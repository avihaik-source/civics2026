# Civics2026 - API Documentation
# תיעוד ממשקי API

**אתר**: https://civics2026.pages.dev  
**Base URL**: `https://civics2026.pages.dev`  
**Backend**: Hono Framework על Cloudflare Workers  
**Database**: Cloudflare D1 (SQLite)  
**עדכון אחרון**: 5 מרץ 2026

---

## סקירה כללית

המערכת מספקת 10 API endpoints המחולקים ל-4 קטגוריות:

| קטגוריה | Endpoints | אימות נדרש |
|----------|-----------|-------------|
| בריאות | 1 | ❌ |
| סנכרון תלמיד | 2 | ❌ |
| מורה/מנהל | 3 | ✅ סיסמה |
| אנליטיקה | 2 | ✅ סיסמה (קריאה) |
| ניהול תלמידים | 2 | ✅ סיסמה |

### אימות מורה
שלוש דרכים להעביר סיסמת מורה:
1. **Query parameter**: `?password=0512`
2. **Header**: `X-Teacher-Password: 0512`
3. סיסמת ברירת מחדל: `0512` (ניתנת לשינוי דרך API)

---

## 1. Health Check - בדיקת תקינות

```
GET /api/health
```

**אימות**: ❌ לא נדרש  
**תיאור**: בדיקת זמינות השרת ומצב המערכת

**דוגמת בקשה:**
```bash
curl https://civics2026.pages.dev/api/health
```

**תגובה (200 OK):**
```json
{
  "status": "ok",
  "version": "phase6-qa",
  "timestamp": "2026-03-05T10:46:24.490Z"
}
```

| שדה | סוג | תיאור |
|------|------|--------|
| `status` | string | `"ok"` אם השרת תקין |
| `version` | string | גרסת המערכת הנוכחית |
| `timestamp` | string | ISO 8601 timestamp |

---

## 2. Sync - שמירת נתוני תלמיד

```
POST /api/sync
```

**אימות**: ❌ לא נדרש  
**תיאור**: שמירת/עדכון כל נתוני התלמיד ל-D1 (התקדמות, הערות, הדגשות)

**Headers:**
```
Content-Type: application/json
```

**גוף הבקשה:**
```json
{
  "studentId": "student-abc123",
  "studentName": "דנה כהן",
  "studentGrade": "י\"א-3",
  "progress": {
    "1": {
      "checklist": [true, false, true, true],
      "answers": { "q1": "תשובה ראשונה" },
      "mood": "😊",
      "completed": false
    },
    "2": {
      "checklist": [true, true],
      "answers": {},
      "mood": "",
      "completed": true
    }
  },
  "notes": {
    "unit-1-notes": "הערות אישיות ליחידה 1",
    "general": "הערות כלליות"
  },
  "highlights": {
    "concept-42": [
      { "text": "טקסט מודגש", "color": "yellow" }
    ]
  }
}
```

| שדה | סוג | חובה | תיאור |
|------|------|------|--------|
| `studentId` | string | ✅ | מזהה ייחודי של התלמיד |
| `studentName` | string | ❌ | שם התלמיד |
| `studentGrade` | string | ❌ | כיתה |
| `progress` | object | ❌ | מפת התקדמות לפי מזהה יחידה (1-16) |
| `notes` | object | ❌ | מפת הערות לפי מפתח |
| `highlights` | object | ❌ | מפת הדגשות לפי מזהה מושג |

**תגובה (200 OK):**
```json
{
  "ok": true,
  "message": "Synced to D1",
  "studentId": "student-abc123",
  "timestamp": "2026-03-05T10:46:24.490Z"
}
```

**תגובת שגיאה (400):**
```json
{
  "ok": false,
  "error": "Missing studentId"
}
```

---

## 3. Sync - טעינת נתוני תלמיד

```
GET /api/sync/:studentId
```

**אימות**: ❌ לא נדרש  
**תיאור**: שליפת כל נתוני התלמיד מ-D1

**פרמטרי נתיב:**
| פרמטר | סוג | תיאור |
|---------|------|--------|
| `studentId` | string | מזהה התלמיד |

**דוגמת בקשה:**
```bash
curl https://civics2026.pages.dev/api/sync/student-abc123
```

**תגובה - תלמיד נמצא (200 OK):**
```json
{
  "found": true,
  "data": {
    "studentName": "דנה כהן",
    "studentGrade": "י\"א-3",
    "progress": {
      "1": {
        "checklist": [true, false, true],
        "answers": { "q1": "תשובה" },
        "mood": "😊",
        "completed": false
      }
    },
    "notes": {
      "unit-1-notes": "הערות"
    },
    "highlights": {}
  }
}
```

**תגובה - תלמיד לא נמצא:**
```json
{
  "found": false,
  "data": null
}
```

---

## 4. Teacher - רשימת תלמידים (דשבורד מורה)

```
GET /api/teacher/students?password=XXXX
```

**אימות**: ✅ סיסמת מורה נדרשת  
**תיאור**: שליפת כל התלמידים עם סיכום התקדמות מלא

**פרמטרי שאילתה:**
| פרמטר | סוג | חובה | תיאור |
|---------|------|------|--------|
| `password` | string | ✅ | סיסמת מורה |

**דוגמת בקשה:**
```bash
curl "https://civics2026.pages.dev/api/teacher/students?password=0512"
```

**תגובה (200 OK):**
```json
{
  "students": [
    {
      "id": "student-abc123",
      "name": "דנה כהן",
      "grade": "י\"א-3",
      "className": "",
      "createdAt": "2026-03-03T10:00:00.000Z",
      "updatedAt": "2026-03-05T08:30:00.000Z",
      "completedUnits": 5,
      "totalAnswers": 42,
      "notesCount": 3,
      "progress": {
        "1": { "checklist": [], "answers": {}, "mood": "", "completed": true }
      }
    }
  ],
  "total": 1,
  "timestamp": "2026-03-05T10:46:24.490Z"
}
```

**תגובת שגיאה (401):**
```json
{
  "error": "Unauthorized",
  "students": []
}
```

---

## 5. Teacher - שינוי סיסמה

```
POST /api/teacher/change-password
```

**אימות**: ✅ סיסמה נוכחית נדרשת בגוף הבקשה  
**תיאור**: שינוי סיסמת דשבורד המורה

**גוף הבקשה:**
```json
{
  "currentPassword": "0512",
  "newPassword": "new-secure-password"
}
```

| שדה | סוג | חובה | תיאור |
|------|------|------|--------|
| `currentPassword` | string | ✅ | הסיסמה הנוכחית |
| `newPassword` | string | ✅ | הסיסמה החדשה (מינימום 4 תווים) |

**תגובה (200 OK):**
```json
{
  "ok": true,
  "message": "Password changed successfully"
}
```

**תגובות שגיאה:**
```json
// 400 - שדות חסרים
{ "ok": false, "error": "Missing fields" }

// 400 - סיסמה קצרה מדי
{ "ok": false, "error": "Password too short (min 4)" }

// 401 - סיסמה נוכחית שגויה
{ "ok": false, "error": "Wrong current password" }
```

---

## 6. Analytics - רישום אירוע

```
POST /api/analytics
```

**אימות**: ❌ לא נדרש  
**תיאור**: רישום אירוע אנליטי (כניסה לדף, לחיצה, שימוש ב-TTS וכו')

**גוף הבקשה:**
```json
{
  "studentId": "student-abc123",
  "eventType": "page_view",
  "eventData": {
    "page": "unit/3",
    "duration": 120
  }
}
```

| שדה | סוג | חובה | תיאור |
|------|------|------|--------|
| `studentId` | string | ✅ | מזהה התלמיד |
| `eventType` | string | ✅ | סוג האירוע |
| `eventData` | object | ❌ | מידע נוסף על האירוע |

**סוגי אירועים נפוצים:**
| eventType | תיאור |
|-----------|--------|
| `page_view` | צפייה בדף |
| `question_attempt` | ניסיון תשובה על שאלה |
| `tts_used` | שימוש ב-TTS |
| `hint_used` | שימוש ברמז |
| `unit_completed` | סיום יחידה |

**תגובה (200 OK):**
```json
{ "ok": true }
```

---

## 7. Analytics - סיכום אנליטיקה (מורה)

```
GET /api/analytics/summary?password=XXXX
```

**אימות**: ✅ סיסמת מורה נדרשת  
**תיאור**: סיכום אנליטי כולל לצפייה בדשבורד המורה

**דוגמת בקשה:**
```bash
curl "https://civics2026.pages.dev/api/analytics/summary?password=0512"
```

**תגובה (200 OK):**
```json
{
  "summary": {
    "totalStudents": 25,
    "activeStudents7d": 18,
    "todaySyncs": 42,
    "averageCompletionPct": 65,
    "unitStats": [
      { "unit_id": 1, "student_count": 22, "completed_count": 15 },
      { "unit_id": 2, "student_count": 20, "completed_count": 12 }
    ],
    "recentEvents": [
      { "event_type": "page_view", "count": 340 },
      { "event_type": "question_attempt", "count": 156 }
    ]
  },
  "timestamp": "2026-03-05T10:46:24.490Z"
}
```

| שדה | סוג | תיאור |
|------|------|--------|
| `totalStudents` | number | סה"כ תלמידים רשומים |
| `activeStudents7d` | number | תלמידים פעילים ב-7 ימים אחרונים |
| `todaySyncs` | number | סנכרונים היום |
| `averageCompletionPct` | number | אחוז השלמה ממוצע |
| `unitStats` | array | סטטיסטיקות לפי יחידה |
| `recentEvents` | array | אירועים אחרונים (7 ימים) |

---

## 8. Student - מחיקת תלמיד

```
DELETE /api/student/:id?password=XXXX
```

**אימות**: ✅ סיסמת מורה נדרשת  
**תיאור**: מחיקת תלמיד וכל הנתונים שלו (התקדמות, הערות, הדגשות, אנליטיקה)

**פרמטרי נתיב:**
| פרמטר | סוג | תיאור |
|---------|------|--------|
| `id` | string | מזהה התלמיד למחיקה |

**דוגמת בקשה:**
```bash
curl -X DELETE "https://civics2026.pages.dev/api/student/student-abc123?password=0512"
```

**תגובה (200 OK):**
```json
{
  "ok": true,
  "deleted": "student-abc123"
}
```

**טבלאות שנמחקות:** `analytics`, `highlights`, `notes`, `progress`, `sync_log`, `students`

---

## 9. Student - ייצוא נתוני תלמיד

```
GET /api/student/:id/export
```

**אימות**: ❌ לא נדרש  
**תיאור**: ייצוא כל נתוני התלמיד בפורמט JSON (להורדה/גיבוי)

**דוגמת בקשה:**
```bash
curl https://civics2026.pages.dev/api/student/student-abc123/export
```

**תגובה (200 OK):**
```json
{
  "student": {
    "id": "student-abc123",
    "name": "דנה כהן",
    "grade": "י\"א-3",
    "className": "",
    "createdAt": "2026-03-03T10:00:00.000Z"
  },
  "progress": {
    "1": {
      "checklist": [true, true, false],
      "answers": { "q1": "תשובה" },
      "mood": "😊",
      "completed": false
    }
  },
  "notes": {
    "unit-1-notes": "הערות ליחידה 1"
  },
  "highlights": {
    "concept-42": [{ "text": "טקסט", "color": "yellow" }]
  },
  "exportedAt": "2026-03-05T10:46:24.490Z"
}
```

**תגובת שגיאה (404):**
```json
{ "error": "Student not found" }
```

---

## 10. Service Worker

```
GET /sw.js
```

**אימות**: ❌ לא נדרש  
**תיאור**: Service Worker לתמיכת Offline. נרשם אוטומטית בטעינת הדף.

**Cache Version**: `civics2026-v5`

**קבצים שנשמרים ב-Cache:**
| קובץ | גודל | תיאור |
|-------|------|--------|
| `/` | ~2.6KB | דף HTML ראשי |
| `/static/app.js` | 176KB | אפליקציה ראשית |
| `/static/data.js` | 192KB | נתוני יחידות |
| `/static/questions-data.js` | 236KB | נתוני שאלות |
| `/static/scaffolding.js` | 108KB | פיגומים |
| `/static/study-materials.js` | 248KB | חומרי לימוד |
| `/static/features.js` | 44KB | פיצ'רים |
| `/static/styles.css` | 124KB | עיצוב |
| `/static/exam-questions-official.json` | 248KB | 96 שאלות |

---

## מבנה מסד הנתונים (D1 SQLite)

### טבלאות

```sql
-- תלמידים
students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  grade TEXT DEFAULT '',
  class_name TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- התקדמות לפי יחידה
progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,         -- FK → students.id
  unit_id INTEGER NOT NULL,         -- 1-16
  checklist TEXT DEFAULT '[]',      -- JSON array of booleans
  answers TEXT DEFAULT '{}',        -- JSON object
  mood TEXT DEFAULT '',
  completed INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, unit_id)
)

-- הערות אישיות
notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,         -- FK → students.id
  note_key TEXT NOT NULL,
  content TEXT DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, note_key)
)

-- הדגשות טקסט
highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,         -- FK → students.id
  highlight_id TEXT NOT NULL,
  data TEXT DEFAULT '[]',           -- JSON array
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, highlight_id)
)

-- יומן סנכרון
sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- אנליטיקה
analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,         -- FK → students.id
  event_type TEXT NOT NULL,
  event_data TEXT DEFAULT '{}',     -- JSON object
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- הגדרות מורה
teacher_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## קודי HTTP

| קוד | משמעות | מתי |
|------|---------|------|
| 200 | OK | בקשה הצליחה |
| 400 | Bad Request | שדות חסרים או לא תקינים |
| 401 | Unauthorized | סיסמת מורה שגויה |
| 404 | Not Found | תלמיד/משאב לא נמצא |
| 500 | Server Error | שגיאת שרת (DB וכו') |

---

## CORS

כל ה-API endpoints תומכים ב-CORS:
```
Access-Control-Allow-Origin: *
```

---

## הערות חשובות

1. **Offline Support**: בקשות API שנכשלות במצב offline מחזירות:
   ```json
   { "ok": false, "offline": true, "message": "אתם במצב לא מקוון" }
   ```

2. **Auto-migration**: טבלאות נוצרות אוטומטית בבקשה הראשונה (אין צורך במיגרציה ידנית)

3. **Batch Operations**: סנכרון משתמש ב-D1 batch API לביצועים מהירים

4. **סיסמת ברירת מחדל**: `0512` (ניתנת לשינוי דרך endpoint #5)
