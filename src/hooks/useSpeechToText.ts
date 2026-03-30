import { useState, useEffect, useRef } from 'react';

// הגדרה ל-TypeScript כדי שלא יצעק על אובייקטים של הדפדפן
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // בדיקה האם הדפדפן תומך בזיהוי קול
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // המשך להקשיב גם אם יש פאוזה קטנה
      recognitionRef.current.interimResults = true; // תראה תוצאות תוך כדי דיבור
      recognitionRef.current.lang = 'he-IL'; // הגדרת שפה לעברית! 🇮🇱

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('שגיאת זיהוי קול:', event.error);
        setIsRecording(false);
      };
    } else {
      console.warn('הדפדפן שלך לא תומך בזיהוי קול 😢');
    }

    // ניקוי כשהקומפוננטה נסגרת
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript(''); // איפוס טקסט קודם
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, transcript, startRecording, stopRecording };
};