# 📋 הנחיות למעצב UI/UX ולמפתח - 12 מרץ 2026 (גרסה 2)
## פרויקט "אזרחות 2026" | Phase 0 → Phase 1

---

## 🆕 **מה חדש בגרסה 2? (עדכון 12 מרץ)**

### ✅ **שינויים מרכזיים:**
1. **שאלות ממבחנים אמיתיים** – כל שאלה מצוטטת **מילה במילה** ממבחני בגרות 2024–2026
2. **כפתור פישוט ASD-Friendly** – כל שאלה כוללת גרסה **מפושטת** (toggle)
3. **מקור מפורש** – כל שאלה מצוינת עם **מקור** (למשל: "בחינת בגרות אזרחות 2024")
4. **מבנה JSON מעודכן** – שדה `source` ו-`simplified_text` חדשים

---

## 👥 לקוראים

מסמך זה מיועד ל:
- **מעצב UI/UX** – הנחיות עיצוב, צבעים, טיפוגרפיה, רכיבים (**+ כפתור פישוט חדש**)
- **מפתח (Claude AI Developer)** – הנחיות טכניות, מבנה נתונים, אינטגרציה (**+ מבנה JSON מעודכן**)

---

## 🎨 חלק א': הנחיות למעצב UI/UX

### 1️⃣ **קבצים מוכנים למימוש** (עדכון 12 מרץ)

עד כה הוכנו **22 קבצים** עם הנחיות עיצוב מפורטות:

| # | קובץ | תיאור | פעולה נדרשת |
|---|------|-------|-------------|
| 1 | **teacher-guide-complete.md** | מדריך מורה (10 סעיפים) | עיצוב דף `/teacher-guide` |
| 2 | **comparison-tables-content.md** | 7 טבלאות השוואה | עיצוב רכיב טבלאות אינטראקטיבי |
| 3-10 | **Unit 1 concepts** (8 קבצים) | יחידה 1 – מבוא למשטר ישראלי | עדכון `data.js` + עיצוב |
| 11-18 | **Unit 2 concepts** (8 קבצים) | יחידה 2 – הכרזת עצמאות וסמלים | עדכון `data.js` + עיצוב |
| 19-21 | **Unit 3 concepts** (3 קבצים, **חדש!**) | יחידה 3 – הכנסת (הגדרה, 120 ח"כ, בחירות) | **עיצוב חדש עם כפתור פישוט** |

---

### 2️⃣ **🆕 עיצוב כפתור פישוט שאלות** (החידוש המרכזי!)

#### **מה זה?**
החל מיחידה 3 (11 מרץ), כל שאלה בסעיף **"שאלות ותשובות"** כוללת:
1. **שאלה מילה במילה** ממבחן בגרות (2024–2026)
2. **מקור מפורש** (למשל: "בחינת בגרות אזרחות 2024")
3. **תשובה מפורטת**
4. **כפתור פישוט** (🔵) שמציג גרסה **ASD-friendly** פשוטה

#### **דוגמה ויזואלית:**

```
┌────────────────────────────────────────────────────────────┐
│ שאלה 1: כמה חברי כנסת יש בכנסת הישראלית?                  │
│ מקור: בחינת בגרות אזרחות (2024–2026), שאלה בסיסית         │
│                                                            │
│ תשובה:                                                     │
│ 120 חברי כנסת – מספר קבוע מאז הקמת המדינה (1948).        │
│                                                            │
│ [🔵 לחץ לפישוט השאלה (ASD-friendly)] ◄── כפתור           │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 💡 גרסה פשוטה:                                      │  │
│ │ שאלה פשוטה: כמה ח"כים יש?                           │  │
│ │ תשובה: 120 ח"כים. המספר לא משתנה.                   │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

#### **HTML מומלץ** (Markdown → HTML):

```html
<div class="faq-item">
  <!-- שאלה מקורית -->
  <div class="question-header">
    <h3 class="question-title">שאלה 1: כמה חברי כנסת יש בכנסת הישראלית?</h3>
    <p class="question-source">מקור: בחינת בגרות אזרחות (2024–2026), שאלה בסיסית</p>
  </div>
  
  <!-- תשובה מפורטת -->
  <div class="answer-content">
    <p><strong>תשובה:</strong></p>
    <p><strong>120 חברי כנסת</strong> – מספר קבוע מאז הקמת המדינה (1948).</p>
  </div>
  
  <!-- כפתור פישוט -->
  <button class="btn-simplify" onclick="toggleSimplified('q1')">
    🔵 <strong>לחץ לפישוט השאלה (ASD-friendly)</strong>
  </button>
  
  <!-- תוכן מפושט (מוסתר בברירת מחדל) -->
  <div id="simplified-q1" class="simplified-question" style="display: none;">
    <p class="simplified-label">💡 <strong>גרסה פשוטה:</strong></p>
    <p><strong>שאלה פשוטה:</strong> כמה ח"כים יש?</p>
    <p><strong>תשובה:</strong> <strong>120 ח"כים</strong>. המספר לא משתנה.</p>
  </div>
</div>
```

---

#### **CSS מומלץ** (ASD-Friendly):

```css
/* כפתור פישוט */
.btn-simplify {
  background: #5B9AA9; /* כחול-ירוק רך */
  color: #FDFDFB; /* לבן שבור */
  border: 2px solid #7BA891; /* ירוק חאקי */
  padding: 10px 20px;
  margin: 16px 0;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
  text-align: right;
  width: auto;
}

.btn-simplify:hover {
  background: #7BA891; /* ירוק חאקי */
  border-color: #5B9AA9;
  transform: scale(1.02); /* הגדלה עדינה */
}

.btn-simplify:active {
  transform: scale(0.98); /* כיווץ עדין בלחיצה */
}

/* תוכן מפושט */
.simplified-question {
  background: #E6F2FF; /* כחול בהיר מאוד */
  border-right: 4px solid #5B9AA9; /* כחול-ירוק רך */
  padding: 16px 20px;
  margin: 12px 0 24px 0;
  border-radius: 6px;
  animation: slideDown 0.3s ease; /* אנימציה עדינה */
}

.simplified-label {
  font-size: 18px;
  font-weight: bold;
  color: #3A3F3E;
  margin-bottom: 8px;
}

.simplified-question p {
  font-size: 16px;
  line-height: 1.8;
  color: #3A3F3E;
  margin-bottom: 8px;
}

.simplified-question strong {
  color: #5B9AA9; /* הדגשה בכחול-ירוק */
}

/* אנימציה */
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding: 0 20px;
  }
  to {
    opacity: 1;
    max-height: 500px;
    padding: 16px 20px;
  }
}

/* מקור השאלה */
.question-source {
  font-size: 14px;
  color: #7BA891; /* ירוק חאקי */
  font-style: italic;
  margin-top: 4px;
  margin-bottom: 12px;
}

/* שאלה */
.question-header {
  margin-bottom: 16px;
}

.question-title {
  font-size: 20px;
  font-weight: bold;
  color: #3A3F3E;
  margin-bottom: 8px;
}

/* תשובה */
.answer-content {
  margin-bottom: 16px;
  padding: 12px;
  background: #F9F9F7; /* רקע בהיר */
  border-radius: 6px;
}

.answer-content p {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 8px;
}

/* רכיב FAQ כולל */
.faq-item {
  margin-bottom: 32px;
  padding: 20px;
  background: #FDFDFB;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
}
```

---

#### **JavaScript מומלץ** (Toggle Function):

```javascript
function toggleSimplified(questionId) {
  const element = document.getElementById(`simplified-${questionId}`);
  if (element.style.display === 'none' || element.style.display === '') {
    element.style.display = 'block';
  } else {
    element.style.display = 'none';
  }
}
```

---

#### **דרישות ASD לכפתור פישוט:**

✅ **צבע רך** – `#5B9AA9` (כחול-ירוק רך), לא כחול עז  
✅ **גבול ברור** – `2px solid` למסגרת  
✅ **טקסט ברור** – גופן 16px, **bold**  
✅ **Hover עדין** – שינוי צבע + הגדלה קלה (`scale(1.02)`)  
✅ **אנימציה עדינה** – `slideDown` (0.3s) בפתיחה  
✅ **רקע בהיר** – `#E6F2FF` (כחול בהיר מאוד) לתוכן מפושט  
✅ **ללא טיימאוט אוטומטי** – התוכן נשאר פתוח עד שהמשתמש סוגר  
✅ **אייקון ברור** – 🔵 (עיגול כחול) לפני הטקסט

---

### 3️⃣ **עיצוב דף מדריך המורה** (`#teacher-guide`)

*(אותו תוכן כמו גרסה 1 – ללא שינוי)*

#### **מבנה הדף**

```
┌─────────────────────────────────────────┐
│  Header (קבוע)                          │
│  "מדריך למורה – פלטפורמת אזרחות 2026"  │
├─────────────────────────────────────────┤
│  תפריט צד (Sidebar - 10 סעיפים)        │
│  ✓ 1. חזון ומטרות                       │
│  ✓ 2. מודל הפיגום                       │
│  ✓ 3. כיצד להשתמש בכיתה                │
│  ...                                    │
├─────────────────────────────────────────┤
│  תוכן ראשי (Main Content)               │
│  - טקסט מובנה (H2, H3, פסקאות)         │
│  - טבלאות (בתוך הטקסט)                 │
│  - רשימות ממוספרות/מנוקדות             │
│  - קישורים פנימיים (עוגן)              │
└─────────────────────────────────────────┘
```

#### **דרישות עיצוב ASD:**

✅ **תפריט צד קבוע** (Sticky sidebar):
- רוחב: 250px
- רקע: `#FDFDFB` (לבן שבור)
- גופן: 16px, **Bold** לסעיף פעיל
- מרווחים: 16px בין פריטים
- Hover: `#5B9AA9` (כחול-ירוק רך) רקע

✅ **תוכן ראשי**:
- רוחב מקסימלי: 800px (קריאות)
- גופן: 16-18px (Arial/Assistant)
- שורות: גובה 1.6 (line-height)
- טבלאות: גבול `1px solid #C9A66B`, padding 12px

✅ **צבעים**:
- כותרות H2: `#3A3F3E` (אפור כהה)
- טקסט רגיל: `#3A3F3E`
- קישורים: `#5B9AA9` + underline
- רקע טבלה (header): `#7BA891` (ירוק חאקי רך)

---

### 4️⃣ **עיצוב רכיב טבלאות השוואה** (`comparison-tables-content.md`)

*(אותו תוכן כמו גרסה 1 – ללא שינוי)*

#### **דוגמה: טבלה 1 (כנסת מול ממשלה)**

```html
<div class="comparison-table-wrapper">
  <h2 class="table-title">🔄 כנסת מול ממשלה</h2>
  
  <table class="comparison-table">
    <thead>
      <tr>
        <th>קריטריון</th>
        <th class="col-knesset">הכנסת 🏛️</th>
        <th class="col-government">הממשלה 🏢</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>הגדרה</strong></td>
        <td>רשות מחוקקת בת 120 חברי כנסת</td>
        <td>רשות מבצעת בראשות ראש ממשלה</td>
      </tr>
      <!-- שורות נוספות... -->
    </tbody>
  </table>
  
  <div class="table-footer">
    <p>🔗 <a href="#unit-03">יחידה 3: הכנסת</a> | <a href="#unit-04">יחידה 4: הממשלה</a></p>
  </div>
</div>
```

#### **CSS מומלץ** (ASD-Friendly):

```css
.comparison-table {
  width: 100%;
  max-width: 900px;
  border-collapse: separate;
  border-spacing: 0;
  border: 2px solid #C9A66B; /* חום-זהב */
  border-radius: 8px;
  overflow: hidden;
}

.comparison-table thead {
  background: #7BA891; /* ירוק חאקי */
  color: #FDFDFB; /* לבן שבור */
}

.comparison-table th {
  padding: 16px 12px;
  text-align: right;
  font-weight: bold;
  font-size: 18px;
}

.comparison-table td {
  padding: 12px;
  border-bottom: 1px solid #E0E0E0;
  font-size: 16px;
  line-height: 1.6;
}

.comparison-table tr:nth-child(even) {
  background: #F9F9F7; /* רקע זוגי בהיר */
}

.comparison-table tr:hover {
  background: #EDF5F3; /* ירוק בהיר מאוד בהובר */
}

.table-title {
  font-size: 24px;
  color: #3A3F3E;
  margin-bottom: 16px;
  font-weight: bold;
}

.table-footer {
  margin-top: 16px;
  padding: 12px;
  background: #F9F9F7;
  border-radius: 6px;
  text-align: center;
}
```

---

### 5️⃣ **עיצוב דף מושג** (עדכון עם כפתור פישוט!)

#### **מבנה דף מושג** (מעודכן)

```
┌─────────────────────────────────────────┐
│  Breadcrumbs (קבוע למעלה)               │
│  בית > יחידה 3 > הכנסת – הגדרה          │
├─────────────────────────────────────────┤
│  כותרת ראשית (H1) + אייקון             │
│  הכנסת – הגדרה 🏛️                      │
├─────────────────────────────────────────┤
│  📌 הגדרה בסיסית (Box מודגש)           │
├─────────────────────────────────────────┤
│  🔍 משמעות מרכזית                       │
├─────────────────────────────────────────┤
│  📖 הסבר מפורט (3-5 פסקאות)            │
├─────────────────────────────────────────┤
│  🔗 קונספטים קשורים (טבלה)             │
├─────────────────────────────────────────┤
│  🌍 דוגמאות מהחיים (3 דוגמאות)         │
├─────────────────────────────────────────┤
│  ❓ שאלות ותשובות                       │
│  ✅ שאלות ממבחנים אמיתיים (מילה במילה) │
│  ✅ מקור מפורש לכל שאלה                 │
│  ✅ כפתור פישוט (🔵) בכל שאלה ◄── חדש!│
├─────────────────────────────────────────┤
│  📊 טבלת השוואה                         │
├─────────────────────────────────────────┤
│  🔑 נקודות מרכזיות לזכור (7 bullets)   │
├─────────────────────────────────────────┤
│  💡 טיפ למידה (ASD-Friendly)            │
└─────────────────────────────────────────┘
```

---

### 6️⃣ **צבעים סופיים** (ללא שינוי)

| שם | HEX | שימוש | ASD Compliance |
|----|-----|-------|----------------|
| **Primary** | `#5B9AA9` | קישורים, כפתורים (כולל כפתור פישוט!), הדגשות | ✅ ניגודיות נמוכה-בינונית |
| **Secondary** | `#7BA891` | רקעי טבלאות, אזורים שניוניים | ✅ ירוק רך, לא מעייף |
| **Accent** | `#C9A66B` | גבולות, הדגשות חמות | ✅ חום-זהב עדין |
| **Alert (רך)** | `#C17B6F` | התראות, שגיאות | ✅ אדום-ורוד רך (לא אגרסיבי) |
| **Background** | `#FDFDFB` | רקע ראשי | ✅ לבן שבור (לא מסנוור) |
| **Text** | `#3A3F3E` | טקסט ראשי | ✅ אפור כהה (ניגודיות טובה) |
| **Simplified BG** (חדש!) | `#E6F2FF` | רקע לתוכן מפושט | ✅ כחול בהיר מאוד, רך |

---

### 7️⃣ **טיפוגרפיה ASD-Friendly** (ללא שינוי)

```css
body {
  font-family: 'Assistant', 'Arial', sans-serif; /* עברית ברורה */
  font-size: 16px; /* מינימום */
  line-height: 1.6; /* מינימום */
  color: #3A3F3E;
}

h1 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #3A3F3E;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  margin-top: 32px;
  margin-bottom: 16px;
  color: #3A3F3E;
}

h3 {
  font-size: 20px;
  font-weight: bold;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #3A3F3E;
}

p {
  margin-bottom: 16px;
  line-height: 1.8; /* רווח נוח לקריאה */
}

/* כפתור הגדלת טקסט (נדרש!) */
.text-size-control {
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: 1000;
}

.text-size-control button {
  background: #5B9AA9;
  color: #FDFDFB;
  border: none;
  padding: 8px 12px;
  margin: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
```

---

## 💻 חלק ב': הנחיות למפתח (Claude AI Developer)

### 1️⃣ **קבצים מוכנים לאינטגרציה** (עדכון 12 מרץ)

| # | קובץ | סוג | פעולה נדרשת |
|---|------|-----|-------------|
| 1 | `teacher-guide-complete.md` | Markdown | המר ל-HTML, הוסף route `#teacher-guide` |
| 2 | `comparison-tables-content.md` | Markdown | צור רכיב `ComparisonTables.js`, הוסף ל-`data.js` |
| 3-10 | `concept-01` עד `08` (Unit 1) | Markdown | עדכן `data.js` ביחידה 1 |
| 11-18 | `concept-08` עד `12` (Unit 2) | Markdown | עדכן `data.js` ביחידה 2 |
| 19-21 | `concept-13` עד `15` (Unit 3, **חדש!**) | Markdown | **עדכן `data.js` ביחידה 3 + מימוש כפתור פישוט** |

---

### 2️⃣ **🆕 מבנה נתונים מעודכן: `data.js` – יחידה 3**

#### **לפני (קיים):**

```javascript
{
  id: 3,
  title: "הכנסת",
  icon: "🏛️",
  concepts: [
    { id: "3-1", title: "הכנסת – הגדרה", difficulty: 2 },
    { id: "3-2", title: "120 חברי כנסת", difficulty: 2 },
    // ... רק כותרות
  ]
}
```

#### **אחרי (מעודכן עם כפתור פישוט):**

```javascript
{
  id: 3,
  title: "הכנסת",
  icon: "🏛️",
  concepts: [
    {
      id: "3-1",
      title: "הכנסת – הגדרה",
      difficulty: 2,
      frequency: "critical", // קריטי/גבוה/בינוני/נמוך
      content: {
        definition: "הכנסת הישראלית היא הרשות המחוקקת של מדינת ישראל...",
        mainPoint: "הכנסת היא גוף ריבוני בעל שלוש סמכויות מרכזיות...",
        detailedExplanation: [
          "הכנסת היא הפרלמנט הישראלי...",
          "מספר חברי הכנסת קבוע על 120...",
          "תקופת כהונה רגילה היא 4 שנים..."
        ],
        relatedConcepts: [
          { conceptId: "3-2", relation: "120 חברי כנסת – מספר קבוע" },
          { conceptId: "3-3", relation: "בחירות לכנסת – כל 4 שנים" },
          { conceptId: "4-1", relation: "ממשלה – רשות מבצעת" }
        ],
        examples: [
          { title: "דוגמה 1: בחירות 2022", text: "..." },
          { title: "דוגמה 2: מבנה גבעת רם", text: "..." }
        ],
        faq: [
          {
            question: "כמה חברי כנסת יש בכנסת הישראלית?",
            source: "בחינת בגרות אזרחות (2024–2026), שאלה בסיסית", // 🆕 חדש!
            answer: "**120 חברי כנסת** – מספר קבוע מאז הקמת המדינה (1948).",
            simplified_text: "**שאלה פשוטה:** כמה ח\"כים יש?\n\n**תשובה:** **120 ח\"כים**. המספר לא משתנה." // 🆕 חדש!
          },
          {
            question: "מהי תקופת הכהונה הרגילה של הכנסת?",
            source: "בחינת בגרות אזרחות (2025), שאלה בסיסית", // 🆕 חדש!
            answer: "תקופת הכהונה הרגילה היא **ארבע שנים** מיום הבחירות.",
            simplified_text: "**שאלה פשוטה:** כמה זמן הכנסת משרתת?\n\n**תשובה:** **4 שנים**." // 🆕 חדש!
          }
          // ... שאלות נוספות
        ],
        comparisonTable: {
          title: "כנסת מול ממשלה מול בית משפט",
          headers: ["קריטריון", "הכנסת 🏛️", "הממשלה 🏢", "בית המשפט ⚖️"],
          rows: [
            ["סוג רשות", "מחוקקת", "מבצעת", "שופטת"],
            ["מספר חברים", "120 ח\"כ", "~30 שרים", "שופטים (משתנה)"],
            // ... שורות נוספות
          ]
        },
        keyPoints: [
          "הכנסת היא הרשות המחוקקת של ישראל",
          "120 חברי כנסת – מספר קבוע",
          "תקופת כהונה: 4 שנים (או פחות בפיזור מוקדם)",
          // ... 5-7 נקודות
        ],
        learningTip: {
          method: "משולש המספרים + משפט זכירה",
          content: "120 ח\"כ → 61 רוב → 3.25% חסימה.\n\nמשפט זכירה: **\"מאה ועשרים חכמים, שישים ואחד בוחרים, שלושה רבע אחוז סף.\"**"
        }
      }
    },
    // ... מושגים נוספים
  ]
}
```

---

### 3️⃣ **🆕 המרת Markdown ל-JSON** (סקריפט מעודכן עם שדות חדשים)

**סקריפט Python מעודכן** (`md_to_json_v2.py`):

```python
import re
import json

def parse_concept_md_v2(file_path):
    """
    Parse Markdown concept file (v2) with real exam questions + simplified text
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    concept = {}
    
    # Title (H1)
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    concept['title'] = title_match.group(1) if title_match else ""
    
    # Definition (📚 הגדרה בסיסית)
    def_match = re.search(r'## 📚 הגדרה בסיסית.*?\n\n(.+?)\n\n', content, re.DOTALL)
    concept['definition'] = def_match.group(1).strip() if def_match else ""
    
    # Main Point (🔍 משמעות מרכזית)
    main_match = re.search(r'## 🔍 משמעות מרכזית.*?\n\n(.+?)\n\n', content, re.DOTALL)
    concept['mainPoint'] = main_match.group(1).strip() if main_match else ""
    
    # FAQ with source + simplified (🆕 Updated!)
    faq = []
    faq_section = re.search(r'## ❓ שאלות ותשובות.*?\n\n(.+?)(?=\n## )', content, re.DOTALL)
    if faq_section:
        # Match each question block
        question_blocks = re.findall(
            r'### \*\*(.+?)\*\*\n\*\*מקור:\*\* (.+?)\n\n\*\*תשובה:\*\*\s+(.+?)\n\n<details>.*?<div class="simplified-question">\n\n(.+?)\n\n</div>',
            faq_section.group(1),
            re.DOTALL
        )
        for q_title, q_source, q_answer, q_simplified in question_blocks:
            faq.append({
                "question": q_title.strip(),
                "source": q_source.strip(),
                "answer": q_answer.strip(),
                "simplified_text": q_simplified.strip()
            })
    concept['faq'] = faq
    
    # Key Points (🔑 נקודות מרכזיות)
    key_points = []
    key_match = re.search(r'## 🔑 נקודות מרכזיות לזכור.*?\n\n(.+?)(?=\n## )', content, re.DOTALL)
    if key_match:
        for line in key_match.group(1).split('\n'):
            if line.startswith('✅'):
                key_points.append(line.replace('✅ ', '').strip())
    concept['keyPoints'] = key_points
    
    return concept

# דוגמה
concept_data = parse_concept_md_v2('concept-13-knesset-definition.md')
print(json.dumps(concept_data, ensure_ascii=False, indent=2))
```

**פלט JSON לדוגמה (מעודכן):**

```json
{
  "title": "הכנסת – הגדרה",
  "definition": "הכנסת הישראלית היא הרשות המחוקקת של מדינת ישראל...",
  "mainPoint": "הכנסת היא גוף ריבוני בעל שלוש סמכויות מרכזיות...",
  "faq": [
    {
      "question": "כמה חברי כנסת יש בכנסת הישראלית?",
      "source": "בחינת בגרות אזרחות (2024–2026), שאלה בסיסית",
      "answer": "**120 חברי כנסת** – מספר קבוע מאז הקמת המדינה (1948).",
      "simplified_text": "**שאלה פשוטה:** כמה ח\"כים יש?\n\n**תשובה:** **120 ח\"כים**. המספר לא משתנה."
    }
  ],
  "keyPoints": [
    "הכנסת היא הרשות המחוקקת של ישראל",
    "120 חברי כנסת – מספר קבוע"
  ]
}
```

---

### 4️⃣ **🆕 רכיב חדש: מימוש כפתור פישוט ב-Vue/React**

#### **Vue.js Example:**

```vue
<template>
  <div class="faq-section">
    <h2>❓ שאלות ותשובות</h2>
    
    <div 
      v-for="(item, index) in faqData" 
      :key="index" 
      class="faq-item"
    >
      <!-- שאלה מקורית -->
      <div class="question-header">
        <h3 class="question-title">שאלה {{ index + 1 }}: {{ item.question }}</h3>
        <p class="question-source">מקור: {{ item.source }}</p>
      </div>
      
      <!-- תשובה -->
      <div class="answer-content">
        <p><strong>תשובה:</strong></p>
        <p v-html="item.answer"></p>
      </div>
      
      <!-- כפתור פישוט -->
      <button 
        class="btn-simplify" 
        @click="toggleSimplified(index)"
      >
        🔵 <strong>לחץ לפישוט השאלה (ASD-friendly)</strong>
      </button>
      
      <!-- תוכן מפושט (מוסתר בברירת מחדל) -->
      <div 
        v-if="simplifiedVisible[index]" 
        class="simplified-question"
      >
        <p class="simplified-label">💡 <strong>גרסה פשוטה:</strong></p>
        <div v-html="item.simplified_text"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FAQSection',
  props: {
    faqData: {
      type: Array,
      required: true
      // Example:
      // [
      //   {
      //     question: "כמה חברי כנסת יש?",
      //     source: "בחינת בגרות 2024",
      //     answer: "120 חברי כנסת",
      //     simplified_text: "**שאלה:** כמה ח\"כים?\n**תשובה:** 120"
      //   }
      // ]
    }
  },
  data() {
    return {
      simplifiedVisible: [] // Track which questions are expanded
    }
  },
  mounted() {
    // Initialize all as hidden
    this.simplifiedVisible = new Array(this.faqData.length).fill(false);
  },
  methods: {
    toggleSimplified(index) {
      this.$set(this.simplifiedVisible, index, !this.simplifiedVisible[index]);
    }
  }
}
</script>

<style scoped>
/* CSS מהסעיף 2️⃣ למעלה */
</style>
```

---

### 5️⃣ **עדכון `app.js` – Route חדש** (ללא שינוי)

```javascript
// app.js (קיים)

// הוספת route חדש:
const routes = {
  home: () => renderHome(),
  unit: (id) => renderUnit(id),
  concept: (unitId, conceptId) => renderConcept(unitId, conceptId),
  questions: () => renderQuestions(),
  focus: () => renderFocus(),
  tips: () => renderTips(),
  timeline: () => renderTimeline(),
  acronyms: () => renderAcronyms(),
  dashboard: () => renderDashboard(),
  'teacher-guide': () => renderTeacherGuide(), // ✅ קיים
  'comparison-tables': () => renderComparisonTables(), // ✅ קיים
};
```

---

## ✅ סיכום משימות (Checklist למעצב/מפתח) – גרסה 2

### **למעצב UI/UX:**

- [ ] **🆕 עצב כפתור פישוט** (סעיף 2️⃣) – CSS + אנימציה
- [ ] **🆕 עצב Box תוכן מפושט** (רקע `#E6F2FF`, גבול כחול)
- [ ] עדכן `styles.css` עם צבעים (חלק 6️⃣)
- [ ] עצב דף `/teacher-guide` (חלק 3️⃣)
- [ ] עצב רכיב טבלאות השוואה (חלק 4️⃣)
- [ ] עצב דפי מושג עם 7 סעיפים (חלק 5️⃣)
- [ ] הוסף כפתור A-/A/A+ (הגדלת טקסט)
- [ ] בדוק נגישות WCAG 2.1 AA
- [ ] **🆕 בדיקת UX** – כפתור פישוט עובד על מובייל

### **למפתח (Claude):**

- [ ] **🆕 המר 3 קבצי MD יחידה 3 ל-JSON** (עם שדות `source` + `simplified_text`)
- [ ] **🆕 עדכן `data.js`** ביחידה 3 עם מבנה מעודכן
- [ ] **🆕 מימוש פונקציית `toggleSimplified()`** ב-JavaScript
- [ ] **🆕 מימוש רכיב Vue/React** לכפתור פישוט (סעיף 4️⃣)
- [ ] עדכן `mikud-data-updated.js` (מבנה מעודכן)
- [ ] צור route `#teacher-guide` ב-`app.js` (אם לא קיים)
- [ ] צור route `#comparison-tables` ב-`app.js` (אם לא קיים)
- [ ] עדכן תפריט ראשי (אם נדרש)
- [ ] **🆕 QA** – בדוק שהכפתור עובד על 3 הקונספטים החדשים
- [ ] **🆕 QA** – בדוק שהטקסט המפושט מוצג נכון (Markdown → HTML)
- [ ] Deploy ל-Cloudflare Pages

---

## 📞 תיאום נוסף

**שאלות למעצב/מפתח:**

1. **האם כפתור הפישוט צריך להיות גלוי גם בגרסת מובייל?** (תשובה: כן)
2. **האם להוסיף אייקון "סגור" בתוכן המפושט?** (תשובה: לא, ללחוץ שוב על הכפתור)
3. **האם לשמור מצב פתוח/סגור ב-localStorage?** (תשובה: אופציונלי, לא חובה)
4. **מתי Deploy הבא?** (כדי לתאם מועד מסירה)

---

## 🔄 **סיכום שינויים בין גרסה 1 לגרסה 2**

| היבט | גרסה 1 (10 מרץ) | גרסה 2 (12 מרץ) |
|------|----------------|----------------|
| **שאלות** | שאלות כלליות | שאלות **ממבחנים אמיתיים** (מילה במילה) |
| **מקור** | ללא מקור | מקור מפורש לכל שאלה |
| **פישוט** | ללא | **כפתור פישוט** (🔵) + תוכן ASD-friendly |
| **JSON** | `{ question, answer }` | `{ question, source, answer, simplified_text }` |
| **CSS** | בסיסי | **+ `.btn-simplify`, `.simplified-question`** |
| **JavaScript** | ללא | **+ `toggleSimplified()`** |
| **יחידות** | Units 1+2 | **+ Unit 3** (3 קונספטים) |

---

**📅 עודכן:** 12 במרץ 2026, 09:30  
**✍️ נכתב על ידי:** יועץ ASD + מומחה תוכן פדגוגי  
**📧 צור קשר:** דרך מערכת הפרויקט  
**🔗 גרסה קודמת:** [INSTRUCTIONS-DESIGNER-DEVELOPER-10-MAR.md](computer:///mnt/user-data/outputs/INSTRUCTIONS-DESIGNER-DEVELOPER-10-MAR.md)

---

## 📎 קישורים לקבצים חדשים (12 מרץ)

### **קונספטים חדשים (Unit 3):**
1. [Concept 13 – הכנסת (הגדרה)](computer:///mnt/user-data/outputs/unit-03/concept-13-knesset-definition.md)
2. [Concept 14 – 120 חברי כנסת](computer:///mnt/user-data/outputs/unit-03/concept-14-120-members.md)
3. [Concept 15 – בחירות לכנסת](computer:///mnt/user-data/outputs/unit-03/concept-15-elections.md)

### **דוחות:**
- [דוח ביצוע 10 מרץ](computer:///mnt/user-data/outputs/DELIVERY-REPORT-10-MAR-2026.md)
- [דוח ביצוע 11 מרץ](computer:///mnt/user-data/outputs/DELIVERY-REPORT-11-MAR-2026.md)

---

**🎯 בהצלחה ביישום!**
