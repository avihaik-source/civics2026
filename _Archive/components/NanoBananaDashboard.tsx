import React from 'react';

// --- Data Dictionary ---
const rowsData = [
  { key: 'bottomLine', label: 'השורה התחתונה' },
  { key: 'reason', label: 'הסיבה (למה?)' },
  { key: 'goal', label: 'המטרה (לאן?)' },
  { key: 'duration', label: 'משך הזמן' },
  { key: 'example', label: 'דוגמת ננו' },
  { key: 'status', label: 'סטטוס בננה' },
];

const conceptsData = [
  {
    id: 'distinction',
    title: 'הבחנה מותרת',
    theme: { bg: 'bg-blue-50/80', border: 'border-blue-300', text: 'text-blue-950', iconFill: '#93C5FD', iconStroke: '#1E3A8A' },
    icon: (fill, stroke) => (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 34C14 34 22 42 34 30C40 24 38 16 38 16C38 16 32 24 24 26C16 28 14 34 14 34Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="8" fill="white" stroke={stroke} strokeWidth="2"/>
        <path d="M14.5 25.5L8 32" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    data: {
      bottomLine: 'יחס שונה כי הצרכים שונים.',
      reason: 'שוני רלוונטי לנושא (כמו מגבלה פיזית או צורך לימודי).',
      goal: 'הגעה לשוויון מהותי (לתת לכל אחד מה שצריך כדי להצליח).',
      duration: 'קבוע - כל עוד השוני הרלוונטי קיים.',
      example: 'הקלות במבחן לתלמיד ASD או חניית נכים.',
      status: '✅ נקי ומאושר',
    },
  },
  {
    id: 'discrimination',
    title: 'אפליה פסולה',
    theme: { bg: 'bg-rose-50/80', border: 'border-rose-300', text: 'text-rose-950', iconFill: '#FDA4AF', iconStroke: '#881337' },
    icon: (fill, stroke) => (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 34C14 34 22 42 34 30C40 24 38 16 38 16C38 16 32 24 24 26C16 28 14 34 14 34Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 16L32 32M32 16L16 32" stroke={stroke} strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    data: {
      bottomLine: 'יחס שונה ללא סיבה מוצדקת.',
      reason: 'דעה קדומה או מאפיין לא רלוונטי (דת, גזע, מין).',
      goal: 'פגיעה מכוונת בזכות לשוויון ובכבוד האדם.',
      duration: 'אסור תמיד - אין מצב שבו זה לגיטימי.',
      example: 'אי קבלה לעבודה של אדם מוכשר רק בגלל מוצאו.',
      status: '❌ פסול ורעיל',
    },
  },
  {
    id: 'affirmative',
    title: 'העדפה מתקנת',
    theme: { bg: 'bg-emerald-50/80', border: 'border-emerald-300', text: 'text-emerald-950', iconFill: '#A7F3D0', iconStroke: '#064E3B' },
    icon: (fill, stroke) => (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 40C8 40 14 46 22 38C26 34 26 28 26 28C26 28 22 34 16 34C10 34 8 40 8 40Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 26C22 26 28 32 36 24C40 20 40 14 40 14C40 14 36 20 30 20C24 20 22 26 22 26Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 20V8M14 8L10 12M14 8L18 12" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    data: {
      bottomLine: 'יחס מועדף לקבוצה מקופחת.',
      reason: 'רצון לתקן עוול היסטורי ולצמצם פערים חברתיים.',
      goal: 'יצירת שוויון הזדמנויות לקבוצות שנותרו מאחור.',
      duration: 'זמני - עד שהפער ייסגר והקבוצה תתחזק.',
      example: 'שריון מקומות לנשים או בני מיעוטים בתפקידי ניהול.',
      status: '🆙 חיובי ומתקן',
    },
  },
];

const NanoBananaDashboard = () => {
  return (
    <div dir="rtl" className="w-full max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50 rounded-xl">
      
      {/* Desktop Grid Layout */}
      <div className="hidden lg:grid lg:grid-cols-[200px_1fr_1fr_1fr] gap-6">
        <div className="p-4"></div>
        {conceptsData.map((concept) => (
          <div key={`header-${concept.id}`} className={`flex flex-col items-center p-6 border-t-8 rounded-t-xl bg-white shadow-sm ${concept.theme.border} ${concept.theme.text}`}>
            <div className="mb-4 bg-white rounded-full p-2 shadow-sm border border-gray-100">
              {concept.icon(concept.theme.iconFill, concept.theme.iconStroke)}
            </div>
            <h2 className="text-2xl font-bold text-center">{concept.title}</h2>
          </div>
        ))}
        {rowsData.map((row, index) => (
          <React.Fragment key={`row-${row.key}`}>
            <div className={`flex items-center p-6 font-bold text-gray-700 text-lg rounded-r-xl ${index % 2 === 0 ? 'bg-gray-100/50' : 'bg-transparent'}`}>
              {row.label}
            </div>
            {conceptsData.map((concept) => (
              <div 
                key={`${concept.id}-${row.key}`}
                className={`p-6 border border-gray-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:z-10 relative cursor-default ${concept.theme.bg} ${concept.theme.text} ${index % 2 === 0 ? 'bg-opacity-100' : 'bg-opacity-40'} ${index === rowsData.length - 1 ? 'rounded-b-xl' : ''}`}
                style={{ lineHeight: '1.6' }}
              >
                {row.key === 'status' ? (
                  <span className="inline-block bg-white px-4 py-2 rounded-full font-bold text-sm border shadow-sm">{concept.data[row.key]}</span>
                ) : (
                  <p className="text-[1.05rem] leading-relaxed">{concept.data[row.key]}</p>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Layout (No Horizontal Scroll) */}
      <div className="lg:hidden flex flex-col gap-8">
        {conceptsData.map((concept) => (
          <div key={`mobile-${concept.id}`} className={`rounded-xl overflow-hidden border-t-8 shadow-sm bg-white ${concept.theme.border}`}>
            <div className={`flex items-center gap-4 p-6 ${concept.theme.bg} ${concept.theme.text}`}>
               <div className="bg-white rounded-full p-2 shadow-sm">
                  {concept.icon(concept.theme.iconFill, concept.theme.iconStroke)}
               </div>
               <h2 className="text-2xl font-bold">{concept.title}</h2>
            </div>
            <div className="flex flex-col">
              {rowsData.map((row, index) => (
                <div key={`mobile-${concept.id}-${row.key}`} className={`p-5 flex flex-col gap-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <span className="text-sm font-bold text-gray-500">{row.label}</span>
                  <div className={`${concept.theme.text}`}>
                    {row.key === 'status' ? (
                      <span className="inline-block bg-white px-4 py-2 rounded-full font-bold text-sm border shadow-sm mt-1">{concept.data[row.key]}</span>
                    ) : (
                      <p className="text-base leading-relaxed">{concept.data[row.key]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default NanoBananaDashboard;