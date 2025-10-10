#!/usr/bin/env python3
"""
CycleMate AI Model Training Script

Gerçek AI modeli eğitimi için Python script.
Multi-task learning ile döngü tahminleri, semptom öngörüleri ve öneriler.
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any
import os
import sys

# ML imports
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import Dataset, DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("PyTorch not available, using scikit-learn")

try:
    from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn not available")

# ONNX exports
try:
    import onnx
    import onnxruntime
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    print("ONNX not available")

# Synthetic data generator (simplified version)
def generate_synthetic_training_data(num_users: int = 100, cycles_per_user: int = 6) -> Dict[str, Any]:
    """
    @adet.md bilgilerini kullanarak sentetik eğitim verisi üret
    """
    print(f"Generating synthetic data for {num_users} users...")
    
    # Cycle phases and characteristics
    phases = {
        'menstrual': {
            'duration': (3, 7),
            'symptoms': ['cramp', 'lowEnergy', 'backPain', 'bloating'],
            'moods': ['tired', 'neutral', 'sad'],
            'energy_level': (0.2, 0.5)
        },
        'follicular': {
            'duration': (10, 16),
            'symptoms': ['lowEnergy', 'acne'],
            'moods': ['happy', 'calm', 'neutral', 'ecstatic'],
            'energy_level': (0.6, 0.9)
        },
        'ovulation': {
            'duration': (1, 2),
            'symptoms': ['cramp', 'discharge', 'breastTenderness'],
            'moods': ['happy', 'ecstatic', 'calm'],
            'energy_level': (0.8, 1.0)
        },
        'luteal': {
            'duration': (9, 16),
            'symptoms': ['bloating', 'breastTenderness', 'mood', 'cravings', 'acne', 'lowEnergy', 'headache', 'anxious', 'irritable'],
            'moods': ['anxious', 'irritable', 'tired', 'neutral', 'sad'],
            'energy_level': (0.3, 0.7)
        }
    }
    
    all_features = []
    all_targets = {
        'next_period': [],
        'ovulation': [],
        'fertile_window_start': [],
        'fertile_window_end': [],
        'phase': [],
        'symptoms': [],
        'mood': [],
        'energy_level': []
    }
    
    for user_id in range(num_users):
        # User characteristics
        avg_cycle = np.random.randint(21, 36)  # 21-35 days
        avg_period = np.random.randint(3, 8)   # 3-7 days
        
        current_date = datetime.now() - timedelta(days=cycles_per_user * avg_cycle)
        
        for cycle in range(cycles_per_user):
            cycle_start = current_date
            cycle_length = np.random.randint(avg_cycle - 3, avg_cycle + 4)
            
            # Generate daily data
            for day in range(cycle_length):
                day_in_cycle = day + 1
                current_day = cycle_start + timedelta(days=day)
                
                # Determine phase
                if day_in_cycle <= avg_period:
                    phase = 'menstrual'
                elif day_in_cycle <= cycle_length - 14:
                    phase = 'follicular'
                elif day_in_cycle <= cycle_length - 12:
                    phase = 'ovulation'
                else:
                    phase = 'luteal'
                
                # Generate features
                features = extract_features(day_in_cycle, cycle_length, avg_period, phase, phases)
                all_features.append(features)
                
                # Generate targets
                targets = generate_targets(current_day, day_in_cycle, cycle_length, phase, phases)
                for key, value in targets.items():
                    all_targets[key].append(value)
            
            current_date += timedelta(days=cycle_length)
    
    return {
        'features': np.array(all_features),
        'targets': all_targets,
        'feature_names': get_feature_names(),
        'target_names': list(all_targets.keys())
    }

def extract_features(day_in_cycle: int, cycle_length: int, period_length: int, 
                    phase: str, phases: Dict) -> List[float]:
    """Feature extraction for a single day"""
    features = []
    
    # Basic cycle features
    features.append(day_in_cycle / cycle_length)  # Normalized day
    features.append(cycle_length / 35.0)          # Normalized cycle length
    features.append(period_length / 7.0)          # Normalized period length
    
    # Phase features (one-hot encoding)
    for phase_name in ['menstrual', 'follicular', 'ovulation', 'luteal']:
        features.append(1.0 if phase == phase_name else 0.0)
    
    # Symptom features (19 symptoms)
    symptoms = ['cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea',
                'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
                'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings',
                'anxious', 'irritable', 'focusIssues']
    
    phase_symptoms = phases[phase]['symptoms']
    for symptom in symptoms:
        if symptom in phase_symptoms:
            # Probability of having this symptom
            prob = np.random.uniform(0.3, 0.8)
            severity = np.random.uniform(1, 3) if np.random.random() < prob else 0
            features.append(severity / 3.0)  # Normalized severity
        else:
            features.append(0.0)
    
    # Mood features (9 moods)
    moods = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry']
    phase_moods = phases[phase]['moods']
    
    for mood in moods:
        if mood in phase_moods:
            features.append(1.0 if np.random.random() < 0.6 else 0.0)
        else:
            features.append(0.0)
    
    # Energy level
    energy_range = phases[phase]['energy_level']
    energy = np.random.uniform(energy_range[0], energy_range[1])
    features.append(energy)
    
    # Flow features
    features.append(1.0 if phase == 'menstrual' and np.random.random() < 0.8 else 0.0)  # Has flow
    features.append(np.random.uniform(0, 1) if phase == 'menstrual' else 0.0)  # Flow intensity
    
    # Habit features
    habits = ['water', 'walk', 'rest', 'shower']
    for habit in habits:
        features.append(1.0 if np.random.random() < 0.4 else 0.0)
    
    return features

def generate_targets(current_day: datetime, day_in_cycle: int, cycle_length: int, 
                    phase: str, phases: Dict) -> Dict[str, Any]:
    """Generate targets for training"""
    
    # Next period
    next_period = current_day + timedelta(days=cycle_length - day_in_cycle)
    
    # Ovulation (typically 14 days before next period)
    ovulation = next_period - timedelta(days=14)
    
    # Fertile window (5 days before ovulation to 1 day after)
    fertile_start = ovulation - timedelta(days=5)
    fertile_end = ovulation + timedelta(days=1)
    
    # Energy level
    energy_range = phases[phase]['energy_level']
    energy_level = np.random.uniform(energy_range[0], energy_range[1])
    
    # Symptoms (next day prediction)
    next_day_symptoms = []
    if phase in ['menstrual', 'luteal']:
        for symptom in phases[phase]['symptoms']:
            if np.random.random() < 0.3:  # 30% chance to continue
                next_day_symptoms.append(symptom)
    
    # Mood (next day prediction)
    next_day_mood = np.random.choice(phases[phase]['moods'])
    
    return {
        'next_period': next_period.strftime('%Y-%m-%d'),
        'ovulation': ovulation.strftime('%Y-%m-%d'),
        'fertile_window_start': fertile_start.strftime('%Y-%m-%d'),
        'fertile_window_end': fertile_end.strftime('%Y-%m-%d'),
        'phase': phase,
        'symptoms': next_day_symptoms,
        'mood': next_day_mood,
        'energy_level': energy_level
    }

def get_feature_names() -> List[str]:
    """Get feature names for interpretability"""
    features = []
    
    # Basic features
    features.extend(['day_in_cycle', 'cycle_length', 'period_length'])
    
    # Phase features
    features.extend(['is_menstrual', 'is_follicular', 'is_ovulation', 'is_luteal'])
    
    # Symptom features
    symptoms = ['cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea',
                'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
                'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings',
                'anxious', 'irritable', 'focusIssues']
    features.extend([f'symptom_{s}' for s in symptoms])
    
    # Mood features
    moods = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry']
    features.extend([f'mood_{m}' for m in moods])
    
    # Other features
    features.extend(['energy_level', 'has_flow', 'flow_intensity'])
    
    # Habit features
    features.extend(['habit_water', 'habit_walk', 'habit_rest', 'habit_shower'])
    
    return features

def prepare_data_for_training(data: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
    """Prepare data for ML training"""
    
    X = data['features']
    y = data['targets']
    
    # Convert targets to appropriate formats
    processed_targets = {}
    
    # Date targets (convert to days from epoch)
    epoch = datetime(1970, 1, 1)
    for date_key in ['next_period', 'ovulation', 'fertile_window_start', 'fertile_window_end']:
        dates = [datetime.strptime(d, '%Y-%m-%d') for d in y[date_key]]
        processed_targets[date_key] = np.array([(d - epoch).days for d in dates])
    
    # Phase (categorical)
    phase_encoder = LabelEncoder()
    processed_targets['phase'] = phase_encoder.fit_transform(y['phase'])
    
    # Symptoms (multi-label)
    all_symptoms = ['cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea',
                    'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
                    'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings',
                    'anxious', 'irritable', 'focusIssues']
    
    symptom_matrix = np.zeros((len(X), len(all_symptoms)))
    for i, symptoms in enumerate(y['symptoms']):
        for symptom in symptoms:
            if symptom in all_symptoms:
                symptom_matrix[i, all_symptoms.index(symptom)] = 1.0
    
    processed_targets['symptoms'] = symptom_matrix
    
    # Mood (categorical)
    mood_encoder = LabelEncoder()
    processed_targets['mood'] = mood_encoder.fit_transform(y['mood'])
    
    # Energy level (continuous)
    processed_targets['energy_level'] = np.array(y['energy_level'])
    
    return X, processed_targets

def train_models(X: np.ndarray, y: Dict[str, np.ndarray]) -> Dict[str, Any]:
    """Train multiple models for different tasks"""
    
    if not SKLEARN_AVAILABLE:
        raise ImportError("Scikit-learn is required for training")
    
    print("Training models...")
    
    # Split data - her target için ayrı ayrı
    indices = np.arange(len(X))
    train_idx, test_idx = train_test_split(indices, test_size=0.2, random_state=42)
    
    X_train = X[train_idx]
    X_test = X[test_idx]
    
    y_train = {key: val[train_idx] for key, val in y.items()}
    y_test = {key: val[test_idx] for key, val in y.items()}
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {}
    results = {}
    
    # 1. Period Prediction (Regression)
    print("Training period prediction model...")
    period_model = RandomForestRegressor(n_estimators=100, random_state=42)
    period_model.fit(X_train_scaled, y_train['next_period'])
    
    period_pred = period_model.predict(X_test_scaled)
    period_mse = mean_squared_error(y_test['next_period'], period_pred)
    
    models['period_prediction'] = period_model
    results['period_prediction'] = {
        'mse': period_mse,
        'rmse': np.sqrt(period_mse),
        'feature_importance': period_model.feature_importances_
    }
    
    # 2. Ovulation Prediction (Regression)
    print("Training ovulation prediction model...")
    ovulation_model = RandomForestRegressor(n_estimators=100, random_state=42)
    ovulation_model.fit(X_train_scaled, y_train['ovulation'])
    
    ovulation_pred = ovulation_model.predict(X_test_scaled)
    ovulation_mse = mean_squared_error(y_test['ovulation'], ovulation_pred)
    
    models['ovulation_prediction'] = ovulation_model
    results['ovulation_prediction'] = {
        'mse': ovulation_mse,
        'rmse': np.sqrt(ovulation_mse),
        'feature_importance': ovulation_model.feature_importances_
    }
    
    # 3. Phase Classification
    print("Training phase classification model...")
    phase_model = RandomForestClassifier(n_estimators=100, random_state=42)
    phase_model.fit(X_train_scaled, y_train['phase'])
    
    phase_pred = phase_model.predict(X_test_scaled)
    phase_accuracy = accuracy_score(y_test['phase'], phase_pred)
    
    models['phase_classification'] = phase_model
    results['phase_classification'] = {
        'accuracy': phase_accuracy,
        'classification_report': classification_report(y_test['phase'], phase_pred),
        'feature_importance': phase_model.feature_importances_
    }
    
    # 4. Mood Classification
    print("Training mood classification model...")
    mood_model = RandomForestClassifier(n_estimators=100, random_state=42)
    mood_model.fit(X_train_scaled, y_train['mood'])
    
    mood_pred = mood_model.predict(X_test_scaled)
    mood_accuracy = accuracy_score(y_test['mood'], mood_pred)
    
    models['mood_classification'] = mood_model
    results['mood_classification'] = {
        'accuracy': mood_accuracy,
        'classification_report': classification_report(y_test['mood'], mood_pred),
        'feature_importance': mood_model.feature_importances_
    }
    
    # 5. Energy Level Prediction (Regression)
    print("Training energy level prediction model...")
    energy_model = RandomForestRegressor(n_estimators=100, random_state=42)
    energy_model.fit(X_train_scaled, y_train['energy_level'])
    
    energy_pred = energy_model.predict(X_test_scaled)
    energy_mse = mean_squared_error(y_test['energy_level'], energy_pred)
    
    models['energy_prediction'] = energy_model
    results['energy_prediction'] = {
        'mse': energy_mse,
        'rmse': np.sqrt(energy_mse),
        'feature_importance': energy_model.feature_importances_
    }
    
    return {
        'models': models,
        'scaler': scaler,
        'results': results,
        'feature_names': get_feature_names()
    }

def export_to_onnx(models: Dict[str, Any], scaler: StandardScaler, 
                   feature_names: List[str], output_dir: str = 'models'):
    """Export trained models to ONNX format"""
    
    if not ONNX_AVAILABLE:
        print("ONNX not available, skipping export")
        return
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Exporting models to ONNX...")
    
    # Export each model
    for model_name, model in models['models'].items():
        try:
            # Define input type
            initial_type = [('float_input', FloatTensorType([None, len(feature_names)]))]
            
            # Convert to ONNX
            onnx_model = convert_sklearn(model, initial_types=initial_type)
            
            # Save model
            model_path = os.path.join(output_dir, f'{model_name}.onnx')
            with open(model_path, 'wb') as f:
                f.write(onnx_model.SerializeToString())
            
            print(f"Exported {model_name} to {model_path}")
            
        except Exception as e:
            print(f"Failed to export {model_name}: {e}")
    
    # Export scaler
    try:
        scaler_onnx = convert_sklearn(scaler, initial_types=initial_type)
        scaler_path = os.path.join(output_dir, 'scaler.onnx')
        with open(scaler_path, 'wb') as f:
            f.write(scaler_onnx.SerializeToString())
        print(f"Exported scaler to {scaler_path}")
    except Exception as e:
        print(f"Failed to export scaler: {e}")

def save_training_results(results: Dict[str, Any], output_path: str = 'training_results.json'):
    """Save training results to JSON"""
    
    # Convert numpy arrays to lists for JSON serialization
    serializable_results = {}
    
    for model_name, result in results['results'].items():
        serializable_results[model_name] = {
            key: value.tolist() if isinstance(value, np.ndarray) else value
            for key, value in result.items()
        }
    
    # Add metadata
    metadata = {
        'training_date': datetime.now().isoformat(),
        'feature_names': results['feature_names'],
        'model_info': {
            'algorithm': 'RandomForest',
            'n_estimators': 100,
            'random_state': 42
        }
    }
    
    output_data = {
        'metadata': metadata,
        'results': serializable_results
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"Training results saved to {output_path}")

def main():
    """Main training pipeline"""
    
    print("=== CycleMate AI Model Training ===")
    print(f"Training date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Generate synthetic data
    print("\n1. Generating synthetic training data...")
    data = generate_synthetic_training_data(num_users=10000, cycles_per_user=6)
    print(f"Generated {len(data['features'])} training samples")
    print(f"Feature dimension: {data['features'].shape[1]}")
    
    # Prepare data
    print("\n2. Preparing data for training...")
    X, y = prepare_data_for_training(data)
    print(f"Features shape: {X.shape}")
    print(f"Targets: {list(y.keys())}")
    
    # Train models
    print("\n3. Training models...")
    training_results = train_models(X, y)
    
    # Print results
    print("\n4. Training Results:")
    print("=" * 50)
    
    for model_name, result in training_results['results'].items():
        print(f"\n{model_name.upper()}:")
        for metric, value in result.items():
            if metric != 'classification_report' and metric != 'feature_importance':
                if isinstance(value, float):
                    print(f"  {metric}: {value:.4f}")
                else:
                    print(f"  {metric}: {value}")
    
    # Export models
    print("\n5. Exporting models...")
    export_to_onnx(training_results, training_results['scaler'], training_results['feature_names'])
    
    # Save results
    print("\n6. Saving results...")
    save_training_results(training_results)
    
    print("\n=== Training Complete ===")
    print("Models are ready for deployment!")

if __name__ == "__main__":
    main()
