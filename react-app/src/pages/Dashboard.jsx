import { useState, useEffect } from 'react';
import { Sparkles, RefreshCcw, Plus, ArrowRight, ClipboardCheck, CircleCheck, CircleAlert, CalendarClock, Timer, Play, Pause, Square } from 'lucide-react';
import { fetchGemini } from '../services/gemini';
import { getCategoryData, getPriorityIconStyles, formatDateDisplay, formatTime } from '../utils/formatters';
import { JournalModal, AIModal } from '../components/Modals';

export default function Dashboard({ tasks, addTask, updateTask, toggleTaskStatus, deleteTask, timerProps }) {
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('invatare');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [quote, setQuote] = useState('Generez un sfat...');
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const [activeAIModal, setActiveAIModal] = useState({ open: false, task: null });
  const [activeJournalModal, setActiveJournalModal] = useState({ open: false, task: null });

  const activeTasks = tasks.filter(t => !t.completed).sort((a,b) => new Date(a.date) - new Date(b.date));
  const completedTasks = tasks.filter(t => t.completed);

  // Initial Motivation
  useEffect(() => {
    loadMotivation();
  }, []);

  const loadMotivation = async () => {
    setLoadingQuote(true);
    try {
      const activeTask = timerProps.currentTrackingTaskId 
        ? tasks.find(t => t.id === timerProps.currentTrackingTaskId) 
        : null;
      let prompt = activeTask 
          ? `Sfat scurt de concentrare pentru lucrul la "${activeTask.title}". Max 10 cuvinte.` 
          : "Frază originală disciplină. Max 10 cuvinte.";
      const response = await fetchGemini(prompt, "Ești mentor de productivitate empatic.");
      setQuote(response.replace(/^["']|["']$/g, '').trim());
    } catch {
      setQuote('Fii disciplinat și vei învinge mereu.');
    }
    setLoadingQuote(false);
  };

  const handleSmartTask = async () => {
    if (!taskName.trim()) {
      alert("Scrie o idee scurtă mai întâi!");
      return;
    }
    setLoadingMagic(true);
    try {
      const prompt = `Analizează această idee de sarcină: "${taskName}". \n1. Formulează un titlu scurt, acționabil.\n2. Categorie: "invatare", "proiect", "rutina".\n3. Prioritate: "low", "medium", "high".\nRăspunde DOAR cu JSON valid: {"title": "...", "category": "...", "priority": "..."}.`;
      const response = await fetchGemini(prompt, "Ești un expert în organizare. Răspunzi exclusiv JSON.");
      const cleanJson = response.replace(/```json|```/gi, '').trim();
      const data = JSON.parse(cleanJson);

      if (data.title) setTaskName(data.title);
      if (data.category) setTaskCategory(data.category);
      if (data.priority) setTaskPriority(data.priority);
    } catch (e) {
      console.error(e);
      alert("Eroare la procesarea AI.");
    }
    setLoadingMagic(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    addTask({
      id: Date.now(),
      title: taskName,
      category: taskCategory,
      priority: taskPriority,
      date: taskDate,
      completed: false,
      timeSpent: 0,
      journal: ''
    });
    setTaskName('');
  };

  const completedPct = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const currentTask = timerProps.currentTrackingTaskId ? tasks.find(x => x.id === timerProps.currentTrackingTaskId) : null;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* LEFT COLUMN */}
      <div className="xl:col-span-8 flex flex-col gap-6 lg:gap-8">
        
        {/* Banner Motivatie */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 bg-white dark:bg-slate-900/20 backdrop-blur-sm text-amber-300 rounded-xl flex items-center justify-center border border-white/20 ${loadingQuote ? 'animate-pulse' : ''}`}>
                <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-blue-200 text-[10px] uppercase tracking-widest mb-0.5">✨ Inspirație AI</h4>
                <p className={`text-sm font-medium text-white leading-snug ${loadingQuote ? 'opacity-70 italic' : ''}`}>
                    {loadingQuote ? 'Gemini gândește un sfat...' : `"${quote}"`}
                </p>
            </div>
            <button 
                onClick={loadMotivation}
                disabled={loadingQuote}
                className="w-8 h-8 shrink-0 bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/10 disabled:opacity-50">
                <RefreshCcw className={`w-3 h-3 ${loadingQuote ? 'animate-spin' : ''}`} />
            </button>
        </div>

        {/* Task Form */}
        <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 rounded-3xl shadow-sm dark:shadow-none p-6 lg:p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Planifică o activitate</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-2 w-full">
                        <input 
                            type="text" 
                            value={taskName}
                            onChange={e => setTaskName(e.target.value)}
                            placeholder="Scrie o idee și apasă bagheta AI..."
                            className="px-5 py-3.5 pr-14 bg-background dark:bg-slate-950 transition-colors duration-300 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-600/50 text-slate-700 dark:text-slate-300 font-medium w-full outline-none"
                            required
                        />
                        <button 
                            type="button" 
                            onClick={handleSmartTask}
                            disabled={loadingMagic}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all disabled:opacity-50"
                            title="Formatează automat cu AI ✨">
                            <Sparkles className={`w-5 h-5 ${loadingMagic ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <select 
                        value={taskCategory} 
                        onChange={e => setTaskCategory(e.target.value)}
                        className="px-5 py-3.5 bg-background dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300 font-medium w-full outline-none">
                        <option value="invatare">🧠 Învățare</option>
                        <option value="proiect">💻 Proiect</option>
                        <option value="rutina">🔄 Rutină</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="date" 
                        value={taskDate}
                        onChange={e => setTaskDate(e.target.value)}
                        className="px-5 py-3.5 bg-background dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300 font-medium w-full outline-none"
                        required
                    />
                    <select 
                        value={taskPriority}
                        onChange={e => setTaskPriority(e.target.value)}
                        className="px-5 py-3.5 bg-background dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300 font-medium w-full outline-none">
                        <option value="low">🔽 Prioritate Mică</option>
                        <option value="medium">⏺ Prioritate Medie</option>
                        <option value="high">🔼 Prioritate Mare</option>
                    </select>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                        Adaugă <ArrowRight className="w-4 h-4"/>
                    </button>
                </div>
            </form>
        </div>

        {/* Progres Bara */}
        <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 rounded-3xl shadow-sm dark:shadow-none p-6 lg:p-8 border border-slate-100">
            <div className="flex justify-between items-end mb-5">
                <div>
                    <h3 className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1">Progres Total</h3>
                    <div className="text-4xl font-black text-slate-800 dark:text-slate-100">{completedPct}%</div>
                </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-3">
                <div className="bg-blue-600 h-3 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]" style={{ width: `${completedPct}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500">
                <span>Început</span>
                <span className="bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    {completedTasks.length} / {tasks.length} Sarcini
                </span>
                <span>100%</span>
            </div>
        </div>

        {/* Lista Sarcini Active */}
        <div className="flex flex-col gap-4">
          {activeTasks.length === 0 ? (
            <div className="text-center py-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">
                    <ClipboardCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-600 dark:text-slate-300 text-sm">Totul este curat!</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Nu ai nicio sarcină planificată deocamdată.</p>
            </div>
          ) : (
            activeTasks.map(t => {
              const isTracking = timerProps.currentTrackingTaskId === t.id;
              const cat = getCategoryData(t.category);
              const prioStyles = getPriorityIconStyles(t.priority);
              
              return (
                <div key={t.id} className={`fade-in bg-card dark:border-slate-800 dark:bg-slate-900 border ${isTracking ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-100'} rounded-3xl p-5 flex items-center justify-between shadow-sm dark:shadow-none transition-colors duration-300`}>
                    <div className="flex items-center gap-5 flex-1 overflow-hidden">
                        <button onClick={() => {
                            toggleTaskStatus(t.id);
                            if(isTracking) timerProps.stopTracking();
                        }} className="text-slate-200 dark:text-slate-700 hover:text-emerald-400 dark:hover:text-emerald-400 transition-transform">
                            <CircleCheck className="w-8 h-8" />
                        </button>
                        <div className="flex-1 truncate">
                            <div className="flex items-center gap-3 mb-1">
                                <CircleAlert className={`w-3 h-3 ${prioStyles}`} />
                                <h4 className={`font-bold text-slate-800 dark:text-slate-100 truncate ${isTracking ? 'text-blue-600 dark:text-blue-600' : ''}`}>{t.title}</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                                <span className={`${cat.styles} text-[10px] font-bold px-2 py-0.5 rounded-lg`}>{cat.label}</span> 
                                <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3"/> {formatDateDisplay(t.date)}</span> 
                                <span>{formatTime(t.timeSpent)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setActiveAIModal({ open: true, task: t })} className="text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 w-10 h-10 rounded-2xl flex items-center justify-center hover:scale-105 transition-all">
                            <Sparkles className="w-4 h-4"/>
                        </button>
                        {isTracking ? (
                            <button onClick={timerProps.stopTracking} className="bg-rose-500 dark:bg-rose-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-md">
                                <Square className="w-4 h-4 fill-current"/>
                            </button>
                        ) : (
                            <button onClick={() => timerProps.startTracking(t)} className="bg-slate-800 dark:bg-slate-700 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-md">
                                <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                            </button>
                        )}
                        <button onClick={() => setActiveJournalModal({ open: true, task: t })} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center">
                           <CalendarClock className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
              );
            })
          )}
        </div>

        {/* Lista Sarcini Completate */}
        {completedTasks.length > 0 && (
          <div>
              <div className="flex items-center gap-3 mb-4 px-2">
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Finalizate</h3>
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">{completedTasks.length}</span>
              </div>
              <div className="flex flex-col gap-3 opacity-60">
                 {completedTasks.map(t => {
                   const cat = getCategoryData(t.category);
                   return (
                      <div key={t.id} className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between">
                          <div className="flex gap-4 items-center">
                              <CircleCheck className="text-emerald-500 dark:text-emerald-400 w-6 h-6 fill-emerald-500/10" />
                              <div>
                                  <h4 className="font-bold text-slate-500 dark:text-slate-400 line-through text-sm">{t.title}</h4>
                                  <div className="flex gap-2">
                                      <span className={`${cat.styles} text-[10px] font-bold px-2 py-0.5 rounded-lg`}>{cat.label}</span> 
                                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{formatTime(t.timeSpent)}</span>
                                  </div>
                              </div>
                          </div>
                          <button onClick={() => deleteTask(t.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-600 transition-colors shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                      </div>
                   )
                 })}
              </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN - TIMER */}
      <div className="xl:col-span-4 flex flex-col gap-6 lg:gap-8">
        <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 p-6 sticky top-10">
            <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Timer className="text-blue-600 w-4 h-4" /> Focus Sesiune
            </h2>
            <div className="text-slate-800 dark:text-slate-100 text-sm font-bold mb-3 truncate w-full">
              {currentTask ? currentTask.title : 'Nicio sarcină selectată'}
            </div>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-5">
                <div className="text-3xl font-mono font-light text-blue-600 tracking-tighter">
                  {formatTime(timerProps.currentSeconds)}
                </div>
                <div className="flex gap-2">
                    {currentTask ? (
                      <button onClick={timerProps.stopTracking} className="w-11 h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-md">
                          <Square className="w-4 h-4 fill-current" />
                      </button>
                    ) : (
                      <button disabled className="w-11 h-11 bg-slate-800 dark:bg-slate-700 text-white rounded-xl flex items-center justify-center shadow-md opacity-40">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    )}
                </div>
            </div>
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Lucrat azi:</span>
                <span className="font-mono text-slate-800 dark:text-slate-100 font-bold bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm px-3 py-1.5 rounded-lg text-xs">
                  {formatTime(timerProps.totalSecondsToday)}
                </span>
            </div>
        </div>
      </div>

      <JournalModal 
        isOpen={activeJournalModal.open} 
        task={activeJournalModal.task} 
        onClose={() => setActiveJournalModal({open: false, task: null})} 
        onSave={(id, text) => {
          updateTask(id, { journal: text });
        }} 
      />
      <AIModal 
        isOpen={activeAIModal.open} 
        task={activeAIModal.task} 
        onClose={() => setActiveAIModal({open: false, task: null})} 
      />
    </div>
  );
}
