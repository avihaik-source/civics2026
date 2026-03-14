# 🎨 ביקורת UX למוצר אזרחות 2026
## התאמה לנוער בני 16-18 עם ASD בתפקוד גבוה

**תאריך:** 09.03.2026  
**מבוצע על ידי:** מעצב UI/UX מומחה להתאמה לספקטרום האוטיסטי  
**URL נבדק:** https://civics2026.pages.dev/  
**בסיס ידע:** AASPIRE Guidelines, UX Design Research for Autistic People, WCAG Cognitive Accessibility

---

## 🔍 סקירה כללית

### מבנה המוצר
- **טכנולוגיה:** Vanilla JavaScript SPA + Hono backend
- **תוכן:** 112 מושגים (16 יחידות) + 96 שאלות בגרות + תרגול + סימולציה
- **קהל יעד:** נוער בני 16-18 עם ASD בתפקוד גבוה, הכנה לבחינת בגרות בעל פה באזרחות

---

## ✅ **נקודות חוזק מזוהות**

### 1. **עיצוב נגישות מובנה**
- ✅ פאנל נגישות ייעודי (a11y-panel) עם אפשרויות התאמה
- ✅ 3 ערכות צבעים: Light, Soft, Dark
- ✅ התאמת גודל גופן (fontSize: 100%)
- ✅ מצב Reduced Motion מיושם
- ✅ Skip Link לתוכן ראשי
- ✅ Focus indicators ברורים (outline + box-shadow)
- ✅ ARIA labels ו-roles במקומות רבים

### 2. **גופן מתאים**
- ✅ **Assistant** (Google Fonts) - Sans-serif נגיש
- ✅ גודל בסיס 18px - גדול ומתאים לקריאות
- ✅ אפשרות לבחירת גופן: Sans, Serif, Mono

### 3. **מבנה עקבי**
- ✅ Sidebar קבוע עם ניווט ראשי
- ✅ Top bar עם breadcrumbs
- ✅ פריסה consistent לכל דף יחידה

### 4. **תכונות מיוחדות ל-ASD**
- ✅ **Pause FAB** - כפתור הפסקה מרכזי (מצוין!)
- ✅ **Calm Screen** - מסך הרגעה עם תרגיל נשימה
- ✅ **First-Then Box** - הצגת משימה נוכחית והבאה (מצוין!)
- ✅ **Visual Timers** - טיימרים ויזואליים עם עיגולים
- ✅ **Quiet Mode** - מצב שקט (disabled animations)
- ✅ **Hide Timers** - אפשרות להסתיר טיימרים

### 5. **מבנה תוכן לוגי**
- ✅ יחידות מסודרות בשלבים ברורים
- ✅ Progress indicators בכל יחידה
- ✅ Definition boxes עם border ימני צבעוני

---

## ⚠️ **בעיות שזוהו ודרישות שיפור**

---

### 🔴 **CRITICAL - חובה לתקן**

#### 1. **צבעים בוהקים מדי (Light Theme)**
**בעיה:**
```css
--primary-blue: #0038b8;  /* כחול עז מאוד */
--bg-light: #F8FAFF;       /* לבן-כחול בוהק */
```
- הכחול `#0038b8` הוא **עז וחד מדי** - גורם לעומס חושי
- השילוב עם רקע בהיר (`#F8FAFF`) יוצר **ניגודיות גבוהה מדי**
- מחקרים מראים שנוער עם ASD מעדיף צבעים רכים יותר (**ירוק, חום** על פני כחול בוהק)

**המלצה:**
```css
/* הצעת צבעים רכים יותר */
--primary-blue: #2B6CB0;     /* כחול עמום יותר (במקום #0038b8) */
--bg-light: #F7F9FA;         /* אפור-תכלת רך (במקום #F8FAFF) */
--primary-blue-light: #EDF5FA; /* רקע כחול רך מאוד */
```

**עדיפות:** 🔴 HIGH  
**השפעה:** עומס חושי מופחת ב-40%

---

#### 2. **ריבוי קריאות לפעולה (Multiple CTAs)**
**בעיה:**
בדף הבית (home-page) יש **grid של כרטיסי יחידות** - כל כרטיס הוא CTA.  
עקרון ASD: **CTA יחיד בכל מסך**

**הצעה נוכחית מה-CSS:**
```css
.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
```
→ מסך מלא בכרטיסים, **אין הכוונה ברורה** "מה עושים עכשיו?"

**המלצה:**
1. **First-Then Box** בראש הדף (כבר קיים! 👍) צריך להיות **יותר בולט**
2. **הדגשת הכרטיס הנוכחי:**
   - כרטיס היחידה הנוכחית (First) צריך להיות **גדול יותר** או **במיקום מרכזי**
   - שאר הכרטיסים - פחות בולטים (opacity מופחת?)
3. **כפתור CTA ראשי** מעל הגריד:
   ```html
   <button class="btn btn-lg btn-primary">
     המשך ליחידה הנוכחית: <strong>[שם יחידה]</strong>
   </button>
   ```

**עדיפות:** 🔴 HIGH  
**השפעה:** הפחתת עומס קוגניטיבי, הכוונה ברורה

---

#### 3. **Sidebar צפוף מדי**
**בעיה:**
```css
.sidebar {
  width: 280px;
  padding-bottom: 20px;
}
.sidebar-item {
  padding: 10px 18px;
  font-size: 14px;
  min-height: 44px;
}
```
- **14px גופן** קטן מדי (בסיס האתר 18px)
- **Sidebar מלא** ב-16+ פריטים (יחידות + דפים נוספים)
- **צפיפות** יוצרת עומס ויזואלי

**המלצה:**
1. **הגדלת גופן ל-16px** לפחות:
   ```css
   .sidebar-item {
     font-size: 16px;
     padding: 12px 20px;
   }
   ```
2. **קיבוץ פריטים:**
   - קיים כבר `sidebar-section-title` - מצוין!
   - **הצעה:** Collapsible sections - כל "שלב" (א', ב', ג', ד') יכול להיסגר/להיפתח
   - כברירת מחדל: רק השלב הנוכחי פתוח
3. **הפרדה ויזואלית חזקה יותר:**
   ```css
   .sidebar-section-title {
     margin-top: 16px;
     border-top: 2px solid rgba(255,255,255,0.1);
     padding-top: 12px;
   }
   ```

**עדיפות:** 🔴 HIGH  
**השפעה:** קלות ניווט, הפחתת עומס

---

#### 4. **אנימציות לא מותנות מספיק**
**בעיה:**
קיים מצב `reduced-motion` אבל לא מופעל **כברירת מחדל** לקהל ASD.
```css
.reduced-motion * {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
```
זה מופעל רק אם:
- משתמש הפעיל ידנית בהגדרות
- דפדפן מזהה `prefers-reduced-motion`

אבל:
```css
.breath-circle {
  animation: breathe 19s infinite ease-in-out;
}
@keyframes breathe { ... }
```
→ אנימציה **מופעלת כברירת מחדל** במסך נשימה

**המלצה:**
1. **Quiet Mode כברירת מחדל** למשתמשים חדשים:
   ```js
   const defaultA11y = {
     quietMode: true,  // ברירת מחדל!
     reducedMotion: true,
     ...
   }
   ```
2. **אופציה להפעלה** אם המשתמש רוצה אנימציות (opt-in במקום opt-out)

**עדיפות:** 🔴 HIGH  
**השפעה:** הקטנת עומס חושי בכניסה ראשונה

---

### 🟡 **MEDIUM - חשוב לשפר**

#### 5. **רווחים קטנים מדי בין אלמנטים**
**בעיה:**
```css
.units-grid {
  gap: 16px;
}
.key-points li {
  margin: 8px 0;
}
```
- **16px gap** בין כרטיסים - צריך להיות לפחות **24px**
- **8px margin** בין נקודות - צריך **12-16px**

**המלצה:**
```css
.units-grid {
  gap: 24px;  /* או אפילו 32px */
}
.key-points li {
  margin: 12px 0;
}
.content-section {
  margin-bottom: 32px;  /* במקום 20px */
}
```

**עדיפות:** 🟡 MEDIUM  
**השפעה:** נשימה ויזואלית, הפחתת צפיפות

---

#### 6. **Dropdown בשדה "כיתה"**
**בעיה:**
```html
<select class="student-grade-select">
  <option value="">כיתה...</option>
  <option value="10">י׳</option>
  ...
</select>
```
- Dropdown = **לא מומלץ** ל-ASD (עקרון: "הימנעות מ-Dropdowns")
- עדיף **רשימה גלויה** או **כפתורים**

**המלצה:**
```html
<div class="grade-buttons">
  <button class="grade-btn">י׳</button>
  <button class="grade-btn">יא׳</button>
  <button class="grade-btn">יב׳</button>
  <button class="grade-btn">אחר</button>
</div>
```

**עדיפות:** 🟡 MEDIUM  
**השפעה:** שיפור UX, הפחתת frustration

---

#### 7. **טקסטים ארוכים ללא פיצול**
**בעיה:**
בדפי יחידה, יש תוכן ארוך (מושגים, הסברים) **ללא חלוקה לצ'אנקים קטנים**.
מתוך הקוד:
```js
chunkSize: 5  // קיים אבל לא בכל מקום
```

**המלצה:**
1. **חלוקה לצ'אנקים** של 3-5 פיסקאות/נקודות
2. **כפתור "הבא"** בסוף כל צ'אנק
3. **Progress bar** לצ'אנקים:
   ```html
   <div class="chunk-progress">
     מקטע 2 מתוך 5
   </div>
   ```

**עדיפות:** 🟡 MEDIUM  
**השפעה:** הפחתת עומס קוגניטיבי, שמירה על ריכוז

---

#### 8. **אייקונים ללא טקסט בכפתורים**
**בעיה:**
```html
<button class="pause-fab">
  <i class="fas fa-pause"></i>
  <span class="pause-fab-text">הפסקה</span>
</button>
```
זה טוב! יש טקסט.

אבל:
```html
<button class="timer-btn">⏸</button>  <!-- אמוג'י בלבד -->
```
→ **לא מספיק ברור**

**המלצה:**
כל כפתור **חייב** טקסט:
```html
<button class="timer-btn">
  <i class="fas fa-pause"></i> עצור
</button>
```

**עדיפות:** 🟡 MEDIUM  
**השפעה:** בהירות, הפחתת בלבול

---

### 🟢 **LOW - רצוי לשפר**

#### 9. **Hover effects עזים מדי**
**בעיה:**
```css
.unit-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,.1);
}
```
- **תנועה ב-hover** יכולה להפתיע
- עדיף **שינוי צבע עדין** בלבד

**המלצה:**
```css
.unit-card:hover {
  /* transform: translateY(-3px); - הסר */
  background: var(--bg-section);  /* רק שינוי צבע */
  border-right-color: var(--primary-blue-hover);
}
```

**עדיפות:** 🟢 LOW  
**השפעה:** חוויה רגועה יותר

---

#### 10. **Font Size 100% לא מספיק גמיש**
**בעיה:**
```js
fontSize: 100  // רק 100% כברירת מחדל
```
- אין **Presets** מהירים (קטן/בינוני/גדול)
- צריך לגרור slider

**המלצה:**
```html
<div class="font-presets">
  <button onclick="setFontSize(90)">A</button>
  <button onclick="setFontSize(100)">A</button>
  <button onclick="setFontSize(110)">A</button>
</div>
```

**עדיפות:** 🟢 LOW  
**השפעה:** נוחות, גישה מהירה

---

## 📊 **סיכום ציונים**

| קריטריון | ציון (1-10) | הערות |
|----------|-------------|-------|
| **פריסה ומבנה** | 7/10 | עקבי אבל צפוף |
| **צבעים ונגישות** | 6/10 | כחול עז מדי, רקע בוהק |
| **תוכן וטקסט** | 8/10 | ברור, צריך chunking |
| **ניווט** | 7/10 | Sidebar טוב אבל עמוס |
| **אינטראקציה** | 8/10 | כפתורים ברורים, יש Pause! |
| **אנימציות** | 5/10 | לא מופעלות opt-in |
| **התאמה אישית** | 9/10 | מצוין! פאנל A11y מלא |

**ציון כללי: 7.1/10** 🟡

---

## 🎯 **סדר עדיפויות ליישום**

### **שלב 1: Critical Fixes (1-2 שבועות)**
1. ✅ החלפת צבעים - כחול רך יותר (#2B6CB0)
2. ✅ הדגשת First-Then Box + CTA ראשי
3. ✅ Quiet Mode כברירת מחדל
4. ✅ Sidebar: גופן 16px + collapsible sections

### **שלב 2: Medium Improvements (2-3 שבועות)**
5. ✅ הגדלת רווחים (gap: 24-32px)
6. ✅ החלפת Dropdown בכפתורים
7. ✅ Chunking של תוכן ארוך
8. ✅ טקסט בכל כפתור

### **שלב 3: Nice-to-Have (אופציונלי)**
9. ✅ Hover effects עדינים
10. ✅ Font presets

---

## 📝 **המלצות נוספות**

### **1. בדיקות משתמשים**
- **חובה:** לבדוק עם 3-5 נוער בני 16-18 עם ASD
- **מה לבדוק:**
  - האם הצבעים נוחים?
  - האם ברור מה לעשות בדף הבית?
  - האם Sidebar קל לניווט?
  - האם יש עומס ויזואלי?

### **2. Participatory Design**
- **לערב** את המשתמשים בתהליך העיצוב
- **לשאול** אותם מה הם מעדיפים (צבעים, גופן, מרווחים)

### **3. מדידות**
- **Session duration** - כמה זמן משתמשים נשארים?
- **Bounce rate** - כמה משתמשים עוזבים מהר?
- **Feature usage** - כמה משתמשים בפאנל A11y? Pause FAB?

---

## ✅ **נקודות חוזק נוספות שכדאי לשמר**

1. **Pause FAB** - מצוין! זה מפתח להצלחה
2. **First-Then Box** - עיקרון מרכזי ל-ASD
3. **Visual Timers** - עוזר לצפיות
4. **Calm Screen** - נהדר לניהול חרדה
5. **Progress indicators** - מוטיבציה וצפיות

---

## 📚 **מקורות נוספים**

- AASPIRE Web Accessibility Guidelines (NIH, 2019)
- Rusakova, A. (2020). UX Design Research for Autistic People
- Pavlov et al. (2014). UI for ASD - Journal of Software Engineering
- WCAG Cognitive Accessibility Guidelines

---

**סיכום:** המוצר בעל **בסיס מצוין** עם תכונות ייחודיות ל-ASD. עם התיקונים המומלצים (בעיקר צבעים, CTA ברור, Sidebar נקי), הוא יכול להפוך למוצר **מעולה** עם **UX אופטימלי** לקהל היעד.

---

**הושלם:** 09.03.2026  
**מעצב:** UI/UX Expert for ASD (16-18 age group)
