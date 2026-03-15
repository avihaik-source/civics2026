# 🎙️ דרישות תכונה: הקלטה ושכתוב אוטומטי (STT)
## אזרחות 2026 - תוספת קריטית לדף תרגול

**תאריך:** 09.03.2026  
**נמען:** מפתח האפליקציה  
**עדיפות:** 🔴 **HIGH** - תכונה קריטית לקהל היעד  
**מקור:** בקשת משתמש + עקרונות ASD UX

---

## 🎯 **מטרה**

להוסיף אפשרות **הקלטת תשובה קולית** עם **המרה אוטומטית לטקסט** (STT) בדף התרגול.

**למה זה חשוב:**
1. ✅ נוער עם ASD מעדיפים **מענה בעל פה** (מדמה מבחן אמיתי)
2. ✅ הקלדה יכולה להיות **מאתגרת** או **מעיכבת**
3. ✅ שיפור **חוויית משתמש** ונגישות
4. ✅ תרגול **אותנטי** למבחן בגרות בעל פה

---

## 📊 **מה קיים עכשיו (תמונת מצב)**

### ✅ **תכונות קיימות:**
- **TTS (Text-to-Speech):** כפתור "🔊 הקרא" מקריא את השאלה
- **שדה הקלדה:** textarea עם מונה תווים (0/500)
- **כפתורים עזרה:** רמז, תשובה מלאה, שאלה הבאה

### ❌ **תכונות חסרות:**
- **כפתור הקלטה:** אין כפתור ייעודי להקלטה קולית
- **STT (Speech-to-Text):** אין המרת דיבור לטקסט
- **חווית הקלטה:** אין משוב חזותי/שמיעתי תוך כדי הקלטה

---

## 🎨 **עיצוב ממשק מוצע**

### **מיקום:** בדף תרגול, **מעל** או **ליד** שדה ההקלדה

```
┌──────────────────────────────────────────────┐
│ שאלה 3 מתוך 96 (3%)                         │
│                                              │
│ 📖 הציגו את עיקרי התוכן של חוק יסוד...     │
│ [🔊 הקרא] [איטי/רגיל/מהיר] [⏹️ עצור]      │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 📝 כתבו את תשובתכם:                        │
│                                              │
│ [ 🎙️ הקלטה קולית ]  [ ⌨️ הקלדה ]          │ ← כפתורי Toggle
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ [כאן מופיע שדה ההקלדה או כפתור הקלטה] │  │
│ │                                        │  │
│ │ • אם בחרו "הקלדה": textarea רגיל      │  │
│ │ • אם בחרו "הקלטה": כפתור מיקרופון גדול│  │
│ └────────────────────────────────────────┘  │
│                                              │
│ 0 / 500 תווים                                │
└──────────────────────────────────────────────┘

[רמז] [תשובה מלאה] [שאלה הבאה →]
```

---

## 🛠️ **מפרט טכני**

### **A. כפתור Toggle - בחירת אופן מענה**

**HTML:**
```html
<div class="answer-mode-toggle">
  <button class="mode-btn active" id="mode-typing" onclick="switchMode('typing')">
    <i class="fas fa-keyboard"></i> ⌨️ הקלדה
  </button>
  <button class="mode-btn" id="mode-recording" onclick="switchMode('recording')">
    <i class="fas fa-microphone"></i> 🎙️ הקלטה קולית
  </button>
</div>
```

**CSS:**
```css
.answer-mode-toggle {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: center;
}

.mode-btn {
  padding: 12px 24px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-white);
  color: var(--text-dark);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mode-btn:hover {
  background: var(--bg-section);
  border-color: var(--primary-blue);
}

.mode-btn.active {
  background: var(--primary-blue);
  color: #fff;
  border-color: var(--primary-blue);
}

.mode-btn i {
  font-size: 18px;
}
```

**JavaScript:**
```javascript
let currentAnswerMode = 'typing'; // ברירת מחדל: הקלדה

function switchMode(mode) {
  currentAnswerMode = mode;
  
  // עדכון UI
  document.getElementById('mode-typing').classList.toggle('active', mode === 'typing');
  document.getElementById('mode-recording').classList.toggle('active', mode === 'recording');
  
  // הצג/הסתר רכיבים
  document.getElementById('typing-area').style.display = mode === 'typing' ? 'block' : 'none';
  document.getElementById('recording-area').style.display = mode === 'recording' ? 'block' : 'none';
}
```

---

### **B. אזור הקלטה (Recording Area)**

**HTML:**
```html
<div id="recording-area" style="display:none;">
  <div class="recording-controls">
    <!-- מצב: לפני הקלטה -->
    <div id="recording-ready" class="recording-state">
      <button class="btn-record-start" onclick="startRecording()">
        <i class="fas fa-microphone"></i>
        🎙️ לחץ להתחלת הקלטה
      </button>
      <p class="recording-hint">לחץ על הכפתור והתחל לדבר</p>
    </div>

    <!-- מצב: מקליט -->
    <div id="recording-active" class="recording-state" style="display:none;">
      <div class="recording-indicator">
        <div class="pulse-circle"></div>
        <span class="recording-text">🔴 מקליט...</span>
        <span class="recording-timer">00:00</span>
      </div>
      <button class="btn-record-stop" onclick="stopRecording()">
        <i class="fas fa-stop"></i>
        ⏹️ עצור הקלטה
      </button>
    </div>

    <!-- מצב: מעבד -->
    <div id="recording-processing" class="recording-state" style="display:none;">
      <div class="processing-animation">
        <i class="fas fa-spinner fa-spin"></i>
        ⏳ מעבד הקלטה...
      </div>
    </div>

    <!-- מצב: הושלם -->
    <div id="recording-done" class="recording-state" style="display:none;">
      <div class="recording-success">
        <i class="fas fa-check-circle"></i>
        ✅ ההקלטה הושלמה!
      </div>
      <div class="transcribed-text-preview">
        <p id="transcribed-text"></p>
      </div>
      <div class="recording-actions">
        <button class="btn-record-play" onclick="playRecording()">
          <i class="fas fa-play"></i> השמע
        </button>
        <button class="btn-record-redo" onclick="redoRecording()">
          <i class="fas fa-redo"></i> הקלט שוב
        </button>
        <button class="btn-record-accept" onclick="acceptRecording()">
          <i class="fas fa-check"></i> אישור
        </button>
      </div>
    </div>
  </div>
</div>
```

**CSS:**
```css
.recording-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: var(--bg-section);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
  min-height: 200px;
}

/* כפתור התחלת הקלטה */
.btn-record-start {
  padding: 20px 40px;
  background: #E53E3E;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
  transition: all 0.2s;
}

.btn-record-start:hover {
  background: #C53030;
  transform: scale(1.05);
}

.btn-record-start i {
  font-size: 24px;
}

/* אינדיקטור הקלטה */
.recording-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.pulse-circle {
  width: 80px;
  height: 80px;
  background: #E53E3E;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.recording-text {
  font-size: 18px;
  font-weight: 700;
  color: #E53E3E;
}

.recording-timer {
  font-size: 24px;
  font-weight: 700;
  font-family: monospace;
  color: var(--text-dark);
}

/* כפתור עצירה */
.btn-record-stop {
  padding: 16px 32px;
  background: #2D3748;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
}

/* אנימציית עיבוד */
.processing-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  color: var(--text-gray);
}

.processing-animation i {
  font-size: 48px;
  color: var(--primary-blue);
}

/* הצלחה */
.recording-success {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #2F855A;
  margin-bottom: 16px;
}

.recording-success i {
  font-size: 32px;
}

/* תצוגת הטקסט המתועד */
.transcribed-text-preview {
  background: var(--bg-white);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  max-width: 500px;
  margin-bottom: 16px;
  max-height: 150px;
  overflow-y: auto;
}

.transcribed-text-preview p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-dark);
}

/* כפתורי פעולה */
.recording-actions {
  display: flex;
  gap: 12px;
}

.recording-actions button {
  padding: 12px 20px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-white);
  color: var(--text-dark);
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.recording-actions button:hover {
  background: var(--bg-section);
  border-color: var(--primary-blue);
}

.btn-record-accept {
  background: var(--primary-blue);
  color: #fff;
  border-color: var(--primary-blue);
}

.btn-record-accept:hover {
  background: var(--primary-blue-hover);
}
```

---

### **C. JavaScript - לוגיקת הקלטה + STT**

**אופציה 1: Web Speech API (מובנה, חינמי)**

```javascript
let mediaRecorder;
let audioChunks = [];
let recordingStartTime;
let timerInterval;
let recognition; // Speech Recognition

// הגדרת Speech Recognition
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('הדפדפן שלך לא תומך בזיהוי קולי. נסה Chrome או Edge.');
    return null;
  }
  
  recognition = new SpeechRecognition();
  recognition.lang = 'he-IL'; // עברית
  recognition.continuous = true; // המשך הקלטה
  recognition.interimResults = false; // תוצאות ביניים
  
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ');
    
    document.getElementById('transcribed-text').textContent = transcript;
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    alert('שגיאה בזיהוי קולי: ' + event.error);
  };
  
  return recognition;
}

// התחלת הקלטה
async function startRecording() {
  try {
    // בקש הרשאת מיקרופון
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // הכן MediaRecorder (להקלטת הקובץ)
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      // יצירת Blob מההקלטה
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // שמירה להשמעה מאוחר יותר
      window.currentRecordingUrl = audioUrl;
      
      // הצג מצב "הושלם"
      showRecordingState('done');
    };
    
    // התחל הקלטה
    mediaRecorder.start();
    
    // התחל Speech Recognition
    if (!recognition) recognition = initSpeechRecognition();
    if (recognition) recognition.start();
    
    // עדכן UI
    showRecordingState('active');
    
    // התחל טיימר
    recordingStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
    
  } catch (error) {
    console.error('Error starting recording:', error);
    alert('לא ניתן לגשת למיקרופון. אנא אפשר הרשאת מיקרופון בדפדפן.');
  }
}

// עצירת הקלטה
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  
  if (recognition) {
    recognition.stop();
  }
  
  clearInterval(timerInterval);
  
  // הצג מצב "מעבד"
  showRecordingState('processing');
  
  // סימולציה של עיבוד (במציאות - המתן ל-onresult)
  setTimeout(() => {
    showRecordingState('done');
  }, 1500);
}

// עדכון טיימר
function updateTimer() {
  const elapsed = Date.now() - recordingStartTime;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  document.querySelector('.recording-timer').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// שינוי מצב הקלטה
function showRecordingState(state) {
  // הסתר הכל
  document.querySelectorAll('.recording-state').forEach(el => {
    el.style.display = 'none';
  });
  
  // הצג מצב נוכחי
  switch(state) {
    case 'ready':
      document.getElementById('recording-ready').style.display = 'block';
      break;
    case 'active':
      document.getElementById('recording-active').style.display = 'flex';
      break;
    case 'processing':
      document.getElementById('recording-processing').style.display = 'flex';
      break;
    case 'done':
      document.getElementById('recording-done').style.display = 'flex';
      break;
  }
}

// השמעת הקלטה
function playRecording() {
  if (window.currentRecordingUrl) {
    const audio = new Audio(window.currentRecordingUrl);
    audio.play();
  }
}

// הקלטה מחדש
function redoRecording() {
  showRecordingState('ready');
  document.getElementById('transcribed-text').textContent = '';
}

// אישור הקלטה
function acceptRecording() {
  const transcribedText = document.getElementById('transcribed-text').textContent;
  
  // העבר לשדה הטקסט הראשי
  document.getElementById('answer-textarea').value = transcribedText;
  
  // חזור למצב הקלדה
  switchMode('typing');
  
  // הצג הודעת אישור
  alert('הטקסט הועבר לשדה התשובה! ניתן לערוך אותו.');
}
```

---

**אופציה 2: Google Cloud Speech-to-Text (מתקדם, בתשלום)**

```javascript
// דוגמה לשימוש ב-Google Cloud Speech-to-Text API
async function transcribeAudioGoogle(audioBlob) {
  // המר Blob ל-Base64
  const reader = new FileReader();
  reader.readAsDataURL(audioBlob);
  
  reader.onloadend = async () => {
    const base64Audio = reader.result.split(',')[1];
    
    // שלח ל-Google Cloud API
    const response = await fetch('https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'he-IL',
        },
        audio: {
          content: base64Audio
        }
      })
    });
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const transcript = data.results[0].alternatives[0].transcript;
      document.getElementById('transcribed-text').textContent = transcript;
    }
  };
}
```

---

## ✅ **בדיקות (Testing Checklist)**

### **פונקציונליות:**
- [ ] כפתור Toggle עובד (הקלדה ⇄ הקלטה)
- [ ] הרשאת מיקרופון מתבקשת
- [ ] הקלטה מתחילה ונעצרת
- [ ] טיימר עובד (00:00)
- [ ] Speech Recognition מזהה עברית
- [ ] טקסט מתועד מוצג
- [ ] אפשר להשמיע את ההקלטה
- [ ] אפשר להקליט מחדש
- [ ] אישור מעביר לשדה התשובה

### **UI/UX:**
- [ ] כפתורים בולטים וברורים
- [ ] אנימציית Pulse עובדת
- [ ] משוב חזותי ברור (מקליט/מעבד/הושלם)
- [ ] עובד במובייל וטאבלט
- [ ] נגיש (ARIA labels, keyboard navigation)

### **נגישות ASD:**
- [ ] כפתורים גדולים ונוחים (min-height: 48px)
- [ ] הנחיות ברורות ("לחץ להתחלת הקלטה")
- [ ] משוב מיידי (🔴 מקליט...)
- [ ] אפשרות לבטל ולהקליט מחדש
- [ ] אין עומס ויזואלי

### **טכני:**
- [ ] תומך ב-Chrome, Edge, Safari
- [ ] תומך במובייל (iOS, Android)
- [ ] טיפול בשגיאות (אין הרשאה, דפדפן לא תומך)
- [ ] זיהוי עברית מדויק

---

## 📊 **השוואת אפשרויות STT**

| פתרון | יתרונות | חסרונות | עלות |
|-------|----------|----------|------|
| **Web Speech API** | חינמי, מובנה בדפדפן, פשוט ליישום | תלוי בדפדפן, דיוק בינוני, לא זמין ב-Firefox | 🟢 חינמי |
| **Google Cloud STT** | דיוק גבוה, תומך במגוון שפות, אפשרויות מתקדמות | בתשלום, צריך API key, תלוי באינטרנט | 🟡 $0.006/15 שניות |
| **Azure Speech** | דיוק גבוה, תמיכה בעברית, אינטגרציה עם Microsoft | בתשלום, מורכב יותר, צריך חשבון Azure | 🟡 $1/שעה |
| **OpenAI Whisper** | דיוק מעולה, תומך בהרבה שפות, קוד פתוח | צריך server, עלויות compute, השהייה | 🟠 תלוי ביישום |

**המלצה:** **התחל עם Web Speech API** (חינמי ופשוט), שדרג ל-Google Cloud STT אם נדרש דיוק גבוה יותר.

---

## 🚀 **תהליך יישום מומלץ**

### **שלב 1: MVP (1-2 שבועות)**
1. כפתור Toggle (הקלדה/הקלטה)
2. כפתור הקלטה בסיסי
3. Web Speech API לזיהוי קולי
4. העברת טקסט לשדה התשובה

**תוצאה:** תכונה בסיסית פעילה

### **שלב 2: שיפורים (1-2 שבועות)**
5. אנימציות ומשוב חזותי
6. טיימר והשמעה
7. הקלטה מחדש
8. טיפול בשגיאות

**תוצאה:** חווית משתמש משופרת

### **שלב 3: אופטימיזציה (אופציונלי)**
9. שדרוג ל-Google Cloud STT (אם נדרש)
10. בדיקות משתמשים
11. שיפורים לפי משוב

**תוצאה:** פתרון מקצועי ומלוטש

---

## 📚 **משאבים ודוקומנטציה**

### **Web Speech API:**
- [MDN - Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Google - Web Speech API Demo](https://www.google.com/intl/en/chrome/demos/speech.html)

### **Google Cloud Speech-to-Text:**
- [Documentation](https://cloud.google.com/speech-to-text/docs)
- [Pricing](https://cloud.google.com/speech-to-text/pricing)

### **דוגמאות קוד:**
- [GitHub - Web Speech Examples](https://github.com/mdn/web-speech-api)
- [CodePen - Speech Recognition Demo](https://codepen.io/collection/XogBKd)

---

## ✅ **סיכום**

| פריט | ערך |
|------|-----|
| **תכונה** | הקלטה קולית + STT |
| **עדיפות** | 🔴 HIGH |
| **זמן יישום משוער** | 1-2 שבועות (MVP) |
| **טכנולוגיה מומלצת** | Web Speech API (חינמי) |
| **השפעה צפויה** | שיפור משמעותי בנגישות וחוויית משתמש לנוער ASD |

---

## 📞 **שאלות?**

אם יש שאלות, צורך בהבהרות, או סיוע טכני:
- 📧 פנה למעצב/צוות הפיתוח
- 📄 עיין בדוקומנטציה (קישורים למעלה)
- 🧪 בדוק דוגמאות קוד (CodePen, GitHub)

---

**הצלחה ביישום!** 🎉

---

**הושלם:** 09.03.2026, 14:30  
**מחבר:** מעצב חומרים לימודיים לתלמידי ASD  
**פרויקט:** אזרחות 2026 - https://civics2026.pages.dev/
