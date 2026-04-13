import React, { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

interface MemoryHintProps {
  sentence: string; // התאמנו את השם למה ששלחת ב-Quiz.tsx קודם
  asdHint?: string;
}

const MemoryHint: React.FC<MemoryHintProps> = ({ sentence, asdHint }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative my-4">
      {/* כפתור גלגל הצלה */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[var(--mnemonic-bg)] text-[var(--gov-blue)] border border-[var(--mnemonic-border)] px-4 py-2 rounded-full font-bold shadow-sm hover:bg-blue-100 transition-colors"
        aria-expanded={isOpen}
      >
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <span>גלגל הצלה (רמז לזיכרון)</span>
      </button>
      
      {/* בועת הרמז */}
      {isOpen && (
        <div className="absolute z-20 top-full right-0 mt-3 w-full max-w-md bg-white border-2 border-[var(--gov-blue)] rounded-xl p-5 shadow-xl animate-in slide-in-from-top-2">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>

          <div className="space-y-3">
            <div className="bg-amber-50 p-3 rounded-lg border-r-4 border-amber-400">
              <p className="text-sm font-bold text-amber-800 mb-1">איך לזכור?</p>
              <p className="text-lg text-slate-700 leading-tight font-medium">
                {sentence}
              </p>
            </div>

            {asdHint && (
              <div className="bg-emerald-50 p-3 rounded-lg border-r-4 border-emerald-400">
                <p className="text-xs font-bold text-emerald-800 mb-1">טיפ נגישות (ASD):</p>
                <p className="text-sm text-slate-600 italic">
                  {asdHint}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryHint;