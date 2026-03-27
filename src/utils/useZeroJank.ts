import { useState, useCallback } from 'hono/jsx';

/**
 * פרוטוקול Zero-Jank: 
 * מבטיח שעדכוני ממשק כבדים (כמו רינדור טקסט ארוך או סינון) 
 * יתבצעו בסנכרון מושלם עם קצב רענון המסך של הדפדפן, ללא קפיצות.
 */
export function useZeroJankState<T>(initialValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(initialValue);

  const setZeroJankState = useCallback((newValue: T) => {
    // שימוש ב-requestAnimationFrame כדי לתזמן את הרינדור לפריים הפנוי הבא
    window.requestAnimationFrame(() => {
      setState(newValue);
    });
  }, []);

  return [state, setZeroJankState];
}