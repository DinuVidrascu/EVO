import { useState, useEffect } from 'react';
import { X, Book, Sparkles } from 'lucide-react';
import { fetchGemini } from '../services/gemini';
import { formatDateDisplay, getCategoryData, formatTime, getPriorityIconStyles } from '../utils/formatters';

export function JournalModal({ isOpen, onClose, task, onSave }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (task) setText(task.journal || '');
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    onSave(task.id, text);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[90] p-4 fade-in" onClick={onClose}>
      <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] border border-blue-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-blue-100 dark:border-slate-800 flex justify-between items-center bg-blue-50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Book className="text-blue-600 dark:text-blue-400 w-5 h-5" /> Jurnal
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-full flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <h4 className="font-bold text-slate-700 dark:text-slate-200">{task.title}</h4>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ce ai învățat azi?"
            className="w-full h-48 p-4 bg-background dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-600/50 outline-none text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300"
          />
          <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg dark:shadow-none hover:bg-blue-700 transition-all">
            Salvează
          </button>
        </div>
      </div>
    </div>
  );
}

export function AIModal({ isOpen, onClose, task }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAIStrategy = () => {
    setLoading(true);
    setError(null);
    fetchGemini(
      `Oferă o strategie de 3 pași pentru sarcina: "${task.title}". Răspunde în HTML simplu (doar <ul><li>...), fără markdown.`,
      'Ești un expert în productivitate. Oferi sfaturi clare și acționabile.'
    )
      .then(res => {
        setContent(res.replace(/```html|```/gi, ''));
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Eroare AI. Încearcă din nou.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && task) {
      loadAIStrategy();
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[95] p-4 fade-in" onClick={onClose}>
      <div className="bg-card dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300 rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh] border border-blue-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-blue-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Asistent AI
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center shadow-sm dark:shadow-none hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col items-center py-12 text-slate-500 dark:text-slate-400 gap-3">
              <Sparkles className="animate-bounce w-10 h-10 text-blue-600" />
              <p className="font-medium">Analizez strategia...</p>
              <p className="text-xs text-slate-400">Câteva secunde, te rog...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 text-center gap-4">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">AI temporar indisponibil</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{error}</p>
              </div>
              <button
                onClick={loadAIStrategy}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" /> Încearcă din nou
              </button>
            </div>
          ) : (
            <div
              className="text-slate-600 dark:text-slate-300 text-sm font-medium space-y-4 prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

