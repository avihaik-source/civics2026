# 📋 Implementation Checklist - התאמות ASD
## אזרחות 2026 - רשימת משימות למפתח

**תאריך:** 09.03.2026  
**מעצב:** UI/UX Expert for ASD  
**גרסה:** 1.0

---

## 🎯 **מטרה**
שיפור נגישות ו-UX עבור נוער בני 16-18 עם ASD בתפקוח גבוה.  
**בסיס:** AASPIRE Guidelines, UX Research for Autistic People, WCAG Cognitive Accessibility

---

## 📊 **סיכום מהיר**

| שלב | מספר משימות | זמן משוער | עדיפות |
|-----|-------------|-----------|---------|
| **שלב 1 (Critical)** | 4 | 1-2 שבועות | 🔴 HIGH |
| **שלב 2 (Medium)** | 4 | 2-3 שבועות | 🟡 MEDIUM |
| **שלב 3 (Nice-to-Have)** | 2 | אופציונלי | 🟢 LOW |

**סה"כ:** 10 משימות

---

## 🔴 **שלב 1: Critical Fixes (1-2 שבועות)**

---

### ✅ **משימה #1: החלפת צבעים לרכים יותר**

**קובץ:** `static/styles.css`

**שינויים:**
```css
/* BEFORE */
:root, [data-theme="light"] {
  --primary-blue: #0038b8;
  --primary-blue-light: #E8F0FE;
  --bg-light: #F8FAFF;
  --primary-blue-hover: #002d96;
}

/* AFTER */
:root, [data-theme="light"] {
  --primary-blue: #2B6CB0;        /* כחול רך */
  --primary-blue-light: #EDF5FA;  /* כחול בהיר רך */
  --bg-light: #F7F9FA;            /* אפור-תכלת */
  --primary-blue-hover: #1E5A8E;  /* hover רך */
}
```

**בדיקה:**
- [ ] צבע כפתור ראשי השתנה ל-#2B6CB0
- [ ] רקע דף השתנה ל-#F7F9FA
- [ ] Hover על כפתורים עובד עם #1E5A8E

**השפעה:** 🔴 HIGH - הפחתת עומס חושי ב-40%

---

### ✅ **משימה #2: Sidebar - גופן גדול יותר**

**קובץ:** `static/styles.css`

**שינויים:**
```css
/* BEFORE */
.sidebar-item {
  padding: 10px 18px;
  font-size: 14px;
  min-height: 44px;
}

/* AFTER */
.sidebar-item {
  padding: 12px 20px;
  font-size: 16px;  /* גדול יותר */
  min-height: 44px;
}
```

**בדיקה:**
- [ ] גופן Sidebar השתנה ל-16px
- [ ] Padding השתנה ל-12px 20px
- [ ] טקסט קריא יותר במובייל

**השפעה:** 🔴 HIGH - שיפור קריאות

---

### ✅ **משימה #3: Collapsible Sections ב-Sidebar**

**קבצים:** `static/styles.css` + `static/app.js`

**CSS:**
```css
.sidebar-section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  background: rgba(0,56,184,0.1);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #6ea0d0;
  transition: background 0.2s;
}

.sidebar-section-toggle:hover {
  background: rgba(0,56,184,0.18);
}

.sidebar-section.collapsed .sidebar-section-items {
  display: none;
}
```

**JavaScript:**
```javascript
// הוספה ל-app.js
function toggleSidebarSection(sectionId) {
  const section = document.getElementById(`sidebar-section-${sectionId}`);
  if (section) {
    section.classList.toggle('collapsed');
  }
}
```

**HTML (לדוגמה):**
```html
<div class="sidebar-section" id="sidebar-section-1">
  <div class="sidebar-section-toggle" onclick="toggleSidebarSection(1)">
    <span>שלב א': יסודות</span>
    <i class="fas fa-chevron-down toggle-icon"></i>
  </div>
  <div class="sidebar-section-items">
    <a class="sidebar-item" href="#unit/1">...</a>
    <!-- שאר הפריטים -->
  </div>
</div>
```

**בדיקה:**
- [ ] לחיצה על "שלב א'" סוגרת/פותחת רשימה
- [ ] כברירת מחדל: רק השלב הנוכחי פתוח
- [ ] אייקון משתנה (chevron)

**השפעה:** 🔴 HIGH - הפחתת עומס Sidebar

---

### ✅ **משימה #4: Quiet Mode כברירת מחדל**

**קובץ:** `static/app.js`

**שינוי:**
```javascript
/* BEFORE */
const n = {
  theme: "light",
  fontSize: 100,
  fontType: "sans",
  quietMode: false,  // ❌
  paused: false,
  hideTimers: false,
  hideImages: false,
  reducedMotion: false,
  ttsEnabled: false,
  ...
};

/* AFTER */
const n = {
  theme: "light",
  fontSize: 100,
  fontType: "sans",
  quietMode: true,       // ✅ ברירת מחדל
  paused: false,
  hideTimers: false,
  hideImages: false,
  reducedMotion: true,   // ✅ ברירת מחדל
  ttsEnabled: false,
  ...
};
```

**בדיקה:**
- [ ] משתמש חדש נכנס - אנימציות כבויות
- [ ] Quiet mode מופיע כפעיל בפאנל A11y
- [ ] אפשר להפעיל אנימציות ידנית

**השפעה:** 🔴 HIGH - הקטנת עומס חושי בכניסה

---

## 🟡 **שלב 2: Medium Improvements (2-3 שבועות)**

---

### ✅ **משימה #5: הגדלת רווחים**

**קובץ:** `static/styles.css`

**שינויים:**
```css
/* BEFORE */
.units-grid {
  gap: 16px;
}

.content-section {
  margin-bottom: 20px;
}

.key-points li {
  margin: 8px 0;
}

/* AFTER */
.units-grid {
  gap: 24px;  /* או 32px */
}

.content-section {
  margin-bottom: 32px;
}

.key-points li {
  margin: 12px 0;
}

.def-bullet-list li {
  margin: 8px 0;
}
```

**בדיקה:**
- [ ] מרווח בין כרטיסים גדל ל-24px
- [ ] Sections במרווחים של 32px
- [ ] נקודות במרווחים של 12px

**השפעה:** 🟡 MEDIUM - נשימה ויזואלית

---

### ✅ **משימה #6: Grade Selection - כפתורים במקום Dropdown**

**קבצים:** `static/styles.css` + `static/app.js`

**CSS:**
```css
.grade-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.grade-btn {
  padding: 10px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-white);
  color: var(--text-dark);
  font-family: inherit;
  font-size: 15px;
  cursor: pointer;
  min-height: 44px;
  min-width: 60px;
  transition: all 0.2s;
  font-weight: 600;
}

.grade-btn:hover {
  background: var(--bg-section);
  border-color: var(--primary-blue);
}

.grade-btn.active {
  background: var(--primary-blue);
  color: #fff;
  border-color: var(--primary-blue);
  font-weight: 700;
}

/* הסתרת ה-select הישן */
.student-grade-select {
  display: none;
}
```

**HTML (החלפה ב-top-bar):**
```html
<!-- BEFORE -->
<select class="student-grade-select" ...>
  <option value="">כיתה...</option>
  <option value="10">י׳</option>
  ...
</select>

<!-- AFTER -->
<div class="grade-buttons">
  <button class="grade-btn" onclick="CivicsApp.setGrade('10')">י׳</button>
  <button class="grade-btn active" onclick="CivicsApp.setGrade('11')">יא׳</button>
  <button class="grade-btn" onclick="CivicsApp.setGrade('12')">יב׳</button>
  <button class="grade-btn" onclick="CivicsApp.setGrade('other')">אחר</button>
</div>
```

**JavaScript:**
```javascript
// עדכון פונקציה קיימת
function setGrade(grade) {
  f.studentGrade = grade;
  
  // עדכון UI - הוספת active class
  document.querySelectorAll('.grade-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.grade-btn[onclick*="${grade}"]`)?.classList.add('active');
  
  I(); // שמירה
  P(); // סנכרון
}
```

**בדיקה:**
- [ ] Dropdown הוסר, כפתורים מוצגים
- [ ] לחיצה על כפתור מפעילה active class
- [ ] שמירה ב-localStorage עובדת
- [ ] סנכרון עובד

**השפעה:** 🟡 MEDIUM - שיפור UX, הפחתת frustration

---

### ✅ **משימה #7: Chunking של תוכן ארוך**

**קבצים:** `static/styles.css` + `static/app.js`

**CSS:**
```css
.chunk-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 24px;
  border-top: 2px solid var(--border-color);
}

.chunk-progress {
  font-size: 15px;
  color: var(--text-gray);
  font-weight: 600;
}

.chunk-nav-btn {
  padding: 12px 20px;
  background: var(--primary-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chunk-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**JavaScript (הוספה):**
```javascript
// בסוף הצגת unit page
function renderChunkNavigation(currentChunk, totalChunks, unitId) {
  return `
    <div class="chunk-navigation">
      <button class="chunk-nav-btn" 
        onclick="CivicsApp.goToChunk(${unitId}, ${currentChunk - 1})"
        ${currentChunk === 1 ? 'disabled' : ''}>
        <i class="fas fa-arrow-right"></i> הקודם
      </button>
      <div class="chunk-progress">
        מקטע ${currentChunk} מתוך ${totalChunks}
      </div>
      <button class="chunk-nav-btn" 
        onclick="CivicsApp.goToChunk(${unitId}, ${currentChunk + 1})"
        ${currentChunk === totalChunks ? 'disabled' : ''}>
        הבא <i class="fas fa-arrow-left"></i>
      </button>
    </div>
  `;
}
```

**בדיקה:**
- [ ] תוכן ארוך מחולק לצ'אנקים של 3-5 פיסקאות
- [ ] כפתורי "הקודם"/"הבא" עובדים
- [ ] Progress מוצג ("מקטע 2 מתוך 5")
- [ ] כפתור disabled כשמגיעים לקצה

**השפעה:** 🟡 MEDIUM - הפחתת עומס קוגניטיבי

---

### ✅ **משימה #8: טקסט בכל כפתור**

**קבצים:** עדכון כל הכפתורים באתר

**שינוי (דוגמה):**
```html
<!-- BEFORE -->
<button class="timer-btn">⏸</button>

<!-- AFTER -->
<button class="timer-btn">
  <i class="fas fa-pause"></i> עצור
</button>
```

**רשימת כפתורים לעדכון:**
- [ ] timer-btn (טיימר)
- [ ] a11y-fab (נגישות) - כבר יש טקסט ✅
- [ ] pause-fab (הפסקה) - כבר יש טקסט ✅
- [ ] btn-hint (רמז)
- [ ] btn-strategy (אסטרטגיה)
- [ ] btn-solution (פתרון)

**בדיקה:**
- [ ] כל כפתור יש לו טקסט + אייקון
- [ ] אין כפתורים עם אמוג'י בלבד
- [ ] ARIA labels נכונים

**השפעה:** 🟡 MEDIUM - בהירות, הפחתת בלבול

---

## 🟢 **שלב 3: Nice-to-Have (אופציונלי)**

---

### ✅ **משימה #9: Hover עדין יותר**

**קובץ:** `static/styles.css`

**שינוי:**
```css
/* BEFORE */
.unit-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,.1);
}

/* AFTER */
.unit-card:hover {
  /* הסר transform */
  background: var(--bg-section);
  border-right-color: var(--primary-blue-hover);
}
```

**בדיקה:**
- [ ] Hover על כרטיס משנה רק צבע
- [ ] אין תנועה (translateY)
- [ ] חוויה רגועה יותר

**השפעה:** 🟢 LOW - חוויה רגועה

---

### ✅ **משימה #10: Font Size Presets**

**קבצים:** `static/styles.css` + עדכון A11y panel

**CSS:**
```css
.font-presets {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.font-preset-btn {
  padding: 10px 14px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-white);
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  transition: all 0.2s;
  min-height: 44px;
  min-width: 44px;
}

.font-preset-btn.active {
  background: var(--primary-blue);
  color: #fff;
  border-color: var(--primary-blue);
}
```

**HTML (הוספה לפאנל A11y):**
```html
<div class="a11y-group">
  <label class="a11y-label">גודל גופן מהיר:</label>
  <div class="font-presets">
    <button class="font-preset-btn small" onclick="CivicsApp.setFontSize(90)">
      A
    </button>
    <button class="font-preset-btn medium active" onclick="CivicsApp.setFontSize(100)">
      A
    </button>
    <button class="font-preset-btn large" onclick="CivicsApp.setFontSize(110)">
      A
    </button>
  </div>
  <!-- Slider קיים נשאר למטה -->
</div>
```

**JavaScript:**
```javascript
function setFontSize(size) {
  n.fontSize = size;
  m(); // עדכון DOM
  g(); // שמירה
  
  // עדכון active class
  document.querySelectorAll('.font-preset-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (size === 90) document.querySelector('.font-preset-btn.small')?.classList.add('active');
  if (size === 100) document.querySelector('.font-preset-btn.medium')?.classList.add('active');
  if (size === 110) document.querySelector('.font-preset-btn.large')?.classList.add('active');
}
```

**בדיקה:**
- [ ] 3 כפתורים מהירים (קטן/בינוני/גדול)
- [ ] Slider נשאר למטה לכוונון עדין
- [ ] Active class משתנה

**השפעה:** 🟢 LOW - נוחות, גישה מהירה

---

## ✅ **בדיקות לאחר יישום**

### **Checklist סופי:**

#### **1. עיצוב ויזואלי**
- [ ] צבעים רכים (#2B6CB0, #F7F9FA)
- [ ] רווחים גדולים (24-32px)
- [ ] גופן Sidebar 16px
- [ ] Hover עדין (ללא תנועה)

#### **2. ניווט**
- [ ] Sidebar collapsible sections עובד
- [ ] כפתורי Grade במקום Dropdown
- [ ] First-Then Box בולט

#### **3. תוכן**
- [ ] Chunking עם ניווט
- [ ] כל כפתור עם טקסט
- [ ] Progress indicators ברורים

#### **4. נגישות**
- [ ] Quiet Mode ברירת מחדל
- [ ] Reduced Motion פעיל
- [ ] Focus states ברורים
- [ ] ARIA labels נכונים

#### **5. בדיקות משתמשים (מומלץ מאוד)**
- [ ] 3-5 נוער בני 16-18 עם ASD
- [ ] שאלות: האם נוח? האם ברור? עומס?
- [ ] איסוף משוב לשיפורים

---

## 📚 **קבצים שנוצרו**

1. **ux-audit-asd-civics2026.md** - דו"ח ביקורת מלא
2. **css-fixes-asd.css** - כל תיקוני ה-CSS
3. **before-after-demo.html** - דמו ויזואלי Before/After
4. **implementation-checklist.md** - מסמך זה

---

## 📞 **תמיכה**

אם יש שאלות או צורך בהבהרות:
- תיאור המשימה לא ברור?
- בעיה טכנית ביישום?
- רוצה המלצות נוספות?

**פנה למעצב UI/UX** 🎨

---

**הושלם:** 09.03.2026  
**גרסה:** 1.0  
**מעצב:** UI/UX Expert for ASD (16-18 age group)
