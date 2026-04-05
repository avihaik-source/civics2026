import React from 'react';
import { createRoot } from 'react-dom/client';
import CivicsQuiz from './Quiz';

// אם יש לך קובץ עיצובים (CSS), שחרר את ההערה מהשורה הבאה:
// import './styles.css';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <CivicsQuiz />
    </React.StrictMode>
  );
} else {
  console.error('שגיאה: לא נמצא אלמנט root ב-HTML');
}