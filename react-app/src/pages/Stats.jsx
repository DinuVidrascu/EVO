import { useState } from 'react';
import { Clock, CheckCheck, Sparkles, BookOpen, Cpu, RefreshCcw } from 'lucide-react';
import { fetchGemini } from '../services/gemini';
import { formatTime } from '../utils/formatters';

const CATEGORIES = [
  { key: 'invatare', label: 'Învățare', color: '#2563eb', bg: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  { key: 'proiect',  label: 'Proiect',  color: '#8b5cf6', bg: 'bg-violet-500', lightBg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
  { key: 'rutina',   label: 'Rutină',   color: '#f59e0b', bg: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
];

export default function Stats({ tasks }) {
  const [aiReport, setAiReport] = useState('Analizează-ți progresul apăsând butonul de mai sus.');
  const [loading, setLoading] = useState(false);

  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);
  const totTime = tasks.reduce((a, t) => a + t.timeSpent, 0);

  // Calc per categorie
  const catData = CATEGORIES.map(cat => {
    const time = tasks.filter(t => t.category === cat.key).reduce((a, t) => a + t.timeSpent, 0);
    const count = tasks.filter(t => t.category === cat.key).length;
    return { ...cat, time, count };
  });
  const totalTime = catData.reduce((a, c) => a + c.time, 0) || 1;

  // SVG donut segments
  let offset = 25; // start at top
  const segments = catData.map(cat => {
    const pct = (cat.time / totalTime) * 100;
    const seg = { ...cat, pct, offset };
    offset = offset - pct;
    return seg;
  });

  const generateAIReport = async () => {
    setLoading(true);
    setAiReport('Analizez datele tale...');
    try {
      const dataStr = completedTasks.map(t => `${t.title} (${Math.round(t.timeSpent / 60)} min)`).join(', ') || 'Nicio sarcină finalizată';
      const prompt = completedTasks.length > 0
        ? `Generează un raport scurt (max 60 cuvinte) despre productivitatea mea. Am finalizat: ${dataStr}. Restul de ${activeTasks.length} sarcini sunt active.`
        : 'Generează un sfat motivant scurt (max 30 cuvinte) pentru cineva care încă nu a finalizat nicio sarcină. Fii incurajator!';
      const report = await fetchGemini(prompt, 'Ești un analist de productivitate pozitiv și empatic.');
      setAiReport(report);
    } catch {
      setAiReport('Eroare la generarea raportului. Încearcă din nou.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto fade-in space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center transition-colors duration-300">
          <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Timp Total</h4>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{formatTime(totTime)}</div>
        </div>
        <div className="bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center transition-colors duration-300">
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
            <CheckCheck className="w-5 h-5" />
          </div>
          <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Finalizate</h4>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{completedTasks.length}</div>
        </div>
        <div className="bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center transition-colors duration-300">
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active</h4>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{activeTasks.length}</div>
        </div>
        <div className="bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center transition-colors duration-300">
          <div className="w-11 h-11 bg-violet-50 dark:bg-violet-900/30 text-violet-500 rounded-2xl flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total</h4>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{tasks.length}</div>
        </div>
      </div>

      {/* Donut + Legend + AI Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut Chart cu legendă */}
        <div className="bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-colors duration-300">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Distribuție Categorii</h3>
          <div className="flex items-center gap-8">
            {/* SVG Donut */}
            <div className="relative shrink-0">
              <svg width="160" height="160" viewBox="0 0 42 42" className="transform -rotate-90">
                {/* Background ring */}
                <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="5" />
                {/* Segments */}
                {segments.map(seg => (
                  seg.pct > 0 && (
                    <circle
                      key={seg.key}
                      cx="21" cy="21" r="15.91"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="5"
                      strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                      strokeDashoffset={seg.offset}
                      strokeLinecap="round"
                    />
                  )
                ))}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{tasks.length}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Sarcini</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 flex flex-col gap-3">
              {catData.map(cat => {
                const pct = Math.round((cat.time / totalTime) * 100);
                return (
                  <div key={cat.key} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${cat.bg}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.label}</span>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{cat.count} sarcini</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-700 ${cat.bg}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Report */}
        <div className="bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-colors duration-300 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 text-white rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Raport AI</h3>
            </div>
            <button
              onClick={generateAIReport}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Analizează
            </button>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic transition-colors duration-300 min-h-[120px]">
            {loading ? (
              <div className="flex items-center gap-2 text-blue-500">
                <Sparkles className="w-4 h-4 animate-bounce" />
                <span>Analizez datele...</span>
              </div>
            ) : aiReport}
          </div>
        </div>
      </div>
    </div>
  );
}
