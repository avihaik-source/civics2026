import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

interface StudentData {
  name: string;
  studentClass: string;
}

const App: React.FC = () => {
  const = useState<StudentData | null>(null);
  const = useState<number>(0); // 0: Onboarding, 1: Acquisition, 2: Practice
  const = useState<number>(-1);
  const = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob>();

  // שמירת מצב ב-LocalStorage למניעת אובדן נתונים [1, 4]
  useEffect(() => {
    const saved = localStorage.getItem('civics_2026_student');
    if (saved) setStudent(JSON.parse(saved));
  },);

  const handleOnboarding = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      studentClass: formData.get('class') as string,
    };
    if (data.name && data.studentClass) {
      setStudent(data);
      localStorage.setItem('civics_2026_student', JSON.stringify(data));
      setStep(1);
    }
  };

  // שלב א: הקראה עם הדגשה (TTS & Highlighting) 
  const startTTS = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.85;

    utterance.onboundary = (event) => {
      // הדגשת המילה הנוכחית למיקוד קוגניטיבי
      const wordIndex = text.substring(0, event.charIndex).split(' ').length - 1;
      setCurrentWordIndex(wordIndex);
    };

    utterance.onend = () => setCurrentWordIndex(-1);
    window.speechSynthesis.speak(utterance);
  };

  // שלב ג: הקלטת תשובה מלאה (MediaRecorder) 
  const toggleRecording = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.start();
      setIsRecording(true);
    } else {
      mediaRecorder.current?.stop();
      setIsRecording(false);
      alert("ההקלטה נשמרה ותישלח למורה עם סיום המשימה");
    }
  };

  return (
    <div className="app-shell">
      <div id="silver-spine" aria-hidden="true" />
      
      <main className="content-container">
        {step === 0 && (
          <section className="card onboarding-card">
            <h1>אזרחות 2026 | מרחב למידה</h1>
            <form onSubmit={handleOnboarding}>
              <input name="name" placeholder="שם מלא" required aria-label="שם מלא" />
              <input name="class" placeholder="כיתה (למשל: י'1)" required aria-label="כיתה" />
              <button type="submit">כניסה למרחב הממלכתי</button>
            </form>
          </section>
        )}

        {step >= 1 && student && (
          <>
            <header className="student-info">
              שלום, {student.name} (כיתה {student.studentClass})
            </header>
            
            {step === 1 && (
              <section className="card concept-phase">
                <h2>הזכות לשוויון: הבחנה, אפליה והעדפה מתקנת</h2>
                <p className="memory-anchor">עוגן: שוויון הוא לא לתת לכולם אותו דבר, אלא לתת לכל אחד מה שהוא צריך.</p>
                <button onClick={() => setStep(2)}>עבור לתרגול הבטוח</button>
              </section>
            )}

            {step === 2 && (
              <section className="card practice-arena">
                <div className="step-box">
                  <h3>שלב 1: הקראה והבנה</h3>
                  <div className="readable-area">
                    {"מדיניות של הבחנה מבוססת על שוני רלוונטי מוצדק.".split(' ').map((word, i) => (
                      <span key={i} className={currentWordIndex === i? 'highlight' : ''}>{word} </span>
                    ))}
                  </div>
                  <button onClick={() => startTTS("מדיניות של הבחנה מבוססת על שוני רלוונטי מוצדק")}>השמע טקסט</button>
                </div>

                <div className="step-box">
                  <h3>שלב 2: נקודות עיקריות</h3>
                  <textarea placeholder="הקלידו כאן את הנקודות שחשוב לזכור..." aria-live="polite" />
                </div>

                <div className="step-box">
                  <h3>שלב 3: מענה קולי מלא</h3>
                  <button 
                    className={isRecording? "recording" : ""} 
                    onClick={toggleRecording}
                  >
                    {isRecording? "עצור הקלטה" : "התחל להקליט תשובה"}
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;