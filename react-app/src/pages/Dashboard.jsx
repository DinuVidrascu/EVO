import { useState, useRef } from 'react';
import { Sparkles, RefreshCcw, Plus, ArrowRight, ClipboardCheck, CircleCheck, CircleAlert, CalendarClock, Timer, Play, Pause, Square, Trash2, Search, X, SlidersHorizontal, GripVertical } from 'lucide-react';
import { fetchGemini } from '../services/gemini';
import { getCategoryData, getPriorityIconStyles, formatDateDisplay, formatTime } from '../utils/formatters';
import { JournalModal, AIModal } from '../components/Modals';

export default function Dashboard({ tasks, addTask, updateTask, toggleTaskStatus, deleteTask, timerProps }) {
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('invatare');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [quote, setQuote] = useState(() => {
    return localStorage.getItem('evotrack_saved_quote') || 'Pregătește-te pentru o zi productivă!';
  });
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const [activeAIModal, setActiveAIModal] = useState({ open: false, task: null });
  const [activeJournalModal, setActiveJournalModal] = useState({ open: false, task: null });
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragList = useRef([]);

  const activeTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      return new Date(a.date) - new Date(b.date);
    });

  // Filtrare dinamică după search + categorie + prioritate
  const filteredTasks = activeTasks
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(t => filterCategory === 'all' || t.category === filterCategory)
    .filter(t => filterPriority === 'all' || t.priority === filterPriority);

  const hasFilters = searchQuery || filterCategory !== 'all' || filterPriority !== 'all';
  const resetFilters = () => { setSearchQuery(''); setFilterCategory('all'); setFilterPriority('all'); };

  // D. Drag & Drop reorder
  const handleDragStart = (e, id) => {
    setDragId(id);
    dragList.current = [...filteredTasks.map(t => t.id)];
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragId) setDragOverId(id);
  };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const list = [...dragList.current];
    const from = list.indexOf(dragId);
    const to = list.indexOf(targetId);
    list.splice(from, 1);
    list.splice(to, 0, dragId);
    list.forEach((id, idx) => updateTask(id, { order: idx }));
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };
  const completedTasks = tasks.filter(t => t.completed);

  // Citatul se incarca DOAR la apasarea manuala a butonului refresh
  // Nu se fac cereri automate la pornire sau la schimbarea task-ului

  const loadMotivation = async () => {
    setLoadingQuote(true);
    try {
      const activeTask = timerProps.currentTrackingTaskId 
        ? tasks.find(t => t.id === timerProps.currentTrackingTaskId) 
        : null;
      const currentId = activeTask ? String(activeTask.id) : 'none';

      let prompt = activeTask 
          ? `Oferă o singură frază scurtă de concentrare pentru sarcina: "${activeTask.title}". Max 10 cuvinte. Răspunde EXCLUSIV cu fraza, fără introducere.` 
          : "Oferă o singură frază scurtă de disciplină sau motivație. Max 10 cuvinte. Răspunde EXCLUSIV cu fraza, fără introducere, fără ghilimele.";
      
      const response = await fetchGemini(prompt, "Ești mentor de productivitate empatic. Oferi doar un singur sfat scurt.");
      const cleanQuote = response.replace(/^["']|["']$/g, '').trim().split('\n')[0];
      
      setQuote(cleanQuote);
      localStorage.setItem('evotrack_saved_quote', cleanQuote);
      localStorage.setItem('evotrack_saved_quote_taskid', currentId);
    } catch (e) {
      console.error("Motivation Error:", e);
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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDeleteTask = (taskId) => {
    setConfirmDelete(taskId);
  };

  const confirmDeleteTask = () => {
    deleteTask(confirmDelete);
    setConfirmDelete(null);
    showToast('Sarcina a fost ștearsă.', 'error');
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
    showToast('Sarcină adăugată cu succes! 🎯');
  };

  const completedPct = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const currentTask = timerProps.currentTrackingTaskId ? tasks.find(x => x.id === timerProps.currentTrackingTaskId) : null;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] fade-in px-5 py-3.5 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 ${
          toast.type === 'error' 
            ? 'bg-rose-500 text-white' 
            : 'bg-emerald-500 text-white'
        }`}>
          {toast.type === 'error' ? '🗑️' : '✅'} {toast.msg}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Ștergi sarcina?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Această acțiune nu poate fi anulată.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                Anulează
              </button>
              <button onClick={confirmDeleteTask} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-colors shadow-sm">
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}

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
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Rândul principal: input + categorie */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="relative col-span-2 md:col-span-2 w-full">
                        <input 
                            type="text" 
                            value={taskName}
                            onChange={e => setTaskName(e.target.value)}
                            placeholder="Scrie o idee..."
                            className="px-4 py-3 pr-12 bg-background dark:bg-slate-950 transition-colors duration-300 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-600/50 text-slate-700 dark:text-slate-300 font-medium w-full outline-none text-sm"
                            required
                        />
                        <button 
                            type="button" 
                            onClick={handleSmartTask}
                            disabled={loadingMagic}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:bg-amber-900/30 rounded-xl transition-all disabled:opacity-50"
                            title="Formatează automat cu AI ✨">
                            <Sparkles className={`w-4 h-4 ${loadingMagic ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <select 
                        value={taskCategory} 
                        onChange={e => setTaskCategory(e.target.value)}
                        className="col-span-2 md:col-span-1 px-4 py-3 bg-background dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300 font-medium w-full outline-none text-sm">
                        <option value="invatare">🧠 Învățare</option>
                        <option value="proiect">💻 Proiect</option>
                        <option value="rutina">🔄 Rutină</option>
                    </select>
                </div>
                {/* Rândul secundar: data + prioritate + buton */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <input 
                        type="date" 
                        value={taskDate}
                        onChange={e => setTaskDate(e.target.value)}
                        className="px-4 py-3 bg-background dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300 font-medium w-full outline-none text-sm"
                        required
                    />
                    <select 
                        value={taskPriority}
                        onChange={e => setTaskPriority(e.target.value)}
                        className="px-4 py-3 bg-background dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300 font-medium w-full outline-none text-sm">
                        <option value="low">🔽 Mică</option>
                        <option value="medium">⏺ Medie</option>
                        <option value="high">🔼 Mare</option>
                    </select>
                    <button type="submit" className="col-span-2 md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
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

        {/* Bara Search + Filtre */}
        <div className="bg-card dark:bg-slate-900 dark:border-slate-800 border border-slate-100 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-sm dark:shadow-none">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Caută sarcini..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
          {/* Filtru Categorie */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-600 dark:text-slate-300 outline-none font-medium cursor-pointer"
          >
            <option value="all">📂 Categorie</option>
            <option value="invatare">🧠 Învățare</option>
            <option value="proiect">💻 Proiect</option>
            <option value="rutina">🔄 Rutină</option>
          </select>
          {/* Filtru Prioritate */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-600 dark:text-slate-300 outline-none font-medium cursor-pointer"
          >
            <option value="all">⚡ Prioritate</option>
            <option value="high">🔼 Mare</option>
            <option value="medium">⏺ Medie</option>
            <option value="low">🔽 Mică</option>
          </select>
          {/* Reset filtre */}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-2xl text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Resetează
            </button>
          )}
        </div>

        {/* Counter rezultate când sunt filtre active */}
        {hasFilters && (
          <div className="flex items-center gap-2 px-1 text-sm text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {filteredTasks.length === 0
                ? 'Nicio sarcină nu corespunde filtrelor'
                : `${filteredTasks.length} din ${activeTasks.length} sarcini`}
            </span>
          </div>
        )}

        {/* Lista Sarcini Active */}
        <div className="flex flex-col gap-4">
          {filteredTasks.length === 0 ? (
            hasFilters ? (
              <div className="slide-up text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Search className="w-7 h-7 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-600 dark:text-slate-300 mb-1">Niciun rezultat</h4>
                <p className="text-sm text-slate-400 max-w-xs mx-auto mb-3">Nicio sarcină nu corespunde filtrelor selectate.</p>
                <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">Resetează filtrele</button>
              </div>
            ) : (
            <div className="slide-up text-center py-12 bg-gradient-to-b from-blue-50/60 to-transparent dark:from-blue-900/10 rounded-3xl border border-dashed border-blue-200 dark:border-blue-900/30">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-3xl animate-pulse" />
                <div className="relative w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-900/50">
                  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="10" width="36" height="30" rx="4" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2"/>
                    <rect x="6" y="10" width="36" height="8" rx="4" fill="#BFDBFE"/>
                    <path d="M14 26h20M14 32h12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="36" cy="34" r="7" fill="#2563eb"/>
                    <path d="M33 34l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base mb-1">Ești la zi! 🎉</h4>
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Nu ai nicio sarcină activă. Adaugă prima ta activitate folosind formularul de mai sus.</p>
            </div>
            )
          ) : (
            filteredTasks.map(t => {
              const isTracking = timerProps.currentTrackingTaskId === t.id;
              const cat = getCategoryData(t.category);
              const prioStyles = getPriorityIconStyles(t.priority);
              const isDragging = dragId === t.id;
              const isOver = dragOverId === t.id;

              return (
                <div
                  key={t.id}
                  draggable={!editingId}
                  onDragStart={e => handleDragStart(e, t.id)}
                  onDragOver={e => handleDragOver(e, t.id)}
                  onDrop={e => handleDrop(e, t.id)}
                  onDragEnd={handleDragEnd}
                  className={`fade-in bg-card dark:border-slate-800 dark:bg-slate-900 border ${
                    isTracking ? 'border-blue-600 ring-2 ring-blue-600/20' :
                    isOver ? 'border-blue-400 border-dashed' :
                    'border-slate-100'
                  } rounded-3xl p-5 flex items-center justify-between shadow-sm dark:shadow-none transition-all duration-200 ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
                >
                    <div className="flex items-center gap-5 flex-1 overflow-hidden">
                        {/* Drag handle */}
                        <div className="text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing shrink-0 hover:text-slate-400 dark:hover:text-slate-500 transition-colors">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button onClick={() => {

                            toggleTaskStatus(t.id);
                            if(isTracking) timerProps.stopTracking();
                        }} className="text-slate-200 dark:text-slate-700 hover:text-emerald-400 dark:hover:text-emerald-400 transition-transform">
                            <CircleCheck className="w-8 h-8" />
                        </button>
                        <div className="flex-1 truncate">
                            <div className="flex items-center gap-3 mb-1">
                            <CircleAlert className={`w-3 h-3 ${prioStyles} shrink-0`} />
                            {editingId === t.id ? (
                              <input
                                autoFocus
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                onBlur={() => {
                                  if (editingTitle.trim()) updateTask(t.id, { title: editingTitle.trim() });
                                  setEditingId(null);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') e.target.blur();
                                  if (e.key === 'Escape') { setEditingId(null); }
                                }}
                                className="font-bold text-slate-800 dark:text-slate-100 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-0.5 outline-none flex-1 min-w-0 text-sm"
                              />
                            ) : (
                              <h4
                                className={`font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isTracking ? 'text-blue-600 dark:text-blue-600' : ''}`}
                                onDoubleClick={() => { setEditingId(t.id); setEditingTitle(t.title); }}
                                title="Dublu-click pentru a edita"
                              >{t.title}</h4>
                            )}
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
                        <button onClick={() => handleDeleteTask(t.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 w-10 h-10 rounded-2xl flex items-center justify-center transition-colors">
                           <Trash2 className="w-4 h-4"/>
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
                          <button onClick={() => handleDeleteTask(t.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-600 transition-colors shrink-0 w-8 h-8 flex items-center justify-center rounded-xl">
                              <Trash2 className="w-4 h-4" />
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
