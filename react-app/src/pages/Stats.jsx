import { useState, useEffect } from 'react';
import { Clock, CheckCheck, Sparkles } from 'lucide-react';
import { fetchGemini } from '../services/gemini';
import { formatTime } from '../utils/formatters';

export default function Stats({ tasks }) {
  const [aiReport, setAiReport] = useState('Analizează-ți progresul apăsând butonul din stânga.');
  const [loading, setLoading] = useState(false);

  const completedTasks = tasks.filter(t => t.completed);
  const totTime = tasks.reduce((a, t) => a + t.timeSpent, 0);
  
  const cats = { invatare: 0, proiect: 0, rutina: 0 };
  tasks.forEach(t => { if(cats[t.category] !== undefined) cats[t.category] += t.timeSpent; });
  const sum = Object.values(cats).reduce((a, b) => a + b, 0) || 1;

  const generateAIReport = async () => {
    setLoading(true);
    setAiReport('Generare raport...');
    try {
      const dataStr = completedTasks.map(t => `${t.title} (${Math.round(t.timeSpent/60)} min)`).join(', ');
      const prompt = completedTasks.length > 0 
          ? `Generează un raport scurt (max 50 cuvinte) despre productivitatea mea. Am completat: ${dataStr}.`
          : "Generează un sfat motivant scurt (max 30 cuvinte) pentru cineva care încă nu a finalizat nicio sarcină. Fii încurajator, nu critic.";
      
      const report = await fetchGemini(prompt, "Ești un analist de productivitate pozitiv.");
      setAiReport(report);
    } catch {
      setAiReport('Eroare la generarea raportului AI.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto fade-in space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 p-6 rounded-3xl border border-slate-100 shadow-sm dark:shadow-none flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Total Timp</h4>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{formatTime(totTime)}</div>
          </div>
          <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 p-6 rounded-3xl border border-slate-100 shadow-sm dark:shadow-none flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCheck className="w-6 h-6" />
              </div>
              <h4 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Sarcini Gata</h4>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{completedTasks.length}</div>
          </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 p-8 rounded-3xl border border-slate-100 shadow-sm dark:shadow-none relative">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Categorii</h3>
              <div className="flex justify-center items-center py-4">
                  <svg width="180" height="180" viewBox="0 0 42 42" className="transform -rotate-90">
                      <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4"></circle>
                      <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray={`${(cats.invatare/sum)*100} ${100-(cats.invatare/sum)*100}`} strokeDashoffset="25"></circle>
                      <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#8b5cf6" strokeWidth="4" strokeDasharray={`${(cats.proiect/sum)*100} ${100-(cats.proiect/sum)*100}`} strokeDashoffset={`${25-(cats.invatare/sum)*100}`}></circle>
                      <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${(cats.rutina/sum)*100} ${100-(cats.rutina/sum)*100}`} strokeDashoffset={`${25-(cats.invatare/sum)*100-(cats.proiect/sum)*100}`}></circle>
                  </svg>
              </div>
          </div>
          <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 p-8 rounded-3xl border border-slate-100 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ultimul Raport AI</h3>
                <button 
                  onClick={generateAIReport} 
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-xs flex items-center gap-1 disabled:opacity-50">
                  <Sparkles className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> 
                  Analizează
                </button>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-blue-100 dark:border-slate-700 transition-colors duration-300 italic min-h-[100px]">
                  {aiReport}
              </div>
          </div>
      </div>
    </div>
  );
}
