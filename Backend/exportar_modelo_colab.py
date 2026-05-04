# ============================================================
# CELDA EXTRA — EXPORTAR MODELO PARA EL BACKEND WEB
# Ejecutar después de la Celda 6 (modelo entrenado)
# ============================================================

import joblib
import os

os.makedirs('models', exist_ok=True)

joblib.dump(mlp,     'models/modelo_mlp_desercion.pkl')
joblib.dump(scaler,  'models/scaler_desercion.pkl')
joblib.dump(imputer, 'models/imputer_desercion.pkl')

print("Modelos guardados en carpeta 'models/'")
print("Archivos:")
for f in os.listdir('models'):
    size = os.path.getsize(f'models/{f}') / 1024
    print(f"  {f}  ({size:.1f} KB)")

# Descargar como ZIP para subir al backend
import shutil
shutil.make_archive('models_export', 'zip', 'models')

from google.colab import files
files.download('models_export.zip')
print("\nDescargando models_export.zip...")
print("Descomprime y coloca los 3 archivos .pkl en la carpeta backend/models/")