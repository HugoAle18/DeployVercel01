'use client'

import { useState } from 'react'
import PredictionForm from '@/components/PredictionForm'
import ResultCard from '@/components/ResultCard'
import Header from '@/components/Header'

export default function Home() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(formData) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/predecir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <PredictionForm onSubmit={handleSubmit} loading={loading} />
        <div className="flex flex-col justify-start pt-2">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300 text-sm">
              {error}
            </div>
          )}
          {result && <ResultCard result={result} />}
          {!result && !error && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="text-4xl mb-4 opacity-30">📊</div>
              <p className="text-white/30 text-sm leading-relaxed">
                Completa el formulario con los datos<br />del estudiante para ver el análisis de riesgo.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}