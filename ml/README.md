# 🧠 CycleMate ML Model Training

Bu klasör, CycleMate uygulaması için AI model eğitimi dosyalarını içerir.

## 📋 İçerik

1. **generate_synthetic_data.py** - Sentetik cycle data üretimi
2. **train_model.py** - ML model eğitimi ve ONNX export
3. **requirements.txt** - Python dependencies

## 🚀 Kurulum ve Çalıştırma

### Adım 1: Python Dependencies Yükleme

```bash
pip install -r requirements.txt
```

### Adım 2: Sentetik Data Üretimi

```bash
python generate_synthetic_data.py
```

**Çıktı:** `ml/synthetic_cycle_data.json` (500 kullanıcı, 12 cycle/kullanıcı)

**İstatistikler:**
- 500 kullanıcı
- 6,000 cycle
- ~25,000+ günlük kayıt
- Gerçekçi semptom ve mood dağılımı

### Adım 3: Model Eğitimi

```bash
python train_model.py --data synthetic_cycle_data.json --output ../assets/models/model.onnx
```

**Parametreler:**
- `--data` - Training data dosyası (varsayılan: synthetic_cycle_data.json)
- `--output` - Model çıktı yolu (varsayılan: ../assets/models/model.onnx)
- `--epochs` - Eğitim epoch sayısı (varsayılan: 100)

**Çıktı:** `assets/models/model.onnx` (quantized, ~50-100KB)

## 📊 Model Detayları

### Mimari
- **Tip:** Multi-layer Perceptron (MLP)
- **Input:** Feature vector (cycle phase, symptoms, mood)
- **Output:** Tip recommendation scores
- **Hidden Layers:** [64, 32]
- **Activation:** ReLU
- **Optimizer:** Adam

### Features (Input)
1. Cycle gün sayısı (normalize)
2. Cycle fazı (one-hot: menstrual, follicular, ovulation, luteal)
3. Semptomlar (multi-hot: 19 semptom)
4. Mood (one-hot: 9 mood)
5. Period uzunluğu
6. Cycle uzunluğu

**Toplam:** ~35 features

### Labels (Output)
- Tip recommendation kategorileri
- Multi-class classification
- Softmax activation

## 🔍 Veri Formatı

### Synthetic Data JSON
```json
{
  "version": "1.0.0",
  "numUsers": 500,
  "data": [
    {
      "userId": 1,
      "cycles": [...],
      "logs": [
        {
          "date": "2024-01-01",
          "mood": "happy",
          "symptoms": [
            {"id": "cramp", "severity": 3}
          ],
          "habits": ["water", "walk"],
          "flow": "medium"
        }
      ]
    }
  ]
}
```

## ⚙️ Kullanım (Uygulama İçinde)

Model eğitildikten sonra, `assets/models/model.onnx` dosyası uygulamaya otomatik olarak dahil edilir.

```typescript
import { getTipModelScores } from '../services/aiModel';

// Feature vector oluştur
const features = buildFeatureVector(log, cycle);

// Model inference
const scores = await getTipModelScores(features);
if (scores) {
  // En yüksek skorlu önerileri göster
  const topTips = getTopRecommendations(scores);
}
```

## 📈 Model Performansı

Training sonrası beklenen metrikler:
- **Accuracy:** ~75-85%
- **Precision:** ~70-80%
- **Recall:** ~70-80%
- **F1-Score:** ~70-80%

## 🔄 Model Güncelleme

Model'i güncellemek için:

1. Yeni veri üret veya gerçek veri kullan
2. `train_model.py` çalıştır
3. Yeni `model.onnx` dosyası otomatik olarak eskisinin üzerine yazılır
4. Uygulama yeni modeli kullanır

## 🐛 Troubleshooting

### ImportError: No module named 'sklearn'
```bash
pip install scikit-learn
```

### ONNX conversion hatası
```bash
pip install --upgrade skl2onnx onnx
```

### Model dosyası bulunamadı
`assets/models/` klasörünün var olduğundan emin olun.

## 📝 Notlar

- Model tamamen **offline** çalışır
- Cihazda inference yapılır (ONNX Runtime)
- Model boyutu küçük (~50-100KB quantized)
- CPU inference yeterlidir

---

**Geliştirme:** CycleMate AI Team  
**Versiyon:** 1.0.0  
**Güncelleme:** 09 Ekim 2025



