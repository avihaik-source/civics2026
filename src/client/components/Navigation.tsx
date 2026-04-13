import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, LayoutGrid, PenTool, BarChart3, GraduationCap, Zap, ZapOff } from 'lucide-react';
import { useCivics } from '../context/CivicsProvider';

export const Navigation: React.FC = () => {
  const { isAsdMode, toggleAsdMode } = useCivics();

  const navItems = [
    { path: '/', label: 'מילון מושגים', icon: <BookOpen size={20} /> },
    { path: '/nano', label: 'ננו-בננה', icon: <LayoutGrid size={20} /> },
    { path: '/practice', label: 'תרגול מרובע', icon: <PenTool size={20} /> },
    { path: '/teacher', label: 'מורה', icon: <BarChart3 size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 md:relative md:bottom-auto md:border-t-0 md:border-l md:h-screen md:w-64 md:flex-col md:pt-10 z-50 shadow-lg md:shadow-none">
      {/* לוגו - גלוי רק בדסקטופ */}
      <div className="hidden md:flex items-center gap-3 mb-10 px-2">
        <div className="bg-yellow-400 p-2 rounded-xl shadow-sm">
          <GraduationCap className="text-blue-900" size={24} />
        </div>
        <span className="text-xl font-black text-slate-800 tracking-tight">אזרחות 2026</span>
      </div>

      {/* מתג ASD - המוח של app.js עבר לכאן */}
      <div className="mb-6 px-2 hidden md:block">
        <button 
          onClick={toggleAsdMode}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
            isAsdMode 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {isAsdMode ? <Zap size={18} fill="currentColor" /> : <ZapOff size={18} />}
          {isAsdMode ? 'מצב ASD פעיל' : 'הפעל מצב ASD'}
        </button>
      </div>

      {/* רשימת ניווט */}
      <ul className="flex justify-between md:flex-col md:gap-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `
                flex flex-col md:flex-row items-center gap-2 md:gap-3 p-3 rounded-xl transition-all
                ${isActive 
                  ? 'text-blue-600 md:bg-blue-50 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 md:hover:bg-slate-50'}
              `}
            >
              {item.icon}
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};