import React, { useState } from 'react';
import { Search, BookOpen, BrainCircuit, MessageSquare } from 'lucide-react';
import { useCivics } from '../context/CivicsProvider';
import MemoryHint from './MemoryHint';

export const Dictionary = () => {
  const { concepts, loading, isAsdMode, error } = useCivics();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = concepts.filter(c => 
    c.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 animate-pulse text-slate-400">
      <BrainCircuit className="w-12 h-12 mb-4" />
      <p>מעבד מושגים ברמה אופטימלית...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-200 text-sm font-bold">
          ⚠️ {error}
        </div>
      )}

      <header className="space-y-4">
        <h1 className="text-4xl font-black text-slate-800">מילון המושגים</h1>
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="חפש מושג (למשל: דמוקרטיה, לאומיות...)"
            className="w-full pr-12 pl-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none shadow-sm transition-all text-lg"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-6">
        {filtered.map(c => (
          <article 
            key={c.id} 
            className={`p-8 bg-white rounded-3xl border-2 transition-all duration-300 ${
              isAsdMode ? 'border-blue-400 shadow-xl shadow-blue-50' : 'border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isAsdMode ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                  <BookOpen size={24} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">{c.term}</h3>
              </div>
            </div>

            <p className={`text-lg leading-relaxed mb-6 transition-colors ${isAsdMode ? 'text-blue-900 font-medium' : 'text-slate-600'}`}>
              {/* הלוגיקה שמחליפה את ההגדרה במצב ASD */}
              {isAsdMode && c.memory_concrete_asd 
                ? `💡 ${c.memory_concrete_asd}` 
                : c.definition_official}
            </p>

            <div className="pt-4 border-t border-slate-50">
              <MemoryHint 
                sentence={c.memory_standard} 
                asdHint={c.memory_concrete_asd} 
              />
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-xl italic">לא מצאנו מושג כזה... אולי נסה מילה אחרת?</p>
          </div>
        )}
      </div>
    </div>
  );
};