import { Zap, Moon, Sun, Layers, CalendarDays, ChartPie } from 'lucide-react';

export default function MobileHeader({ setView, activeView, toggleTheme, theme }) {
  return (
    <header className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 p-4 shadow-sm dark:shadow-none md:hidden flex justify-between items-center z-20">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Zap className="text-blue-600 fill-current w-5 h-5" /> EvoTrack
      </h1>
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button 
          onClick={toggleTheme} 
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 my-auto mx-1"></div>
        <button 
          onClick={() => setView('tasks')} 
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'tasks' 
              ? "text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none" 
              : "text-slate-500 dark:text-slate-400"
          }`}>
          <Layers className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setView('calendar')} 
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'calendar' 
              ? "text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none" 
              : "text-slate-500 dark:text-slate-400"
          }`}>
          <CalendarDays className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setView('stats')} 
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'stats' 
              ? "text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none" 
              : "text-slate-500 dark:text-slate-400"
          }`}>
          <ChartPie className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
