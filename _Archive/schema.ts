/**
 * Project: Civics 2026 - High-Functioning ASD Adaptation
 * Description: Master TypeScript Interfaces for Frontend/Backend Data Exchange
 * Version: 1.0.0 (Ready for GitHub Push)
 * Pedagogy Lead: [User Name / PM]
 */

// --- Enums & Utility Types ---

/** תמיכה בעמעום ידע כללי שאינו במיקוד למניעת עומס חזותי */
export type ContentStatus = 'active' | 'deprecated';

/** הגדרות מחמירות לרכיבי הממשק כדי לכפות נגישות מה-Backend */
export type ComponentUIType = 
  | 'autocomplete' 
  | 'textarea-validated' 
  | 'text-selection-tool' 
  | 'textarea-template' 
  | 'dropdown-selector';

// --- 1. מודול האלגוריתם המרובע (תשובות מובנות) ---

export interface SquareAlgorithmQuestion {
  questionId: string;
  topic: string;
  status: ContentStatus;
  /** חובת מקור למניעת עמימות קוגניטיבית */
  source: string;
  hasVisualAid: boolean;
  questionText: string;
  squareAlgorithm: {
    identify: {
      uiType: Extract<ComponentUIType, 'autocomplete'>;
      expectedTermId: string;
      /** חובה להיות false! טקסט חופשי מעלה חרדה ודורש פונקציות ניהוליות גבוהות */
      allowFreeText: false; 
    };
    define: {
      uiType: Extract<ComponentUIType, 'textarea-validated'>;
      /** חיבור ישיר למודול השינון לשליפת רמזים (Retrieval Cues) */
      flashcardRef: string;
    };
    quote: {
      uiType: Extract<ComponentUIType, 'text-selection-tool'>;
      sourceTextId: string;
    };
    explain: {
      uiType: Extract<ComponentUIType, 'textarea-template'>;
      /** פיגום טקסטואלי חצי-אפוי המפחית עומס מזיכרון העבודה */
      placeholderTemplate: string;
    };
  };
}

// --- 2. מודול כרטיסיות שינון (פירוק והדגשה) ---

export interface Flashcard {
  flashcardId: string;
  conceptName: string;
  /** מסנן חומר "מעומעם" כדי לייצר ודאות בלמידה */
  isCoreCurriculum: boolean;
  frontSide: {
    displayTitle: string;
    visualCue: string;
    cognitiveHint: string;
  };
  backSide: {
    /** מערך של משפטים קצרים (Chunking) במקום פסקאות ארוכות */
    exactDefinition: string[];
    emphasisKeywords: string[];
    hasVisualAid: boolean;
    visualAidRef?: string;
    /** מניעת טעויות נפוצות בהתבסס על דוחות הפיקוח - חוסך תסכול מראש */
    supervisorPitfallWarning: string;
  };
}

// --- 3. מודול שאלות עמדה (מעקף Theory of Mind) ---

export interface PositionQuestion {
  positionQuestionId: string;
  dilemmaTopic: string;
  structureTemplate: {
    step1_claim: { scaffolding: string };
    step2_transition: { 
      uiType: Extract<ComponentUIType, 'dropdown-selector'>;
      /** מילות ניגוד הכרחיות ליצירת רצף לוגי תקין */
      options: string[]; 
    };
    step3_counterClaim: { scaffolding: string };
  };
  /** חלוקה מראש לקטגוריות מצמצמת את הצורך בניתוח רגשי/חברתי מורכב */
  conceptBank: {
    sideA: string[];
    sideB: string[];
  };
  uiDirectives: {
    layout: 'split-screen-table';
    visualNeutrality: boolean;
  };
}

// --- 4. מודול למידה ותקשורת (ASD-LMS) ---

export interface ChecklistItem {
  taskType: string;
  targetId: string;
  requirement: string;
  /** מספק ודאות וסיום ברור (Closure) לתלמיד */
  isCompleted: boolean;
}

export interface MicroMission {
  missionId: string;
  progressPercentage: number;
  checklistItems: ChecklistItem[];
}

export interface PinnedFeedback {
  feedbackId: string;
  targetEntityId: string;
  /** הערות מרחפות שקטות - חל איסור מוחלט על פופ-אפים או צלצולים */
  visualStyle: 'pinned-note' | 'inline-hint';
  content: string;
}

export interface ContextualPing {
  pingId: string;
  contextRef: { 
    entityType: 'question' | 'flashcard' | 'mission'; 
    entityId: string; 
  };
  /** מונע את הצורך בניסוח חופשי של שאלות למורה (מפחית חרדה חברתית) */
  predefinedTemplateId: string;
  status: 'pending' | 'resolved';
}

export interface LmsCommunication {
  contextualPing: ContextualPing;
  pinnedFeedback: PinnedFeedback;
  microMission: MicroMission;
}

// --- Master Schema Export ---

export interface Civics2026Schema {
  squareAlgorithmQuestion: SquareAlgorithmQuestion;
  flashcard: Flashcard;
  positionQuestion: PositionQuestion;
  lmsCommunication: LmsCommunication;
}