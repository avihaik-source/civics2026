# אזרחות 2026 – הכנה לבגרות שאלון 34281

[![Live Site](https://img.shields.io/badge/🌐_Live-civics2026.pages.dev-2e86de)](https://civics2026.pages.dev)
[![Platform](https://img.shields.io/badge/Platform-Cloudflare_Pages-f38020)](https://pages.cloudflare.com)
[![Version](https://img.shields.io/badge/Version-2.0-27ae60)]()
[![Accessibility](https://img.shields.io/badge/WCAG-2.1_AAA-8e44ad)]()

---

## תיאור

פלטפורמה אינטראקטיבית להכנה לבחינת הבגרות באזרחות (שאלון **34281**), עם דגש מיוחד על נגישות לתלמידים עם ASD ולכלל תלמידי כיתות י'–י"ב.

**פיתוח:** אביחי ק. | **בחסות:** תוכנית אומץ, משרד החינוך

---

## תכונות מרכזיות

### תוכן

- **96 שאלות בגרות אמיתיות** מ-5 מבחנים (חורף ∕ קיץ 2024–2026), מצוטטות **מילה-במילה**
- **16 יחידות לימוד** עם **111 מושגים והגדרות** מלאים
- **51 שאלות תרגול** עם פיגומים (scaffolding) **תלת-רמתיים**
- סימולציית בחינה עם טיימר רב-שלבי

### נגישות ASD (20+ כלים)

- 3 ערכות צבע: בהיר / כהה / רך
- שינוי גודל גופן 100%–200%
- TTS (Text-to-Speech) עברי – 3 מהירויות
- מצב שקט, הפחתת תנועה, הסתרת טיימרים
- תרגיל נשימה אינטראקטיבי
- לוח "עכשיו–הבא" (First-Then)
- WCAG 2.1 AAA ניגודיות

### מצב מורה

- דשבורד עם נתוני התקדמות תלמידים (חי מ-D1)
- פיקוח על ביצועים לפי יחידה
- מודול שיעור 45 דקות (בפיתוח)

---

## כתובות

| סביבה | URL |
|--------|-----|
| Production | <https://civics2026.pages.dev> |
| API Health | <https://civics2026.pages.dev/api/health> |
| API Sync | <https://civics2026.pages.dev/api/sync> |

---

## ארכיטקטורה

```
Frontend:   Vanilla JavaScript (SPA + Hash Routing)
Backend:    Hono (TypeScript) on Cloudflare Workers
Database:   Cloudflare D1 (SQLite)
CDN:        Cloudflare Pages (global edge network)
Build:      Vite + Terser (minification + code splitting)
```

### מבנה קבצים

```
civics2026/
├── src/
│   └── index.tsx            # Hono backend – API routes
├── public/
│   ├── app.js               # אפליקציה ראשית (SPA)
│   ├── features.js          # פיצ'רים: תרגול, ציר זמן, מילון
│   ├── data.js              # 16 יחידות + 111 מושגים
│   ├── questions-data.js    # 96 שאלות בגרות
│   ├── scaffolding.js       # פיגומים תלת-רמתיים
│   ├── styles.css           # עיצוב מלא (RTL, dark mode)
│   ├── sw.js                # Service Worker (offline cache)
│   └── exam-questions-official.json
├── migrations/
│   └── 0001_init.sql        # D1 schema
├── wrangler.jsonc           # Cloudflare config
├── vite.config.ts           # Build (minify + code split)
└── package.json
```

---

## התקנה והרצה

### דרישות מקדימות

- Node.js ≥ 18
- חשבון Cloudflare (לפריסה)

### הרצה מקומית

```bash
# התקנת תלויות
npm install

# פיתוח עם D1 מקומי (מומלץ)
npm run dev:d1

# יישום migrations מקומי
npm run db:migrate:local
```

### פריסה ל-Cloudflare Pages

```bash
# בניה
npm run build

# פריסה
npm run deploy

# Migration ל-production D1
npx wrangler d1 execute civics2026-db \
  --file=migrations/0001_init.sql \
  --remote
```

---

## API Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| `GET` | `/api/health` | בדיקת תקינות |
| `GET` | `/api/sync/:studentId` | שליפת נתוני תלמיד |
| `POST` | `/api/sync` | שמירת התקדמות + הערות |
| `POST` | `/api/analytics` | רישום אירוע |
| `POST` | `/api/teacher/auth` | אימות מורה |
| `GET` | `/api/teacher/students` | רשימת תלמידים (לדשבורד) |
| `GET` | `/api/teacher/students/:id` | פרטי תלמיד בודד |

---

## ניווט (Hash Routing)

| Hash | תיאור |
|------|--------|
| `#` | דף הבית |
| `#unit/1`–`#unit/16` | יחידות לימוד |
| `#questions` | 96 שאלות בגרות |
| `#practice/:id` | תרגול שאלה ספציפית |
| `#exam-sim` | סימולציית בחינה |
| `#timeline` | ציר זמן 1897–1948 |
| `#acronyms` | מילון ראשי תיבות |
| `#tips` | 7 כללי הזהב ללמידה |
| `#student-progress` | ההתקדמות שלי |
| `#dashboard` | דשבורד מורה |
| `#breathing` | תרגיל נשימה |
| `#about` | אודות |

---

## עקרונות ה-Iron Laws

1. **אין שינוי בנוסח שאלות הבגרות** – מילה במילה, ללא תוספות
2. **מיקוד תשפ"ו הוא המקור הסמכותי** לנושאים הנלמדים
3. **תיאוריה לפני תרגול** – בכל יחידה
4. **QA מול מסמך הבחינה הרשמי** לפני כל עדכון

---

## קרדיטים

| תפקיד | שם |
|--------|-----|
| פיתוח ועיצוב | אביחי ק. |
| תוכן חינוכי | מבחני בגרות אזרחות, משרד החינוך |
| מימון | תוכנית אומץ |

---

*גרסה 2.0 | מרץ 2026*
