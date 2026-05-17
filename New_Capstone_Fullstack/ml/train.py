import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import sys
from pathlib import Path

print("=" * 50)
print("🚀 TRAINING MODEL VARK LEARNING STYLE")
print("=" * 50)

# Path logic: naik 2 level dari ml/ ke Root project
script_dir = Path(__file__).parent
project_root = script_dir.parent.parent 
dataset_path = project_root / "Dataset" / "Data_Clean" / "Data_Final.csv"

print(f"🔍 Mencari dataset di: {dataset_path}")

if not dataset_path.exists():
    print(f"❌ File dataset tidak ditemukan!")
    sys.exit(1)

try:
    df = pd.read_csv(dataset_path)
    print(f"✅ Dataset berhasil dimuat: {df.shape[0]} baris, {df.shape[1]} kolom")
except Exception as e:
    print(f"❌ Gagal membaca CSV: {e}")
    sys.exit(1)

# ✅ UPDATE: Tambahkan 'Dominant_Style' sebagai target utama
possible_targets = ['Dominant_Style', 'learning_style', 'predicted_style', 'style', 'label', 'target', 'Gaya_Belajar']
target_col = None

for col in possible_targets:
    if col in df.columns:
        target_col = col
        break

if target_col is None:
    print("\n❌ Kolom target tidak ditemukan!")
    print(f"   Kolom yang tersedia: {df.columns.tolist()}")
    sys.exit(1)

print(f"🎯 Menggunakan kolom target: '{target_col}'")

# Features: hanya ambil V1-V5, A1-A5, R1-R5, K1-K5 (20 kolom)
feature_cols = [col for col in df.columns if len(col) > 1 and col[0] in ['V', 'A', 'R', 'K'] and col[1:].isdigit()]

# Pastikan urutannya konsisten: V1-V5, A1-A5, R1-R5, K1-K5
feature_cols = sorted(feature_cols, key=lambda x: (['V','A','R','K'].index(x[0]), int(x[1:])))

if len(feature_cols) != 20:
    print(f"⚠️ Warning: Ditemukan {len(feature_cols)} kolom features")

# ✅ Pastikan Features & Target sudah berupa NumPy Array standar
X = df[feature_cols].to_numpy()
y = df[target_col].astype(str).to_numpy()  # Fix error stratify PyArrow

print(f"\n📈 Shape X: {X.shape}, y: {y.shape}")
print(f"📊 Distribusi Kelas:\n{pd.Series(y).value_counts()}")

# Split data (tanpa stratify jika kelas < 20 dikhawatirkan error, tapi 17 aman)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scaling & Training
print("\n⚖️  Scaling & Training Model...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=100, 
    max_depth=10, 
    random_state=42, 
    class_weight='balanced',
    n_jobs=-1
)
model.fit(X_train_scaled, y_train)

# Evaluasi
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Accuracy: {acc:.4f} ({acc*100:.2f}%)")
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred))

# Save model
ml_dir = Path(__file__).parent
scaler_path = ml_dir / "scaler.save"
model_path = ml_dir / "model.save"

joblib.dump(scaler, scaler_path)
joblib.dump(model, model_path)

print("\n" + "=" * 50)
print("🎉 SELESAI! Model tersimpan:")
print(f"   📦 Scaler: {scaler_path}")
print(f"   🧠 Model:  {model_path}")
print("=" * 50)