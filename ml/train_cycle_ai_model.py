#!/usr/bin/env python3
"""
CycleMate AI Model Training Script

Gerçek AI modeli eğitimi için Python script.
Multi-task learning ile döngü tahminleri, semptom öngörüleri ve öneriler.
"""

import json
import numpy as np
import joblib
# import pandas as pd  # Not used
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
            'symptoms': ['bloating', 'breastTenderness', 'cravings', 'acne', 'lowEnergy', 'headache', 'anxious', 'irritable'],
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
    all_user_ids = []  # Track user IDs for proper splitting
    
    for user_id in range(num_users):
        # User characteristics
        avg_cycle = np.random.randint(21, 36)  # 21-35 days
        avg_period = np.random.randint(3, 8)   # 3-7 days
        
        # Generate user history (NO LEAKAGE)
        user_history = generate_user_history(cycles_per_user)
        
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
                
                # Generate features (NO LEAKAGE)
                features = extract_features(day_in_cycle, user_history, avg_period, phase, phases)
                all_features.append(features)
                
                # Generate targets
                targets = generate_targets(current_day, day_in_cycle, cycle_length, phase, phases)
                for key, value in targets.items():
                    all_targets[key].append(value)
                
                # Track user ID
                all_user_ids.append(user_id)
            
            current_date += timedelta(days=cycle_length)
    
    return {
        'features': np.array(all_features),
        'targets': all_targets,
        'user_ids': np.array(all_user_ids),
        'feature_names': get_feature_names(),
        'target_names': list(all_targets.keys())
    }

def extract_features(day_in_cycle: int, user_history: Dict, period_length: int, 
                    phase: str, phases: Dict) -> List[float]:
    """Feature extraction for a single day - NO LEAKAGE"""
    features = []
    
    # Basic cycle features (NO current cycle length!)
    features.append(day_in_cycle / 35.0)  # Normalized day (using average cycle length)
    features.append(user_history.get('avg_cycle_length', 28) / 35.0)  # User's historical average
    features.append(user_history.get('cycle_std', 3) / 10.0)  # Cycle variability
    features.append(period_length / 7.0)  # Normalized period length
    
    # Phase features (one-hot encoding) - REMOVED: This causes data leakage!
    # Instead, use cyclic features for day_in_cycle
    # Sin/cos encoding for day_in_cycle to avoid direct phase leakage
    # Use user's average cycle length instead of current cycle length
    avg_cycle = user_history.get('avg_cycle_length', 28)
    features.append(np.sin(2 * np.pi * day_in_cycle / avg_cycle))
    features.append(np.cos(2 * np.pi * day_in_cycle / avg_cycle))
    
    # Symptom features (19 symptoms) - SIMPLIFIED to prevent data leakage
    symptoms = ['cramp', 'headache', 'backPain', 'jointPain', 'bloating', 'nausea',
                'constipation', 'diarrhea', 'acne', 'breastTenderness', 'discharge',
                'lowEnergy', 'sleepy', 'insomnia', 'appetite', 'cravings',
                'anxious', 'irritable', 'focusIssues']
    
    # Use random symptom features (not phase-dependent) to prevent leakage
    for symptom in symptoms:
        prob = np.random.uniform(0.1, 0.4)  # Reduced probability
        severity = np.random.uniform(0, 3) if np.random.random() < prob else 0
        features.append(severity / 3.0)  # Normalized severity
    
    # Mood features (9 moods) - REMOVED to prevent data leakage
    # Instead, use lag features or remove entirely for phase prediction
    # For now, we'll use simplified mood indicators
    moods = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry']
    
    # Use random mood features (not phase-dependent) to prevent leakage
    for mood in moods:
        features.append(1.0 if np.random.random() < 0.2 else 0.0)  # Reduced probability
    
    # Energy level - weak phase correlation with significant noise (NO PERFECT LEAKAGE)
    energy_range = phases[phase]['energy_level']
    energy_mean = (energy_range[0] + energy_range[1]) / 2
    # Add cross-phase noise
    energy = np.clip(np.random.normal(energy_mean, 0.25), 0.0, 1.0)
    features.append(energy)
    
    # Flow features - probabilistic, not deterministic (NO PERFECT LEAKAGE)
    if phase == 'menstrual':
        has_flow_prob = 0.7
    elif phase == 'follicular':
        has_flow_prob = 0.05
    elif phase == 'ovulation':
        has_flow_prob = 0.03
    else:  # luteal
        has_flow_prob = 0.10  # PMS spotting can occur
    
    has_flow = 1.0 if np.random.random() < has_flow_prob else 0.0
    features.append(has_flow)
    features.append(np.random.uniform(0.3, 1.0) if has_flow else 0.0)  # Flow intensity if has flow
    
    # Historical features (NO LEAKAGE)
    features.append(user_history.get('cycle_cv', 0.1))  # Cycle variability (coefficient of variation)
    features.append(user_history.get('cycle_trend', 0.0))  # Cycle length trend
    features.append(user_history.get('last_3_cycles_mean', 28) / 35.0)  # Last 3 cycles average
    features.append(user_history.get('last_5_cycles_mean', 28) / 35.0)  # Last 5 cycles average
    features.append(user_history.get('last_cycle_length', 28) / 35.0)   # Last cycle length
    features.append(user_history.get('last_period_length', 5) / 7.0)    # Last period length
    features.append(user_history.get('avg_period_length', 5) / 7.0)     # Avg period length
    features.append(user_history.get('period_std', 1.0) / 3.0)          # Period variability
    features.append(user_history.get('last_luteal_length', 14) / 20.0)  # Last luteal length
    features.append(user_history.get('logging_rate', 0.8))              # User engagement
    
    # Habit features
    habits = ['water', 'walk', 'rest', 'shower']
    for habit in habits:
        features.append(1.0 if np.random.random() < 0.4 else 0.0)
    
    return features

def generate_user_history(cycles: int) -> Dict[str, float]:
    """Generate user historical statistics (NO LEAKAGE)"""
    # Generate historical cycle lengths
    historical_cycles = []
    for _ in range(cycles):
        cycle_length = np.random.normal(28, 3)  # Mean 28, std 3
        cycle_length = max(21, min(35, cycle_length))  # Clamp to realistic range
        historical_cycles.append(cycle_length)
    
    # Generate historical period lengths
    historical_periods = []
    for _ in range(cycles):
        period_length = np.random.normal(5, 1.5)
        period_length = max(3, min(8, period_length))
        historical_periods.append(period_length)
    
    # Advanced statistics
    cycle_cv = np.std(historical_cycles) / np.mean(historical_cycles) if len(historical_cycles) > 0 else 0.1  # Coefficient of variation
    
    # Trend (linear regression slope over last cycles)
    if len(historical_cycles) >= 3:
        x = np.arange(len(historical_cycles))
        cycle_trend = np.polyfit(x, historical_cycles, 1)[0]  # Slope
    else:
        cycle_trend = 0.0
    
    # Calculate statistics
    return {
        'avg_cycle_length': np.mean(historical_cycles),
        'cycle_std': np.std(historical_cycles),
        'cycle_cv': cycle_cv,
        'cycle_trend': cycle_trend,
        'last_3_cycles_mean': np.mean(historical_cycles[-3:]) if len(historical_cycles) >= 3 else np.mean(historical_cycles),
        'last_5_cycles_mean': np.mean(historical_cycles[-5:]) if len(historical_cycles) >= 5 else np.mean(historical_cycles),
        'last_cycle_length': historical_cycles[-1] if historical_cycles else 28,
        'last_period_length': historical_periods[-1] if historical_periods else 5,
        'last_luteal_length': historical_cycles[-1] - historical_periods[-1] if historical_cycles and historical_periods else 14,
        'avg_period_length': np.mean(historical_periods),
        'period_std': np.std(historical_periods),
        'logging_rate': np.random.uniform(0.6, 1.0),  # User engagement rate
    }

def generate_targets(current_day: datetime, day_in_cycle: int, cycle_length: int, 
                    phase: str, phases: Dict) -> Dict[str, Any]:
    """Generate targets for training"""
    targets = {}
    
    # Next period (FLOAT precision)
    next_period = current_day + timedelta(days=cycle_length - day_in_cycle)
    targets['next_period'] = (next_period - current_day).total_seconds() / 86400.0
    
    # Ovulation (typically 14 days before next period)
    ovulation = next_period - timedelta(days=14)
    targets['ovulation'] = (ovulation - current_day).total_seconds() / 86400.0
    
    # Fertile window (5 days before ovulation to 1 day after)
    fertile_start = ovulation - timedelta(days=5)
    fertile_end = ovulation + timedelta(days=1)
    targets['fertile_window_start'] = (fertile_start - current_day).total_seconds() / 86400.0
    targets['fertile_window_end'] = (fertile_end - current_day).total_seconds() / 86400.0
    
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
    
    # Phase
    targets['phase'] = phase
    
    # Symptoms (next day prediction)
    targets['symptoms'] = next_day_symptoms
    
    # Mood (next day prediction)
    targets['mood'] = next_day_mood
    
    # Energy level
    targets['energy_level'] = energy_level
    
    return targets

def get_feature_names() -> List[str]:
    """Get feature names for interpretability"""
    features = []
    
    # Basic features (normalized) - NO LEAKAGE
    features.extend(['day_in_cycle_norm', 'user_avg_cycle_norm', 'user_cycle_std_norm', 'period_length_norm'])
    
    # Phase features (cyclic encoding instead of one-hot to prevent leakage)
    features.extend(['day_in_cycle_sin', 'day_in_cycle_cos'])
    
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
    
    # Historical features (NO LEAKAGE) - v2 with advanced stats
    features.extend([
        'cycle_cv', 'cycle_trend',
        'last_3_cycles_mean_norm', 'last_5_cycles_mean_norm',
        'last_cycle_length_norm', 'last_period_length_norm',
        'avg_period_length_norm', 'period_std_norm',
        'last_luteal_length_norm', 'logging_rate'
    ])
    
    # Habit features
    features.extend(['habit_water', 'habit_walk', 'habit_rest', 'habit_shower'])
    
    return features

def prepare_data_for_training(data: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, np.ndarray], Any, Any, np.ndarray]:
    """Prepare data for ML training"""
    
    X = data['features']
    y = data['targets']
    
    # Assert feature count matches feature names
    expected_feature_count = len(get_feature_names())
    actual_feature_count = X.shape[1] if len(X.shape) > 1 else 0
    assert actual_feature_count == expected_feature_count, \
        f"Feature count mismatch! Expected {expected_feature_count}, got {actual_feature_count}"
    
    print(f"✓ Feature count validation passed: {actual_feature_count} features")
    
    # Convert targets to appropriate formats
    processed_targets = {}
    
    # Date targets (already in days from current day)
    for date_key in ['next_period', 'ovulation', 'fertile_window_start', 'fertile_window_end']:
        processed_targets[date_key] = np.array(y[date_key])
    
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
    
    return X, processed_targets, phase_encoder, mood_encoder, data['user_ids']

def train_models(X: np.ndarray, y: Dict[str, np.ndarray], user_ids: np.ndarray, phase_encoder: Any, mood_encoder: Any) -> Dict[str, Any]:
    """Train multiple models for different tasks"""
    
    if not SKLEARN_AVAILABLE:
        raise ImportError("Scikit-learn is required for training")
    
    print("Training models...")
    
    # Ensure numpy is available
    import numpy as np
    
    # User-based split to prevent data leakage
    from sklearn.model_selection import GroupKFold
    
    # Use GroupKFold for user-based splitting
    gkf = GroupKFold(n_splits=5)
    
    # For now, use first fold (later: average over all folds for better reliability)
    # TODO: Implement 5-fold cross-validation with mean/std reporting
    train_idx, test_idx = next(gkf.split(X, groups=user_ids))
    
    X_train = X[train_idx]
    X_test = X[test_idx]
    
    y_train = {key: val[train_idx] for key, val in y.items()}
    y_test = {key: val[test_idx] for key, val in y.items()}
    
    print(f"✓ Train size: {len(X_train):,} | Test size: {len(X_test):,}")
    
    # Scale features (for compatibility, but HGB/RF don't need it)
    # Keeping scaler for potential future linear models
    scaler = StandardScaler()
    scaler.fit(X_train)  # Fit but don't transform for tree-based models
    
    # For HGB and RF, use unscaled features (tree-based models are scale-invariant)
    X_train_scaled = X_train  # No scaling needed
    X_test_scaled = X_test    # No scaling needed
    
    models = {}
    results = {}
    
    # 1. Period Prediction (Regression) - Using GradientBoosting
    print("\n=== Training Period Prediction (GradientBoosting) ===")
    try:
        from sklearn.ensemble import HistogramGradientBoostingRegressor
        period_model = HistogramGradientBoostingRegressor(
            max_iter=100,
            max_depth=8,
            learning_rate=0.1,
            l2_regularization=0.1,
            random_state=42
        )
    except ImportError:
        # Fallback to GradientBoostingRegressor if HistogramGradientBoostingRegressor not available
        from sklearn.ensemble import GradientBoostingRegressor
        period_model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=8,
            learning_rate=0.1,
            random_state=42
        )
    period_model.fit(X_train_scaled, y_train['next_period'])
    
    period_pred = period_model.predict(X_test_scaled)
    period_mse = mean_squared_error(y_test['next_period'], period_pred)
    
    models['period_prediction'] = period_model
    from sklearn.metrics import mean_absolute_error
    period_mae = mean_absolute_error(y_test['next_period'], period_pred)
    
    # Naive baseline: user_avg_cycle - day_in_cycle
    # Extract day_in_cycle and user_avg_cycle from features (already unscaled now)
    day_in_cycle_test = X_test[:, 0] * 35.0  # Index 0: day_in_cycle_norm
    user_avg_cycle_test = X_test[:, 1] * 35.0  # Index 1: user_avg_cycle_norm
    naive_baseline = user_avg_cycle_test - day_in_cycle_test
    naive_mae = mean_absolute_error(y_test['next_period'], naive_baseline)
    naive_rmse = np.sqrt(mean_squared_error(y_test['next_period'], naive_baseline))
    
    # Within 2 days accuracy
    within_2d = np.mean(np.abs(period_pred - y_test['next_period']) <= 2.0)
    naive_within_2d = np.mean(np.abs(naive_baseline - y_test['next_period']) <= 2.0)
    
    results['period_prediction'] = {
        'mse': period_mse,
        'rmse': np.sqrt(period_mse),
        'mae': period_mae,
        'within_2d_accuracy': within_2d,
        'naive_mae': naive_mae,
        'naive_rmse': naive_rmse,
        'naive_within_2d': naive_within_2d,
        'improvement_vs_naive': (naive_mae - period_mae) / naive_mae * 100,  # Percentage improvement
        # HGB doesn't have feature_importances_ - skip or use permutation_importance
    }
    
    # 2. Ovulation Prediction (Regression) - Using GradientBoosting
    print("\n=== Training Ovulation Prediction (GradientBoosting) ===")
    try:
        ovulation_model = HistogramGradientBoostingRegressor(
            max_iter=100,
            max_depth=8,
            learning_rate=0.1,
            l2_regularization=0.1,
            random_state=42
        )
    except NameError:
        # Fallback to GradientBoostingRegressor
        from sklearn.ensemble import GradientBoostingRegressor
        ovulation_model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=8,
            learning_rate=0.1,
            random_state=42
        )
    ovulation_model.fit(X_train_scaled, y_train['ovulation'])
    
    ovulation_pred = ovulation_model.predict(X_test_scaled)
    ovulation_mse = mean_squared_error(y_test['ovulation'], ovulation_pred)
    
    models['ovulation_prediction'] = ovulation_model
    ovulation_mae = mean_absolute_error(y_test['ovulation'], ovulation_pred)
    
    # Within 2 days accuracy for ovulation
    ovulation_within_2d = np.mean(np.abs(ovulation_pred - y_test['ovulation']) <= 2.0)
    
    # Ovulation naive baseline
    ovulation_naive_baseline = user_avg_cycle_test - 14 - day_in_cycle_test  # Ovulation ~14 days before next period
    ovulation_naive_mae = mean_absolute_error(y_test['ovulation'], ovulation_naive_baseline)
    ovulation_naive_within_2d = np.mean(np.abs(ovulation_naive_baseline - y_test['ovulation']) <= 2.0)
    
    results['ovulation_prediction'] = {
        'mse': ovulation_mse,
        'rmse': np.sqrt(ovulation_mse),
        'mae': ovulation_mae,
        'within_2d_accuracy': ovulation_within_2d,
        'naive_mae': ovulation_naive_mae,
        'naive_within_2d': ovulation_naive_within_2d,
        'improvement_vs_naive': (ovulation_naive_mae - ovulation_mae) / ovulation_naive_mae * 100,
        # HGB doesn't have feature_importances_
    }
    
    # 3. Phase Classification
    print("\n=== Training Phase Classification (RandomForest) ===")
    phase_model = RandomForestClassifier(
        n_estimators=50, 
        max_depth=12,
        max_samples=200000,
        random_state=42
    )
    phase_model.fit(X_train_scaled, y_train['phase'])
    
    phase_pred = phase_model.predict(X_test_scaled)
    phase_accuracy = accuracy_score(y_test['phase'], phase_pred)
    
    # Balanced accuracy
    from sklearn.metrics import balanced_accuracy_score
    phase_balanced_acc = balanced_accuracy_score(y_test['phase'], phase_pred)
    
    models['phase_classification'] = phase_model
    results['phase_classification'] = {
        'accuracy': phase_accuracy,
        'balanced_accuracy': phase_balanced_acc,
        'classification_report': str(classification_report(y_test['phase'], phase_pred)),  # String for JSON
        'feature_importance': phase_model.feature_importances_.tolist()  # RF has feature_importances_
    }
    
    # 4. Mood Classification
    print("\n=== Training Mood Classification (RandomForest) ===")
    # Alt örnekleme ile bellek sorunu çöz
    subset_size = min(250000, len(X_train_scaled))
    subset_indices = np.random.choice(len(X_train_scaled), subset_size, replace=False)
    
    mood_model = RandomForestClassifier(
        n_estimators=50, 
        max_depth=12,
        max_samples=200000,
        class_weight='balanced',  # Handle class imbalance
        random_state=42
    )
    mood_model.fit(X_train_scaled[subset_indices], y_train['mood'][subset_indices])
    
    mood_pred = mood_model.predict(X_test_scaled)
    mood_accuracy = accuracy_score(y_test['mood'], mood_pred)
    
    # Also calculate F1-macro for better evaluation
    from sklearn.metrics import f1_score
    mood_f1 = f1_score(y_test['mood'], mood_pred, average='macro')
    
    models['mood_classification'] = mood_model
    results['mood_classification'] = {
        'accuracy': mood_accuracy,
        'f1_macro': mood_f1,
        'classification_report': str(classification_report(y_test['mood'], mood_pred)),  # String for JSON
        'feature_importance': mood_model.feature_importances_.tolist()  # RF has feature_importances_
    }
    
    # Save encoders
    models['phase_encoder'] = phase_encoder
    models['mood_encoder'] = mood_encoder
    
    # 5. Energy Level Prediction (Regression)
    print("Training energy level prediction model...")
    energy_model = RandomForestRegressor(
        n_estimators=50, 
        max_depth=12,
        max_samples=200000,
        random_state=42
    )
    energy_model.fit(X_train_scaled, y_train['energy_level'])
    
    energy_pred = energy_model.predict(X_test_scaled)
    energy_mse = mean_squared_error(y_test['energy_level'], energy_pred)
    
    models['energy_prediction'] = energy_model
    results['energy_prediction'] = {
        'mse': energy_mse,
        'rmse': np.sqrt(energy_mse),
        'feature_importance': energy_model.feature_importances_.tolist()  # RF has feature_importances_
    }
    
    return {
        'models': models,
        'scaler': scaler,
        'results': results,
        'feature_names': get_feature_names(),
        'total_samples': len(X)
    }

def export_to_onnx(models: Dict[str, Any], scaler: StandardScaler, 
                   feature_names: List[str], output_dir: str = 'models'):
    """Export trained models to ONNX format"""
    
    if not ONNX_AVAILABLE:
        print("⚠️  ONNX not available, skipping export")
        return
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("\n5. Exporting models to ONNX...")
    print("⚠️  Note: HGB models may fail ONNX conversion - joblib fallback will be used")
    
    # Export each model
    for model_name, model in models['models'].items():
        try:
            # Define input type
            initial_type = [('float_input', FloatTensorType([None, len(feature_names)]))]
            
            # Convert to ONNX
            onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=17)
            
            # Save model
            model_path = os.path.join(output_dir, f'{model_name}.onnx')
            with open(model_path, 'wb') as f:
                f.write(onnx_model.SerializeToString())
            
            print(f"✅ Exported {model_name} to {model_path}")
            
        except Exception as e:
            print(f"❌ Failed to export {model_name} to ONNX: {e}")
            # Fallback: save as joblib
            import joblib
            joblib_path = os.path.join(output_dir, f'{model_name}.joblib')
            joblib.dump(model, joblib_path)
            print(f"💾 Saved {model_name} as joblib fallback to {joblib_path}")
    
    # Export scaler (NOTE: Not used for tree-based models, but kept for compatibility)
    # Since we're using unscaled features, scaler export is optional
    try:
        scaler_onnx = convert_sklearn(scaler, initial_types=initial_type, target_opset=17)
        scaler_path = os.path.join(output_dir, 'scaler.onnx')
        with open(scaler_path, 'wb') as f:
            f.write(scaler_onnx.SerializeToString())
        print(f"✅ Exported scaler to {scaler_path} (⚠️  NOT used for tree models in production)")
    except Exception as e:
        print(f"ℹ️  Scaler export skipped: {e}")
    
    # Export encoders as joblib (not ONNX)
    try:
        if 'phase_encoder' in models:
            phase_encoder_path = os.path.join(output_dir, 'phase_encoder.joblib')
            joblib.dump(models['phase_encoder'], phase_encoder_path)
            print(f"✅ Exported phase_encoder to {phase_encoder_path}")
        
        if 'mood_encoder' in models:
            mood_encoder_path = os.path.join(output_dir, 'mood_encoder.joblib')
            joblib.dump(models['mood_encoder'], mood_encoder_path)
            print(f"✅ Exported mood_encoder to {mood_encoder_path}")
    except Exception as e:
        print(f"Failed to export encoders: {e}")

def save_training_results(results: Dict[str, Any], output_path: str = 'training_results.json', sample_count: int = None):
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
        'model_version': '2.0.0',
        'training_date': datetime.now().isoformat(),
        'random_seed': 42,
        'feature_version': 'v2_advanced_stats',
        'cv_folds': 5,
        'cv_note': 'Using first fold only - TODO: average over all folds',
        'inference_note': 'Scaler is fitted but NOT used for tree-based models. Use unscaled features in production.',
        'feature_names': results['feature_names'],
        'feature_count': len(results['feature_names']),
        'model_info': {
            'period_ovulation': {
                'algorithm': 'HistogramGradientBoosting',
                'max_iter': 100,
                'max_depth': 8,
                'learning_rate': 0.1,
                'l2_regularization': 0.1,
                'random_state': 42
            },
            'phase_mood_energy': {
                'algorithm': 'RandomForest',
                'n_estimators': 50,
                'max_depth': 12,
                'max_samples': 200000,
                'random_state': 42
            }
        },
        'data_generation': {
            'num_users': 10000,
            'cycles_per_user': 6,
            'total_samples': sample_count if sample_count is not None else results.get('total_samples', 'unknown')
        },
        'classes': {
            'phase_classes': results['models']['phase_encoder'].classes_.tolist() if 'phase_encoder' in results['models'] else [],
            'mood_classes': results['models']['mood_encoder'].classes_.tolist() if 'mood_encoder' in results['models'] else []
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
    
    # Set seeds for reproducibility
    np.random.seed(42)
    import random
    random.seed(42)
    
    print("=== CycleMate AI Model Training ===")
    print(f"Training date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Random seed: 42")
    
    # Generate synthetic data
    print("\n1. Generating synthetic training data...")
    data = generate_synthetic_training_data(num_users=10000, cycles_per_user=6)
    print(f"Generated {len(data['features'])} training samples")
    print(f"Feature dimension: {data['features'].shape[1]}")
    
    # Prepare data
    print("\n2. Preparing data for training...")
    X, y, phase_encoder, mood_encoder, user_ids = prepare_data_for_training(data)
    print(f"Features shape: {X.shape}")
    print(f"Targets: {list(y.keys())}")
    unique_users = np.unique(user_ids).size
    print(f"User IDs: {unique_users} unique users")
    
    # Train models
    print("\n3. Training models...")
    training_results = train_models(X, y, user_ids, phase_encoder, mood_encoder)
    
    # Print results summary
    print("\n" + "=" * 70)
    print("📊 TRAINING RESULTS SUMMARY")
    print("=" * 70)
    
    # Period summary
    period_res = training_results['results']['period_prediction']
    print(f"\n📅 PERIOD PREDICTION:")
    print(f"   RMSE: {period_res['rmse']:.2f} days | MAE: {period_res['mae']:.2f} days")
    print(f"   ±2d Accuracy: {period_res['within_2d_accuracy']*100:.1f}%")
    print(f"   Naive Baseline: RMSE {period_res['naive_rmse']:.2f} | MAE {period_res['naive_mae']:.2f}")
    print(f"   🎯 Improvement vs Naive: {period_res['improvement_vs_naive']:.1f}%")
    
    # Ovulation summary
    ovulation_res = training_results['results']['ovulation_prediction']
    print(f"\n🥚 OVULATION PREDICTION:")
    print(f"   RMSE: {ovulation_res['rmse']:.2f} days | MAE: {ovulation_res['mae']:.2f} days")
    print(f"   ±2d Accuracy: {ovulation_res['within_2d_accuracy']*100:.1f}%")
    print(f"   🎯 Improvement vs Naive: {ovulation_res['improvement_vs_naive']:.1f}%")
    
    # Phase summary
    phase_res = training_results['results']['phase_classification']
    print(f"\n🌙 PHASE CLASSIFICATION:")
    print(f"   Accuracy: {phase_res['accuracy']*100:.1f}%")
    print(f"   Balanced Accuracy: {phase_res['balanced_accuracy']*100:.1f}%")
    
    # Mood summary
    mood_res = training_results['results']['mood_classification']
    print(f"\n😊 MOOD CLASSIFICATION:")
    print(f"   Accuracy: {mood_res['accuracy']*100:.1f}%")
    print(f"   F1-Macro: {mood_res['f1_macro']*100:.1f}%")
    
    # Energy summary
    energy_res = training_results['results']['energy_prediction']
    print(f"\n⚡ ENERGY PREDICTION:")
    print(f"   RMSE: {energy_res['rmse']:.4f}")
    
    print("\n" + "=" * 70)
    
    # Detailed results
    print("\n4. Detailed Training Results:")
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
    save_training_results(training_results, sample_count=X.shape[0])
    
    print("\n" + "=" * 70)
    print("✅ TRAINING COMPLETE!")
    print("=" * 70)
    print(f"\n📦 Models exported to: ./models/")
    print(f"📊 Results saved to: ./training_results.json")
    print(f"🎯 Model version: 2.0.0")
    print(f"🔧 Feature version: v2_advanced_stats")
    print(f"\n⚠️  IMPORTANT: Tree models use UNSCALED features in production!")
    print(f"⚠️  Do NOT apply scaler during inference for HGB/RF models.")
    print("\n🚀 Models are ready for deployment!")

if __name__ == "__main__":
    main()
