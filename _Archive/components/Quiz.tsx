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

const CivicsQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [opacity, setOpacity] = useState(1);
  
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 1. טעינת נתונים ושחזור התקדמות
  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        const saved = localStorage.getItem('civicsProgress');
        if (saved) setCurrentIndex(parseInt(saved));
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
    ctx.font = '25px Arial'; ctx.fillText('הוענקה על השלמת תרגול אזרחות 2026', 400, 300);
    const link = document.createElement('a');
    link.download = 'certificate.png'; link.href = canvas.toDataURL(); link.click();
  };

  if (questions.length === 0) return <div>טוען...</div>;

  const progress = Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="quiz-master-container">
      {/* Progress Bar */}
      <div className="progress-wrapper" role="progressbar" aria-valuenow={progress}>
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <main style={{ opacity, transition: 'opacity 0.3s ease' }}>
        {!isFinished ? (
          <section className="question-card">
            <h2 ref={titleRef} tabIndex={-1}>{questions[currentIndex].text}</h2>
            <div className="options-grid">
              {questions[currentIndex].options.map(opt => (
                <button key={opt.id} className="option-btn" onClick={() => handleAnswer(opt)}>
                  {opt.text}
                </button>
              ))}
            </div>
            
            {activeHint && (
              <div className={`hint-box is-expanded ${showNext ? 'is-success' : ''}`} role="status">
                {activeHint}
              </div>
            )}

            {showNext && (
              <button className="btn-next" onClick={nextQuestion}>המשך לשאלה הבאה</button>
            )}
          </section>
        ) : (
          <section className="results-screen">
            <h1>כל הכבוד!</h1>
            <p>סיימת את התרגול בהצלחה.</p>
            <button className="btn-primary" onClick={generateCertificate}>📜 הורד תעודה</button>
          </section>
        )}
      </main>
    </div>
  );
};

export default CivicsQuiz;