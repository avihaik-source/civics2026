// src/schema.ts

/**
 * מודול 1: אלגוריתם מרובע (צ-ה-צ-ה)
 * מבנה תשובה תקני לפי משרד החינוך להפחתת עומס קוגניטיבי
 */
export interface SquareAlgorithm {
  identify: string;    // ציין: שם המושג
  define: string;      // הצג: הגדרה תיאורטית מהמילון
  quote: string;       // צטט: הוכחה מהטקסט
  explain: string;     // הסבר: הקישור בין הציטוט למושג
}

export interface SquareQuestion {
  id: string;
  topic: string;
  questionText: string;
  sourceText: string;
  algorithm: SquareAlgorithm;
  hints: string[];     // רמזים מונגשים ל-ASD
}

/**
 * מודול 2: כרטיסיות "שאגת הארי"
 */
export interface Flashcard {
  id: string;
  term: string;
  definitionOfficial: string; // ההגדרה הרשמית של המפמ"ר
  memorySentence: string;      // משפט זיכרון קצר וקולע
  concreteExample: string;     // דוגמה מוחשית (לפי המחקר שלך)
}

/**
 * מודול 3: ניהול התקדמות תלמיד
 */
export interface StudentProgress {
  studentId: string;
  completedUnits: number[];
  lastActive: string;
  moodTrack: string[]; // מעקב אחר המצב הרגשי למניעת "פניקה"
}

export type AppSchema = {
  questions: SquareQuestion[];
  flashcards: Flashcard[];
};