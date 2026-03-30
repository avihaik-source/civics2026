import '../public/civics2026-additions.css'; 
// הנתיב תלוי באיפה הקובץ שלך נמצא ביחס ל-Quiz.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechToText } from './hooks/useSpeechToText'; 

// הגדרת טיפוסים בסיסית כדי למנוע שגיאות TS
interface Question {
  topic: string;
  questionText: string;
  sourceText: string;
  algorithm?: {
    explain?: {
      placeholderTemplate?: string;
    };
  };
}

interface QuizData {
  squareQuestions: Question[];
  teacherFeedback?: Array<{ id: string; content: string }>;
}

const MicButton = ({ 
  field, 
  isActive, 
  toggleRecording 
}: { 
  field: string; 
  isActive: boolean; 
  toggleRecording: (field: string) => void; 
}) => {
  return (
    <button
      type="button"
      onClick={() => toggleRecording(field)}
      style={{
        marginLeft: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        color: isActive ? 'red' : '#005baa',
        animation: isActive ? 'pulse 1.5s infinite' : 'none'
      }}
      title={isActive ? "הקלטה פעילה, לחץ לעצירה" : "לחץ כדי לענות בעל פה"}
    >
      {isActive ? '🔴' : '🎤'}
    </button>
  );
};

export default function CivicsQuiz(): React.JSX.Element {
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [answers, setAnswers] = useState<Record<string, string>>({
    identify: '',
    define: '',
    quote: '',
    explain: ''
  });

  const [activeRecordingField, setActiveRecordingField] = useState<string | null>(null);
  const { isRecording, transcript, startRecording, stopRecording } = useSpeechToText();
  const focusRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // ודא שהנתיב הזה נכון בתוך תיקיית ה-public שלך
    fetch('/static/payload.json')
      .then(res => {
        if (!res.ok) throw new Error('שגיאה בטעינת הנתונים');
        return res.json();
      })
      .then(jsonData => {
        setData(jsonData as QuizData); // הוספת "as QuizData" אומרת ל-TS לסמוך עליך
        setLoading(false);
})
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && focusRef.current) {
      focusRef.current.focus();
    }
  }, [loading]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (isRecording && activeRecordingField && transcript) {
      handleInputChange(activeRecordingField, transcript);
    }
  }, [transcript, isRecording, activeRecordingField, handleInputChange]);

  const toggleRecording = (field: string) => {
    if (isRecording && activeRecordingField === field) {
      stopRecording();
      setActiveRecordingField(null);
    } else {
      setActiveRecordingField(field);
      startRecording();
    }
  };

  const submitToTeacher = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: "תלמיד אנונימי",
          timestamp: new Date().toISOString(),
          answers: answers
        })
      });

      if (!response.ok) throw new Error(`שגיאת שרת: ${response.status}`);

      alert("הדיווח נשלח בהצלחה!"); 
    } catch (err) {
      console.error("שגיאה בשליחת הדיווח:", err);
      alert("הייתה בעיה בשליחת הדיווח.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="gov-layout container">טוען נתונים...</div>;
  if (error) return <div className="gov-layout container gov-error">שגיאה: {error}</div>;

  const currentQuestion = data?.squareQuestions?.[0];
  if (!currentQuestion) return <div>לא נמצאו שאלות.</div>;

  return (
    <div className="quiz-master-container" id="main-container" dir="rtl">
      <main className="concept-card">
        <h2 ref={focusRef} tabIndex={-1} className="title">
          {currentQuestion.topic}
        </h2>
        <div className="question-content">
          <p><strong>תיאור האירוע:</strong> {currentQuestion.questionText}</p>
          <blockquote className="source-text">
            <strong>מקור:</strong> {currentQuestion.sourceText}
          </blockquote>
        </div>

        <div className="square-algorithm-form">
          {[
            { id: 'identify', label: '1. ציין (זיהוי המושג):', placeholder: 'לדוגמה: חופש הביטוי...' },
            { id: 'define', label: '2. הצג (הגדרת המושג):', placeholder: 'הגדר את המושג...' },
            { id: 'quote', label: '3. ציטוט (ביסוס מהטקסט):', placeholder: 'העתק משפט מהטקסט...' },
            { id: 'explain', label: '4. הסבר (קישור):', placeholder: currentQuestion.algorithm?.explain?.placeholderTemplate || "הסבר..." }
          ].map((input) => (
            <div className="form-group" key={input.id}>
              <label htmlFor={input.id}>
                {input.label}
                <MicButton 
                  field={input.id} 
                  isActive={isRecording && activeRecordingField === input.id} 
                  toggleRecording={toggleRecording} 
                />
              </label>
              {input.id === 'identify' ? (
                <input
                  id={input.id}
                  type="text"
                  value={answers[input.id]}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  placeholder={input.placeholder}
                />
              ) : (
                <textarea
                  id={input.id}
                  value={answers[input.id]}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  placeholder={input.placeholder}
                />
              )}
            </div>
          ))}

          <div className="submit-section" style={{ marginTop: '20px', textAlign: 'left' }}>
            <button
              onClick={submitToTeacher}
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'שולח...' : 'שלח דיווח למורה'}
            </button>
          </div>
        </div>
      </main>

      {data?.teacherFeedback?.map((feedback) => (
        <aside key={feedback.id} className="hint-box is-expanded">
          <strong>הערת מורה:</strong> {feedback.content}
        </aside>
      ))}
    </div>
  );
}