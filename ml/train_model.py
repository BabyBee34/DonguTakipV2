"""
CycleMate - ML Model Training Script v2.2
==========================================

Sentetik cycle data'dan model eğitir ve ONNX formatında export eder.
- Multi-shard data loading
- Feature extraction from cycle data
- Neural network training
- ONNX conversion + quantization
"""

import argparse
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple
from collections import Counter

import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Quantization optional (onnxruntime-tools gerekebilir)
try:
    from onnxruntime.quantization import quantize_dynamic, QuantType
    QUANTIZATION_AVAILABLE = True
except ImportError:
    try:
        from onnxruntime.tools.quantization import quantize_dynamic, QuantType
        QUANTIZATION_AVAILABLE = True
    except ImportError:
        QUANTIZATION_AVAILABLE = False
        print("⚠️  onnxruntime quantization not available, skipping quantization")


# Paths
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "models" / "model.onnx"
TMP_MODEL = Path(__file__).resolve().parent / "model_fp32.onnx"

# Semptom ve mood listeleri (generate_synthetic_data.py ile aynı)
SYMPTOMS = [
    'cramp', 'headache', 'backPain', 'jointPain',
    'bloating', 'nausea', 'constipation', 'diarrhea',
    'acne', 'breastTenderness', 'discharge',
    'lowEnergy', 'sleepy', 'insomnia',
    'appetite', 'cravings', 'anxious', 'irritable', 'focusIssues'
]

MOODS = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry']

# Tip kategorileri (basitleştirilmiş)
TIP_CATEGORIES = {
    'menstrual_relief': 0,    # Menstrual ağrı rahatlatma
    'energy_boost': 1,        # Enerji artırma
    'mood_support': 2,        # Mood desteği
    'general_wellness': 3     # Genel sağlık
}


def load_shard_files(pattern: str = "ml/synthetic_cycle_data_v2_2_part_*.json") -> List[Dict[str, Any]]:
    """Tüm shard dosyalarını yükle"""
    shard_files = sorted(Path(".").glob(pattern))
    
    if not shard_files:
        raise FileNotFoundError(f"Shard dosyaları bulunamadı: {pattern}")
    
    print(f"Found {len(shard_files)} shard files")
    
    all_users = []
    for shard_file in shard_files:
        print(f"  Loading {shard_file.name}...")
        with open(shard_file, 'r', encoding='utf-8') as f:
            shard_data = json.load(f)
            all_users.extend(shard_data['data'])
    
    print(f"✓ Loaded {len(all_users)} total users")
    return all_users


def extract_features_from_log(log: Dict[str, Any], cycle_info: Dict[str, Any]) -> List[float]:
    """
    Bir log'dan feature vector oluştur
    
    Features (35 boyutlu):
    - dayInCycle (normalized): 1
    - phase (one-hot): 4
    - symptoms (multi-hot): 19
    - symptom severity avg: 1
    - mood (one-hot): 9
    - flow (one-hot): 3 (light, medium, heavy)
    - cycle stats: 2 (cycle_length, period_length normalized)
    """
    features = []
    
    # 1. Day in cycle (normalized 0-1)
    day_in_cycle = log.get('dayInCycle', 0)
    cycle_length = cycle_info.get('cycleLength', 28)
    features.append(day_in_cycle / cycle_length)
    
    # 2. Phase (one-hot: menstrual, follicular, ovulation, luteal)
    phase = log.get('phase', 'menstrual')
    for p in ['menstrual', 'follicular', 'ovulation', 'luteal']:
        features.append(1.0 if phase == p else 0.0)
    
    # 3. Symptoms (multi-hot)
    symptoms = log.get('symptoms', [])
    symptom_ids = [s['id'] for s in symptoms] if symptoms else []
    for symptom in SYMPTOMS:
        features.append(1.0 if symptom in symptom_ids else 0.0)
    
    # 4. Average symptom severity
    if symptoms:
        avg_severity = np.mean([s['severity'] for s in symptoms]) / 3.0  # Normalize to 0-1
    else:
        avg_severity = 0.0
    features.append(avg_severity)
    
    # 5. Mood (one-hot)
    mood = log.get('mood')
    for m in MOODS:
        features.append(1.0 if mood == m else 0.0)
    
    # 6. Flow (one-hot: light, medium, heavy)
    flow = log.get('flow')
    for f in ['light', 'medium', 'heavy']:
        features.append(1.0 if flow == f else 0.0)
    
    # 7. Cycle stats (normalized)
    period_length = cycle_info.get('periodLength', 5)
    features.append(cycle_length / 35.0)  # Max 35 days
    features.append(period_length / 7.0)  # Max 7 days
    
    return features


def determine_tip_label(log: Dict[str, Any], phase: str) -> int:
    """
    Log'dan hangi tip kategorisinin uygun olduğunu belirle
    """
    symptoms = log.get('symptoms', [])
    mood = log.get('mood')
    
    # Menstrual fazda ve ağrı semptomları varsa
    symptom_ids = [s['id'] for s in symptoms] if symptoms else []
    if phase == 'menstrual' and any(s in symptom_ids for s in ['cramp', 'backPain', 'headache']):
        return TIP_CATEGORIES['menstrual_relief']
    
    # Düşük enerji veya yorgunluk
    if 'lowEnergy' in symptom_ids or 'sleepy' in symptom_ids or mood == 'tired':
        return TIP_CATEGORIES['energy_boost']
    
    # Mood sorunları
    if mood in ['sad', 'anxious', 'irritable', 'angry']:
        return TIP_CATEGORIES['mood_support']
    
    # Varsayılan: genel wellness
    return TIP_CATEGORIES['general_wellness']


def prepare_training_data(users: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
    """
    Tüm kullanıcılardan feature matrix ve labels oluştur
    """
    print("\nExtracting features from logs...")
    
    X_list = []
    y_list = []
    
    for user in users:
        cycles = user.get('cycles', [])
        logs = user.get('logs', [])
        
        for log in logs:
            # Log'un hangi cycle'a ait olduğunu bul
            log_date = log.get('date')
            cycle_info = None
            
            for cycle in cycles:
                if cycle['cycleStart'] <= log_date <= cycle['cycleEnd']:
                    cycle_info = cycle
                    break
            
            if not cycle_info:
                continue  # Cycle bulunamadı, atla
            
            # Feature extraction
            features = extract_features_from_log(log, cycle_info)
            
            # Label determination
            phase = log.get('phase', 'menstrual')
            label = determine_tip_label(log, phase)
            
            X_list.append(features)
            y_list.append(label)
    
    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)
    
    print(f"✓ Extracted {len(X)} samples with {X.shape[1]} features")
    return X, y


def train_model(X: np.ndarray, y: np.ndarray, verbose: bool = True) -> Pipeline:
    """Neural network eğit"""
    if verbose:
        print("\nTraining model...")
        print(f"  Samples: {len(X)}")
        print(f"  Features: {X.shape[1]}")
        print(f"  Classes: {len(np.unique(y))}")
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    if verbose:
        print(f"  Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Pipeline (scaler + classifier)
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", MLPClassifier(
            hidden_layer_sizes=(64, 32),
            activation="relu",
            solver="adam",
            max_iter=200,
            random_state=42,
            verbose=verbose,
            early_stopping=True,
            validation_fraction=0.1
        ))
    ])
    
    # Eğitim
    pipeline.fit(X_train, y_train)
    
    if verbose:
        print("\n✓ Training completed")
        
        # Evaluation
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        print("\nModel Performance:")
        print(f"  Accuracy:  {accuracy*100:.2f}%")
        print(f"  Precision: {precision*100:.2f}%")
        print(f"  Recall:    {recall*100:.2f}%")
        print(f"  F1-Score:  {f1*100:.2f}%")
    
    return pipeline


def export_to_onnx(model: Pipeline, n_features: int, verbose: bool = True) -> None:
    """Scikit-learn modelini ONNX'e çevir"""
    if verbose:
        print("\nConverting to ONNX...")
    
    initial_type = [("input", FloatTensorType([None, n_features]))]
    onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=13)
    
    TMP_MODEL.parent.mkdir(parents=True, exist_ok=True)
    with TMP_MODEL.open("wb") as f:
        f.write(onnx_model.SerializeToString())
    
    if verbose:
        size_mb = TMP_MODEL.stat().st_size / (1024 * 1024)
        print(f"✓ ONNX model saved: {TMP_MODEL.name} ({size_mb:.2f} MB)")


def quantize_model(output_path: Path, verbose: bool = True) -> bool:
    """Model'i quantize et (boyut küçültme) - opsiyonel"""
    if not QUANTIZATION_AVAILABLE:
        if verbose:
            print("\n⚠️  Quantization skipped (onnxruntime quantization not available)")
            print("   Installing: pip install onnxruntime")
        # Quantize edilmemiş modeli kopyala
        import shutil
        output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(str(TMP_MODEL), str(output_path))
        if verbose:
            size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"✓ Model saved (not quantized): {output_path.name} ({size_mb:.2f} MB)")
        return False
    
    if verbose:
        print("\nQuantizing model...")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        quantize_dynamic(
            model_input=str(TMP_MODEL),
            model_output=str(output_path),
            weight_type=QuantType.QUInt8
        )
        
        if verbose:
            size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"✓ Quantized model saved: {output_path.name} ({size_mb:.2f} MB)")
        return True
    except Exception as e:
        if verbose:
            print(f"⚠️  Quantization failed: {e}")
            print("   Using non-quantized model...")
        import shutil
        shutil.copy(str(TMP_MODEL), str(output_path))
        return False


def main():
    parser = argparse.ArgumentParser(description="CycleMate ML Model Training v2.2")
    parser.add_argument(
        "--data",
        type=str,
        default="ml/synthetic_cycle_data_v2_2_part_*.json",
        help="Data file pattern (default: v2.2 shards)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=str(DEFAULT_OUTPUT),
        help="Output ONNX model path"
    )
    parser.add_argument(
        "--synthetic",
        action="store_true",
        help="Use old synthetic generator (legacy)"
    )
    
    args = parser.parse_args()
    
    print("="*70)
    print("CycleMate - ML Model Training v2.2")
    print("="*70)
    print()
    
    start_time = time.time()
    
    # Load data
    if args.synthetic:
        print("Using legacy synthetic data generator...")
        from train_model import generate_synthetic_data as legacy_gen
        examples = legacy_gen()
        X = np.array([ex.features for ex in examples], dtype=np.float32)
        y = np.array([ex.label for ex in examples], dtype=np.int64)
    else:
        print(f"Loading data from: {args.data}")
        users = load_shard_files(args.data)
        X, y = prepare_training_data(users)
    
    # Train
    model = train_model(X, y, verbose=True)
    
    # Export to ONNX
    export_to_onnx(model, X.shape[1], verbose=True)
    
    # Quantize
    output_path = Path(args.output).resolve()
    quantize_model(output_path, verbose=True)
    
    # Cleanup
    TMP_MODEL.unlink(missing_ok=True)
    
    # Summary
    elapsed = time.time() - start_time
    print("\n" + "="*70)
    print("TRAINING COMPLETED")
    print("="*70)
    print(f"Model saved to: {output_path}")
    print(f"Total samples: {len(X)}")
    print(f"Features: {X.shape[1]}")
    print(f"Classes: {len(np.unique(y))}")
    print(f"Time: {elapsed:.1f}s")
    print("="*70)
    print("\n✅ Model training completed successfully!")


if __name__ == "__main__":
    main()
