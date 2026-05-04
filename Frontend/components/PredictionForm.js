'use client'

import { useState } from 'react'

const defaultValues = {
  creditos_aprobados_s1: 5,
  nota_promedio_s1:      12.0,
  creditos_aprobados_s2: 4,
  nota_promedio_s2:      11.5,
  creditos_inscritos_s1: 6,
  creditos_inscritos_s2: 6,
  cuota_al_dia:  1,
  es_deudor:     0,
  tiene_beca:    0,
  edad_ingreso:  19,
  desplazado:    0,
  genero:        0,
  pbi:           1.74,
  tasa_desempleo: 13.9,
  tasa_inflacion: 2.8,
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function NumInput({ label, name, value, onChange, min, max, step = 1, hint }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm text-white/70">{label}</label>
        <span className="font-mono text-sm text-indigo-300 font-medium">{value}</span>
      </div>
      <input
        type="range" name={name} min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(name, parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-white/10 cursor-pointer"
      />
      {hint && <p className="text-xs text-white/25 mt-1">{hint}</p>}
    </div>
  )
}

function Toggle({ label, name, value, onChange, hint }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <div>
        <span className="text-sm text-white/70">{label}</span>
        {hint && <p className="text-xs text-white/30 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(name, value === 1 ? 0 : 1)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          value === 1 ? 'bg-indigo-500' : 'bg-white/10'
        }`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          value === 1 ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

export default function PredictionForm({ onSubmit, loading }) {
  const [values, setValues] = useState(defaultValues)

  function handleChange(name, value) {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Datos del estudiante</h2>
          <p className="text-sm text-white/35">Ajusta los valores con los sliders. Los campos con toggle son Sí/No.</p>
        </div>

        {/* SECCIÓN ACADÉMICA */}
        <Section title="Rendimiento académico" icon="📚">
          <NumInput label="Créditos inscritos — 1er semestre"
            name="creditos_inscritos_s1" value={values.creditos_inscritos_s1}
            min={0} max={26} onChange={handleChange}
            hint="Total de materias en las que se inscribió" />
          <NumInput label="Créditos aprobados — 1er semestre"
            name="creditos_aprobados_s1" value={values.creditos_aprobados_s1}
            min={0} max={26} onChange={handleChange} />
          <NumInput label="Nota promedio — 1er semestre (0–20)"
            name="nota_promedio_s1" value={values.nota_promedio_s1}
            min={0} max={20} step={0.5} onChange={handleChange} />
          <NumInput label="Créditos inscritos — 2do semestre"
            name="creditos_inscritos_s2" value={values.creditos_inscritos_s2}
            min={0} max={26} onChange={handleChange} />
          <NumInput label="Créditos aprobados — 2do semestre"
            name="creditos_aprobados_s2" value={values.creditos_aprobados_s2}
            min={0} max={26} onChange={handleChange} />
          <NumInput label="Nota promedio — 2do semestre (0–20)"
            name="nota_promedio_s2" value={values.nota_promedio_s2}
            min={0} max={20} step={0.5} onChange={handleChange} />
        </Section>

        {/* SECCIÓN FINANCIERA */}
        <Section title="Situación financiera" icon="💳">
          <Toggle label="Cuota de matrícula al día"
            name="cuota_al_dia" value={values.cuota_al_dia} onChange={handleChange}
            hint="¿El estudiante tiene sus pagos al corriente?" />
          <Toggle label="Registra deuda con la institución"
            name="es_deudor" value={values.es_deudor} onChange={handleChange} />
          <Toggle label="Cuenta con beca"
            name="tiene_beca" value={values.tiene_beca} onChange={handleChange} />
        </Section>

        {/* SECCIÓN DEMOGRÁFICA */}
        <Section title="Perfil personal" icon="👤">
          <NumInput label="Edad al momento de ingreso"
            name="edad_ingreso" value={values.edad_ingreso}
            min={17} max={70} onChange={handleChange} />
          <Toggle label="Estudiante desplazado (vive fuera de la ciudad)"
            name="desplazado" value={values.desplazado} onChange={handleChange} />
          <Toggle label="Género masculino"
            name="genero" value={values.genero} onChange={handleChange}
            hint="Activado = Masculino, Desactivado = Femenino" />
        </Section>

        {/* SECCIÓN MACROECONÓMICA */}
        <Section title="Contexto económico" icon="📈">
          <NumInput label="PBI (GDP) — periodo de ingreso"
            name="pbi" value={values.pbi}
            min={-5} max={5} step={0.1} onChange={handleChange}
            hint="Crecimiento económico del país ese semestre" />
          <NumInput label="Tasa de desempleo (%)"
            name="tasa_desempleo" value={values.tasa_desempleo}
            min={0} max={30} step={0.1} onChange={handleChange} />
          <NumInput label="Tasa de inflación (%)"
            name="tasa_inflacion" value={values.tasa_inflacion}
            min={-2} max={20} step={0.1} onChange={handleChange} />
        </Section>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-semibold text-sm tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analizando...
            </span>
          ) : 'Analizar riesgo de deserción →'}
        </button>
      </div>
    </form>
  )
}