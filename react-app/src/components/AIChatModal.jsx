import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { fetchGemini } from '../services/gemini';
import { formatTime } from '../utils/formatters';

const SUGGESTED = [
  'Ce sarcini ar trebui să prioritizez azi?',
  'Cum îmi pot îmbunătăți productivitatea?',
  'Analizează-mi progresul de azi',
  'Dă-mi un plan pentru restul zilei',
];

export default function AIChatModal({ open, onClose, tasks }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Bună! Sunt asistentul tău AI personal. Știu tot despre task-urile tale și sunt gata să te ajut cu strategii, analize și sfaturi de productivitate. Ce ai vrea să știi?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!open) return null;

  const buildContext = () => {
    const completed = tasks.filter(t => t.completed);
    const active = tasks.filter(t => !t.completed);
    const totalTime = tasks.reduce((a, t) => a + t.timeSpent, 0);
    const catCount = {};
    tasks.forEach(t => { catCount[t.category] = (catCount[t.category] || 0) + 1; });
    const domCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'necunoscut';

    return `Context utilizator EvoTrack:
- Sarcini active (${active.length}): ${active.map(t => `"${t.title}" (${t.priority}, ${t.category}, ${formatTime(t.timeSpent)})`).join('; ') || 'niciuna'}
- Sarcini finalizate (${completed.length}): ${completed.map(t => `"${t.title}"`).join(', ') || 'niciuna'}
- Timp total lucrat: ${formatTime(totalTime)}
- Categoria dominantă: ${domCat}
- Total sarcini: ${tasks.length}`;
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const context = buildContext();
      const systemPrompt = `Ești EvoTrack AI, un asistent de productivitate empatic și direct. 
${context}
Răspunde în română, concis (max 100 cuvinte), cu sfaturi acționabile. Nu repeta contextul înapoi.`;
      
      const reply = await fetchGemini(userMsg, systemPrompt);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Eroare AI. Încearcă din nou în câteva secunde.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col"
        style={{ maxHeight: '85vh', height: '600px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">EvoTrack AI</h3>
              <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" /> Online · știe contextul tău
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-blue-500 to-violet-600'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                  : 'bg-blue-600 text-white rounded-tr-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analizez...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
            {SUGGESTED.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="shrink-0 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-xl font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Întreba-mă orice despre productivitatea ta..."
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 px-2"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
