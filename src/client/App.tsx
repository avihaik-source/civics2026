import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { CivicsProvider } from './context/CivicsProvider';
import { Navigation } from './components/Navigation';
import { Dictionary } from './components/Dictionary';
import { NanoBananaDashboard } from './components/NanoBananaDashboard';
import { SquaredPractice } from './components/SquaredPractice';
import { Dashboard as TeacherDashboard } from './components/Dashboard';

import './styles/civics-theme.css';
import './index.css';

export const App = () => {
  return (
    <CivicsProvider>
      <HashRouter>
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
          {/* תפריט ניווט */}
          <Navigation />

          {/* אזור התוכן המרכזי */}
          <main className="flex-1 pb-24 md:pb-0 overflow-y-auto max-h-screen">
            <div className="max-w-6xl mx-auto py-8 px-4">
              <Routes>
                <Route path="/" element={<Dictionary />} />
                <Route path="/nano" element={<NanoBananaDashboard />} />
                <Route path="/practice" element={<SquaredPractice />} />
                <Route path="/teacher" element={<TeacherDashboard />} />
              </Routes>
            </div>
          </main>
        </div>
      </HashRouter>
    </CivicsProvider>
  );
};