input, textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid var(--gov-gray-700);
  border-radius: 8px;
  font-family: var(--font-main);
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  border-color: var(--gov-focus);
  outline: none; /* ה-outline הכללי שלנו יתפוס כאן */
}
import React, { useState, useEffect, useRef } from 'react';
// במידה והשתמשנו ב-Hook שיצרנו:
// import { useZeroJankState } from './utils/useZeroJank';

export default function CivicsQuiz() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ניהול סטייט עבור התשובות של התלמיד באלגוריתם המרובע
  const [answers, setAnswers] = useState({
    identify: '',
    define: '',
    quote: '',
    explain: ''
  });

  const focusRef = useRef(null);

  // 1. משיכת הנתונים מה-Payload החדש
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

  const handleInputChange = (field, value) => {
    // אידיאלית כאן נשתמש ב-useZeroJankState כדי למנוע קפיצות במסך
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
              onChange={(e) => handleInputChange('identify', e.target.value)}
              placeholder="לדוגמה: חופש הביטוי..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="define">2. הצג (הגדרת המושג):</label>
            <textarea 
              id="define"
              value={answers.define}
              onChange={(e) => handleInputChange('define', e.target.value)}
              placeholder="הגדר את המושג שציינת..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="quote">3. ציטוט (ביסוס מהטקסט):</label>
            <textarea 
              id="quote"
              value={answers.quote}
              onChange={(e) => handleInputChange('quote', e.target.value)}
              placeholder="העתק את המשפט המדויק מהטקסט..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="explain">4. הסבר (קישור בין המושג לאירוע):</label>
            <textarea 
              id="explain"
              value={answers.explain}
              onChange={(e) => handleInputChange('explain', e.target.value)}
              placeholder={currentQuestion.algorithm.explain.placeholderTemplate}
            />
          </div>
        </div>
      </main>

      {/* Pinned Feedback לפי ה-Schema (במידה ויש הערה מהמורה) */}
      {data.teacherFeedback && data.teacherFeedback.map(feedback => (
        <aside key={feedback.id} className="hint-box is-expanded">
          <strong>הערת מורה:</strong> {feedback.content}
        </aside>
      ))}
    </div>
  );
}