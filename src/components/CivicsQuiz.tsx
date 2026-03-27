import { useState, useEffect, useRef } from 'hono/jsx'
import type { JSX } from 'hono/jsx'

export const CivicsQuiz = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ניהול סטייט עבור התשובות של התלמיד באלגוריתם המרובע
  const [answers, setAnswers] = useState({
    identify: '',
    define: '',
    quote: '',
    explain: ''
  });

  const focusRef = useRef<HTMLHeadingElement | null>(null);

  // 1. משיכת הנתונים מה-Payload החדש מתיקיית ה-static!
  useEffect(() => {
    fetch('/static/payload.json')
      .then(res => {
        if (!res.ok) throw new Error('שגיאה בטעינת הנתונים');
        return res.json();
      })
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. ניהול פוקוס נגיש (ASD Compliance) בעת טעינה
  useEffect(() => {
    if (!loading && focusRef.current) {
      focusRef.current.focus();
    }
  }, [loading]);

  const handleInputChange = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="gov-layout container">טוען נתונים למבחן...</div>;
  if (error) return <div className="gov-layout container gov-error">שגיאה: {error}</div>;

  const currentQuestion = data.squareQuestions[0];

  return (
    <div className="quiz-master-container" id="main-container">
      <main className="concept-card">
        {/* כותרת מונגשת פוקוס */}
        <h2 ref={focusRef} tabIndex={-1} className="title">
          {currentQuestion.topic}
        </h2>
        
        {/* טקסט השאלה והמקור */}
        <div className="question-content">
          <p><strong>תיאור האירוע:</strong> {currentQuestion.questionText}</p>
          <blockquote className="source-text">
            <strong>מקור:</strong> {currentQuestion.sourceText}
          </blockquote>
        </div>

        {/* מודול 1: אלגוריתם מרובע - ממשק למילוי */}
        <div className="square-algorithm-form">
          <div className="form-group">
            <label htmlFor="identify">1. ציין (זיהוי המושג):</label>
            <input 
              id="identify"
              type="text" 
              value={answers.identify}
              onInput={(e: any) => handleInputChange('identify', e.target.value)}
              placeholder="לדוגמה: חופש הביטוי..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="define">2. הצג (הגדרת המושג):</label>
            <textarea 
              id="define"
              value={answers.define}
              onInput={(e: any) => handleInputChange('define', e.target.value)}
              placeholder="הגדר את המושג שציינת..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="quote">3. ציטוט (ביסוס מהטקסט):</label>
            <textarea 
              id="quote"
              value={answers.quote}
              onInput={(e: any) => handleInputChange('quote', e.target.value)}
              placeholder="העתק את המשפט המדויק מהטקסט..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="explain">4. הסבר (קישור בין המושג לאירוע):</label>
            <textarea 
              id="explain"
              value={answers.explain}
              onInput={(e: any) => handleInputChange('explain', e.target.value)}
              placeholder={currentQuestion.algorithm.explain.placeholderTemplate}
            />
          </div>
        </div>
      </main>

      {/* Pinned Feedback לפי ה-Schema */}
      {data.teacherFeedback && data.teacherFeedback.map((feedback: any) => (
        <aside key={feedback.id} className="hint-box is-expanded">
          <strong>הערת מורה:</strong> {feedback.content}
        </aside>
      ))}
    </div>
  );
}