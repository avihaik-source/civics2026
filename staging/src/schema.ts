// src/schema.ts

// מודול 1: אלגוריתם מרובע (תשובה מובנית להפחתת עומס קוגניטיבי)
export interface SquareAlgorithm {
  identify: { expectedTerm: string };
  define: { flashcardRefId: string };
  quote: { sourceTextId: string };
  explain: { placeholderTemplate: string };
}

export interface SquareQuestion {
  id: string;
  topic: string;
  questionText: string;
  sourceText: string;
  algorithm: SquareAlgorithm;
}

// מודול 2: כרטיסיות (Chunking - חלוקה למנות מידע קטנות)
export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  memorySentence: string;
}

// מודול 3: שאלות עמדה (Split-screen לעיבוד נתונים מקביל)
export interface PositionQuestion {
  id: string;
  dilemma: string;
  scaffoldingTemplate: {
    claimText: string;
    transitionOptions: string[];
    counterClaimText: string;
  };
  conceptBank: {
    sideA: string[]; // מושגים התומכים בצד אחד
    sideB: string[]; // מושגים התומכים בצד שני
  };
}

// מודול 4: תקשורת שקטה מותאמת ASD (Pinned Notes)
export interface PinnedFeedback {
  id: string;
  targetQuestionId: string;
  visualStyle: 'pinned-note'; // חל איסור על pop-ups
  content: string;
}

// ייצוא המבנה הכללי של קובץ הנתונים
export interface CivicsPayload {
  squareQuestions: SquareQuestion[];
  flashcards: Flashcard[];
  positionQuestions: PositionQuestion[];
  teacherFeedback: PinnedFeedback[];
}