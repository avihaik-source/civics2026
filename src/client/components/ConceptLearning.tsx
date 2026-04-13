import React, { useState } from 'react';
import { useCivicsData } from '../context/CivicsProvider';
import MemoryHint from './MemoryHint';
import AIChatMediator from './AIChatMediator';
import NanoBananaDashboard from './NanoBananaDashboard';
import { TableProperties, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const ConceptLearning: React.FC = () => {
  const { data, loading } = useCivicsData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);

  // מונע קריסה בזמן טעינה
  if (loading || !data) {
    return <div className="p-8 text-center font-bold text-xl">טוען מרחב למידה...</div>;
  }

  // שולף את המושגים מה-Provider
  const concepts = data.flashcards || [];
  
  if (concepts.length === 0) {
    return <div className="p-8 text-center text-red-500">לא נמצאו מושגים ללמידה.</div>;
  }

  const currentConcept = concepts[currentIndex];

  return (
    <div className="concept-card animate-in fade-in duration-500 relative bg-white rounded-2xl shadow-sm p-8 max-w-4xl mx-auto mt-8 border border-slate-100">
      
      {/* כפתור עזר צף - טבלת השוואה (ננו-בננה) */}
      <button 
        onClick={() => setShowDashboard(true)}
        className="absolute left-4 top-4 p-3 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors shadow-sm"
        title="לוח השוואה מהיר"
      >
        <TableProperties size={24} />
      </button>

      {/* כותרת ותוכן המושג */}
      <div className="text-center mb-8 pt-4">
        <h2 className="text-4xl font-black text-[var(--gov-blue)] mb-4">{currentConcept.term}</h2>
        <p className="text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
          {currentConcept.definition}
        </p>
      </div>

      {/* רמז זיכרון מותאם ASD */}
      {currentConcept.memorySentence && (
        <MemoryHint 
          sentence={currentConcept.memorySentence} 
        />
      )}

      {/* ניווט בין מושגים */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
        <button 
          disabled={currentIndex === 0} 
          onClick={() => setCurrentIndex(prev => prev - 1)} 
          className="p-3 bg-slate-100 rounded-full disabled:opacity-30 hover:bg-slate-200 transition-colors"
        >
          <ChevronRight size={28} className="text-slate-700" />
        </button>
        
        <div className="progress-container flex-1 mx-8 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--gov-blue)] transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / concepts.length) * 100}%` }}
          />
        </div>

        <button 
          disabled={currentIndex === concepts.length - 1} 
          onClick={() => setCurrentIndex(prev => prev + 1)} 
          className="p-3 bg-slate-100 rounded-full disabled:opacity-30 hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft size={28} className="text-slate-700" />
        </button>
      </div>

      {/* חלון ננו-בננה */}
      {showDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative shadow-2xl p-6">
            <button 
              onClick={() => setShowDashboard(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all"
            >
              <X size={24} />
            </button>
            <NanoBananaDashboard />
          </div>
        </div>
      )}
    </div>
  );
};