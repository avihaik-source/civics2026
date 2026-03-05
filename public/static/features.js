// ===== CIVICS 2026 - SPEC FEATURES (v1.0, 4 March 2026) =====
// Implements: Question Practice, Timeline, Acronyms, Tips, About, Enhanced TTS
// Compatible with existing SPA architecture in app.js

(function() {
'use strict';

// ===== OFFICIAL QUESTIONS DATA (loaded from exam-questions-official.json) =====
let _officialQuestions = null;
let _officialMeta = null;

async function loadOfficialQuestions() {
  if (_officialQuestions) return _officialQuestions;
  try {
    const response = await fetch('/static/exam-questions-official.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    _officialMeta = data._meta;
    _officialQuestions = data.questions;
    return _officialQuestions;
  } catch (e) {
    console.error('Failed to load official questions:', e);
    return [];
  }
}

// ===== QUESTION PRACTICE STATE =====
const _practiceState = {
  currentQuestionIdx: 0,
  currentQuestionId: null,
  hintShown: false,
  answerShown: false,
  userAnswer: '',
  feedback: null // 'easy', 'medium', 'hard'
};

// Load practice progress from localStorage
function _loadPracticeProgress() {
  try {
    return JSON.parse(localStorage.getItem('civics2026_examProgress') || '{}');
  } catch(e) { return {}; }
}

function _savePracticeProgress(questionId, data) {
  const progress = _loadPracticeProgress();
  progress[questionId] = { ...data, timestamp: new Date().toISOString() };
  localStorage.setItem('civics2026_examProgress', JSON.stringify(progress));
}

function _loadPracticeFeedback() {
  try {
    return JSON.parse(localStorage.getItem('civics2026_examFeedback') || '{}');
  } catch(e) { return {}; }
}

function _savePracticeFeedback(questionId, rating) {
  const feedback = _loadPracticeFeedback();
  feedback[questionId] = { rating, timestamp: new Date().toISOString() };
  localStorage.setItem('civics2026_examFeedback', JSON.stringify(feedback));
}

// ===== ENHANCED TTS =====
let _ttsSpeed = 1.0;
let _ttsReading = false;

function setTTSSpeed(speed) {
  _ttsSpeed = parseFloat(speed);
}

function speakTextEnhanced(text, btnId) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  _ttsReading = true;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'he-IL';
  utterance.rate = _ttsSpeed;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onstart = () => {
    _ttsReading = true;
    const btn = document.getElementById(btnId);
    if (btn) { btn.textContent = '⏸️ מקריא...'; btn.disabled = true; }
  };
  utterance.onend = () => {
    _ttsReading = false;
    const btn = document.getElementById(btnId);
    if (btn) { btn.textContent = '🔊 הקרא'; btn.disabled = false; }
  };
  utterance.onerror = () => {
    _ttsReading = false;
    const btn = document.getElementById(btnId);
    if (btn) { btn.textContent = '🔊 הקרא'; btn.disabled = false; }
  };
  
  window.speechSynthesis.speak(utterance);
}

function stopTTSEnhanced() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  _ttsReading = false;
}

// ===== TIMELINE DATA =====
const TIMELINE_EVENTS = [
  { year: 1897, title: 'הקונגרס הציוני הראשון', description: 'תיאודור הרצל מכנס את הקונגרס הציוני הראשון בבזל, שוויץ. מטרתו: הקמת בית לאומי לעם היהודי בארץ ישראל.', linkedQuestion: 'w24-5', relatedAcronyms: ['הקב״ט'], icon: '🏛️' },
  { year: 1917, title: 'הצהרת בלפור', description: 'בריטניה מכריזה על תמיכתה בהקמת בית לאומי יהודי בארץ ישראל. ההצהרה נחתמה על ידי שר החוץ הבריטי ארתור בלפור.', linkedQuestion: 's25-3', relatedAcronyms: ['הקב״ט'], icon: '📜' },
  { year: 1920, title: 'כתב המנדט הבריטי', description: 'חבר הלאומים מעניק לבריטניה מנדט על ארץ ישראל, הכולל התחייבות ליישום הצהרת בלפור.', linkedQuestion: 'w24-6', relatedAcronyms: [], icon: '🇬🇧' },
  { year: 1929, title: 'מאורעות תרפ"ט', description: 'פרעות ערביות בארץ ישראל, כולל הטבח בחברון. אירוע מכונן ביחסי ערבים-יהודים.', linkedQuestion: '', relatedAcronyms: [], icon: '⚔️' },
  { year: 1936, title: 'המרד הערבי הגדול', description: 'שלוש שנות מרד ערבי נגד השלטון הבריטי וההגירה היהודית. הוביל לוועדת פיל ולתוכנית חלוקה ראשונה.', linkedQuestion: '', relatedAcronyms: [], icon: '🔥' },
  { year: 1937, title: 'ועדת פיל', description: 'ועדת חקירה בריטית שהמליצה לראשונה על חלוקת ארץ ישראל לשתי מדינות - יהודית וערבית.', linkedQuestion: '', relatedAcronyms: [], icon: '📋' },
  { year: 1939, title: 'הספר הלבן', description: 'בריטניה מגבילה את ההגירה היהודית ל-75,000 תוך 5 שנים ומגבילה רכישת קרקעות. סותר את הצהרת בלפור.', linkedQuestion: '', relatedAcronyms: [], icon: '📄' },
  { year: 1942, title: 'תוכנית בילטמור', description: 'הנהגה הציונית דורשת הקמת מדינה יהודית בארץ ישראל ופתיחת שערי הארץ להגירה חופשית.', linkedQuestion: '', relatedAcronyms: [], icon: '🗽' },
  { year: 1945, title: 'סיום מלחמת העולם השנייה', description: 'השואה חושפת את הצורך הדחוף במקלט לניצולים. מעמד בינלאומי משתנה לטובת הקמת מדינה יהודית.', linkedQuestion: '', relatedAcronyms: ['הקב״ט'], icon: '🕯️' },
  { year: 1947, title: 'החלטה 181 - החלטת החלוקה', description: 'עצרת האו"ם מחליטה על חלוקת ארץ ישראל לשתי מדינות - יהודית וערבית. ירושלים - מעמד בינלאומי מיוחד.', linkedQuestion: 'w26-1', relatedAcronyms: ['הקב״ט'], icon: '🌐' },
  { year: 1948, title: 'הכרזת העצמאות', description: 'ב-14 במאי (ה\' באייר תש"ח) דוד בן-גוריון מכריז על הקמת מדינת ישראל. מגילת העצמאות כוללת 4 הצדקות ו-5 פניות.', linkedQuestion: 'w26-1', relatedAcronyms: ['הקב״ט'], icon: '🇮🇱' },
  { year: 1948, title: 'מלחמת העצמאות והקו הירוק', description: 'מלחמת העצמאות נגד 5 צבאות ערב. הסכמי שביתת נשק ב-1949 קובעים את "הקו הירוק" - גבול שביתת הנשק.', linkedQuestion: 's24-1', relatedAcronyms: [], icon: '🗺️' }
];

// ===== ACRONYMS DATA =====
const ACRONYMS_DATA = [
  { id: 'haqabat', acronym: 'הקב״ט', expanded: 'היסטורי, קיומי, בינלאומי, טענתי', context: '4 הצדקות להקמת המדינה בהצהרת העצמאות', order: 'ה → ק → ב → ט', linkedQuestions: ['w26-1', 's25-2'], explanation: 'ארבעת הצדקות הקמת המדינה כפי שמופיעות במגילת העצמאות: צידוק היסטורי (קשר עתיק לארץ), קיומי (צורך במקלט אחרי השואה), בינלאומי (החלטת האו"ם 181), טענתי (זכות טבעית של העם היהודי).' },
  { id: 'hamahpach', acronym: 'המהפ״ח', expanded: 'היסטורי, מקומי, הסכמי, פוליטי, חוקי', context: '5 מאפיינים של הסטטוס קוו (הסדר הדתי)', order: 'ה → מ → ה → פ → ח', linkedQuestions: ['w26-6', 's24-8'], explanation: 'חמישה מאפיינים מרכזיים של הסדר הסטטוס קוו (הסדר מצב קיים) בנושאי דת ומדינה בישראל: רקע היסטורי, מימד מקומי, הסכמים פוליטיים, היבטים חוקיים.' },
  { id: 'amash', acronym: 'אמ״ש נ״מ', expanded: 'אישיים, מוסריים, שימושיים, נצרכים, מושגיים', context: 'סוגי ערכים / סיווג זכויות', order: 'א → מ → ש  |  נ → מ', linkedQuestions: ['w25-4', 's24-10'], explanation: 'סיווג ערכים וזכויות: אישיים (שייכים לפרט), מוסריים (קשורים למוסר ומצפון), שימושיים (בעלי תועלת מעשית), נצרכים (חיוניים לקיום), מושגיים (מופשטים ורעיוניים).' },
  { id: 'hakneset', acronym: 'חד״ם', expanded: 'חקיקה, דיון, מעקב', context: '3 סמכויות הכנסת', order: 'ח → ד → ם', linkedQuestions: ['w25-7', 's25-11'], explanation: 'שלוש הסמכויות המרכזיות של הכנסת: סמכות חקיקה (חוקי יסוד וחוקים רגילים), סמכות דיון (דיונים ושאילתות), סמכות מעקב ופיקוח (על הממשלה).' },
  { id: 'zchuyot', acronym: 'ז״ח ש״פ', expanded: 'זכויות חברתיות, שוויון, פוליטיות', context: 'סוגי זכויות אזרחיות', order: 'ז → ח → ש → פ', linkedQuestions: ['s24-10', 'w25-4'], explanation: 'סיווג עיקרי של זכויות אדם ואזרח: זכויות חברתיות (רווחה, בריאות), שוויון, זכויות פוליטיות (בחירה, הצבעה).' },
  { id: 'shlita', acronym: 'רפ״ח', expanded: 'ריבונות, פלורליזם, חוק', context: 'עקרונות יסוד של דמוקרטיה', order: 'ר → פ → ח', linkedQuestions: ['w25-1', 's25-5'], explanation: 'שלושה עקרונות יסוד של משטר דמוקרטי: ריבונות העם (העם הוא הריבון), פלורליזם (ריבוי דעות), שלטון החוק (כולם כפופים לחוק).' },
  { id: 'pikuach', acronym: 'פב״ם', expanded: 'פורמלי, בלתי פורמלי, מוסדי', context: 'סוגי מנגנוני פיקוח', order: 'פ → ב → ם', linkedQuestions: ['w26-1', 's25-12'], explanation: 'שלושה סוגי מנגנוני פיקוח על השלטון: פורמלי (מוגדר בחוק - כמו מבקר המדינה), בלתי פורמלי (לא מוגדר בחוק - כמו תקשורת), מוסדי (מבנה מוסדות ממלכתיים).' },
  { id: 'shofet', acronym: 'ע״ש', expanded: 'עצמאות, שמרנות', context: 'עקרונות הרשות השופטת', order: 'ע → ש', linkedQuestions: ['w26-5', 's25-8'], explanation: 'שני עקרונות מרכזיים של הרשות השופטת: עצמאות (אי-תלות בשלטון) ושמרנות שיפוטית (פסיקה על פי חוק ולא לפי דעה אישית).' }
];

// ===== TIPS - 7 GOLDEN RULES =====
const GOLDEN_TIPS = [
  { id: 1, title: 'למד באותו זמן ובאותו מקום מדי יום', text: 'רוטינה קבועה עוזרת למוח להיכנס "למצב למידה" מהר יותר. בחר מקום שקט ונוח, ושמור עליו.', icon: '📍' },
  { id: 2, title: 'השתמש בטיימר', text: '20 דקות למידה → 5 דקות הפסקה. טכניקת פומודורו עוזרת לשמור על ריכוז.', icon: '⏱️' },
  { id: 3, title: 'הפסקה כל 20 דקות', text: 'קום, התמתח, שתה מים. מוח עייף לא לומד טוב. תנו לו לנוח.', icon: '🚰' },
  { id: 4, title: 'מקסימום 45 דקות רצופות', text: 'אחר כך הפסקה ארוכה (10-15 דקות). אין טעם ללמוד במצב של עייפות.', icon: '⏸️' },
  { id: 5, title: 'סמן יחידות שהושלמו', text: 'ראיית התקדמות = מוטיבציה! סמנו כל יחידה שסיימתם. הרגישו את ההתקדמות.', icon: '✅' },
  { id: 6, title: 'דלג על קשה, חזור אחר כך', text: 'אל תיתקע. עברו לשאלה הבאה ותחזרו אחר כך. לפעמים המוח צריך זמן לעבד.', icon: '⏭️' },
  { id: 7, title: 'לפני יחידה חדשה - סכם בקול רם', text: 'הסבירו למישהו (או לעצמכם) את היחידה הקודמת. אם אתם יכולים להסביר - אתם מבינים!', icon: '🗣️' }
];

// ===== RENDER: QUESTION PRACTICE PAGE =====
function renderQuestionPractice(questionId) {
  const questions = _officialQuestions;
  if (!questions || !questions.length) {
    return `<div class="home-page"><div class="card" style="text-align:center;padding:40px">
      <i class="fas fa-spinner fa-spin" style="font-size:2em;color:#4299e1"></i>
      <p style="margin-top:16px">טוען שאלות...</p></div></div>`;
  }

  const qIdx = questions.findIndex(q => q.id === questionId);
  const q = qIdx >= 0 ? questions[qIdx] : questions[0];
  if (!q) return '<div class="card">שאלה לא נמצאה</div>';

  const progress = _loadPracticeProgress();
  const feedback = _loadPracticeFeedback();
  const answeredCount = Object.keys(progress).filter(k => progress[k].completed).length;
  const percentage = Math.round((answeredCount / questions.length) * 100);
  const qNumber = qIdx >= 0 ? qIdx + 1 : 1;
  const prevQ = qIdx > 0 ? questions[qIdx - 1] : null;
  const nextQ = qIdx < questions.length - 1 ? questions[qIdx + 1] : null;
  const currentFeedback = feedback[q.id]?.rating || _practiceState.feedback;
  const hasAnswer = q.officialAnswer && q.officialAnswer.trim().length > 0;
  const savedAnswer = progress[q.id]?.userAnswer || '';

  return `<div class="home-page practice-page">
    <!-- Progress Bar -->
    <div class="practice-progress-wrapper" role="region" aria-label="פס התקדמות">
      <div class="practice-progress-bar" role="progressbar" aria-valuenow="${qNumber}" aria-valuemin="0" aria-valuemax="96">
        <div class="practice-progress-fill" style="width:${Math.round((qNumber/96)*100)}%"></div>
      </div>
      <p class="practice-progress-text">שאלה ${qNumber} מתוך 96 (${Math.round((qNumber/96)*100)}%)</p>
    </div>

    <!-- Question Header -->
    <div class="card practice-card">
      <div class="practice-header">
        <span class="practice-badge">שאלה ${q.number}</span>
        <span class="practice-source"><i class="fas fa-file-alt"></i> מקור: ${_escHtmlF(q.examName)}</span>
      </div>

      <!-- Question Text -->
      <section class="practice-question-section" aria-labelledby="pq-heading">
        <h2 id="pq-heading" class="practice-question-text">${_escHtmlF(q.originalQuestion).replace(/\n/g, '<br>')}</h2>
      </section>

      <!-- TTS Controls -->
      <div class="practice-audio-controls" role="region" aria-label="בקרות הקראה">
        <button id="pq-read-btn" class="btn btn-sm btn-audio" onclick="window.CivicsFeatures.readQuestion()" aria-label="הקרא את השאלה בקול רם">
          🔊 הקרא שאלה
        </button>
        <label for="pq-speed" class="speed-label">מהירות:</label>
        <select id="pq-speed" class="practice-speed-select" onchange="window.CivicsFeatures.setTTSSpeed(this.value)" aria-label="בחירת מהירות הקראה">
          <option value="0.8"${_ttsSpeed===0.8?' selected':''}>איטי (0.8x)</option>
          <option value="1.0"${_ttsSpeed===1.0?' selected':''}>רגיל (1.0x)</option>
          <option value="1.2"${_ttsSpeed===1.2?' selected':''}>מהיר (1.2x)</option>
        </select>
        <button class="btn btn-sm" onclick="window.CivicsFeatures.stopTTS()" aria-label="עצור הקראה" style="background:#fee2e2;color:#dc2626">
          ⏹️ עצור
        </button>
      </div>

      <!-- User Answer -->
      <section class="practice-answer-section" aria-labelledby="pa-label">
        <label id="pa-label" for="pa-textarea" class="practice-answer-label">
          ✍️ התשובה שלך:
          <span id="pa-char-counter" class="practice-char-counter" aria-live="polite">0 / 500 תווים</span>
        </label>
        <textarea id="pa-textarea" class="practice-textarea" placeholder="כתוב כאן את תשובתך (2-3 משפטים לפחות)..." maxlength="500" rows="8" oninput="window.CivicsFeatures.onAnswerInput(this)" aria-describedby="pa-char-counter">${_escHtmlF(savedAnswer)}</textarea>
      </section>

      <!-- Action Buttons -->
      <div class="practice-actions" role="group" aria-label="פעולות">
        <button id="pq-hint-btn" class="btn btn-warning" onclick="window.CivicsFeatures.showPracticeHint('${q.id}')" aria-label="הצג רמז מנחה">
          💡 רמז
        </button>
        <button id="pq-answer-btn" class="btn btn-primary" onclick="window.CivicsFeatures.showPracticeAnswer('${q.id}')" aria-label="הצג תשובה רשמית" ${!hasAnswer ? 'disabled title="אין תשובה רשמית לשאלה זו"' : ''}>
          📖 תשובה מלאה
        </button>
        ${nextQ ? `<button class="btn btn-success" onclick="window.CivicsFeatures.goToQuestion('${nextQ.id}')" aria-label="עבור לשאלה הבאה">
          ➡️ שאלה הבאה
        </button>` : ''}
      </div>

      <!-- Hint Container (hidden) -->
      <div id="pq-hint-container" class="practice-hint-container" style="display:none" role="alert" aria-live="assertive">
        <div class="practice-hint-header"><span>💡</span><h3>רמז מנחה</h3></div>
        <div id="pq-hint-content" class="practice-hint-content"></div>
      </div>

      <!-- Official Answer Container (hidden) -->
      <div id="pq-answer-container" class="practice-answer-container" style="display:none" role="alert" aria-live="assertive">
        <div class="practice-answer-header"><span>✅</span><h3>התשובה הרשמית (ממפתח משרד החינוך)</h3></div>
        <div id="pq-answer-content" class="practice-answer-content"></div>
        <button id="pq-read-answer-btn" class="btn btn-sm btn-audio" onclick="window.CivicsFeatures.readAnswer()" aria-label="הקרא את התשובה הרשמית" style="margin-top:12px">
          🔊 הקרא תשובה
        </button>
      </div>

      <!-- Feedback -->
      <section class="practice-feedback-section" aria-labelledby="pf-heading">
        <h3 id="pf-heading">איך הייתה השאלה?</h3>
        <div class="practice-feedback-buttons" role="group" aria-label="דרג את קושי השאלה">
          <button class="practice-feedback-btn${currentFeedback==='easy'?' active':''}" data-rating="easy" onclick="window.CivicsFeatures.ratePractice('${q.id}','easy')" aria-label="קל">😊 קל</button>
          <button class="practice-feedback-btn${currentFeedback==='medium'?' active':''}" data-rating="medium" onclick="window.CivicsFeatures.ratePractice('${q.id}','medium')" aria-label="בינוני">😐 בינוני</button>
          <button class="practice-feedback-btn${currentFeedback==='hard'?' active':''}" data-rating="hard" onclick="window.CivicsFeatures.ratePractice('${q.id}','hard')" aria-label="קשה">😓 קשה</button>
        </div>
        <div id="pq-feedback-msg" class="practice-feedback-msg" style="display:${currentFeedback?'block':'none'}" role="status" aria-live="polite">
          תודה על המשוב! 🎯
        </div>
      </section>

      <!-- Navigation -->
      <div class="practice-nav">
        ${prevQ ? `<button class="btn btn-sm" onclick="window.CivicsFeatures.goToQuestion('${prevQ.id}')"><i class="fas fa-arrow-right"></i> שאלה קודמת</button>` : '<div></div>'}
        <button class="btn btn-sm" onclick="location.hash='question-list'" aria-label="חזרה לרשימה"><i class="fas fa-th-list"></i> רשימת שאלות</button>
        ${nextQ ? `<button class="btn btn-sm" onclick="window.CivicsFeatures.goToQuestion('${nextQ.id}')">שאלה הבאה <i class="fas fa-arrow-left"></i></button>` : '<div></div>'}
      </div>
    </div>

    <!-- Stats -->
    <div class="card practice-stats-card">
      <div class="practice-stats">
        <div class="practice-stat"><span class="stat-num">${answeredCount}</span><span class="stat-label">נענו</span></div>
        <div class="practice-stat"><span class="stat-num">${96 - answeredCount}</span><span class="stat-label">נותרו</span></div>
        <div class="practice-stat"><span class="stat-num">${percentage}%</span><span class="stat-label">הושלמו</span></div>
      </div>
    </div>
  </div>`;
}

// ===== RENDER: QUESTION LIST PAGE (linking to practice) =====
function renderQuestionList() {
  const questions = _officialQuestions;
  if (!questions || !questions.length) {
    return `<div class="home-page"><div class="card" style="text-align:center;padding:40px">
      <i class="fas fa-spinner fa-spin" style="font-size:2em;color:#4299e1"></i>
      <p style="margin-top:16px">טוען שאלות...</p></div></div>`;
  }

  const progress = _loadPracticeProgress();
  const feedback = _loadPracticeFeedback();
  const answeredCount = Object.keys(progress).filter(k => progress[k].completed).length;
  
  // Group by exam
  const exams = _officialMeta?.exams || [];
  const examGroups = {};
  questions.forEach(q => {
    const src = q.source || 'אחר';
    if (!examGroups[src]) examGroups[src] = [];
    examGroups[src].push(q);
  });

  let html = `<div class="home-page">
    <div class="card" style="padding:24px">
      <h2 style="margin-bottom:12px"><i class="fas fa-file-alt" style="color:#4299e1"></i> 96 שאלות בגרות רשמיות - מצב תרגול</h2>
      <p style="color:var(--text-gray);margin-bottom:16px">לחצו על שאלה כדי לתרגל אותה עם רמז, תשובה רשמית ו-TTS</p>
      <div class="practice-stats" style="margin-bottom:20px">
        <div class="practice-stat"><span class="stat-num">${answeredCount}</span><span class="stat-label">הושלמו</span></div>
        <div class="practice-stat"><span class="stat-num">${96 - answeredCount}</span><span class="stat-label">נותרו</span></div>
        <div class="practice-stat"><span class="stat-num">${Math.round((answeredCount/96)*100)}%</span><span class="stat-label">התקדמות</span></div>
      </div>
    </div>`;

  Object.entries(examGroups).forEach(([examName, qs]) => {
    const examAnswered = qs.filter(q => progress[q.id]?.completed).length;
    html += `<div class="card" style="margin-top:16px;padding:20px">
      <h3 style="margin-bottom:12px;color:var(--primary-color)">${_escHtmlF(examName)} <span style="font-size:14px;color:var(--text-gray)">(${examAnswered}/${qs.length} הושלמו)</span></h3>
      <div class="practice-question-grid">`;
    
    qs.forEach(q => {
      const isCompleted = progress[q.id]?.completed;
      const rating = feedback[q.id]?.rating;
      const ratingIcon = rating === 'easy' ? '😊' : rating === 'medium' ? '😐' : rating === 'hard' ? '😓' : '';
      html += `<a href="#practice/${q.id}" class="practice-q-link ${isCompleted ? 'completed' : ''}" aria-label="שאלה ${q.number} - ${isCompleted ? 'הושלמה' : 'לא הושלמה'}">
        <span class="pq-num">${q.number}</span>
        ${ratingIcon ? `<span class="pq-rating">${ratingIcon}</span>` : ''}
        ${isCompleted ? '<i class="fas fa-check pq-check"></i>' : ''}
      </a>`;
    });
    
    html += '</div></div>';
  });

  html += `
    <div class="card" style="margin-top:16px;padding:20px;text-align:center">
      <button class="btn btn-warning" onclick="window.CivicsFeatures.resetPracticeProgress()" aria-label="איפוס התקדמות">
        🔄 איפוס כל ההתקדמות
      </button>
    </div>
  </div>`;
  return html;
}

// ===== RENDER: TIMELINE PAGE =====
function renderTimelinePage() {
  let html = `<div class="home-page timeline-page">
    <div class="card" style="padding:24px">
      <h2><i class="fas fa-history" style="color:#4299e1"></i> ציר זמן אינטראקטיבי: 1897-1948</h2>
      <p style="color:var(--text-gray)">12 אירועים מרכזיים בדרך להקמת המדינה. לחצו על אירוע כדי לעבור לשאלה הקשורה.</p>
    </div>
    <div class="timeline-container" role="list" aria-label="ציר זמן היסטורי">`;
  
  TIMELINE_EVENTS.forEach((event, idx) => {
    const hasLink = event.linkedQuestion && event.linkedQuestion.length > 0;
    const side = idx % 2 === 0 ? 'left' : 'right';
    html += `
    <div class="timeline-event timeline-${side}" role="listitem" style="animation-delay:${idx * 0.1}s">
      <div class="timeline-year-badge">${event.year}</div>
      <div class="timeline-content">
        <div class="timeline-icon">${event.icon}</div>
        <h3 class="timeline-title">${_escHtmlF(event.title)}</h3>
        <p class="timeline-desc">${_escHtmlF(event.description)}</p>
        ${event.relatedAcronyms.length > 0 ? 
          `<div class="timeline-acronyms">${event.relatedAcronyms.map(ac => `<span class="acronym-tag" onclick="location.hash='acronyms'">${ac}</span>`).join('')}</div>` : ''}
        ${hasLink ? `<button class="btn btn-sm btn-primary timeline-link-btn" onclick="window.CivicsFeatures.goToQuestion('${event.linkedQuestion}')">
          ➡️ לשאלה הקשורה
        </button>` : ''}
      </div>
    </div>`;
  });

  html += `</div></div>`;
  return html;
}

// ===== RENDER: ACRONYMS PAGE =====
let _acronymSearch = '';

function renderAcronymsPage() {
  const filtered = ACRONYMS_DATA.filter(item => {
    if (!_acronymSearch.trim()) return true;
    const q = _acronymSearch.trim().toLowerCase();
    return item.acronym.includes(q) || item.expanded.toLowerCase().includes(q) || item.context.toLowerCase().includes(q) || item.explanation.toLowerCase().includes(q);
  });

  let html = `<div class="home-page acronyms-page">
    <div class="card" style="padding:24px">
      <h2><i class="fas fa-book" style="color:#4299e1"></i> מילון ראשי תיבות</h2>
      <p style="color:var(--text-gray);margin-bottom:16px">ראשי תיבות חשובים לבגרות באזרחות. חפשו או עיינו ברשימה.</p>
      <div class="acronym-search-wrapper">
        <i class="fas fa-search acronym-search-icon"></i>
        <input type="text" id="acronym-search" class="acronym-search-input" placeholder="חפש ראשי תיבות..." 
          value="${_escHtmlF(_acronymSearch)}" oninput="window.CivicsFeatures.searchAcronyms(this.value)" aria-label="חיפוש ראשי תיבות">
      </div>
    </div>`;

  if (filtered.length === 0) {
    html += '<div class="card" style="text-align:center;padding:32px;margin-top:16px"><p style="color:var(--text-gray)">לא נמצאו תוצאות עבור "' + _escHtmlF(_acronymSearch) + '"</p></div>';
  } else {
    filtered.forEach(item => {
      html += `<div class="card acronym-card" style="margin-top:16px;padding:20px">
        <h2 class="acronym-title">${_escHtmlF(item.acronym)}</h2>
        <p class="acronym-expanded"><strong>פירוש:</strong> ${_escHtmlF(item.expanded)}</p>
        <p class="acronym-context"><strong>הקשר:</strong> ${_escHtmlF(item.context)}</p>
        <div class="acronym-order"><strong>סדר:</strong> ${_escHtmlF(item.order)}</div>
        <p class="acronym-explanation">${_escHtmlF(item.explanation)}</p>
        <div class="acronym-links">
          <strong>שאלות קשורות:</strong>
          ${item.linkedQuestions.map(qid => 
            `<a href="#practice/${qid}" class="acronym-question-link">${qid}</a>`
          ).join(' ')}
        </div>
      </div>`;
    });
  }

  html += '</div>';
  return html;
}

// ===== RENDER: TIPS PAGE =====
function renderTipsPage() {
  let html = `<div class="home-page tips-page">
    <div class="card" style="padding:24px">
      <h2><i class="fas fa-lightbulb" style="color:#f39c12"></i> 7 כללי הזהב ללמידה</h2>
      <p style="color:var(--text-gray)">טיפים מוכחים ללמידה יעילה, במיוחד לקראת בחינת הבגרות</p>
    </div>
    <div class="tips-grid">`;

  GOLDEN_TIPS.forEach(tip => {
    html += `<div class="card tip-card" style="margin-top:16px;padding:24px">
      <div class="tip-header">
        <span class="tip-icon">${tip.icon}</span>
        <span class="tip-number">כלל ${tip.id}</span>
      </div>
      <h3 class="tip-title">${_escHtmlF(tip.title)}</h3>
      <p class="tip-text">${_escHtmlF(tip.text)}</p>
    </div>`;
  });

  html += '</div></div>';
  return html;
}

// ===== RENDER: ABOUT PAGE =====
function renderAboutPage() {
  return `<div class="home-page about-page">
    <div class="card" style="padding:24px">
      <h2><i class="fas fa-info-circle" style="color:#4299e1"></i> אודות המערכת</h2>
    </div>
    <div class="card" style="margin-top:16px;padding:24px">
      <h3>🎓 מערכת הכנה לבגרות באזרחות 2026</h3>
      <p style="line-height:1.8;margin-top:12px">
        מערכת תרגול אינטראקטיבית ונגישה לבחינת הבגרות באזרחות (בעל-פה), 
        מותאמת במיוחד לתלמידי תיכון עם ASD בתפקוד גבוה.
      </p>
      
      <div class="about-features" style="margin-top:20px">
        <h4 style="margin-bottom:12px">✨ מה כולל האתר:</h4>
        <ul class="about-list">
          <li><strong>96 שאלות בגרות רשמיות</strong> - מצוטטות מילה במילה ממבחני 2024-2026</li>
          <li><strong>16 יחידות לימוד</strong> - עם 111+ מושגי מפתח</li>
          <li><strong>51 שאלות תרגול</strong> - עם פיגומים תלת-רמתיים</li>
          <li><strong>ציר זמן אינטראקטיבי</strong> - 12 אירועים מרכזיים 1897-1948</li>
          <li><strong>מילון ראשי תיבות</strong> - עם חיפוש וקישורים</li>
          <li><strong>הקראת טקסט (TTS)</strong> - Web Speech API בעברית</li>
          <li><strong>סימולציית בחינה</strong> - עם שעון וחלוקה לפרקים</li>
          <li><strong>נגישות מלאה</strong> - WCAG 2.1 AA, ניווט מקלדת, קורא מסך</li>
        </ul>
      </div>

      <div style="margin-top:20px">
        <h4 style="margin-bottom:12px">♿ התאמות ASD:</h4>
        <ul class="about-list">
          <li>צבעים רכים ונוחים לעין</li>
          <li>מבנה קבוע ואחיד בכל דף</li>
          <li>משוב מיידי על כל פעולה</li>
          <li>שליטה מלאה (מהירות TTS, דילוג, איפוס)</li>
          <li>מצב שקט (ללא אנימציות ורעש)</li>
          <li>תרגיל נשימה מובנה</li>
          <li>תמיכה בגדלי מסך שונים (מובייל ועד מחשב)</li>
        </ul>
      </div>

      <div style="margin-top:20px">
        <h4 style="margin-bottom:12px">📄 מקורות:</h4>
        <p style="line-height:1.8">
          כל השאלות והתשובות מצוטטות מילה במילה ממבחני הבגרות הרשמיים של משרד החינוך.<br>
          מועדים: חורף 2024, קיץ 2024, חורף 2025, קיץ 2025, חורף 2026.<br>
          <strong>מקור:</strong> אזרחות - לקט מבחני בגרות - חורף 2026.docx
        </p>
      </div>

      <div style="margin-top:20px;padding:16px;background:var(--bg-section);border-radius:12px">
        <p style="text-align:center;color:var(--text-gray)">
          © 2026 מערכת תרגול בגרות אזרחות | מותאם לתלמידי ASD<br>
          <small>גרסה 1.0 | נבנה באהבה למען שוויון הזדמנויות בחינוך 💙</small>
        </p>
      </div>
    </div>
  </div>`;
}

// ===== RENDER: PROGRESS DASHBOARD (student view) =====
function renderProgressDashboard() {
  const progress = _loadPracticeProgress();
  const feedback = _loadPracticeFeedback();
  const total = 96;
  const answered = Object.keys(progress).filter(k => progress[k].completed).length;
  const pct = Math.round((answered / total) * 100);
  
  // Feedback stats
  const feedbackEntries = Object.values(feedback);
  const easyCount = feedbackEntries.filter(f => f.rating === 'easy').length;
  const mediumCount = feedbackEntries.filter(f => f.rating === 'medium').length;
  const hardCount = feedbackEntries.filter(f => f.rating === 'hard').length;

  // Recent activity
  const recentEntries = Object.entries(progress)
    .filter(([,v]) => v.completed)
    .sort((a,b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
    .slice(0, 10);

  return `<div class="home-page progress-dashboard-page">
    <div class="card" style="padding:24px">
      <h2><i class="fas fa-chart-pie" style="color:#4299e1"></i> לוח מחוונים - ההתקדמות שלי</h2>
    </div>

    <!-- Stats Cards -->
    <div class="progress-stats-grid" style="margin-top:16px">
      <div class="card stat-card">
        <div class="stat-card-icon" style="background:#ebf4ff;color:#2b6cb0">📊</div>
        <div class="stat-card-num">${answered}/${total}</div>
        <div class="stat-card-label">שאלות הושלמו</div>
        <div class="stat-card-bar"><div class="stat-card-fill" style="width:${pct}%;background:#4299e1"></div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-card-icon" style="background:#f0fff4;color:#22543d">😊</div>
        <div class="stat-card-num">${easyCount}</div>
        <div class="stat-card-label">שאלות קלות</div>
      </div>
      <div class="card stat-card">
        <div class="stat-card-icon" style="background:#fffbeb;color:#92400e">😐</div>
        <div class="stat-card-num">${mediumCount}</div>
        <div class="stat-card-label">שאלות בינוניות</div>
      </div>
      <div class="card stat-card">
        <div class="stat-card-icon" style="background:#fef2f2;color:#991b1b">😓</div>
        <div class="stat-card-num">${hardCount}</div>
        <div class="stat-card-label">שאלות קשות</div>
      </div>
    </div>

    <!-- Completed Questions List -->
    <div class="card" style="margin-top:16px;padding:20px">
      <h3 style="margin-bottom:12px">🕐 פעילות אחרונה</h3>
      ${recentEntries.length === 0 ? '<p style="color:var(--text-gray)">עדיין לא התחלתם לתרגל. לחצו על "96 שאלות תרגול" כדי להתחיל!</p>' :
        `<div class="recent-activity-list">
          ${recentEntries.map(([qid, data]) => {
            const dateStr = new Date(data.timestamp).toLocaleDateString('he-IL');
            return `<div class="recent-item">
              <a href="#practice/${qid}" class="recent-link">${qid}</a>
              <span class="recent-date">${dateStr}</span>
              ${feedback[qid] ? `<span class="recent-rating">${feedback[qid].rating === 'easy' ? '😊' : feedback[qid].rating === 'medium' ? '😐' : '😓'}</span>` : ''}
            </div>`;
          }).join('')}
        </div>`}
    </div>

    <!-- Reset -->
    <div class="card" style="margin-top:16px;padding:20px;text-align:center">
      <button class="btn btn-warning" onclick="window.CivicsFeatures.resetPracticeProgress()" aria-label="איפוס כל ההתקדמות">
        🔄 איפוס כל ההתקדמות
      </button>
      <p style="color:var(--text-gray);font-size:13px;margin-top:8px">⚠️ פעולה זו תמחק את כל ההתקדמות והמשוב</p>
    </div>
  </div>`;
}

// ===== HELPER: HTML escape =====
function _escHtmlF(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ===== HINT GENERATION (since JSON has no hints) =====
function generateHint(question) {
  const text = question.originalQuestion || '';
  const answer = question.officialAnswer || '';
  
  // Extract action verbs for guidance
  const verbs = [];
  if (/ציינו|ציין/.test(text)) verbs.push('ציינו');
  if (/הציגו|הצג/.test(text)) verbs.push('הציגו');
  if (/הסבירו|הסבר/.test(text)) verbs.push('הסבירו');
  if (/צטטו/.test(text)) verbs.push('צטטו');
  if (/השוו/.test(text)) verbs.push('השוו');
  
  let hints = [];
  
  if (verbs.includes('ציינו')) hints.push('שימו לב: המילה "ציינו" אומרת שצריך לנקוב בשם/מושג ספציפי.');
  if (verbs.includes('הציגו')) hints.push('כש"מציגים" - צריך הגדרה + הסבר + דוגמה.');
  if (verbs.includes('הסבירו')) hints.push('ב"הסבר" - השתמשו במילים כמו "כלומר", "משום ש", "על פי".');
  if (verbs.includes('צטטו')) hints.push('חפשו בקטע משפט שאפשר לשים במרכאות.');
  if (verbs.includes('השוו')) hints.push('בהשוואה: מה דומה? מה שונה? תנו לפחות שניים מכל אחד.');
  
  // Content hints based on keywords
  if (/מגילת העצמאות|הכרזת העצמאות/.test(text)) hints.push('חשבו על 4 הצדקות (הקב"ט) ו-5 פניות.');
  if (/חוק יסוד/.test(text)) hints.push('זכרו: חוקי יסוד הם ה"חוקה" של ישראל.');
  if (/זכות|זכויות/.test(text)) hints.push('האם מדובר בזכות טבעית או חיובית? אישית או קבוצתית?');
  if (/דמוקרטיה/.test(text)) hints.push('חשבו על עקרונות: ריבונות, פלורליזם, שלטון החוק.');
  if (/פיקוח|ביקורת/.test(text)) hints.push('האם מדובר בפיקוח פורמלי או בלתי פורמלי?');
  if (/כנסת/.test(text)) hints.push('זכרו: חקיקה, דיון, מעקב (חד"ם).');
  if (/ממשלה/.test(text)) hints.push('חשבו על: אחריות מיניסטריאלית, אחריות ממשלתית משותפת.');
  
  if (hints.length === 0) hints.push('קראו את השאלה בעיון. סמנו מילות מפתח. נסו לזהות את הפעלים (ציינו, הציגו, הסבירו).');
  
  return hints.join('\n');
}

// ===== ACTION HANDLERS =====
function showPracticeHint(qId) {
  const q = _officialQuestions?.find(q => q.id === qId);
  if (!q) return;
  
  const hint = q.hint || generateHint(q);
  const container = document.getElementById('pq-hint-container');
  const content = document.getElementById('pq-hint-content');
  const btn = document.getElementById('pq-hint-btn');
  
  if (container && content) {
    content.innerHTML = hint.split('\n').map(l => `<p>${_escHtmlF(l)}</p>`).join('');
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  if (btn) { btn.disabled = true; btn.textContent = '✅ רמז הוצג'; }
}

function showPracticeAnswer(qId) {
  const q = _officialQuestions?.find(q => q.id === qId);
  if (!q || !q.officialAnswer) return;
  
  const container = document.getElementById('pq-answer-container');
  const content = document.getElementById('pq-answer-content');
  const btn = document.getElementById('pq-answer-btn');
  
  if (container && content) {
    content.innerHTML = q.officialAnswer.split('\n').filter(l => l.trim()).map(l => `<p>${_escHtmlF(l)}</p>`).join('');
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  if (btn) { btn.disabled = true; btn.textContent = '✅ תשובה הוצגה'; }
  
  // Save progress
  const textarea = document.getElementById('pa-textarea');
  _savePracticeProgress(qId, { completed: true, userAnswer: textarea?.value || '' });
}

function ratePractice(qId, rating) {
  _savePracticeFeedback(qId, rating);
  _practiceState.feedback = rating;
  
  const msgEl = document.getElementById('pq-feedback-msg');
  if (msgEl) msgEl.style.display = 'block';
  
  // Update button states visually
  document.querySelectorAll('.practice-feedback-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-rating') === rating);
  });
  
  if (window.CivicsApp && window.CivicsApp.announceToSR) window.CivicsApp.announceToSR('תודה על המשוב!');
}

function onAnswerInput(textarea) {
  const len = textarea.value.length;
  const counter = document.getElementById('pa-char-counter');
  if (counter) {
    counter.textContent = `${len} / 500 תווים`;
    counter.style.color = len > 450 ? '#e74c3c' : 'var(--text-gray)';
  }
}

function goToQuestion(qId) {
  // Save current answer before navigating
  const textarea = document.getElementById('pa-textarea');
  if (textarea && _practiceState.currentQuestionId) {
    const progress = _loadPracticeProgress();
    const existing = progress[_practiceState.currentQuestionId] || {};
    _savePracticeProgress(_practiceState.currentQuestionId, { ...existing, userAnswer: textarea.value });
  }
  
  _practiceState.feedback = null;
  _practiceState.hintShown = false;
  _practiceState.answerShown = false;
  _practiceState.currentQuestionId = qId;
  
  stopTTSEnhanced();
  location.hash = 'practice/' + qId;
}

function readQuestion() {
  const textEl = document.getElementById('pq-heading');
  if (textEl) speakTextEnhanced(textEl.textContent, 'pq-read-btn');
}

function readAnswer() {
  const textEl = document.getElementById('pq-answer-content');
  if (textEl) speakTextEnhanced(textEl.textContent, 'pq-read-answer-btn');
}

function searchAcronyms(query) {
  _acronymSearch = query;
  // Re-render only the acronyms content
  if (window._civicsRender) window._civicsRender();
}

function resetPracticeProgress() {
  const confirmed = confirm(
    '⚠️ שים לב!\n\n' +
    'פעולה זו תמחק:\n' +
    '• את כל ההתקדמות שלך\n' +
    '• את כל התשובות שכתבת\n' +
    '• את כל המשוב שנתת\n\n' +
    'האם אתה בטוח?'
  );
  if (!confirmed) return;
  
  const doubleConfirmed = confirm(
    '❗ אישור אחרון\n\n' +
    'לא ניתן לשחזר את המידע לאחר המחיקה.\n\n' +
    'להמשיך?'
  );
  if (!doubleConfirmed) return;
  
  localStorage.removeItem('civics2026_examProgress');
  localStorage.removeItem('civics2026_examFeedback');
  alert('✅ ההתקדמות אופסה בהצלחה!');
  if (window._civicsRender) window._civicsRender();
}

// ===== MIKUD PAGE - Full source material from bagrut focus documents =====
function renderMikudPage() {
  const hasMikud = typeof MIKUD_DATA !== 'undefined';
  if (!hasMikud) {
    return `<div class="page-container" style="direction:rtl;padding:20px">
      <button class="back-btn" onclick="location.hash=''" aria-label="חזרה לדף הבית"><i class="fas fa-arrow-right"></i> חזרה</button>
      <h1><i class="fas fa-book-open"></i> חומר מיקוד</h1>
      <p>טוען את חומר המיקוד... נסו לרענן את הדף.</p>
    </div>`;
  }

  const state = window._mikudState || { openUnit: null, searchTerm: '', showGuidelines: false };
  window._mikudState = state;

  let html = `<div class="page-container" style="direction:rtl;padding:20px;max-width:900px;margin:0 auto">
    <button class="back-btn" onclick="location.hash=''" aria-label="חזרה לדף הבית"><i class="fas fa-arrow-right"></i> חזרה</button>
    <h1 style="color:#0038b8;margin-bottom:8px"><i class="fas fa-book-open"></i> חומר מיקוד בגרות 2026</h1>
    <p style="color:#666;margin-bottom:16px">${MIKUD_DATA.totalSections} סעיפים | ${(MIKUD_DATA.totalChars/1000).toFixed(0)}K תווים | מקור: 3 מסמכים רשמיים</p>
    
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <input type="text" id="mikud-search" placeholder="חיפוש בחומר המיקוד..." 
        value="${state.searchTerm}" 
        oninput="window._mikudState.searchTerm=this.value;window.CivicsFeatures.filterMikud()"
        style="flex:1;min-width:200px;padding:10px 14px;border:2px solid #ddd;border-radius:8px;font-size:16px;direction:rtl" />
      <button class="btn btn-primary" onclick="window._mikudState.showGuidelines=!window._mikudState.showGuidelines;render()" style="white-space:nowrap">
        <i class="fas fa-lightbulb"></i> הנחיות בחינה (${MIKUD_DATA.examGuidelines.length})
      </button>
    </div>`;

  // Guidelines panel
  if (state.showGuidelines) {
    html += `<div style="background:#fff3cd;border:2px solid #ffc107;border-radius:12px;padding:16px;margin-bottom:20px">
      <h3 style="color:#856404;margin-bottom:12px"><i class="fas fa-exclamation-triangle"></i> הנחיות חשובות לבחינה (ממשרד החינוך)</h3>`;
    MIKUD_DATA.examGuidelines.forEach(g => {
      html += `<div style="background:white;border-radius:8px;padding:12px;margin-bottom:8px">
        <strong style="color:#0038b8">${g.title}</strong>
        <p style="margin:6px 0 0;line-height:1.6">${g.content}</p>
      </div>`;
    });
    html += `</div>`;
  }

  // Units accordion
  html += `<div id="mikud-units">`;
  MIKUD_DATA.units.forEach(unit => {
    const isOpen = state.openUnit === unit.unit;
    const hasContent = unit.sections && unit.sections.length > 0;
    const charLabel = unit.charCount > 0 ? `${(unit.charCount/1000).toFixed(1)}K` : '—';
    
    html += `<div class="card" style="margin-bottom:8px;border-radius:10px;overflow:hidden;border:2px solid ${isOpen?'#0038b8':'#e2e8f0'}">
      <div onclick="window._mikudState.openUnit=${isOpen?'null':unit.unit};render()" 
        style="padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;background:${isOpen?'#0038b8':'#f8f9fa'};color:${isOpen?'white':'#333'}" 
        role="button" tabindex="0" aria-expanded="${isOpen}" aria-label="יחידה ${unit.unit}: ${unit.title}">
        <span style="font-size:18px;min-width:32px;text-align:center;font-weight:700">${unit.unit}</span>
        <span style="flex:1;font-weight:600">${unit.title}</span>
        <span style="font-size:13px;opacity:0.8">${unit.sections.length} סעיפים | ${charLabel}</span>
        <i class="fas fa-chevron-${isOpen?'up':'down'}"></i>
      </div>`;
    
    if (isOpen && hasContent) {
      html += `<div style="padding:16px;background:white;max-height:600px;overflow-y:auto">`;
      const searchLower = (state.searchTerm || '').trim();
      unit.sections.forEach((sec, idx) => {
        // Filter by search
        if (searchLower && !sec.header.includes(searchLower) && !sec.body.includes(searchLower)) return;
        
        const headerHtml = sec.header ? `<div style="font-weight:700;color:#0038b8;margin-bottom:4px;font-size:15px">${highlightSearch(sec.header, searchLower)}</div>` : '';
        const bodyHtml = sec.body ? `<div style="line-height:1.7;color:#333;white-space:pre-wrap;font-size:14px">${highlightSearch(sec.body.replace(/\\n/g, '\n'), searchLower)}</div>` : '';
        
        if (headerHtml || bodyHtml) {
          html += `<div style="border-bottom:1px solid #eee;padding:10px 0">${headerHtml}${bodyHtml}</div>`;
        }
      });
      html += `</div>`;
    } else if (isOpen && unit.note) {
      html += `<div style="padding:16px;background:white;color:#888;text-align:center"><i class="fas fa-info-circle"></i> ${unit.note}</div>`;
    }
    html += `</div>`;
  });
  html += `</div></div>`;
  return html;
}

function highlightSearch(text, term) {
  if (!term || term.length < 2) return text;
  try {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escaped, 'gi'), match => `<mark style="background:#fef08a;padding:0 2px;border-radius:2px">${match}</mark>`);
  } catch(e) { return text; }
}

window.CivicsFeatures = window.CivicsFeatures || {};
window.CivicsFeatures.filterMikud = function() { if(typeof render==='function') render(); };

// ===== NAVIGATION INTEGRATION =====
// These functions are called from the modified routing in app.js
function getPageRenderer(page, param) {
  switch(page) {
    case 'practice': return renderQuestionPractice(param);
    case 'question-list': return renderQuestionList();
    case 'timeline': return renderTimelinePage();
    case 'acronyms': return renderAcronymsPage();
    case 'tips': return renderTipsPage();
    case 'about': return renderAboutPage();
    case 'student-progress': return renderProgressDashboard();
    case 'mikud': return renderMikudPage();
    default: return null;
  }
}

// ===== PUBLIC API =====
window.CivicsFeatures = {
  loadOfficialQuestions,
  getPageRenderer,
  renderMikudPage,
  renderQuestionPractice,
  renderQuestionList,
  renderTimelinePage,
  renderAcronymsPage,
  renderTipsPage,
  renderAboutPage,
  renderProgressDashboard,
  goToQuestion,
  showPracticeHint,
  showPracticeAnswer,
  ratePractice,
  onAnswerInput,
  readQuestion,
  readAnswer,
  setTTSSpeed,
  stopTTS: stopTTSEnhanced,
  searchAcronyms,
  resetPracticeProgress,
  TIMELINE_EVENTS,
  ACRONYMS_DATA,
  GOLDEN_TIPS
};

// Auto-load questions
loadOfficialQuestions();

})();
