"""
CycleMate - Sentetik Cycle Data Üretici v2.2
============================================

ML eğitimi için gerçekçi menstrüasyon cycle verisi üretir.
- 3 kademeli semptom şiddeti (1=hafif, 2=orta, 3=şiddetli)
- Dinamik faz geçişleri (kullanıcı bazlı ovulation timing)
- Zenginleştirilmiş mood profilleri
- Streaming shard yazımı (RAM dostu)
- CLI argümanları (--users, --cycles, --seed)
- ID validation (semptom/mood doğrulama)
- Reproducible (default SEED=42)
"""

import json
import random
import time
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import Counter
import numpy as np

# ===== Semptom ve Mood Listeleri =====
SYMPTOMS = [
    'cramp', 'headache', 'backPain', 'jointPain',
    'bloating', 'nausea', 'constipation', 'diarrhea',
    'acne', 'breastTenderness', 'discharge',
    'lowEnergy', 'sleepy', 'insomnia',
    'appetite', 'cravings', 'anxious', 'irritable', 'focusIssues'
]

MOODS = ['ecstatic', 'happy', 'calm', 'neutral', 'tired', 'sad', 'anxious', 'irritable', 'angry']

# Türkçe label map'leri
SYMPTOM_LABELS_TR = {
    'cramp': 'Kramp', 'headache': 'Baş Ağrısı', 'backPain': 'Bel Ağrısı',
    'jointPain': 'Eklem Ağrısı', 'bloating': 'Şişkinlik', 'nausea': 'Mide Bulantısı',
    'constipation': 'Kabızlık', 'diarrhea': 'İshal', 'acne': 'Akne',
    'breastTenderness': 'Göğüs hassasiyeti', 'discharge': 'Akıntı',
    'lowEnergy': 'Düşük Enerji', 'sleepy': 'Uyku Hali', 'insomnia': 'Uykusuzluk',
    'appetite': 'İştah Değişimi', 'cravings': 'Yiyecek İsteği',
    'anxious': 'Kaygı', 'irritable': 'Sinirlilik', 'focusIssues': 'Dikkat Eksikliği'
}

MOOD_LABELS_TR = {
    'ecstatic': 'Çok Mutlu', 'happy': 'Mutlu', 'calm': 'Sakin',
    'neutral': 'Nötr', 'tired': 'Yorgun', 'sad': 'Üzgün',
    'anxious': 'Kaygılı', 'irritable': 'Sinirli', 'angry': 'Kızgın'
}

# ===== Faz Bazlı Semptom Olasılıkları (FIXED: "tired" removed) =====
PHASE_SYMPTOM_PROBABILITIES = {
    'menstrual': {
        'cramp': 0.8, 'backPain': 0.6, 'lowEnergy': 0.7,
        'bloating': 0.5, 'headache': 0.4,
        'nausea': 0.3, 'diarrhea': 0.2
    },
    'follicular': {
        'acne': 0.3, 'breastTenderness': 0.2, 'discharge': 0.4,
        'lowEnergy': 0.2
    },
    'ovulation': {
        'breastTenderness': 0.4, 'discharge': 0.6, 'cramp': 0.3,
        'bloating': 0.3
    },
    'luteal': {
        'bloating': 0.7, 'breastTenderness': 0.6, 'irritable': 0.5,
        'anxious': 0.4, 'cravings': 0.6, 'acne': 0.5,
        'headache': 0.4, 'backPain': 0.3, 'lowEnergy': 0.4
    }
}

# ===== Faz Dışı Semptom Olasılıkları (Base) =====
BASE_SYMPTOM_PROB = {
    'headache': 0.08,
    'lowEnergy': 0.07,
    'insomnia': 0.06,
    'irritable': 0.05,
    'cravings': 0.05,
    'anxious': 0.04,
    'bloating': 0.04,
    'acne': 0.03
}

# ===== Faz Bazlı Severity Olasılıkları =====
PHASE_SEVERITY_PROBS = {
    'menstrual': [0.2, 0.4, 0.4],
    'follicular': [0.6, 0.3, 0.1],
    'ovulation': [0.5, 0.4, 0.1],
    'luteal': [0.3, 0.4, 0.3]
}

# ===== Faz Bazlı Mood Olasılıkları =====
PHASE_MOOD_PROBABILITIES = {
    'menstrual': {'tired': 0.35, 'irritable': 0.25, 'calm': 0.15, 'sad': 0.1, 'anxious': 0.15},
    'follicular': {'happy': 0.5, 'calm': 0.3, 'neutral': 0.15, 'ecstatic': 0.05},
    'ovulation': {'ecstatic': 0.3, 'happy': 0.5, 'calm': 0.15, 'neutral': 0.05},
    'luteal': {'anxious': 0.3, 'irritable': 0.3, 'tired': 0.2, 'neutral': 0.1, 'sad': 0.1}
}

# ===== Mood Bias Profilleri =====
MOOD_BIAS_PROFILES = {
    'positive': {'happy': 0.15, 'ecstatic': 0.1, 'calm': 0.1, 'sad': -0.1, 'anxious': -0.05},
    'neutral': {},
    'negative': {'sad': 0.1, 'anxious': 0.1, 'irritable': 0.05, 'happy': -0.1, 'ecstatic': -0.05}
}


def get_cycle_phase(day_in_cycle: int, ovulation_day: int, period_length: int) -> str:
    """Dinamik faz hesaplaması"""
    if day_in_cycle <= period_length:
        return 'menstrual'
    elif day_in_cycle < ovulation_day - 1:
        return 'follicular'
    elif ovulation_day - 1 <= day_in_cycle <= ovulation_day + 1:
        return 'ovulation'
    else:
        return 'luteal'


def generate_user_profile() -> Dict[str, Any]:
    """Kullanıcı bazlı parametreler"""
    mood_profile_type = random.choices(
        ['positive', 'neutral', 'negative'],
        weights=[0.3, 0.5, 0.2],
        k=1
    )[0]
    
    return {
        'cycle_mean': int(np.random.normal(28, 3)),
        'period_mean': int(np.random.normal(5, 1)),
        'logging_rate': np.clip(np.random.normal(0.7, 0.15), 0.3, 1.0),
        'symptom_sensitivity': np.clip(np.random.normal(1.0, 0.3), 0.5, 2.0),
        'mood_bias_profile': mood_profile_type
    }


def generate_symptoms_for_phase(
    phase: str,
    day_in_cycle: int,
    sensitivity: float
) -> List[Dict[str, Any]]:
    """Faz bazlı + base semptom olasılıkları"""
    symptoms = []
    
    # Faz bazlı semptomlar
    phase_probs = PHASE_SYMPTOM_PROBABILITIES.get(phase, {})
    
    # Base semptomları birleştir
    combined_probs = {**BASE_SYMPTOM_PROB}
    for symptom, prob in phase_probs.items():
        combined_probs[symptom] = combined_probs.get(symptom, 0) + prob
    
    severity_probs = PHASE_SEVERITY_PROBS.get(phase, [0.33, 0.33, 0.34])
    
    for symptom, prob in combined_probs.items():
        adjusted_prob = min(prob * sensitivity, 1.0)
        
        if random.random() < adjusted_prob:
            severity = random.choices([1, 2, 3], weights=severity_probs, k=1)[0]
            symptoms.append({
                'id': symptom,
                'severity': severity
            })
    
    return symptoms


def generate_mood_for_phase(phase: str, mood_bias_profile: str) -> str:
    """Faz bazlı mood + kullanıcı bias"""
    phase_probs = PHASE_MOOD_PROBABILITIES.get(phase, {})
    
    if not phase_probs:
        return random.choice(MOODS)
    
    # Mood bias uygula
    bias = MOOD_BIAS_PROFILES.get(mood_bias_profile, {})
    adjusted_probs = {}
    
    for mood in MOODS:
        base_prob = phase_probs.get(mood, 0)
        bias_value = bias.get(mood, 0)
        adjusted_probs[mood] = max(0.01, base_prob + bias_value)
    
    # Normalize
    total = sum(adjusted_probs.values())
    normalized_probs = {k: v / total for k, v in adjusted_probs.items()}
    
    # Weighted choice
    moods = list(normalized_probs.keys())
    probs = list(normalized_probs.values())
    
    return random.choices(moods, weights=probs, k=1)[0]


def generate_cycle_data(
    user_id: int,
    profile: Dict[str, Any],
    num_cycles: int = 12,
    start_date: datetime = None
) -> Dict[str, Any]:
    """Bir kullanıcı için cycle verisi üret"""
    if start_date is None:
        start_date = datetime.now() - timedelta(days=num_cycles * int(profile['cycle_mean']))
    
    cycles = []
    logs = []
    current_date = start_date
    total_logs = 0
    
    for cycle_num in range(num_cycles):
        # Cycle parametreleri
        cycle_length = int(np.random.normal(profile['cycle_mean'], 2))
        cycle_length = max(21, min(35, cycle_length))
        
        period_length = int(np.random.normal(profile['period_mean'], 0.8))
        period_length = max(3, min(7, period_length))
        
        # Daha güvenli ovulation hesabı (v2.2)
        ovulation_day = int(np.random.normal(cycle_length // 2, 1))
        ovulation_day = max(period_length + 3, min(cycle_length - 4, ovulation_day))
        
        cycle_start = current_date
        cycle_end = current_date + timedelta(days=cycle_length - 1)
        period_start = cycle_start
        period_end = cycle_start + timedelta(days=period_length - 1)
        
        cycles.append({
            'cycleStart': cycle_start.strftime('%Y-%m-%d'),
            'cycleEnd': cycle_end.strftime('%Y-%m-%d'),
            'periodStart': period_start.strftime('%Y-%m-%d'),
            'periodEnd': period_end.strftime('%Y-%m-%d'),
            'cycleLength': cycle_length,
            'periodLength': period_length,
            'ovulationDay': ovulation_day
        })
        
        # Günlük kayıtlar
        for day in range(cycle_length):
            log_date = current_date + timedelta(days=day)
            day_in_cycle = day + 1
            
            if random.random() < profile['logging_rate']:
                phase = get_cycle_phase(day_in_cycle, ovulation_day, period_length)
                
                symptoms = generate_symptoms_for_phase(
                    phase,
                    day_in_cycle,
                    profile['symptom_sensitivity']
                )
                mood = generate_mood_for_phase(phase, profile['mood_bias_profile'])
                
                # Flow
                flow = None
                if day_in_cycle <= period_length:
                    if day_in_cycle <= 2:
                        flow = random.choice(['heavy', 'medium'])
                    elif day_in_cycle >= period_length - 1:
                        flow = 'light'
                    else:
                        flow = random.choice(['medium', 'heavy'])
                
                # Habits
                habits = []
                if random.random() < 0.4:
                    habit_options = ['water', 'walk', 'rest', 'shower']
                    habits = random.sample(habit_options, k=random.randint(1, 3))
                
                # Note
                note = None
                if random.random() < 0.2:
                    notes = [
                        "Bugün çok yorgunum", "Ağrılar başladı", "İyi hissediyorum",
                        "Baş ağrısı var", "Enerji seviyem düşük", "Harika bir gün",
                        "Stresli bir gün", "Dinlenmeye ihtiyacım var"
                    ]
                    note = random.choice(notes)
                
                log_entry = {
                    'date': log_date.strftime('%Y-%m-%d'),
                    'dayInCycle': day_in_cycle,
                    'phase': phase,
                    'symptoms': symptoms,
                    'mood': mood,
                    'flow': flow,
                    'habits': habits if habits else None,
                    'note': note
                }
                
                logs.append(log_entry)
                total_logs += 1
        
        current_date += timedelta(days=cycle_length)
    
    return {
        'userId': user_id,
        'profile': profile,
        'cycles': cycles,
        'logs': logs,
        'totalLogs': total_logs
    }


def validate_ids(dataset: Dict[str, Any]) -> bool:
    """Semptom ve mood ID'lerini doğrula"""
    ok_sym = set(SYMPTOMS)
    ok_mood = set(MOODS)
    bad_sym, bad_mood = set(), set()
    
    for u in dataset['data']:
        for log in u['logs']:
            if log.get('symptoms'):
                for s in log['symptoms']:
                    if s['id'] not in ok_sym:
                        bad_sym.add(s['id'])
            if log.get('mood') and log['mood'] not in ok_mood:
                bad_mood.add(log['mood'])
    
    if bad_sym or bad_mood:
        print("⚠️  Unknown IDs found:", {"symptoms": list(bad_sym), "moods": list(bad_mood)})
        return False
    
    print("✓ ID validation passed")
    return True


def generate_dataset(
    num_users: int = 4000,
    cycles_per_user: int = 12,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Tüm dataset'i üret (streaming shard yazımı ile)
    Her 500 kullanıcıda bir shard'a yaz (RAM dostu)
    """
    # Seed ayarla
    random.seed(seed)
    np.random.seed(seed)
    
    print(f"CycleMate Synthetic Data Generator v2.2")
    print(f"Generating data for {num_users} users (SEED={seed})...")
    
    all_data = []
    shard_index = 1
    
    # Global istatistikler
    total_logs = 0
    total_cycles = 0
    total_symptoms = 0
    total_moods = 0
    all_cycle_lengths = []
    all_period_lengths = []
    all_severities = []
    symptoms_per_log = []
    all_symptoms = []
    all_moods = []
    
    for user_id in range(1, num_users + 1):
        # Progress (her 100 kullanıcıda)
        if user_id % 100 == 0:
            print(f"  Progress: {user_id}/{num_users} users...")
        
        profile = generate_user_profile()
        user_data = generate_cycle_data(user_id, profile, cycles_per_user)
        all_data.append(user_data)
        
        # İstatistikler
        total_logs += user_data['totalLogs']
        total_cycles += len(user_data['cycles'])
        
        for cycle in user_data['cycles']:
            all_cycle_lengths.append(cycle['cycleLength'])
            all_period_lengths.append(cycle['periodLength'])
        
        for log in user_data['logs']:
            if log.get('symptoms'):
                symptoms_per_log.append(len(log['symptoms']))
                for symptom in log['symptoms']:
                    total_symptoms += 1
                    all_symptoms.append(symptom['id'])
                    all_severities.append(symptom['severity'])
            if log.get('mood'):
                total_moods += 1
                all_moods.append(log['mood'])
        
        # Her 500 kullanıcıda bir shard'a yaz (streaming)
        if user_id % 500 == 0 or user_id == num_users:
            # Metadata hesapla
            symptom_counts = Counter(all_symptoms)
            mood_counts = Counter(all_moods)
            
            metadata = {
                'version': '2.2.0',
                'generatedBy': 'CycleMate Synthetic Data Generator v2.2',
                'seed': seed,
                'labelLang': 'en',
                'shard': shard_index,
                'usersInShard': len(all_data),
                'numUsers': num_users,
                'cyclesPerUser': cycles_per_user,
                'totalCycles': total_cycles,
                'totalLogs': total_logs,
                'totalSymptoms': total_symptoms,
                'totalMoods': total_moods,
                'avgCycleLength': round(np.mean(all_cycle_lengths), 2) if all_cycle_lengths else 0,
                'avgPeriodLength': round(np.mean(all_period_lengths), 2) if all_period_lengths else 0,
                'avgSymptomsPerLog': round(np.mean(symptoms_per_log), 2) if symptoms_per_log else 0,
                'avgSeverity': round(np.mean(all_severities), 2) if all_severities else 0,
                'mostCommonMood': mood_counts.most_common(1)[0][0] if all_moods else None,
                'mostCommonSymptom': symptom_counts.most_common(1)[0][0] if all_symptoms else None,
                'generatedAt': datetime.now().isoformat(),
                'symptomLabelsTR': SYMPTOM_LABELS_TR,
                'moodLabelsTR': MOOD_LABELS_TR
            }
            
            shard_dataset = {
                'metadata': metadata,
                'data': all_data
            }
            
            # Shard'a yaz
            shard_filename = f"ml/synthetic_cycle_data_v2_2_part_{shard_index}.json"
            with open(shard_filename, 'w', encoding='utf-8') as f:
                json.dump(shard_dataset, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ Shard {shard_index} saved: {shard_filename} ({len(all_data)} users)")
            
            # Sonraki shard için temizle
            all_data = []
            shard_index += 1
    
    # Final metadata (son shard'daki metadata'yı döndür)
    metadata['totalShards'] = shard_index - 1
    
    # Final dataset objesi (sadece özet için)
    final_dataset = {
        'metadata': metadata,
        'data': []  # Streaming olduğu için boş
    }
    
    print(f"\n✅ Generated {num_users} users, {total_cycles} cycles, {total_logs} logs, " +
          f"{total_symptoms} symptoms, {total_moods} moods")
    
    return final_dataset


def print_summary(metadata: Dict[str, Any], all_symptoms: List[str], all_moods: List[str], all_severities: List[int]):
    """Detaylı özet bastır"""
    symptom_counts = Counter(all_symptoms)
    mood_counts = Counter(all_moods)
    severity_counts = Counter(all_severities)
    
    print("\n" + "="*70)
    print("DATASET SUMMARY (v2.2)")
    print("="*70)
    print(f"Version:            {metadata['version']}")
    print(f"Seed:               {metadata['seed']}")
    print(f"Total Shards:       {metadata.get('totalShards', 1)}")
    print(f"\nUsers:              {metadata['numUsers']}")
    print(f"Cycles:             {metadata['totalCycles']}")
    print(f"Logs:               {metadata['totalLogs']}")
    print(f"Symptoms:           {metadata['totalSymptoms']}")
    print(f"Moods:              {metadata['totalMoods']}")
    print(f"\nAvg Cycle Length:   {metadata['avgCycleLength']} days")
    print(f"Avg Period Length:  {metadata['avgPeriodLength']} days")
    print(f"Avg Logs/User:      {metadata['totalLogs'] / metadata['numUsers']:.1f}")
    print(f"Avg Logs/Cycle:     {metadata['totalLogs'] / metadata['totalCycles']:.1f}")
    print(f"\nAvg Symptoms/Log:   {metadata['avgSymptomsPerLog']}")
    print(f"Avg Severity:       {metadata['avgSeverity']}")
    
    # Severity dağılımı
    if all_severities:
        total = len(all_severities)
        print(f"\nSeverity Distribution:")
        print(f"  Hafif (1):     {severity_counts[1]:6d} ({severity_counts[1]/total*100:.1f}%)")
        print(f"  Orta (2):      {severity_counts[2]:6d} ({severity_counts[2]/total*100:.1f}%)")
        print(f"  Şiddetli (3):  {severity_counts[3]:6d} ({severity_counts[3]/total*100:.1f}%)")
    
    # Top 3 moods
    if all_moods:
        print(f"\nTop 3 Moods:")
        for i, (mood, count) in enumerate(mood_counts.most_common(3), 1):
            print(f"  {i}. {mood:12s} {count:6d} ({count/len(all_moods)*100:.1f}%)")
    
    # Top 3 symptoms
    if all_symptoms:
        print(f"\nTop 3 Symptoms:")
        for i, (symptom, count) in enumerate(symptom_counts.most_common(3), 1):
            print(f"  {i}. {symptom:18s} {count:6d} ({count/len(all_symptoms)*100:.1f}%)")
    
    print("="*70)


if __name__ == '__main__':
    # CLI argümanları
    parser = argparse.ArgumentParser(description='CycleMate Synthetic Data Generator v2.2')
    parser.add_argument('--users', type=int, default=4000, help='Number of users (default: 4000)')
    parser.add_argument('--cycles', type=int, default=12, help='Cycles per user (default: 12)')
    parser.add_argument('--seed', type=int, default=42, help='Random seed (default: 42)')
    args = parser.parse_args()
    
    print("="*70)
    print("CycleMate - Synthetic Data Generator v2.2")
    print("="*70)
    print()
    
    # Süre ölçümü
    start_time = time.time()
    
    # Dataset üret (streaming mode)
    final_dataset = generate_dataset(
        num_users=args.users,
        cycles_per_user=args.cycles,
        seed=args.seed
    )
    
    # Tüm shard'ları oku ve istatistik topla (özet için)
    print("\nCollecting statistics from shards...")
    all_symptoms_global = []
    all_moods_global = []
    all_severities_global = []
    
    for shard_num in range(1, final_dataset['metadata']['totalShards'] + 1):
        shard_file = f"ml/synthetic_cycle_data_v2_2_part_{shard_num}.json"
        with open(shard_file, 'r', encoding='utf-8') as f:
            shard_data = json.load(f)
            for user in shard_data['data']:
                for log in user['logs']:
                    if log.get('symptoms'):
                        for symptom in log['symptoms']:
                            all_symptoms_global.append(symptom['id'])
                            all_severities_global.append(symptom['severity'])
                    if log.get('mood'):
                        all_moods_global.append(log['mood'])
    
    # ID validation
    validate_ids({'data': shard_data['data']})
    
    # Özet bastır
    print_summary(
        final_dataset['metadata'],
        all_symptoms_global,
        all_moods_global,
        all_severities_global
    )
    
    # Süre
    elapsed = time.time() - start_time
    print(f"\n⏱️  Completed in {elapsed:.1f}s")
    print("\n✅ Data generation completed successfully!")
    print()
