import React, { useState, useRef, useEffect } from 'react';
import { Send, X, User, Loader2, Sparkles } from 'lucide-react';
import { useCivics } from '../context/CivicsProvider';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface AIChatMediatorProps {
  concept: string;
  onClose: () => void;
}

// --- Arik Avatar Integration ---
// כאן אנו מגדירים את הדמות המאוירת המקורית שלך.
// בדפדפן האמיתי, אנו נהפוך את image_0c9d6f.png לקובץ SVG נקי או PNG שקוף.
// כאן אנו משתמשים בתיאור ויזואלי של האיור המקורי שלך.
const ArikAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`shrink-0 rounded-full flex items-center justify-center p-0.5 ${className}`}>
    {/* האיור המקורי של האריה עם הרעמה והמשקפיים מתוך image_0c9d6f.png */}
    <img 
      src="/assets/arik-lion-sketch.png" // הנתיב לנכס הדיגיטלי המנוקה
      alt="אריק - סוכן למידה מאויר" 
      className="w-full h-full object-contain rounded-full"
    />
  </div>
);

export const AIChatMediator: React.FC<AIChatMediatorProps> = ({ concept, onClose }) => {
  const { isAsdMode } = useCivics();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `שלום! אני אריק, סוכן הלמידה שלך. 🤖\nראיתי שאתה לומד על המושג "${concept}". יש לך שאלה עליו או תרצה שאתרגל אותך?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/practice/${encodeURIComponent(concept)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages, isAsdMode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.question || data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'אופס, משהו השתבש בחיבור למוח שלי. נסה שוב.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'שגיאת רשת. בדוק את החיבור שלך.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 left-6 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 transition-all duration-300 ease-in-out sm:w-[400px] h-[600px] ${
      isAsdMode ? 'border-4 border-emerald-400 bg-white' : 'bg-slate-50 border border-slate-200'
    }`}>
      
      {/* --- אזור הכותרת (Header) --- */}
      <div className={`p-4 flex justify-between items-center text-white shadow-md z-10 ${
        isAsdMode ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-blue-700 to-blue-500'
      }`}>
        <div className="flex items-center gap-3">
          {/* אווטאר האריה המאויר שלך בכותרת */}
          <ArikAvatar className="w-10 h-10 bg-white/10 backdrop-blur-sm" />
          <div>
            <h3 className={`font-bold text-lg flex items-center gap-2 ${isAsdMode ? 'text-blue-900' : 'text-white'}`}>
              אריק - מורה פרטי
              <Sparkles size={16} className={isAsdMode ? 'text-blue-700' : 'text-yellow-300'} />
            </h3>
            <p className={isAsdMode ? 'text-blue-800 text-xs' : 'text-blue-100 text-xs'}>מתרגל את: {concept}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <X size={20} className={isAsdMode ? 'text-blue-900' : 'text-white'} />
        </button>
      </div>

      {/* --- אזור השיחה (Messages) --- */}
      {/* רקע עם טקסטורה עדינה */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* אווטאר דינמי ליד בועת הצ'אט */}
              <div className={`shrink-0 w-9 h-9 flex items-center justify-center ${msg.role === 'user' ? 'w-8 h-8' : ''}`}>
                {msg.role === 'user' 
                  ? <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm"><User size={16} /></div>
                  // האריה המאויר המקורי שלך מופיע כאן ליד כל בועה של אריק
                  : <ArikAvatar className="w-9 h-9" />
                }
              </div>

              {/* בועת הטקסט */}
              <div className={`p-4 text-sm shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tl-sm'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {/* אנימציית טעינה בזמן שה-AI חושב */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex items-end gap-2 max-w-[80%]">
              {/* האריה המאויר גם בטעינה */}
              <ArikAvatar className="w-9 h-9" />
              <div className="p-4 rounded-2xl rounded-tr-sm shadow-sm flex items-center gap-1 bg-emerald-50 border border-emerald-200">
                <div className="w-2 h-2 rounded-full animate-bounce bg-emerald-600" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-emerald-600" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-emerald-600" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* --- אזור הקלט (Input) --- */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 rounded-full p-1 transition-all bg-slate-100 focus-within:ring-2 focus-within:ring-blue-500">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="כתוב תשובה או שאלה לאריק..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-800 focus:outline-none"
            dir="rtl"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-full transition-colors shrink-0 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
};