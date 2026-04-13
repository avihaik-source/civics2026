import React from 'react';
import { useCivics } from '../context/CivicsProvider';
import { LayoutGrid, Info, Target, Lightbulb, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NanoBananaDashboard: React.FC = () => {
  const { concepts, isAsdMode, loading } = useCivics();
  const navigate = useNavigate();

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold">טוען את לוח הבננה...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* כותרת הדשבורד */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-8 rounded-[2rem] shadow-lg text-blue-900">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black mb-2">לוח ננו-בננה (Nano-Banana)</h1>
            <p className="font-medium opacity-90">ריכוז המושגים בשיטת "השורה התחתונה" למניעת עומס</p>
          </div>
          <LayoutGrid size={48} className="opacity-20" />
        </div>
      </header>

      {/* רשת הכרטיסיות */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {concepts.map((concept) => (
          <div 
            key={concept.id} 
            className={`group bg-white rounded-[2rem] border-2 transition-all duration-300 hover:shadow-xl ${
              isAsdMode ? 'border-blue-200 shadow-blue-50' : 'border-slate-100 shadow-sm'
            }`}
          >
            {/* ראש הכרטיסייה */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{concept.term}</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                יחידה {concept.unitId}
              </span>
            </div>

            {/* תוכן ה"בננה" - מידע מזוקק */}
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg h-fit">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">השורה התחתונה</p>
                  <p className="text-slate-700 font-medium leading-relaxed">{concept.definition_official}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg h-fit">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">איך לזכור (ASD Memory)</p>
                  <p className="text-slate-600 italic leading-relaxed">
                    {concept.memory_concrete_asd || concept.memory_standard}
                  </p>
                </div>
              </div>
            </div>

            {/* כפתורי פעולה מהירים */}
            <div className="p-4 bg-slate-50/50 rounded-b-[2rem] flex gap-2">
              <button 
                onClick={() => navigate('/practice')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <ArrowLeftRight size={16} />
                תרגל צ-ה-צ-ה
              </button>
            </div>
          </div>
        ))}
      </div>

      {concepts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold text-xl">לא נמצאו מושגים להצגה.</p>
        </div>
      )}
    </div>
  );
};