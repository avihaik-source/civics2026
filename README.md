# Civics2026 - הכנה לבגרות באזרחות 2026

> פלטפורמת למידה אינטראקטיבית לבחינת הבגרות באזרחות, מותאמת במיוחד לתלמידים בספקטרום האוטיסטי (ASD).

## URLs

| סביבה | כתובת |
|--------|-------|
| **Production** | https://civics2026.pages.dev |
| **API Health** | https://civics2026.pages.dev/api/health |
| **שאלות בגרות** | https://civics2026.pages.dev/#questions |
| **סימולציית מבחן** | https://civics2026.pages.dev/#exam-sim |
| **לוח מורה** | https://civics2026.pages.dev/#dashboard |

## תכונות פעילות

### תוכן לימודי
- **96 שאלות בגרות אמיתיות** מ-5 מבחנים (חורף/קיץ 2024-2026), דיוק 99%+ מול המקור
- **16 יחידות לימוד** עם 111 מושגים מפורטים, הגדרות ומקורות
- **51 שאלות תרגול** עם פיגומים תלת-רמתיים (663 הנחיות)
- **סימולציית מבחן** עם תזמון ושלבי קריאה/כתיבה

### נגישות ASD
- ניגודיות >=4.5:1 (WCAG AA)
- גופן מינימלי 16px, מטרות מגע >= 44x44px
- ללא הבהובים מהירים
- מערכת פיגומים מדורגת (3 רמות תמיכה)
- מעקב מצב רוח בכל יחידה
- מצב שקט, הפסקות, תרגיל נשימה
- הקראת טקסט (TTS)
- 3 ערכות נושא: בהיר, כהה, רך

### ממשק משתמש
- עיצוב כחול-לבן פטריוטי (גוון דגל ישראל `#0038b8`)
- תמיכה מלאה ב-RTL ועברית
- רספונסיבי (מובייל/טאבלט/דסקטופ)
- ניווט בסרגל צד עם מעקב התקדמות
- שמירה אוטומטית ב-localStorage
- כפתורי החלטה מותאמי ASD
- שדה כיתה (י'/יא'/יב')
- כותרות עמודים דינמיות
- קרדיטים ומקורות

### לוח מורה (חלקי - 29%)
- הזדהות בסיסמה (ברירת מחדל: `1234`)
- צפייה בנתוני תלמידים
- ייצוא נתונים
- **חסר:** איפוס סיסמה, ניהול כיתות, שיעור 45 דקות

## ארכיטקטורת נתונים

### מודלים
| מודל | קובץ | תיאור |
|-------|-------|--------|
| `UNITS_DATA` | `data.js` (1,696 שורות) | 16 יחידות, 111 מושגים, הגדרות, מקורות |
| `EXAMS_DATA` | `questions-data.js` (704 שורות) | 96 שאלות בגרות, פתרונות, מטא-דאטה |
| `SCAFFOLDING` | `scaffolding.js` | 663 הנחיות פיגום לתרגול |
| `STATE` | `app.js` (זיכרון + localStorage) | מצב תלמיד, התקדמות, הגדרות |

### אחסון
- **Client-side:** localStorage (מצב, התקדמות, הערות)
- **Server-side (Phase 4):** Cloudflare D1 מתוכנן
- **API Sync:** `/api/sync` - מקבל נתונים (stub - ללא שמירה צד שרת)

## מבנה קבצים

```
webapp/
├── src/
│   └── index.tsx          # Hono backend (API routes + HTML entry)
├── public/
│   └── static/
│       ├── app.js         # Frontend logic (3,119 שורות, 143+ פונקציות)
│       ├── data.js        # יחידות לימוד ומושגים (1,696 שורות)
│       ├── questions-data.js  # 96 שאלות בגרות (704 שורות)
│       ├── scaffolding.js # 663 הנחיות פיגום
│       └── styles.css     # עיצוב ASD (2,555 שורות, 3 ערכות נושא)
├── ecosystem.config.cjs   # PM2 configuration
├── wrangler.jsonc         # Cloudflare Pages config
├── vite.config.ts         # Vite build config
├── package.json           # Dependencies & scripts
└── README.md              # This file
```

## API Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| `GET` | `/` | HTML entry point (SPA) |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/sync` | Student data sync (stub) |
| `GET` | `/api/sync/:studentId` | Get student data (stub) |
| `GET` | `/api/teacher/students?password=` | Teacher dashboard data |
| `GET` | `/static/*` | Static assets (JS/CSS/images) |

## התקנה ופיתוח

```bash
# Clone & install
git clone <repo-url>
cd webapp
npm install

# Development (sandbox)
npm run build
pm2 start ecosystem.config.cjs

# Development (local)
npm run dev

# Deploy to Cloudflare Pages
npm run deploy
```

## Stack טכנולוגי

| רכיב | טכנולוגיה |
|-------|-----------|
| Backend | Hono (edge runtime) |
| Frontend | Vanilla JS (ES6+), CSS3 |
| Build | Vite |
| Deploy | Cloudflare Pages / Workers |
| Fonts | Assistant, David Libre (Google Fonts) |
| Icons | FontAwesome 6.4 |
| Storage | localStorage (Phase 1), D1 (Phase 4) |

## Phase 1 - תיקונים קריטיים (הושלם)

| # | תיקון | סטטוס |
|---|--------|--------|
| 1 | ניקוי מטא-דאטה מ-Q22 (חורף 2024) | ✅ |
| 2 | תיקון שגיאת 404 ב-API sync | ✅ |
| 3 | הוספת קרדיטים ומקורות | ✅ |
| 4 | כותרות עמודים דינמיות | ✅ |
| 5 | הוספת שדה כיתה | ✅ |
| 6 | ערכת צבעים כחול-לבן פטריוטי | ✅ |
| 7 | כפתורי החלטה מותאמי ASD | ✅ |
| 8 | README מקיף | ✅ |
| 9 | פריסה ל-Cloudflare Pages | ⏳ |

## שלבים הבאים

### Phase 2 - ביצועים
- Minify JS/CSS
- Lazy-load data files
- Service Worker לעבודה offline
- Code splitting

### Phase 3 - תכונות חסרות
- שילוב 4 קבצי מקור נוספים
- מיפוי מלא שאלות-ליחידות
- שיעור מורה 45 דקות
- הדגשת טקסט
- הקלטת תשובה בעל-פה
- דוגמאות מעולם התלמיד

### Phase 4 - Backend מלא
- טבלאות Cloudflare D1
- CRUD API מלא
- לוח מורה מלא
- ניהול כיתות
- דוחות התקדמות

## מקורות תוכן

- שאלוני בגרות באזרחות 2024-2026 (משרד החינוך)
- ספר "אומץ" (מהדורה עדכנית)
- מיקוד בגרות 2025-2026
- חוברת 99 מושגים

## רישיון

פרויקט ללא מטרות רווח. תכנים מקוריים שייכים לבעליהם (משרד החינוך).
שימוש למטרות לימוד בלבד.

**פיתוח ויזום:** אביחי ק.

---

**גרסה:** 1.2.0  
**עדכון אחרון:** 3 מרץ 2026  
**סטטוס:** ✅ פעיל - מוכן לבדיקות תלמידים
