import { Zap, CalendarDays, ChartPie, Layers, Sparkles, Moon, Sun } from 'lucide-react';

export default function Sidebar({ setView, activeView, toggleTheme, theme }) {
  return (
    <aside className="w-72 bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden md:flex flex-col z-10 relative border-r border-slate-100">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm dark:shadow-none">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          EvoTrack
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <button 
          onClick={() => setView('tasks')}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
            activeView === 'tasks' 
              ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30 hover:scale-[1.02]" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
          }`}>
          <Layers className="w-5 h-5" /> <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
            activeView === 'calendar' 
              ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30 hover:scale-[1.02]" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
          }`}>
          <CalendarDays className="w-5 h-5" /> <span>Planificator</span>
        </button>
        <button 
          onClick={() => setView('stats')}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
            activeView === 'stats' 
              ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30 hover:scale-[1.02]" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
          }`}>
          <ChartPie className="w-5 h-5" /> <span>Statistici AI</span>
        </button>
      </nav>

      <div className="p-6 space-y-4">
        <button 
          onClick={() => setView('stats')}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg dark:shadow-none shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> Analiză AI
        </button>

        <button 
          onClick={toggleTheme} 
          className="w-full py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 mt-2">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Mod Luminos' : 'Mod Întunecat'}</span>
        </button>
      </div>
    </aside>
  );
}
