# 📋 הנחיות למעצב UI/UX ולמפתח - 10 מרץ 2026
## פרויקט "אזרחות 2026" | Phase 0 → Phase 1

---

## 👥 לקוראים

מסמך זה מיועד ל:
- **מעצב UI/UX** – הנחיות עיצוב, צבעים, טיפוגרפיה, רכיבים
- **מפתח (Claude AI Developer)** – הנחיות טכניות, מבנה נתונים, אינטגרציה

---

## 🎨 חלק א': הנחיות למעצב UI/UX

### 1️⃣ **קבצים מוכנים למימוש**

עד כה הוכנו **7 קבצים** עם הנחיות עיצוב מפורטות:

| # | קובץ | תיאור | פעולה נדרשת |
|---|------|-------|-------------|
| 1 | **teacher-guide-complete.md** | מדריך מורה (10 סעיפים) | עיצוב דף `/teacher-guide` |
| 2 | **comparison-tables-content.md** | 7 טבלאות השוואה | עיצוב רכיב טבלאות אינטראקטיבי |
| 3-7 | **concept-08 עד 12** (יחידה 2) | 5 מושגים מלאים | עדכון `data.js` + עיצוב דף מושג |

---

### 2️⃣ **עיצוב דף מדריך המורה** (`#teacher-guide`)

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

### 3️⃣ **עיצוב רכיב טבלאות השוואה** (`comparison-tables-content.md`)

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

#### **דרישות ASD לטבלאות:**

✅ **שורות גבוהות** (50px+) – נשימה ויזואלית  
✅ **גבולות ברורים** – `2px solid` למסגרת חיצונית  
✅ **ניגודיות נמוכה-בינונית** – רקע `#F9F9F7` ולא לבן טהור  
✅ **ללא Zebra Stripes עזים** – רק שינוי עדין (`#F9F9F7` → `#FDFDFB`)  
✅ **Hover עדין** – `#EDF5F3` (ירוק בהיר מאוד)  
✅ **פונט 16px מינימום** – קריאות לתלמידי ASD

---

### 4️⃣ **עיצוב דף מושג** (לדוגמה: `concept-08-israeli-flag.md`)

#### **מבנה דף מושג**

```
┌─────────────────────────────────────────┐
│  Breadcrumbs (קבוע למעלה)               │
│  בית > יחידה 2 > דגל ישראל              │
├─────────────────────────────────────────┤
│  כותרת ראשית (H1) + אייקון             │
│  דגל ישראל 🇮🇱                          │
├─────────────────────────────────────────┤
│  📌 הגדרה בסיסית (Box מודגש)           │
├─────────────────────────────────────────┤
│  🎯 משמעות מרכזית                       │
├─────────────────────────────────────────┤
│  📖 הסבר מפורט (3-5 פסקאות)            │
├─────────────────────────────────────────┤
│  🔗 קשר למושגים אחרים (טבלה)           │
├─────────────────────────────────────────┤
│  💡 דוגמאות מהחיים (3 דוגמאות)         │
├─────────────────────────────────────────┤
│  ❓ שאלות נפוצות (Q&A)                  │
├─────────────────────────────────────────┤
│  📊 טבלת השוואה                         │
├─────────────────────────────────────────┤
│  ✅ נקודות מפתח (5-7 bullets)           │
├─────────────────────────────────────────┤
│  🎓 טיפ ללמידה (ASD-Friendly)           │
└─────────────────────────────────────────┘
```

#### **CSS לרכיבים מיוחדים**

**1. Box הגדרה בסיסית** (סעיף 📌):

```css
.definition-box {
  background: #EDF5F3; /* ירוק בהיר מאוד */
  border-right: 4px solid #7BA891; /* ירוק חאקי */
  padding: 20px;
  margin: 24px 0;
  border-radius: 6px;
  font-size: 18px;
  line-height: 1.8;
}

.definition-box strong {
  color: #3A3F3E;
  font-weight: bold;
}
```

**2. סעיפים עם אייקונים** (🎯, 📖, 💡 וכו'):

```css
.section-with-icon h2::before {
  content: "🎯"; /* אייקון דינמי */
  margin-left: 8px;
  font-size: 24px;
}

.section-with-icon {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #E0E0E0;
}
```

**3. נקודות מפתח** (✅ bullets):

```css
.key-points {
  background: #FFF9E6; /* צהוב בהיר מאוד (עדין) */
  border: 2px solid #C9A66B; /* חום-זהב */
  border-radius: 8px;
  padding: 20px 24px;
  margin: 24px 0;
}

.key-points ul {
  list-style: none;
  padding-right: 0;
}

.key-points li::before {
  content: "✅ ";
  margin-left: 8px;
  font-size: 18px;
}

.key-points li {
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 1.6;
}
```

**4. טיפ ללמידה** (🎓):

```css
.learning-tip {
  background: #E6F2FF; /* כחול בהיר מאוד */
  border-right: 4px solid #5B9AA9; /* כחול-ירוק רך */
  padding: 20px;
  margin: 24px 0;
  border-radius: 6px;
}

.learning-tip h3 {
  color: #3A3F3E;
  font-size: 20px;
  margin-bottom: 12px;
}

.learning-tip p {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 8px;
}
```

---

### 5️⃣ **צבעים סופיים** (עדכון מ-`final-colors.css`)

| שם | HEX | שימוש | ASD Compliance |
|----|-----|-------|----------------|
| **Primary** | `#5B9AA9` | קישורים, כפתורים, הדגשות | ✅ ניגודיות נמוכה-בינונית |
| **Secondary** | `#7BA891` | רקעי טבלאות, אזורים שניוניים | ✅ ירוק רך, לא מעייף |
| **Accent** | `#C9A66B` | גבולות, הדגשות חמות | ✅ חום-זהב עדין |
| **Alert (רך)** | `#C17B6F` | התראות, שגיאות | ✅ אדום-ורוד רך (לא אגרסיבי) |
| **Background** | `#FDFDFB` | רקע ראשי | ✅ לבן שבור (לא מסנוור) |
| **Text** | `#3A3F3E` | טקסט ראשי | ✅ אפור כהה (ניגודיות טובה) |

**⚠️ חשוב לזכור:**
- **ללא צהוב עז** (`#FFFF00` אסור!) – רגישות חושית
- **ללא אדום טהור** (`#FF0000` אסור!) – מעורר חרדה
- **ללא ניאון/פלורסנט** – מעייף עיניים

---

### 6️⃣ **טיפוגרפיה ASD-Friendly**

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

**⚠️ דרישה קריטית:**
- **כפתור A-/A/A+** (הקטנה/רגיל/הגדלה) חובה בכל עמוד!
- **ללא גופן Serif** (Times New Roman, Georgia) – קשה לקריאה
- **ללא Italics מוגזם** – מבלבל

---

## 💻 חלק ב': הנחיות למפתח (Claude AI Developer)

### 1️⃣ **קבצים מוכנים לאינטגרציה**

| # | קובץ | סוג | פעולה נדרשת |
|---|------|-----|-------------|
| 1 | `teacher-guide-complete.md` | Markdown | המר ל-HTML, הוסף route `#teacher-guide` |
| 2 | `comparison-tables-content.md` | Markdown | צור רכיב `ComparisonTables.js`, הוסף ל-`data.js` |
| 3-7 | `concept-08` עד `concept-12` | Markdown | עדכן `data.js` ביחידה 2, הוסף תוכן מלא |

---

### 2️⃣ **מבנה נתונים: `data.js` – יחידה 2 (עדכון)**

#### **לפני (קיים):**

```javascript
{
  id: 2,
  title: "הכרזת העצמאות וסמלי המדינה",
  icon: "📜",
  concepts: [
    { id: "2-1", title: "הכרזת העצמאות", difficulty: 2 },
    { id: "2-2", title: "דוד בן-גוריון", difficulty: 2 },
    // ... רק כותרות
  ]
}
```

#### **אחרי (מעודכן):**

```javascript
{
  id: 2,
  title: "הכרזת העצמאות וסמלי המדינה",
  icon: "📜",
  concepts: [
    {
      id: "2-1",
      title: "הכרזת העצמאות",
      difficulty: 2,
      frequency: "critical", // קריטי/גבוה/בינוני/נמוך
      content: {
        definition: "הכרזת העצמאות של מדינת ישראל הוכרזה על ידי דוד בן-גוריון ב-14 במאי 1948...",
        mainPoint: "ההכרזה מבטאת את החזון הציוני...",
        detailedExplanation: [
          "פסקה 1...",
          "פסקה 2...",
          "פסקה 3..."
        ],
        relatedConcepts: [
          { conceptId: "2-2", relation: "בן-גוריון הכריז על ההכרזה" },
          { conceptId: "1-1", relation: "ההכרזה מבוססת על עקרונות דמוקרטיים" }
        ],
        examples: [
          { title: "דוגמה 1: יום העצמאות", text: "..." },
          { title: "דוגמה 2: מוזיאון העצמאות", text: "..." }
        ],
        faq: [
          { question: "מתי הוכרזה ההכרזה?", answer: "14 במאי 1948" },
          { question: "מי הכריז?", answer: "דוד בן-גוריון" }
        ],
        keyPoints: [
          "ההכרזה הוכרזה ב-14 במאי 1948",
          "דוד בן-גוריון קרא את ההכרזה",
          // ... 5-7 נקודות
        ],
        learningTip: {
          method: "משפט לזכור",
          content: "14 במאי 1948 – **יום העצמאות**..."
        }
      }
    },
    // ... מושגים נוספים באותו מבנה
  ]
}
```

---

### 3️⃣ **המרת Markdown ל-JSON** (אוטומציה)

**סקריפט Python מומלץ** (`md_to_json.py`):

```python
import re
import json

def parse_concept_md(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    concept = {}
    
    # Title (H1)
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    concept['title'] = title_match.group(1) if title_match else ""
    
    # Definition (📌 הגדרה בסיסית)
    def_match = re.search(r'## 📌 הגדרה בסיסית.*?\n\n(.+?)\n\n', content, re.DOTALL)
    concept['definition'] = def_match.group(1).strip() if def_match else ""
    
    # Main Point (🎯 מהי המשמעות המרכזית)
    main_match = re.search(r'## 🎯 מהי המשמעות המרכזית.*?\n\n(.+?)\n\n', content, re.DOTALL)
    concept['mainPoint'] = main_match.group(1).strip() if main_match else ""
    
    # Detailed Explanation (📖 הסבר מפורט)
    detail_match = re.search(r'## 📖 הסבר מפורט.*?\n\n(.+?)(?=\n## )', content, re.DOTALL)
    if detail_match:
        paragraphs = detail_match.group(1).strip().split('\n\n')
        concept['detailedExplanation'] = [p.strip() for p in paragraphs if p.strip()]
    
    # Key Points (✅ נקודות מפתח)
    key_points = []
    key_match = re.search(r'## ✅ נקודות מפתח.*?\n\n(.+?)(?=\n## )', content, re.DOTALL)
    if key_match:
        for line in key_match.group(1).split('\n'):
            if line.startswith('✅'):
                key_points.append(line.replace('✅ ', '').strip())
    concept['keyPoints'] = key_points
    
    return concept

# דוגמה
concept_data = parse_concept_md('concept-08-israeli-flag.md')
print(json.dumps(concept_data, ensure_ascii=False, indent=2))
```

**פלט JSON לדוגמה:**

```json
{
  "title": "דגל ישראל 🇮🇱",
  "definition": "דגל ישראל הוא הסמל הלאומי הרשמי של מדינת ישראל...",
  "mainPoint": "דגל ישראל מסמל את הזהות היהודית והציונית...",
  "detailedExplanation": [
    "דגל ישראל מורכב משלושה אלמנטים מרכזיים...",
    "רקע לבן – מסמל טהרה, שלום ותקווה..."
  ],
  "keyPoints": [
    "דגל ישראל מורכב מ-שני פסים כחולים על רקע לבן + מגן דוד כחול במרכז",
    "הפסים הכחולים מסמלים את פסי הטלית"
  ]
}
```

---

### 4️⃣ **אינטגרציה ל-`mikud-data-updated.js`**

**מבנה קובץ:**

```javascript
// mikud-data-updated.js
window.MIKUD_DATA_UPDATED = {
  units: [
    {
      unitId: 2,
      unitTitle: "הכרזת העצמאות וסמלי המדינה",
      concepts: [
        {
          conceptId: "2-4",
          conceptTitle: "דגל ישראל",
          icon: "🇮🇱",
          difficulty: 2, // 1=קל, 2=בינוני, 3=קשה
          frequency: "critical", // critical/high/medium/low
          content: {
            definition: "דגל ישראל הוא הסמל הלאומי...",
            mainPoint: "דגל ישראל מסמל את הזהות היהודית...",
            detailedExplanation: [...],
            relatedConcepts: [...],
            examples: [...],
            faq: [...],
            keyPoints: [...],
            learningTip: {...}
          }
        },
        // ... מושגים נוספים
      ]
    },
    // ... יחידות נוספות
  ]
};
```

---

### 5️⃣ **רכיב חדש: `ComparisonTables.vue` (או `.js`)**

**מבנה רכיב:**

```vue
<template>
  <div class="comparison-tables-page">
    <h1>🔄 טבלאות השוואה</h1>
    <p class="intro">טבלאות אלו מיועדות להשוואה ברורה בין מושגים מרכזיים בבחינת הבגרות.</p>
    
    <!-- טבלה 1 -->
    <div class="comparison-table-wrapper">
      <h2 class="table-title">1. כנסת מול ממשלה</h2>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>קריטריון</th>
            <th class="col-knesset">הכנסת 🏛️</th>
            <th class="col-government">הממשלה 🏢</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table1Data" :key="row.criterion">
            <td><strong>{{ row.criterion }}</strong></td>
            <td>{{ row.knesset }}</td>
            <td>{{ row.government }}</td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <p>🔗 <a href="#unit-03">יחידה 3: הכנסת</a> | <a href="#unit-04">יחידה 4: הממשלה</a></p>
      </div>
    </div>
    
    <!-- טבלאות 2-7 באותו מבנה -->
  </div>
</template>

<script>
export default {
  name: 'ComparisonTables',
  data() {
    return {
      table1Data: [
        { criterion: 'הגדרה', knesset: 'רשות מחוקקת בת 120 חברי כנסת', government: 'רשות מבצעת בראשות ראש ממשלה' },
        { criterion: 'תפקיד מרכזי', knesset: 'חקיקת חוקים, פיקוח על הממשלה', government: 'ביצוע מדיניות, ניהול השלטון היומיומי' },
        // ... שורות נוספות
      ],
      // table2Data, table3Data, ...
    }
  }
}
</script>

<style scoped>
/* CSS מהסעיף 3️⃣ למעלה */
</style>
```

---

### 6️⃣ **עדכון `app.js` – Route חדש**

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
  'teacher-guide': () => renderTeacherGuide(), // ✅ חדש
  'comparison-tables': () => renderComparisonTables(), // ✅ חדש
};

// פונקציה חדשה:
function renderTeacherGuide() {
  const content = `
    <div class="teacher-guide-page">
      <h1>📚 מדריך למורה</h1>
      <div class="sidebar">
        <ul>
          <li><a href="#section-1">1. חזון ומטרות</a></li>
          <li><a href="#section-2">2. מודל הפיגום</a></li>
          <!-- ... -->
        </ul>
      </div>
      <div class="main-content">
        <!-- תוכן מ-teacher-guide-complete.md -->
      </div>
    </div>
  `;
  document.getElementById('app').innerHTML = content;
}

function renderComparisonTables() {
  const content = `
    <div class="comparison-tables-page">
      <h1>🔄 טבלאות השוואה</h1>
      <!-- 7 טבלאות מ-comparison-tables-content.md -->
    </div>
  `;
  document.getElementById('app').innerHTML = content;
}
```

---

### 7️⃣ **עדכון תפריט ראשי** (Navigation)

```html
<!-- index.html או app.js -->
<nav class="main-nav">
  <ul>
    <li><a href="#home">🏠 בית</a></li>
    <li><a href="#questions">📝 שאלות</a></li>
    <li><a href="#focus">🎯 מיקוד</a></li>
    <li><a href="#tips">💡 טיפים</a></li>
    <li><a href="#comparison-tables">🔄 טבלאות השוואה</a></li> <!-- ✅ חדש -->
    <li><a href="#teacher-guide">📚 מדריך למורה</a></li> <!-- ✅ חדש -->
    <li><a href="#dashboard">📊 לוח מחוונים</a></li>
  </ul>
</nav>
```

---

## ✅ סיכום משימות (Checklist למעצב/מפתח)

### **למעצב UI/UX:**

- [ ] עדכן `styles.css` עם צבעים חדשים (חלק 5️⃣)
- [ ] עצב דף `/teacher-guide` (חלק 2️⃣)
- [ ] עצב רכיב טבלאות השוואה (חלק 3️⃣)
- [ ] עצב דפי מושג עם 7 סעיפים (חלק 4️⃣)
- [ ] הוסף כפתור A-/A/A+ (הגדלת טקסט)
- [ ] בדוק נגישות WCAG 2.1 AA
- [ ] צור Wireframes לדפים החדשים (אופציונלי)

### **למפתח (Claude):**

- [ ] המר 5 קבצי MD ליחידה 2 ל-JSON
- [ ] עדכן `data.js` עם תוכן מלא ליחידה 2
- [ ] צור `mikud-data-updated.js` (מבנה חלק 4️⃣)
- [ ] צור route `#teacher-guide` ב-`app.js`
- [ ] צור route `#comparison-tables` ב-`app.js`
- [ ] עדכן תפריט ראשי (חלק 7️⃣)
- [ ] הרץ QA על 5 המושגים החדשים
- [ ] בדוק קישורים פנימיים (relatedConcepts)
- [ ] Deploy ל-Cloudflare Pages

---

## 📞 תיאום נוסף

**שאלות למעצב/מפתח:**

1. **האם יש צורך ב-Wireframes נוספים?** (לדפים החדשים)
2. **האם לשלב את הטבלאות כרכיב נפרד** או בתוך דפי מושג?
3. **האם יש העדפה לספריית CSS** (Tailwind? Bootstrap? Custom?)
4. **מתי Deploy הבא?** (כדי לתאם מועד מסירה)

---

**📅 עודכן:** 10 במרץ 2026, 17:00  
**✍️ נכתב על ידי:** יועץ ASD + מומחה תוכן פדגוגי  
**📧 צור קשר:** דרך מערכת הפרויקט

---

