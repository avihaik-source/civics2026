import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { client } from '../api';
import { Flashcard, SquareQuestion } from '../schema';

interface CivicsContextType {
  concepts: Flashcard[];
  questions: SquareQuestion[];
  studentId: string;
  loading: boolean;
  isAsdMode: boolean; 
  toggleAsdMode: () => void;
  error: string | null;
  refreshData: () => Promise<void>;
  updateProgress: (unitId: number, data: any) => Promise<void>;
}

const CivicsContext = createContext<CivicsContextType | undefined>(undefined);

export const CivicsProvider = ({ children }: { children: ReactNode }) => {
  const [concepts, setConcepts] = useState<any[]>([]); // מקבל נתונים מה-DB (snake_case)
  const [questions, setQuestions] = useState<SquareQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string>('');
  const [isAsdMode, setIsAsdMode] = useState(false);

  useEffect(() => {
    // ניהול זהות תלמיד פרסיסטנטי
    let savedId = localStorage.getItem('civics_student_id');
    if (!savedId) {
      savedId = `stu_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('civics_student_id', savedId);
    }
    setStudentId(savedId);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. טעינת מושגים מה-D1 API
      const res = await client.api.concepts.$get();
      const result = await res.json();
      
      // 2. טעינת שאלות מה-JSON המקומי
      const qRes = await fetch('/questions.json');
      const qData = await qRes.json();
      
      if (result.success) {
        setConcepts(result.data);
        setQuestions(qData);
      } else {
        throw new Error("נתונים לא תקינים מהשרת");
      }
    } catch (err) {
      setError("שגיאת תקשורת. המערכת פועלת במצב מוגבל.");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsdMode = () => setIsAsdMode(prev => !prev);

  const updateProgress = async (unitId: number, progressData: any) => {
    // בעתיד: קריאת POST ל-Worker לשמירה ב-D1
    console.log(`[D1 Sync] Student ${studentId} updated unit ${unitId}`, progressData);
  };

  return (
    <CivicsContext.Provider value={{ 
      concepts, 
      questions, 
      studentId, 
      loading, 
      isAsdMode, 
      toggleAsdMode, 
      error, 
      refreshData: fetchInitialData, 
      updateProgress 
    }}>
      {children}
    </CivicsContext.Provider>
  );
};

export const useCivics = () => {
  const context = useContext(CivicsContext);
  if (!context) throw new Error('useCivics must be used within a CivicsProvider');
  return context;
};