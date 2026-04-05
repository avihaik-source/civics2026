import React from 'react';
import { createRoot } from 'react-dom/client';
import type { FC } from 'react';
import CivicsQuiz from './Quiz';
import './styles.css';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<CivicsQuiz /> as any);
}