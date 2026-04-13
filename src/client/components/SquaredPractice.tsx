import React, { useState } from 'react';
import { client } from '../client/api';
import { CheckCircle2, HelpCircle, ArrowLeft, ArrowRight, Quote, Brain, AlertCircle } from 'lucide-react';
import { AIChatMediator } from './AIChatMediator';

export const SquaredPractice = ({ questionId }: { questionId?: string }) => {
  const [step, setStep] = useState(0); // 0: ציין, 1: הצג, 2: צטט, 3: הסבר
  const [answers, setAnswers] = useState({ identify: '', define: '', quote: '', explain: '' });
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // נניח שאנחנו מושכים את השאלה לפי ה-ID
  const question = {
    title: "בגרות קיץ תשפ\"ה - אירוע בטחוני",
    text: "ראש עיריית שדרות הורה לסגור את המקלטים הציבוריים בטענה שהם מהווים מטרד תברואתי, למרות הנחיות פיקוד העורף המורות להשאירם פתוחים בשל המצב הביטחוני.",
    task: "ציין והצג את סוג המדיניות שבאה לידי ביטוי בדברי ראש העיר. הסבר כיצד מדיניות זו באה לידי ביטוי בטקסט.",
    correctTerm: "הבחנה מותרת"
  };

  const steps = [
    { id: 'identify', label: '1. ציין', icon: <CheckCircle2 />, placeholder: 'מהו המושג האזרחי?', hint: 'חפש מושג מתוך רשימת הזכויות או העקרונות.' },
    { id: 'define', label: '2. הצג', icon: <Brain />, placeholder: 'הגדר את המושג באופן תיאורטי...', hint: 'היעזר במילון המושגים אם שכחת.' },
    { id: 'quote', label: '3. צטט', icon: <Quote />, placeholder: 'העתק את המשפט הרלוונטי מהטקסט...', hint: 'חפש את המילים שמוכיחות את מה שציינת.' },
    { id: 'explain', label: '4. הסבר', icon: <AlertCircle />, placeholder: 'קשר בין הציטוט למושג...', hint: 'התחל ב: "בקטסט נכתב ש... וזה מעיד על... כי..."' },
  ];

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 0 && setStep(s => s - 1);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-4 min-h-[80vh]">
      
      {/* צד א': הטקסט (העוגן הוויזואלי) */}
      <section className="flex-1 bg-slate-50 p-8 rounded-3xl border-2 border-slate-100">
        <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">{question.title}</h2>
        <div className="prose prose-lg text-slate-800 leading-relaxed font-medium">
          {question.text}
        </div>
        <div className="mt-8 p-4 bg-blue-100/50 rounded-2xl border-r-4 border-blue-500">
          <p className="font-bold text-blue-900">המשימה:</p>
          <p className="text-blue-800">{question.task}</p>
        </div>
      </section>

      {/* צד ב': מרחב הכתיבה (הסטפר) */}
      <section className="flex-1 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col">
        {/* Step Progress Indicator */}
        <div className="flex justify-between mb-10">
          {steps.map((s, idx) => (
            <div key={s.id} className={`flex flex-col items-center gap-2 ${idx <= step ? 'text-blue-600' : 'text-slate-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${idx <= step ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                {idx < step ? <CheckCircle2 size={20} /> : <span>{idx + 1}</span>}
              </div>
              <span className="text-xs font-bold">{s.label.split(' ')[1]}</span>
            </div>
          ))}
        </div>

        {/* Active Step Field */}
        <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            {steps[step].icon}
            <h3>{steps[step].label}</h3>
          </div>
          
          <p className="text-slate-500 font-medium">{steps[step].hint}</p>

          <textarea
            autoFocus
            className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none"
            placeholder={steps[step].placeholder}
            value={(answers as any)[steps[step].id]}
            onChange={(e) => setAnswers({...answers, [steps[step].id]: e.target.value})}
          />

          <button 
            onClick={() => setActiveChat(`אני צריך עזרה בשלב ה${steps[step].label} בשאלה על ${question.title}`)}
            className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
          >
            <HelpCircle size={18} />
            צריך רמז מהסוכן?
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <button onClick={handleBack} disabled={step === 0} className="p-4 rounded-xl hover:bg-slate-100 disabled:opacity-0 transition-all">
            <ArrowRight />
          </button>
          
          {step < 3 ? (
            <button onClick={handleNext} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
              המשך לשלב הבא
              <ArrowLeft />
            </button>
          ) : (
            <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
              הגש תשובה לבדיקה
            </button>
          )}
        </div>
      </section>

      {activeChat && (
        <AIChatMediator 
          concept={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
};