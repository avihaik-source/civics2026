# 🤖 מסמך חפיפה מלא לסוכן AI — פרויקט אזרחות 2026
# AGENT_HANDOFF.md — תאריך: 8 במרץ 2026

---

## 🎯 תקציר מנהלים — קרא ראשון!

**אזרחות 2026** = אתר הכנה לבגרות בעל-פה באזרחות, לתלמידי תיכון (כולל ASD).  
**טכנולוגיה:** Hono + Vanilla JS + Cloudflare Pages + D1 Database  
**המשתמש (אביחי)** = מנהל פרויקט / מנהל תוכן. הוא **לא מפתח**. דבר אליו בעברית פשוטה.  
**כתובת האתר:** https://civics2026.pages.dev  
**GitHub:** https://github.com/avihaik-source/civics2026  
**ספריית הפרויקט:** `/home/user/webapp/`  
**Cloudflare project name:** `civics2026`

---

## 📋 מצב המשימות — מה הושלם ומה נשאר

### ✅ הושלם:
| ID | משימה | תאריך | Commit |
|----|--------|--------|--------|
| P1 | תיקון באג EXAM_QUESTIONS undefined | 7 מרץ | `21b9c40` |
| P5 | תשתית 7 טבלאות השוואה (comparison-tables.js) | 7-8 מרץ | `f2f5d9e` |
| P4 | מדריך למורה — עמוד #teacher-guide מלא | 8 מרץ | `53e50a2` |

### ⏳ ממתין לקבצים מהמשתמש:
| ID | משימה | מה חסר | דדליין | הערכת זמן |
|----|--------|---------|--------|-----------|
| P5+ | עדכון תוכן טבלאות השוואה | תוכן גולמי מהמנהל | 8 מרץ בוקר | 30 דק' |
| P4+ | עדכון תוכן מדריך למורה | תוכן מלא מהמנהל | 8 מרץ צהריים | 30 דק' |
| P3 | דשבורד מתקדם עם Chart.js | דרישות + נתונים מהמנהל | 8 מרץ צהריים | 1-1.5 שעות |
| P2 | אינטגרציית mikud-data-updated.js | קובץ JS מוכן | 9 מרץ בוקר | 30 דק' |
| P6 | אינטגרציית עיצוב חדש | 3 HTML + 5 CSS + PDF סגנון | 10 מרץ | 3-4 שעות |

### דדליין סופי: **12 מרץ 2026** | הבגרות: **אמצע מאי 2026**

---

## 🏗️ ארכיטקטורת הפרויקט

### סטאק טכנולוגי:
```
Frontend:  Vanilla JS (SPA, hash-router) + CSS (RTL, 3 themes) + Tailwind (CDN)
Backend:   Hono (TypeScript) on Cloudflare Workers
Database:  Cloudflare D1 (SQLite) — 7 tables
Hosting:   Cloudflare Pages
Build:     Vite + terser + clean-css
Dev:       PM2 + wrangler pages dev --local
```

### מבנה הקבצים:
```
/home/user/webapp/
├── src/
│   └── index.tsx              # Backend Hono — HTML entry point + 10 API endpoints + SW
├── public/
│   ├── favicon.svg
│   ├── sw.js                  # (unused — SW defined inline in index.tsx)
│   └── static/
│       ├── app.js             # 190KB — אפליקציה ראשית (router, render, state, UI)
│       ├── features.js        # 75KB — פיצ'רים: תרגול, ציר זמן, ר"ת, טיפים, מיקוד, מדריך למורה
│       ├── data.js            # 124KB — 16 יחידות, 63 שאלות תרגול, 248 מושגים
│       ├── mikud-data.js      # 512KB — תוכן מיקוד מלא (391 מדורים)
│       ├── questions-data.js  # 235KB — EXAMS_DATA (96 שאלות) + QUESTION_UNIT_MAP + EXAM_QUESTIONS builder
│       ├── comparison-tables.js # 15KB — 7 טבלאות השוואה + window.COMPARISON_TABLES
│       ├── scaffolding.js     # 105KB — פיגומים תלת-רמתיים (51 שאלות)
│       ├── study-materials.js # 247KB — 4 מסמכי מקור
│       ├── exam-questions-official.json # 247KB — שאלות רשמיות (Q/A)
│       ├── styles.css         # 142KB — כל ה-CSS (כולל dark/soft themes, ASD, teacher-guide)
│       └── *.md               # דוחות ומסמכים
├── migrations/
│   └── 0001_initial_schema.sql  # 7 tables: students, progress, notes, highlights, sync_log, analytics, teacher_settings
├── wrangler.jsonc             # D1 binding: civics2026-production (ID: 93488a89-...)
├── ecosystem.config.cjs       # PM2: wrangler pages dev dist --d1=... --local --port 3000
├── vite.config.ts             # @hono/vite-build/cloudflare-pages
├── package.json
└── uploaded_files/            # /home/user/uploaded_files/ — מסמכי מקור מהמשתמש
```

### סדר טעינת הקבצים (חשוב!):
```html
<!-- נטענים עם defer (לפי סדר): -->
<script src="/static/data.js" defer></script>
<script src="/static/mikud-data.js" defer></script>
<script src="/static/comparison-tables.js" defer></script>  <!-- ← חדש -->
<script src="/static/scaffolding.js" defer></script>
<script src="/static/app.js" defer></script>
<script src="/static/features.js" defer></script>

<!-- נטענים lazy (אחרי window load): -->
questions-data.js  → builds window.EXAM_QUESTIONS, fires 'examQuestionsReady'
study-materials.js → loads SOURCE_MATERIALS
```

---

## 🔧 פקודות פיתוח

### התחלת עבודה:
```bash
cd /home/user/webapp
npm run build                    # חובה לפני הפעלה ראשונה (timeout 300s)
pm2 start ecosystem.config.cjs  # מפעיל wrangler pages dev על port 3000
curl http://localhost:3000       # בדיקה
pm2 logs civics2026 --nostream   # צפייה בלוגים
```

### אחרי שינויים:
```bash
cd /home/user/webapp && npm run build && pm2 restart civics2026
# בדוק: curl http://localhost:3000
```

### פריסה ל-Cloudflare:
```bash
# 1. חובה קודם: setup_cloudflare_api_key (tool)
# 2. build + deploy:
cd /home/user/webapp && npm run build && npx wrangler pages deploy dist --project-name civics2026
```

### push ל-GitHub:
```bash
# 1. חובה קודם: setup_github_environment (tool)
# 2. commit + push:
cd /home/user/webapp && git add -A && git commit -m "תיאור" && git push origin main
```

### ⚠️ Authentication — חשוב מאוד:
- **GitHub**: תמיד קרא ל-`setup_github_environment` לפני push. הטוקן פג תוקף בין sessions.
- **Cloudflare**: תמיד קרא ל-`setup_cloudflare_api_key` לפני deploy. אם נכשל — הפנה את המשתמש ל-Deploy tab.
- **cloudflare_project_name**: `civics2026` (בדוק עם `meta_info(read, cloudflare_project_name)`)

---

## 🗺️ מבנה ה-SPA — Hash Router

### עמודים קיימים:
| Route | Renderer | קובץ | תיאור |
|-------|----------|-------|--------|
| `#` (home) | `renderHomePage()` | app.js | דף בית — סקירת יחידות |
| `#unit/1..16` | `renderUnitPage()` | app.js | יחידת לימוד — tabs: למד/שאלות/דוגמאות |
| `#questions` | `renderQuestionsPage()` | app.js | 96 שאלות בגרות עם סינון |
| `#question-list` | `renderQuestionList()` | features.js | רשימת 96 שאלות לתרגול |
| `#practice/:id` | `renderQuestionPractice()` | features.js | תרגול שאלה בודדת |
| `#exam-sim` | `renderExamSim()` | app.js | סימולציית בחינה עם טיימר |
| `#dashboard` | `renderDashboard()` | app.js | דשבורד מורה (מוגן סיסמה) |
| `#timeline` | `renderTimelinePage()` | features.js | ציר זמן 1897-1948 |
| `#acronyms` | `renderAcronymsPage()` | features.js | ראשי תיבות |
| `#tips` | `renderTipsPage()` | features.js | 7 כללי הזהב |
| `#mikud` | `renderMikudPage()` | features.js | חומר מיקוד מלא |
| `#student-progress` | `renderProgressDashboard()` | features.js | דשבורד תלמיד |
| `#teacher-guide` | `renderTeacherGuide()` | features.js | מדריך למורה |
| `#breathing` | `renderBreathingPage()` | app.js | תרגיל נשימה 4-7-8 |
| `#about` | `renderAboutPage()` | features.js | אודות |

### איך מוסיפים עמוד חדש:
1. **app.js** — `onHashChange()` (~line 997): הוסף `else if (hash === 'new-page') STATE.currentPage = 'new-page';`
2. **app.js** — `navigate()` (~line 1058): הוסף `else if (page === 'new-page') location.hash = 'new-page';`
3. **app.js** — `titleMap` (~line 1080): הוסף title
4. **app.js** — `pageNames` (~line 1044): הוסף שם עברי
5. **app.js** — `renderSidebar()` (~line 1327): הוסף קישור
6. **features.js** — `getPageRenderer()` (~line 830): הוסף case
7. **features.js** — הוסף את ה-render function + ייצוא ב-public API
8. **styles.css** — הוסף CSS
9. Build + test

---

## 📊 מבני נתונים חשובים

### UNITS_DATA (data.js):
```javascript
window.UNITS_DATA = [
  { id: 1, title: "הרקע ההיסטורי והחלטה 181", icon: "🌍", phase: 1,
    concepts: [{term: "...", definition: "..."}],  // 8-16 מושגים
    questions: [{id: "q1", text: "...", type: "open|choice", options: [...], correct: "...", explanation: "..."}],  // 3-5 שאלות
    checklist: ["..."],  // צ'קליסט למד
    sections: [{title: "...", body: "..."}]  // סקשנים
  }, ...
];
```

### EXAMS_DATA (questions-data.js):
```javascript
const EXAMS_DATA = [
  { exam: "exam_winter_2026", title: "בגרות חורף 2026", questions: [
    { id: "exam_winter_2026_q1", number: 1, full_text: "...", length: 1234, lines: 15 }
  ]}, ...
]; // 5 מבחנים, סה"כ 96 שאלות

const QUESTION_UNIT_MAP = {
  "exam_winter_2026_q1": [1, 2],  // שאלה זו שייכת ליחידות 1 ו-2
  ...
};

// Builder (סוף הקובץ) — יוצר window.EXAM_QUESTIONS:
// [{id, exam, number, question, passage, unitIds, full_text, length, lines}]
```

### COMPARISON_TABLES (comparison-tables.js):
```javascript
window.COMPARISON_TABLES = [
  { id: "table-1", title: "...", unitIds: [1, 2],
    headers: ["קריטריון", "עמודה1", "עמודה2"],
    rows: [["שורה", "ערך", "ערך"]],
    similarities: ["נקודת דמיון 1"]
  }, ...
]; // 7 טבלאות
```

### STATE (app.js — global):
```javascript
const STATE = {
  currentPage: 'home', currentUnit: null, currentTab: 'learn',
  sidebarOpen: false, teacherAuth: false, teacherStudents: [],
  progress: {}, notes: {}, highlights: {}, // per-unit data
  studentName: '', // from localStorage
  breathingActive: false, timerActive: false,
  ...
};
```

---

## 🔌 API Endpoints (src/index.tsx)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | - | Health check |
| POST | `/api/sync` | - | Save student progress to D1 |
| GET | `/api/sync/:studentId` | - | Get student progress |
| GET | `/api/teacher/students` | password | List all students |
| POST | `/api/teacher/change-password` | password | Change teacher password |
| POST | `/api/analytics` | - | Log analytics event |
| GET | `/api/analytics/summary` | password | Analytics summary |
| DELETE | `/api/student/:id` | password | Delete student |
| GET | `/api/student/:id/export` | password | Export student data |

**סיסמת מורה:** `0512` (ניתנת לשינוי דרך ה-API)

---

## 🎨 עיצוב ו-CSS

### 3 ערכות נושא:
- **רגיל** (default): רקע לבן, טקסט כהה
- **כהה** (dark): רקע כהה, צבעים מותאמים
- **רך** (soft): רקע בז', ניגודיות מופחתת (ASD-friendly)

### CSS Variables (main):
```css
--primary-blue: #0038b8;
--bg-white, --bg-section, --text-dark, --text-gray, --border-color
```

### נגישות ASD מובנית:
- TTS (הקראה) עם 3 מהירויות
- מצב רגוע (הסתרת אנימציות+צבעים)
- גודל גופן מתכוונן
- ניגודיות גבוהה
- הסתרת תמונות
- הפסקה (freeze all timers)
- תרגיל נשימה 4-7-8
- Pomodoro break reminders (כל 25 דק')

---

## ⚠️ מלכודות ודברים שחשוב לדעת

### 1. סדר טעינת קבצים
**questions-data.js נטען LAZY** (אחרי window.load). לכן:
- אל תניח ש-`EXAM_QUESTIONS` קיים — תמיד השתמש ב-`getExamQuestions()` (getter)
- אירוע `examQuestionsReady` נורה כשהנתונים מוכנים
- אם מוסיפים קובץ JS חדש שחייב להיטען לפני app.js — הוסף עם `defer` ב-index.tsx

### 2. Build חובה
**wrangler pages dev** עובד מ-`dist/`. אחרי כל שינוי בקבצי JS/CSS ב-`public/static/` חייב `npm run build`.
ה-build גם מריץ minification (terser + clean-css).

### 3. Service Worker caching
ה-SW (מוגדר inline ב-index.tsx) caches static assets. אחרי deploy, דפדפן עלול להציג גרסה ישנה.
- Ctrl+Shift+R לרענון מלא
- אם שינית שם קובץ — עדכן את רשימת `STATIC_ASSETS` ב-SW code

### 4. D1 Database
מצב local: `--local` flag → SQLite ב-`.wrangler/state/v3/d1/`
מצב production: Cloudflare D1 cloud
- `npm run db:migrate:local` — apply migrations locally
- `npm run db:reset` — reset local DB

### 5. RTL
כל ה-HTML הוא `dir="rtl" lang="he"`. כל CSS חדש צריך להתחשב ב-RTL:
- `padding-right` (לא left)
- `border-right` (לא left)
- `text-align: right` (default)

### 6. קבצי מקור של המשתמש
נמצאים ב-`/home/user/uploaded_files/` — כוללים:
- מסמכי מיקוד (PDF, DOCX)
- הנחיות למפתח (MD)
- שאלות בגרות (JSON, DOCX)
- מפרט טכני (`tech_spec.md`, `מפרט_טכני_מלא_למפתח_2026.md`)

---

## 📝 פירוט המשימות הפתוחות

### P2: אינטגרציית mikud-data-updated.js
**מה:** המשתמש ישלח קובץ JS מעודכן עם תוכן מיקוד מורחב ליחידות 2-15.
**איך:**
1. גיבוי: `cp public/static/mikud-data.js public/static/mikud-data-backup.js`
2. החלף את התוכן
3. ודא שהמבנה תקין: `window.MIKUD_DATA = [...]` (מערך של 16 אובייקטים עם `unitId, title, sections[]`)
4. Build + test: כל 16 יחידות נטענות ב-`#mikud`

### P3: דשבורד מתקדם עם Chart.js
**מה:** שדרוג דשבורד המורה (`#dashboard`) עם גרפים ויזואליים.
**איך:**
1. הוסף Chart.js CDN ל-index.tsx: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0"></script>`
2. הוסף ל-`renderDashboard()` ב-app.js (line ~2996):
   - גרף עוגה: חלוקת התקדמות (ירוק/צהוב/אדום)
   - גרף עמודות: התקדמות לפי יחידה
   - גרף קו: פעילות לאורך זמן
3. המשתמש ישלח דרישות מדויקות — חכה לפני שמתחיל

### P4+: עדכון תוכן מדריך למורה
**מה:** המשתמש עשוי לשלוח תוכן נוסף/מעודכן למדריך.
**איך:**
- עמוד `#teacher-guide` כבר קיים ב-features.js — פונקציה `renderTeacherGuide()`
- 10 sections מתקפלים, CSS מוכן, הדפסה עובדת
- פשוט עדכן את הטקסט בתוך הפונקציה

### P5+: עדכון תוכן טבלאות השוואה
**מה:** המשתמש ישלח תוכן גולמי מדויק ל-7 הטבלאות.
**איך:**
- ערוך `public/static/comparison-tables.js`
- כל טבלה = אובייקט ב-`window.COMPARISON_TABLES`
- הרנדור כבר עובד ב-app.js (line ~1772) — בודק `typeof COMPARISON_TABLES !== 'undefined'`

### P6: אינטגרציית עיצוב
**מה:** המשתמש ישלח קבצי HTML ו-CSS חדשים מעצב.
**איך:**
- **אל תחליף** קבצים קיימים — **מזג** את הסגנון החדש לתוך styles.css
- שמור על תאימות RTL, 3 ערכות נושא, ונגישות ASD
- בדוק רספונסיביות

---

## 🔑 רוח הפרויקט — מה חשוב למשתמש

1. **עברית** — הכל בעברית. תקשורת, קוד, ממשק, הודעות.
2. **נגישות ASD** — לא רק checkbox. הפלטפורמה מיועדת באמת לתלמידים על הספקטרום. כל תכונה חדשה חייבת להיות:
   - ברורה, פשוטה, לא צפופה
   - עם אפשרות הקראה (TTS)
   - מותאמת למצב רגוע
3. **דיוק תוכני** — השאלות הן מילה-במילה מהבגרות. אסור לשנות נוסח.
4. **דדליינים** — המשתמש עובד עם לוח זמנים צמוד. אם הוא שולח קובץ — שלב אותו מהר.
5. **דוחות** — המשתמש אוהב לקבל דוחות מסודרים. שלח עדכון אחרי כל משימה שהושלמה.
6. **קבצים סטטיים** — דוחות ומסמכים שמורים ב-`public/static/` ונגישים מ-`https://civics2026.pages.dev/static/FILENAME`

---

## 📞 מידע נוסף

- **סיסמת מורה:** `0512`
- **Cloudflare D1 ID:** `93488a89-9448-4cb9-998b-e4fad7b045aa`
- **Cloudflare project:** `civics2026`
- **GitHub user:** `avihaik-source`
- **GitHub repo:** `civics2026`
- **Main branch:** `main`
- **Port:** 3000

---

*מסמך זה נוצר ב-8 מרץ 2026 על ידי Claude (AI Developer). בהצלחה! 🚀*
