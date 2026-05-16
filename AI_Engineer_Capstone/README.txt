
# Model Klasifikasi Gaya Belajar

## File yang disertakan
- learning_style_final.keras : model TensorFlow
- scaler.save : StandardScaler yang sudah di-fit
- requirements.txt : daftar library

## Cara menggunakan
1. Install dependencies: pip install -r requirements.txt
2. Load model dan scaler:
   import tensorflow as tf
   import joblib
   model = tf.keras.models.load_model('learning_style_final.keras', custom_objects={'FocalLoss': FocalLoss})
   scaler = joblib.load('scaler.save')
3. Prediksi: preprocessing dengan scaler, lalu model.predict()
