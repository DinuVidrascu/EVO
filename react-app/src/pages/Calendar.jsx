import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarX2 } from 'lucide-react';
import { formatDateDisplay, getCategoryData, formatTime, getPriorityIconStyles } from '../utils/formatters';
import { CircleCheck, CircleAlert, Trash2 } from 'lucide-react';

export default function Calendar({ tasks, updateTask, deleteTask }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalDate, setModalDate] = useState(null);

  const changeMonth = (delta) => {
    setCurrentDate(prev => {
      const nw = new Date(prev);
      nw.setMonth(nw.getMonth() + delta);
      return nw;
    });
  };

  const dayTasks = modalDate ? tasks.filter(t => t.date === modalDate) : [];

  const yr = currentDate.getFullYear();
  const mo = currentDate.getMonth();
  const moNames = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
  
  const first = new Date(yr, mo, 1).getDay(); 
  const days = new Date(yr, mo+1, 0).getDate();
  const startOffset = first === 0 ? 6 : first - 1;

  const emptyCells = Array.from({ length: startOffset }, (_, i) => i);
  const monthDays = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{moNames[mo]} {yr}</h2>
            <div className="flex gap-2 bg-background dark:bg-slate-950 transition-colors duration-300 p-1.5 rounded-2xl">
                <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-white dark:bg-slate-900 shadow-sm rounded-xl text-slate-600 dark:text-slate-300 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-600">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-white dark:bg-slate-900 shadow-sm rounded-xl text-slate-600 dark:text-slate-300 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-600">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-3 mb-2 md:mb-4 text-center text-[10px] md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <div>Lu</div><div>Ma</div><div>Mi</div><div>Jo</div><div>Vi</div><div>Sâ</div><div>Du</div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-3">
          {emptyCells.map(i => (
             <div key={`empty-${i}`} className="bg-background dark:bg-slate-950 transition-colors duration-300 rounded-lg md:rounded-2xl p-1 md:p-2 opacity-40 calendar-day" />
          ))}

          {monthDays.map(d => {
            const ds = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const tsks = tasks.filter(t => t.date === ds);
            
            return (
              <div 
                key={d} 
                onClick={() => setModalDate(ds)} 
                className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 border border-slate-100 rounded-lg md:rounded-2xl p-1 md:p-3 calendar-day flex flex-col gap-0.5 md:gap-1 hover:shadow-md cursor-pointer overflow-hidden">
                  <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 text-center md:text-left">{d}</span>
                  {tsks.slice(0, 2).map((t, index) => (
                    <div key={index} className="text-[8px] md:text-[9px] truncate bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded font-bold">
                        {t.title}
                    </div>
                  ))}
                  {tsks.length > 2 && (
                    <div className="text-[7px] md:text-[8px] text-slate-400 dark:text-slate-500 font-bold text-center md:text-left">
                        + {tsks.length - 2}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {modalDate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 fade-in p-4" onClick={() => setModalDate(null)}>
            <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] border border-white/20" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatDateDisplay(modalDate)}</h3>
                    <button onClick={() => setModalDate(null)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 rounded-full flex items-center justify-center"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-background dark:bg-slate-950">
                    {dayTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <CalendarX2 className="mx-auto w-10 h-10 mb-3 opacity-30" />
                            <p className="font-medium">Nicio activitate în această zi.</p>
                        </div>
                    ) : (
                        dayTasks.map(t => {
                            const catData = getCategoryData(t.category);
                            return (
                                <div key={t.id} className={`bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 ${t.completed ? 'opacity-60' : ''} shadow-sm relative`}>
                                    <div className="flex justify-between items-start mb-3 border-b border-slate-50 dark:border-slate-800 pb-3">
                                        <div className="flex items-center gap-3 pr-8">
                                            <CircleAlert className={`w-3 h-3 ${getPriorityIconStyles(t.priority)}`} />
                                            <h4 className={`font-bold text-slate-800 dark:text-slate-100 ${t.completed ? 'line-through' : ''}`}>{t.title}</h4>
                                        </div>
                                        <button onClick={() => deleteTask(t.id)} className="w-8 h-8 text-slate-400 hover:text-rose-500 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full absolute top-4 right-4">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`${catData.styles} text-[10px] font-bold px-2 py-0.5 rounded-lg`}>{catData.label}</span>
                                            <span className="text-xs font-mono font-bold bg-background dark:bg-slate-950 px-2.5 py-1 rounded-lg text-slate-500 dark:text-slate-400">{formatTime(t.timeSpent)}</span>
                                        </div>
                                        <button 
                                          onClick={() => updateTask(t.id, { completed: !t.completed })} 
                                          className={`text-xs px-4 py-2 rounded-xl font-bold transition-transform hover:scale-105 flex items-center gap-1 ${t.completed ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                                            {t.completed ? 'Reia' : <><CircleCheck className="w-3 h-3" /> Gata</>}
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
