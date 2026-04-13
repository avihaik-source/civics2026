import React, { useState, useEffect, useRef } from 'react';

// הגדרת טיפוסים ל-TypeScript
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  hint: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

// שים לב לשינוי השם ל-AmericanTest ולייצוא הישיר
export const AmericanTest: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [error, setError] = useState<string | null>(null); // נוסף סטייט לשגיאות
  
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 1. טעינת נתונים ושחזור התקדמות (עם טיפול בשגיאות!)
  useEffect(() => {
    fetch('/questions.json')
      .then(res => {
        if (!res.ok) throw new Error('שגיאה בטעינת השאלות');
        return res.json();
      })
      .then(data => {
        setQuestions(data);
        const saved = localStorage.getItem('civicsProgress');
        // הוספנו את הבסיס העשרוני (10) כ-Best Practice
        if (saved) setCurrentIndex(parseInt(saved, 10));
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError('מצטערים, חלה שגיאה בטעינת המבחן. אנא ודא שקובץ השאלות קיים ורענן את העמוד.');
      });
  }, []);

  // 2. עדכון פוקוס במעבר שאלה (Accessibility)
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus({ preventScroll: true });
    }
  }, [currentIndex, isFinished]);

  const handleAnswer = (option: Option) => {
    if (option.isCorrect) {
      setShowNext(true);
      setActiveHint("מצוין! ניתוח אזרחי מדויק. אפשר להמשיך.");
    } else {
      setActiveHint(option.hint);
    }
  };

  const nextQuestion = () => {
    setOpacity(0); // Fade out
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        localStorage.setItem('civicsProgress', nextIdx.toString());
        setShowNext(false);
        setActiveHint(null);
        setOpacity(1); // Fade in
      } else {
        setIsFinished(true);
        setOpacity(1);
      }
    }, 300);
  };

  const generateCertificate = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 800; canvas.height = 600;
    ctx.fillStyle = '#FBFBFC'; ctx.fillRect(0, 0, 800, 600);
    ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 20; ctx.strokeRect(40, 40, 720, 520);
    ctx.textAlign = 'center'; ctx.fillStyle = '#2A5C82';
    ctx.font = 'bold 40px Arial'; ctx.fillText('תעודת הצטיינות באזרחות', 400, 150);
    ctx.font = '25px Arial'; ctx.fillText('הוענקה על השלמת המבחן המסכם לאזרחות 2026', 400, 300);
    const link = document.createElement('a');
    link.download = 'civics-certificate.png'; link.href = canvas.toDataURL(); link.click();
  };

  // תצוגת שגיאה במקרה של בעיית רשת
  if (error) return <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-lg">{error}</div>;
  if (questions.length === 0) return <div className="p-8 text-center text-[var(--gov-blue)] font-bold">טוען מבחן...</div>;

  const progress = Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="quiz-master-container max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-4" role="progressbar" aria-valuenow={progress}>
        <div className="bg-[var(--gov-blue)] h-4 transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div>
      </div>

      <main className="p-8" style={{ opacity, transition: 'opacity 0.3s ease' }}>
        {!isFinished ? (
          <section className="question-card flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-800" ref={titleRef} tabIndex={-1}>{questions[currentIndex].text}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentIndex].options.map(opt => (
                <button 
                  key={opt.id} 
                  className={`p-4 border-2 rounded-xl text-lg transition-all text-right ${showNext && opt.isCorrect ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`} 
                  onClick={() => handleAnswer(opt)}
                  disabled={showNext} // מונע לחיצות נוספות אחרי תשובה נכונה
                >
                  {opt.text}
                </button>
              ))}
            </div>
            
            {activeHint && (
              <div className={`p-4 rounded-xl text-lg font-medium border-r-4 ${showNext ? 'bg-emerald-100 text-emerald-800 border-emerald-500' : 'bg-amber-50 text-amber-800 border-amber-500'}`} role="status">
                {activeHint}
              </div>
            )}

            {showNext && (
              <button className="mt-4 p-4 bg-[var(--gov-blue)] text-white rounded-xl font-bold text-xl hover:bg-blue-800 transition-colors" onClick={nextQuestion}>
                המשך לשאלה הבאה
              </button>
            )}
          </section>
        ) : (
          <section className="results-screen text-center py-12 flex flex-col items-center gap-6">
            <h1 className="text-5xl font-black text-[var(--gov-blue)]">כל הכבוד!</h1>
            <p className="text-2xl text-slate-600">סיימת את המבחן המסכם בהצלחה.</p>
            <button className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3" onClick={generateCertificate}>
              <span>📜</span> הורד תעודת הצטיינות
            </button>
          </section>
        )}
      </main>
    </div>
  );
};