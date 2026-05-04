"""
Backend FastAPI — Sistema de Alerta Temprana de Deserción Estudiantil
Universidad Continental | CRISP-ML
Deploy: Railway / Render / Fly.io
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import joblib
import os
from pathlib import Path

app = FastAPI(
    title="API Deserción Estudiantil",
    description="Predice el riesgo de deserción usando MLP entrenado con CRISP-ML",
    version="1.0.0"
)

# CORS — permite que el frontend de Vercel llame al backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # En producción: ["https://tu-app.vercel.app"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Cargar modelo al arrancar ──────────────────────────────
MODEL_DIR = Path(__file__).parent / "models"

try:
    mlp     = joblib.load(MODEL_DIR / "modelo_mlp_desercion.pkl")
    scaler  = joblib.load(MODEL_DIR / "scaler_desercion.pkl")
    imputer = joblib.load(MODEL_DIR / "imputer_desercion.pkl")
    print("✅ Modelos cargados correctamente")
except Exception as e:
    print(f"⚠️  Error cargando modelos: {e}")
    mlp = scaler = imputer = None


# ── Schema de entrada ──────────────────────────────────────
class EstudianteInput(BaseModel):
    # Académicas
    creditos_aprobados_s1: float = Field(..., ge=0, le=26, description="Créditos aprobados 1er semestre")
    nota_promedio_s1:      float = Field(..., ge=0, le=20, description="Nota promedio 1er semestre")
    creditos_aprobados_s2: float = Field(..., ge=0, le=26, description="Créditos aprobados 2do semestre")
    nota_promedio_s2:      float = Field(..., ge=0, le=20, description="Nota promedio 2do semestre")
    creditos_inscritos_s1: float = Field(..., ge=0, le=26, description="Créditos inscritos 1er semestre")
    creditos_inscritos_s2: float = Field(..., ge=0, le=26, description="Créditos inscritos 2do semestre")
    # Financieras
    cuota_al_dia:     int = Field(..., ge=0, le=1, description="1=Sí está al día, 0=No")
    es_deudor:        int = Field(..., ge=0, le=1, description="1=Tiene deuda, 0=No")
    tiene_beca:       int = Field(..., ge=0, le=1, description="1=Tiene beca, 0=No")
    # Demográficas
    edad_ingreso:  float = Field(..., ge=17, le=70, description="Edad al momento de ingreso")
    desplazado:      int = Field(..., ge=0, le=1, description="1=Vive fuera de ciudad, 0=No")
    genero:          int = Field(..., ge=0, le=1, description="1=Hombre, 0=Mujer")
    # Macroeconómicas
    pbi:           float = Field(..., description="PBI (GDP) del país en el periodo")
    tasa_desempleo: float = Field(..., description="Tasa de desempleo (%)")
    tasa_inflacion: float = Field(..., description="Tasa de inflación (%)")

    class Config:
        json_schema_extra = {
            "example": {
                "creditos_aprobados_s1": 5,
                "nota_promedio_s1": 11.5,
                "creditos_aprobados_s2": 3,
                "nota_promedio_s2": 10.0,
                "creditos_inscritos_s1": 6,
                "creditos_inscritos_s2": 6,
                "cuota_al_dia": 0,
                "es_deudor": 1,
                "tiene_beca": 0,
                "edad_ingreso": 22,
                "desplazado": 1,
                "genero": 1,
                "pbi": 1.74,
                "tasa_desempleo": 13.9,
                "tasa_inflacion": 2.8
            }
        }


def calcular_features_engineering(data: EstudianteInput) -> np.ndarray:
    """Aplica el mismo feature engineering que en el entrenamiento."""
    # Tasas de aprobación
    aprobacion_rate_1 = (data.creditos_aprobados_s1 / data.creditos_inscritos_s1
                         if data.creditos_inscritos_s1 > 0 else 0)
    aprobacion_rate_2 = (data.creditos_aprobados_s2 / data.creditos_inscritos_s2
                         if data.creditos_inscritos_s2 > 0 else 0)
    # Variación de rendimiento entre semestres
    variacion_rendimiento = data.nota_promedio_s2 - data.nota_promedio_s1
    # Carga total
    carga_total = data.creditos_inscritos_s1 + data.creditos_inscritos_s2
    # Índice de riesgo financiero
    riesgo_financiero = (
        int(data.cuota_al_dia == 0) +
        int(data.es_deudor == 1) +
        int(data.tiene_beca == 0)
    )

    # Vector en el mismo orden que features[] del entrenamiento
    vector = np.array([[
        data.creditos_aprobados_s1,
        data.nota_promedio_s1,
        data.creditos_aprobados_s2,
        data.nota_promedio_s2,
        data.cuota_al_dia,
        data.es_deudor,
        data.tiene_beca,
        data.edad_ingreso,
        data.desplazado,
        data.genero,
        data.pbi,
        data.tasa_desempleo,
        data.tasa_inflacion,
        aprobacion_rate_1,
        aprobacion_rate_2,
        variacion_rendimiento,
        carga_total,
        riesgo_financiero,
    ]])
    return vector


@app.get("/")
def root():
    return {"status": "ok", "mensaje": "API Deserción Estudiantil activa"}


@app.get("/health")
def health():
    return {"modelo_cargado": mlp is not None}


@app.post("/predecir")
def predecir(estudiante: EstudianteInput):
    if mlp is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")

    try:
        X_raw     = calcular_features_engineering(estudiante)
        X_imp     = imputer.transform(X_raw)
        X_scaled  = scaler.transform(X_imp)
        proba     = float(mlp.predict_proba(X_scaled)[0, 1])
        THRESHOLD = 0.40

        if proba >= 0.70:
            nivel  = "CRÍTICO"
            accion = "Alerta inmediata al tutor. Contacto obligatorio en 48h. Activar plan de acompañamiento."
            color  = "red"
        elif proba >= THRESHOLD:
            nivel  = "ATENCIÓN"
            accion = "Seguimiento activo. Enviar email de apoyo e invitar a tutoría en 2 semanas."
            color  = "yellow"
        else:
            nivel  = "BAJO"
            accion = "Monitoreo pasivo. Re-evaluar al inicio del siguiente periodo académico."
            color  = "green"

        # Factores de riesgo detectados (para mostrar en el UI)
        factores = []
        if estudiante.creditos_aprobados_s1 < 4:
            factores.append("Pocos créditos aprobados en 1er semestre")
        if estudiante.nota_promedio_s1 < 10:
            factores.append("Nota promedio baja en 1er semestre")
        if estudiante.nota_promedio_s2 < estudiante.nota_promedio_s1:
            factores.append("Rendimiento bajó entre semestres")
        if estudiante.cuota_al_dia == 0:
            factores.append("Cuota de matrícula no está al día")
        if estudiante.es_deudor == 1:
            factores.append("Registra deuda con la institución")
        if estudiante.tiene_beca == 0 and estudiante.cuota_al_dia == 0:
            factores.append("Sin beca y con problemas financieros")
        if estudiante.edad_ingreso > 25:
            factores.append("Estudiante mayor (mayor carga externa potencial)")

        return {
            "probabilidad":       round(proba * 100, 1),
            "nivel_riesgo":       nivel,
            "color":              color,
            "accion_recomendada": accion,
            "factores_riesgo":    factores,
            "umbral_usado":       THRESHOLD,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))