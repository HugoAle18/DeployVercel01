export default function Header() {
  return (
    <header className="border-b border-white/5 bg-white/[0.02] backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm">
            🎓
          </div>
          <div>
            <span className="font-semibold text-white tracking-tight">AlertaEdu</span>
            <span className="text-white/30 text-xs ml-2 hidden sm:inline">Universidad Continental</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-white/40">Modelo activo</span>
        </div>
      </div>
    </header>
  )
}