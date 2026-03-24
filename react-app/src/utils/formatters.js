export const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
  
  export const formatDateDisplay = (dateString) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };
  
  export const getCategoryData = (cat) => {
    switch(cat) {
        case 'invatare': return { label: 'Învățare', styles: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', color: '#2563eb' };
        case 'proiect': return { label: 'Proiect', styles: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', color: '#8b5cf6' };
        default: return { label: 'Rutină', styles: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', color: '#f59e0b' };
    }
  };
  
  export const getPriorityIconStyles = (prio) => {
    if(prio === 'high') return 'text-rose-500 dark:text-rose-600';
    if(prio === 'medium') return 'text-amber-500 dark:text-amber-400';
    return 'text-slate-300 dark:text-slate-600';
  };
