# 🎓 Model Eğitim Rehberi - Adım Adım

Bu rehber, hiçbir deneyimi olmayan kullanıcılar için hazırlanmıştır.

## ✅ Gereksinimler

### 1. Python Kurulumu

**Windows için:**
1. [python.org](https://www.python.org/downloads/) adresinden Python 3.11+ indirin
2. Kurulum sırasında "Add Python to PATH" seçeneğini işaretleyin
3. Kurulum tamamlandıktan sonra terminal açın:
   ```bash
   python --version
   ```
   Çıktı: `Python 3.11.x` olmalı

**Zaten Kurulu mu Kontrol:**
```bash
python --version
```

## 📦 Kurulum

### Adım 1: Terminal Açın

**Windows:**
- Win + R → "cmd" → Enter
- VEYA
- Win + X → "Windows PowerShell"

### Adım 2: Proje Klasörüne Gidin

```bash
cd "C:\Users\androidv1\Desktop\döngü cursor\CycleMateApp\ml"
```

### Adım 3: Dependencies Yükleyin

```bash
pip install -r requirements.txt
```

**Beklenen Çıktı:**
```
Collecting numpy>=1.24.0
Installing collected packages: numpy, scikit-learn, onnx, ...
Successfully installed ...
```

**Hata Alırsanız:**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 🎯 Model Eğitimi - 3 Adım

### ADIM 1: Sentetik Data Üret

```bash
python generate_synthetic_data.py
```

**Çıktı:**
```
============================================================
CycleMate - Synthetic Data Generator
============================================================

Generating synthetic data for 500 users...
  Generated data for 50/500 users...
  Generated data for 100/500 users...
  ...
✓ Generated 500 users with 6000 total cycles
✓ Dataset saved to ml/synthetic_cycle_data.json

Dataset Statistics:
  Total Users: 500
  Total Cycles: 6000
  Total Logs: ~25000

✅ Data generation completed!
```

**Kontrol:**
- `ml/synthetic_cycle_data.json` dosyası oluştu mu? ✅
- Dosya boyutu ~10-15MB olmalı

### ADIM 2: Model Eğit

```bash
python train_model.py
```

**Çıktı:**
```
============================================================
CycleMate - ML Model Training
============================================================

Loading training data from synthetic_cycle_data.json...
✓ Loaded 500 users, 25000+ samples

Preprocessing data...
✓ Feature extraction completed
✓ Train/Test split: 80/20

Training model...
Epoch 1/100 - Loss: 2.45
Epoch 10/100 - Loss: 1.82
Epoch 50/100 - Loss: 0.95
Epoch 100/100 - Loss: 0.42
✓ Training completed

Evaluating model...
✓ Accuracy: 82.5%
✓ Precision: 78.3%
✓ Recall: 76.9%

Converting to ONNX...
✓ ONNX conversion successful
✓ Model saved to: model_fp32.onnx

Quantizing model...
✓ Quantization completed
✓ Final model saved to: ../assets/models/model.onnx
✓ Model size: 87 KB

============================================================
✅ Model training completed successfully!
============================================================

Model location: CycleMateApp/assets/models/model.onnx
```

**Kontrol:**
- `assets/models/model.onnx` dosyası oluştu mu? ✅
- Dosya boyutu ~50-100KB arası olmalı

### ADIM 3: Test Et (Opsiyonel)

Uygulamayı başlatın ve AI features çalışmalı!

## 🔍 Detaylı Açıklamalar

### generate_synthetic_data.py Ne Yapar?

1. **500 sanal kullanıcı** oluşturur
2. Her kullanıcı için **12 cycle** (1 yıllık veri) üretir
3. Her cycle için:
   - Period başlangıç/bitiş tarihleri
   - Günlük kayıtlar (mood, semptomlar, habits)
   - Cycle fazlarına göre gerçekçi veriler
4. Toplam **~25,000+ günlük kayıt** üretir
5. JSON dosyasına kaydeder

### train_model.py Ne Yapar?

1. **Veri Yükleme:** JSON dosyasını okur
2. **Feature Extraction:** Her kayıttan 35 özellik çıkarır
   - Cycle gün sayısı
   - Cycle fazı (menstrual, follicular, etc.)
   - Semptomlar (19 semptom)
   - Mood (9 mood tipi)
   - Period/cycle uzunlukları
3. **Model Eğitimi:** Neural network eğitir
   - Multi-layer Perceptron (MLP)
   - 2 hidden layer (64, 32 neurons)
   - Adam optimizer
4. **ONNX Conversion:** Scikit-learn → ONNX formatına çevirir
5. **Quantization:** Model boyutunu küçültür (FP32 → INT8)
6. **Kaydetme:** `assets/models/model.onnx`

## 📊 Beklenen Sonuçlar

### Dosya Boyutları
- `synthetic_cycle_data.json`: ~10-15 MB
- `model.onnx`: ~50-100 KB

### Süre
- Data generation: ~30 saniye
- Model training: ~2-5 dakika (CPU'ya bağlı)
- Toplam: ~5-6 dakika

### Model Performansı
- Accuracy: %75-85
- Precision: %70-80
- Recall: %70-80

## ❌ Sık Karşılaşılan Hatalar

### 1. "python: command not found"

**Çözüm:**
- Python kurulu değil, yukarıdaki kurulum adımlarını takip edin

### 2. "ModuleNotFoundError: No module named 'numpy'"

**Çözüm:**
```bash
pip install -r requirements.txt
```

### 3. "Permission denied"

**Çözüm (Windows):**
- Terminal'i "Yönetici olarak çalıştır" ile açın

### 4. "FileNotFoundError: synthetic_cycle_data.json"

**Çözüm:**
- Önce ADIM 1'i çalıştırın (data generation)

### 5. Model dosyası oluşmadı

**Çözüm:**
- `assets/models/` klasörünün var olduğundan emin olun:
  ```bash
  mkdir -p ../assets/models
  ```

## ✨ İpuçları

1. **İlk Denemede Başarısız:** Normal! Hata mesajını okuyun ve yukarıdaki çözümleri deneyin.

2. **Daha Fazla Veri:** `generate_synthetic_data.py` dosyasında `num_users` değerini artırabilirsiniz:
   ```python
   dataset = generate_dataset(num_users=1000, cycles_per_user=12)
   ```

3. **Daha Hızlı Eğitim:** `train_model.py` dosyasında epoch sayısını azaltabilirsiniz.

4. **Model Kalitesi:** Daha fazla data = Daha iyi model

## 🆘 Yardım

Hala sorun yaşıyorsanız:

1. Hata mesajının **tamamını** kopyalayın
2. Hangi adımda olduğunuzu belirtin
3. Python versiyonunuzu kontrol edin: `python --version`
4. Pip versiyonunuzu kontrol edin: `pip --version`

---

**Başarılar! 🚀**

