import sys
import json
import joblib
import numpy as np
from pathlib import Path

# 🔍 Resolv path relatif terhadap LOKASI file script ini (bukan CWD)
SCRIPT_DIR = Path(__file__).parent
SCALER_PATH = SCRIPT_DIR / "scaler.save"
MODEL_PATH = SCRIPT_DIR / "model.save"

# 1. Load Model & Scaler
try:
    if not SCALER_PATH.exists() or not MODEL_PATH.exists():
        raise FileNotFoundError(f"File model/scaler tidak ditemukan.\nCek path: {SCALER_PATH} & {MODEL_PATH}")
    
    scaler = joblib.load(str(SCALER_PATH))
    model = joblib.load(str(MODEL_PATH))
except Exception as e:
    print(json.dumps({"error": f"Gagal load model/scaler: {str(e)}"}))
    sys.exit(1)

# 2. Baca input dari Node.js
if len(sys.argv) < 2:
    print(json.dumps({"error": "Argument input JSON tidak ditemukan"}))
    sys.exit(1)

try:
    raw_input = json.loads(sys.argv[1])
except json.JSONDecodeError:
    print(json.dumps({"error": "Format JSON input tidak valid"}))
    sys.exit(1)

# 3. Validasi input
if not isinstance(raw_input, list) or len(raw_input) != 20:
    print(json.dumps({"error": "Input harus berupa array JSON dengan tepat 20 angka (1-5)"}))
    sys.exit(1)

# 4. Scaling & Prediksi
try:
    X = np.array(raw_input).reshape(1, -1)
    X_scaled = scaler.transform(X)
    
    # Support untuk model yang punya predict_proba (RF, GB, Logistic, dll)
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_scaled)[0]
    else:
        # Fallback jika model tidak support proba (e.g., SVM default)
        pred = model.predict(X_scaled)[0]
        probs = np.array([1.0 if c == pred else 0.0 for c in model.classes_])
        
    classes = model.classes_
    prob_dict = {str(cls): float(p) for cls, p in zip(classes, probs)}
    predicted = max(prob_dict, key=prob_dict.get)
    
    # ✅ Output JSON ke stdout (Node.js akan menangkap ini)
    print(json.dumps({"probabilities": prob_dict, "predicted_style": predicted}))
    
except Exception as e:
    print(json.dumps({"error": f"Proses prediksi gagal: {str(e)}"}))
    sys.exit(1)