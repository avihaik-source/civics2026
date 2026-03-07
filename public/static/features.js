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

// ===== TEACHER GUIDE PAGE =====
let _tgOpenSections = {};

function toggleTeacherSection(sectionId) {
  _tgOpenSections[sectionId] = !_tgOpenSections[sectionId];
  const el = document.getElementById('tg-section-' + sectionId);
  const icon = document.getElementById('tg-icon-' + sectionId);
  if (el) {
    el.style.display = _tgOpenSections[sectionId] ? 'block' : 'none';
    if (icon) icon.className = _tgOpenSections[sectionId] ? 'fas fa-chevron-down' : 'fas fa-chevron-left';
  }
}

function expandAllTeacherSections() {
  document.querySelectorAll('[id^="tg-section-"]').forEach(el => {
    el.style.display = 'block';
    const key = el.id.replace('tg-section-', '');
    _tgOpenSections[key] = true;
  });
  document.querySelectorAll('[id^="tg-icon-"]').forEach(el => el.className = 'fas fa-chevron-down');
}

function collapseAllTeacherSections() {
  document.querySelectorAll('[id^="tg-section-"]').forEach(el => {
    el.style.display = 'none';
    const key = el.id.replace('tg-section-', '');
    _tgOpenSections[key] = false;
  });
  document.querySelectorAll('[id^="tg-icon-"]').forEach(el => el.className = 'fas fa-chevron-left');
}

function printTeacherGuide() {
  const content = document.getElementById('teacher-guide-content');
  if (!content) return;
  const w = window.open('', '_blank');
  w.document.write(`<html dir="rtl" lang="he"><head><title>מדריך למורה - אזרחות 2026</title>
  <style>
    body{font-family:Assistant,Rubik,sans-serif;padding:30px;direction:rtl;line-height:1.8;color:#1a1a2e}
    h1{color:#0038b8;border-bottom:3px solid #0038b8;padding-bottom:10px}
    h2{color:#0038b8;margin-top:30px;border-right:4px solid #0038b8;padding-right:12px}
    h3{color:#1a1a2e;margin-top:20px}
    .tg-section-content{display:block!important}
    table{border-collapse:collapse;width:100%;margin:16px 0}
    th,td{border:1px solid #ddd;padding:10px;text-align:right}
    th{background:#E8F0FE;font-weight:700}
    .tip-box{background:#FFF3CD;border:1px solid #FFC107;padding:12px;border-radius:8px;margin:12px 0}
    .important-box{background:#FFEBEE;border:1px solid #F44336;padding:12px;border-radius:8px;margin:12px 0}
    .success-box{background:#E8F5E9;border:1px solid #4CAF50;padding:12px;border-radius:8px;margin:12px 0}
    ul,ol{padding-right:24px}
    li{margin:6px 0}
    @media print{body{font-size:12pt}h1{font-size:18pt}h2{font-size:14pt}}
  </style></head><body>`);
  w.document.write(content.innerHTML);
  w.document.write('</body></html>');
  w.document.close();
  setTimeout(() => w.print(), 500);
}

function renderTeacherGuide() {
  const unitCount = typeof UNITS_DATA !== 'undefined' ? UNITS_DATA.length : 16;
  const questionCount = typeof getExamQuestions === 'function' ? getExamQuestions().length : 96;
  
  function section(id, icon, title, content, defaultOpen) {
    const isOpen = _tgOpenSections[id] !== undefined ? _tgOpenSections[id] : (defaultOpen || false);
    if (_tgOpenSections[id] === undefined && defaultOpen) _tgOpenSections[id] = true;
    return `
      <div class="tg-section">
        <button class="tg-section-header" onclick="window.CivicsFeatures.toggleTeacherSection('${id}')" aria-expanded="${isOpen}" aria-controls="tg-section-${id}">
          <span><i class="${icon}"></i> ${title}</span>
          <i id="tg-icon-${id}" class="fas fa-chevron-${isOpen ? 'down' : 'left'}"></i>
        </button>
        <div class="tg-section-content" id="tg-section-${id}" style="display:${isOpen ? 'block' : 'none'}">
          ${content}
        </div>
      </div>`;
  }

  let html = `<div class="teacher-guide-page" id="teacher-guide-content">
    <div class="tg-hero">
      <h1><i class="fas fa-chalkboard-teacher"></i> מדריך למורה — אזרחות 2026</h1>
      <p class="tg-subtitle">מדריך מקיף לשימוש בפלטפורמת ההכנה לבגרות בעל-פה באזרחות</p>
      <div class="tg-meta">
        <span><i class="fas fa-calendar"></i> עודכן: מרץ 2026</span>
        <span><i class="fas fa-book"></i> ${unitCount} יחידות לימוד</span>
        <span><i class="fas fa-question-circle"></i> ${questionCount} שאלות בגרות</span>
      </div>
      <div class="tg-actions">
        <button class="btn btn-primary" onclick="window.CivicsFeatures.expandAllTeacherSections()"><i class="fas fa-expand-arrows-alt"></i> פתח הכל</button>
        <button class="btn btn-secondary" onclick="window.CivicsFeatures.collapseAllTeacherSections()"><i class="fas fa-compress-arrows-alt"></i> סגור הכל</button>
        <button class="btn btn-success" onclick="window.CivicsFeatures.printTeacherGuide()"><i class="fas fa-print"></i> הדפסה</button>
      </div>
    </div>`;

  // ===== Section 1: Overview =====
  html += section('overview', 'fas fa-eye', 'סקירה כללית – מה זה אזרחות 2026?', `
    <div class="tg-body">
      <p><strong>אזרחות 2026</strong> היא פלטפורמה דיגיטלית אינטראקטיבית שנועדה להכין תלמידי תיכון לבחינת הבגרות <strong>בעל-פה</strong> באזרחות. הפלטפורמה מתאימה לתלמידי כיתות י'-י"ב, כולל תלמידים על הספקטרום האוטיסטי.</p>
      <div class="success-box">💡 <strong>יתרון מרכזי:</strong> הפלטפורמה משלבת חומר לימוד, תרגול, סימולציה, ומעקב התקדמות – הכל במקום אחד, עם נגישות מלאה.</div>
      <h3>מה כלול בפלטפורמה?</h3>
      <ul>
        <li>📚 <strong>${unitCount} יחידות לימוד</strong> – כל יחידה כוללת: סיכום, מושגי מפתח, שאלות תרגול, טבלאות השוואה, דוגמאות</li>
        <li>📝 <strong>${questionCount} שאלות בגרות אמיתיות</strong> – מתוך בחינות 2024-2026, מסווגות לפי יחידה</li>
        <li>🎯 <strong>סימולציית בחינה</strong> – חוויה מלאה של בחינת בגרות בעל-פה עם טיימר</li>
        <li>📊 <strong>דשבורד מורה</strong> – מעקב התקדמות לכל תלמיד עם ייצוא נתונים</li>
        <li>🧠 <strong>כלי עזר:</strong> ציר זמן, ראשי תיבות, כללי הזהב, תרגיל נשימה</li>
        <li>♿ <strong>נגישות מלאה:</strong> TTS (הקראה), מצב רגוע, גופן גדול, ניגודיות גבוהה</li>
      </ul>
    </div>`, true);

  // ===== Section 2: Getting Started =====
  html += section('getting-started', 'fas fa-play-circle', 'תחילת עבודה – איך מתחילים?', `
    <div class="tg-body">
      <h3>🔗 כניסה לאתר</h3>
      <p>הפלטפורמה זמינה בכתובת: <a href="https://civics2026.pages.dev" target="_blank" class="tg-link">https://civics2026.pages.dev</a></p>
      <p>אין צורך בהרשמה או התקנה – האתר עובד ישירות מהדפדפן.</p>
      
      <h3>📱 הנחיות לתלמידים – שלב ראשון</h3>
      <ol>
        <li>פתחו את הדפדפן והקלידו את כתובת האתר</li>
        <li>בחלון שייפתח, הזינו <strong>שם מלא</strong> (חשוב למעקב ההתקדמות)</li>
        <li>התחילו מ<strong>דף הבית</strong> ולחצו על יחידה 1</li>
        <li>עברו על ה<strong>סיכום</strong>, ואז על <strong>מושגי המפתח</strong></li>
        <li>עברו לטאב <strong>"שאלות"</strong> כדי לתרגל</li>
      </ol>
      
      <div class="tip-box">💡 <strong>טיפ:</strong> מומלץ שהתלמידים יוסיפו את האתר ל"מסך הבית" בטלפון כדי לגשת בקלות.</div>
      
      <h3>🔐 כניסה לדשבורד מורה</h3>
      <ol>
        <li>בתפריט הצד, לחצו על <strong>"דשבורד מורה"</strong></li>
        <li>הזינו את הסיסמה (ברירת מחדל: <code>1234</code>)</li>
        <li>לאחר הכניסה, תוכלו לשנות את הסיסמה</li>
      </ol>
      <div class="important-box">⚠️ <strong>חשוב:</strong> שנו את הסיסמה מיד לאחר הכניסה הראשונה כדי למנוע גישה לא מורשית.</div>
    </div>`);

  // ===== Section 3: Platform Structure =====
  html += section('structure', 'fas fa-sitemap', 'מבנה הפלטפורמה – עמודים ותכונות', `
    <div class="tg-body">
      <table class="tg-table">
        <thead>
          <tr><th>עמוד</th><th>כתובת</th><th>תיאור</th><th>שימוש מומלץ</th></tr>
        </thead>
        <tbody>
          <tr><td>🏠 דף הבית</td><td>#</td><td>סקירת כל היחידות עם אחוזי התקדמות</td><td>מבט כללי, בחירת יחידה</td></tr>
          <tr><td>📚 יחידת לימוד</td><td>#unit/1-16</td><td>סיכום, מושגים, שאלות, דוגמאות</td><td>לימוד שוטף בכיתה/בבית</td></tr>
          <tr><td>📝 שאלות בגרות</td><td>#questions</td><td>כל 96 השאלות עם סינון לפי יחידה ומבחן</td><td>סקירת שאלות</td></tr>
          <tr><td>✏️ תרגול שאלות</td><td>#question-list</td><td>תרגול אינטראקטיבי עם רמזים ותשובות</td><td>תרגול עצמאי / שיעורי בית</td></tr>
          <tr><td>🎯 סימולציית בחינה</td><td>#exam-sim</td><td>סימולציה מלאה עם הגרלת שאלות וטיימר</td><td>הכנה סופית לפני הבחינה</td></tr>
          <tr><td>⏳ ציר זמן</td><td>#timeline</td><td>אירועים מרכזיים 1897-1948</td><td>חזרה על רקע היסטורי</td></tr>
          <tr><td>📖 ראשי תיבות</td><td>#acronyms</td><td>מילון ראשי תיבות באזרחות</td><td>עזר לשינון מהיר</td></tr>
          <tr><td>⭐ כללי הזהב</td><td>#tips</td><td>7 טיפים מנצחים לבחינה בע"פ</td><td>הנחיות לפני הבחינה</td></tr>
          <tr><td>📖 חומר מיקוד</td><td>#mikud</td><td>תוכן מיקוד מלא ב-16 יחידות</td><td>חזרה מעמיקה</td></tr>
          <tr><td>📊 ההתקדמות שלי</td><td>#student-progress</td><td>דשבורד אישי לתלמיד</td><td>מעקב עצמי</td></tr>
          <tr><td>📊 דשבורד מורה</td><td>#dashboard</td><td>מעקב התקדמות כל התלמידים</td><td>ניהול כיתה</td></tr>
          <tr><td>🧘 תרגיל נשימה</td><td>#breathing</td><td>תרגיל נשימה 4-7-8 להרגעה</td><td>לפני בחינה / מצב לחץ</td></tr>
          <tr><td>📖 מדריך למורה</td><td>#teacher-guide</td><td>המדריך הנוכחי</td><td>הנחיות לשימוש</td></tr>
        </tbody>
      </table>
    </div>`);

  // ===== Section 4: Teaching Methods =====
  html += section('teaching', 'fas fa-graduation-cap', 'שיטות הוראה מומלצות', `
    <div class="tg-body">
      <h3>🎯 מתכונת שיעור 45 דקות</h3>
      <p>ניתן להשתמש ב<strong>מחולל מתווה השיעור</strong> (בדשבורד מורה) ליצירת מתווה אוטומטי, או להשתמש במבנה הבא:</p>
      <table class="tg-table">
        <thead><tr><th>שלב</th><th>זמן</th><th>פעילות</th><th>שימוש בפלטפורמה</th></tr></thead>
        <tbody>
          <tr><td>1. פתיחה</td><td>7 דק'</td><td>סקירה + שאלה מנחה</td><td>הצגת סיכום היחידה על המסך</td></tr>
          <tr><td>2. הקנייה</td><td>12 דק'</td><td>הצגת מושגים חדשים</td><td>עבודה עם טאב "למד" - מושגי מפתח</td></tr>
          <tr><td>3. תרגול</td><td>18 דק'</td><td>תרגול שאלות בגרות</td><td>טאב "שאלות" + פיגומים</td></tr>
          <tr><td>4. סיכום</td><td>8 דק'</td><td>חזרה + שאלה מסכמת</td><td>טבלת השוואה / ציר זמן</td></tr>
        </tbody>
      </table>

      <h3>📋 תרחישי שימוש בכיתה</h3>
      <div class="tg-scenario">
        <h4>🔹 תרחיש א': שיעור פרונטלי עם הקרנה</h4>
        <ul>
          <li>הקרינו את העמוד על הלוח החכם</li>
          <li>עברו על סיכום היחידה יחד עם הכיתה</li>
          <li>הציגו את מושגי המפתח אחד-אחד</li>
          <li>בקשו מתלמידים לענות בעל-פה על שאלות מהטאב</li>
        </ul>
      </div>
      <div class="tg-scenario">
        <h4>🔹 תרחיש ב': עבודה עצמאית בכיתת מחשבים</h4>
        <ul>
          <li>כל תלמיד פותח את האתר במחשב / בטלפון</li>
          <li>תנו משימה: "עברו על יחידה X, ענו על 3 שאלות"</li>
          <li>השתמשו בדשבורד מורה לבדיקת התקדמות בזמן אמת</li>
          <li>לסיום – דיון כיתתי על שאלה מרכזית</li>
        </ul>
      </div>
      <div class="tg-scenario">
        <h4>🔹 תרחיש ג': שיעורי בית ולמידה עצמאית</h4>
        <ul>
          <li>תנו משימה: "השלימו יחידה X עד 100%"</li>
          <li>בדקו בדשבורד מורה שהתלמידים השלימו</li>
          <li>בשיעור הבא, דונו בשאלות שהתקשו בהן</li>
        </ul>
      </div>

      <h3>🧩 עבודה עם הפיגומים (Scaffolding)</h3>
      <p>מערכת הפיגומים מדריכה תלמידים בבניית תשובה איכותית:</p>
      <ol>
        <li><strong>רמה 1 – פירוק השאלה:</strong> רשימת בדיקה של מה צריך לכלול בתשובה</li>
        <li><strong>רמה 2 – תבנית מובנית:</strong> מבנה כתיבה מוכן למילוי</li>
        <li><strong>רמה 3 – דוגמת תשובה:</strong> תשובה לדוגמה מלאה</li>
      </ol>
      <div class="tip-box">💡 <strong>טיפ:</strong> עודדו תלמידים להשתמש ברמה 1 בלבד ולנסות לבנות תשובה עצמאית לפני שצופים בדוגמה.</div>
    </div>`);

  // ===== Section 5: Exam Preparation =====
  html += section('exam-prep', 'fas fa-clipboard-check', 'הכנה לבחינה – לוח זמנים מומלץ', `
    <div class="tg-body">
      <h3>📅 תכנית הכנה ב-4 שבועות</h3>
      <table class="tg-table">
        <thead><tr><th>שבוע</th><th>מטרה</th><th>פעילות</th><th>יעד התקדמות</th></tr></thead>
        <tbody>
          <tr><td><strong>שבוע 1</strong></td><td>יסודות</td><td>יחידות 1-4: סיכום + מושגים + 2 שאלות ליחידה</td><td>25%</td></tr>
          <tr><td><strong>שבוע 2</strong></td><td>דמוקרטיה</td><td>יחידות 5-9: סיכום + מושגים + 3 שאלות ליחידה</td><td>50%</td></tr>
          <tr><td><strong>שבוע 3</strong></td><td>מוסדות ושלטון</td><td>יחידות 10-12: סיכום + כל השאלות</td><td>75%</td></tr>
          <tr><td><strong>שבוע 4</strong></td><td>חזרה וסימולציה</td><td>סימולציות בחינה + חזרה ממוקדת על חולשות</td><td>100%</td></tr>
        </tbody>
      </table>

      <h3>🎯 הכנה אינטנסיבית – שבוע לפני הבחינה</h3>
      <table class="tg-table">
        <thead><tr><th>יום</th><th>פעילות</th><th>כלי בפלטפורמה</th></tr></thead>
        <tbody>
          <tr><td>ראשון</td><td>חזרה על יחידות 1-4</td><td>טאב "למד" + מושגי מפתח</td></tr>
          <tr><td>שני</td><td>חזרה על יחידות 5-8</td><td>שאלות תרגול + פיגומים</td></tr>
          <tr><td>שלישי</td><td>חזרה על יחידות 9-12</td><td>טבלאות השוואה + דוגמאות</td></tr>
          <tr><td>רביעי</td><td>סימולציית בחינה #1</td><td>סימולציית בחינה + טיימר</td></tr>
          <tr><td>חמישי</td><td>סימולציית בחינה #2 + חזרה</td><td>סימולציה + חומר מיקוד</td></tr>
          <tr><td>שישי</td><td>חזרה קלה + 7 כללי הזהב</td><td>טיפים + תרגיל נשימה</td></tr>
          <tr><td>שבת</td><td>מנוחה + תרגיל נשימה</td><td>תרגיל נשימה 4-7-8</td></tr>
        </tbody>
      </table>

      <div class="success-box">✅ <strong>מטרה:</strong> תלמיד שעבד על כל 96 השאלות וביצע לפחות 3 סימולציות מלאות – מוכן לבחינה!</div>
    </div>`);

  // ===== Section 6: Dashboard Guide =====
  html += section('dashboard-guide', 'fas fa-tachometer-alt', 'שימוש בדשבורד מורה', `
    <div class="tg-body">
      <h3>📊 מה מציג הדשבורד?</h3>
      <ul>
        <li><strong>מספר תלמידים מסונכרנים</strong> – כל מי שהזין שם ועבד לפחות פעם</li>
        <li><strong>ממוצע התקדמות</strong> – אחוז ממוצע מתוך כל היחידות</li>
        <li><strong>סה"כ תשובות</strong> – מספר תשובות שנכתבו</li>
        <li><strong>טבלת תלמידים</strong> – כל תלמיד עם פירוט מלא</li>
      </ul>

      <h3>🔍 מה לחפש?</h3>
      <table class="tg-table">
        <thead><tr><th>סימן</th><th>משמעות</th><th>פעולה מומלצת</th></tr></thead>
        <tbody>
          <tr><td>🟢 התקדמות 70%+</td><td>תלמיד עובד היטב</td><td>עידוד, סימולציות</td></tr>
          <tr><td>🟡 התקדמות 30-69%</td><td>תלמיד בתהליך</td><td>בדיקה שעובד על כל היחידות</td></tr>
          <tr><td>🔴 התקדמות מתחת ל-30%</td><td>צריך תשומת לב</td><td>שיחה אישית, התאמת משימות</td></tr>
          <tr><td>😟 מצב רוח "לחוץ"</td><td>תלמיד בלחץ</td><td>הכוונה לתרגיל נשימה, הפחתת עומס</td></tr>
          <tr><td>📝 0 תשובות</td><td>תלמיד לא מתרגל</td><td>שיחה + משימות ממוקדות</td></tr>
        </tbody>
      </table>

      <h3>📤 ייצוא נתונים</h3>
      <p>לחצו <strong>"ייצוא כל התלמידים"</strong> כדי להוריד קובץ JSON עם כל הנתונים. קובץ זה כולל:</p>
      <ul>
        <li>שם כל תלמיד + תאריך עדכון אחרון</li>
        <li>התקדמות לפי יחידה (צ'קליסט)</li>
        <li>תשובות שנכתבו לכל שאלה</li>
        <li>מצב רוח לכל יחידה</li>
        <li>פתקים והדגשות</li>
      </ul>

      <h3>📋 תכנון שיעור</h3>
      <p>מחולל מתווה השיעור בדשבורד יוצר מתווה מובנה של 45 דקות ב-4 שלבים:</p>
      <ol>
        <li>בחרו יחידה מהרשימה</li>
        <li>לחצו <strong>"צור מתווה שיעור"</strong></li>
        <li>המתווה יכלול: פתיחה, הקנייה, תרגול, סיכום</li>
        <li>לחצו <strong>"הדפס"</strong> כדי לקבל עותק להדפסה</li>
      </ol>
    </div>`);

  // ===== Section 7: Accessibility =====
  html += section('accessibility', 'fas fa-universal-access', 'נגישות והתאמות לתלמידים על הספקטרום', `
    <div class="tg-body">
      <h3>♿ תכונות נגישות מובנות</h3>
      <table class="tg-table">
        <thead><tr><th>תכונה</th><th>מה עושה</th><th>איך מפעילים</th></tr></thead>
        <tbody>
          <tr><td>🔊 הקראה (TTS)</td><td>קורא בקול כל טקסט</td><td>לחצן 🔊 ליד כל קטע</td></tr>
          <tr><td>🅰️ גודל גופן</td><td>מגדיל את הטקסט</td><td>כפתור נגישות (♿) > גודל גופן</td></tr>
          <tr><td>🌓 ניגודיות גבוהה</td><td>רקע כהה + טקסט בהיר</td><td>כפתור נגישות > ניגודיות</td></tr>
          <tr><td>🧘 מצב רגוע</td><td>מפחית אנימציות וצבעים</td><td>כפתור נגישות > מצב רגוע</td></tr>
          <tr><td>🖼️ הסתרת תמונות</td><td>מסיר תמונות מוסחות</td><td>כפתור נגישות > הסתר תמונות</td></tr>
          <tr><td>⏸️ הפסקה</td><td>הקפאת כל הטיימרים ומעבר למסך רגוע</td><td>כפתור ⏸️ (תמיד נראה)</td></tr>
          <tr><td>🧠 תרגיל נשימה</td><td>טכניקת 4-7-8 להרגעה</td><td>תפריט > תרגיל נשימה</td></tr>
          <tr><td>⌨️ ניווט מקלדת</td><td>ניווט מלא ללא עכבר</td><td>Tab, Enter, Escape</td></tr>
        </tbody>
      </table>

      <h3>🎯 המלצות לתלמידים על הספקטרום</h3>
      <ul>
        <li><strong>הפעילו מצב רגוע</strong> – מפחית גירויים חזותיים</li>
        <li><strong>השתמשו בטיימר</strong> – מסייע למיקוד (פומודורו 25 דק')</li>
        <li><strong>למדו בחלקים קטנים</strong> – יחידה אחת בכל פעם, עם הפסקות</li>
        <li><strong>השתמשו בפיגומים</strong> – מבנה ברור עוזר לתלמידים שצריכים מסגרת</li>
        <li><strong>תרגיל נשימה לפני בחינה</strong> – 3-4 סבבים של 4-7-8</li>
      </ul>

      <div class="important-box">⚠️ <strong>שימו לב:</strong> הודעות קוליות (TTS) עלולות להפריע בכיתה. ודאו שתלמידים משתמשים באוזניות.</div>
    </div>`);

  // ===== Section 8: Curriculum Mapping =====
  html += section('curriculum', 'fas fa-map', 'מיפוי תכנית הלימודים', `
    <div class="tg-body">
      <h3>📋 יחידות הלימוד וחלוקה לשלבים</h3>
      <table class="tg-table">
        <thead><tr><th>שלב</th><th>יחידות</th><th>נושאים מרכזיים</th><th>שעות מומלצות</th></tr></thead>
        <tbody>
          <tr><td>שלב א' – יסודות</td><td>1-6</td><td>רקע היסטורי, הכרזת העצמאות, לאום, יהודית, מיעוטים, תפוצות</td><td>12 שעות</td></tr>
          <tr><td>שלב ב' – דמוקרטיה</td><td>7-10</td><td>עקרונות דמוקרטיה, זכויות, חוקי יסוד, כלכלה-חברה</td><td>10 שעות</td></tr>
          <tr><td>שלב ג' – מוסדות</td><td>11-13</td><td>שלוש רשויות, פיקוח, בחירות</td><td>8 שעות</td></tr>
          <tr><td>שלב ד' – חברה</td><td>14-16</td><td>תקשורת, מעורבות, אינטגרציה</td><td>6 שעות</td></tr>
        </tbody>
      </table>

      <div class="important-box">⚠️ <strong>שימו לב:</strong> יחידות 13-15 מסומנות כ"לא במיקוד תשפ"ז". ודאו מול המסמך הרשמי לפני ההוראה.</div>

      <h3>📊 חלוקת שאלות בגרות לפי יחידה</h3>
      <p>ניתן לראות כמה שאלות בגרות שייכות לכל יחידה בטאב <strong>"שאלות בגרות"</strong> בעמוד הראשי. מומלץ להתמקד ביחידות עם הכי הרבה שאלות.</p>
    </div>`);

  // ===== Section 9: Troubleshooting =====
  html += section('troubleshooting', 'fas fa-tools', 'פתרון בעיות נפוצות', `
    <div class="tg-body">
      <table class="tg-table">
        <thead><tr><th>בעיה</th><th>סיבה אפשרית</th><th>פתרון</th></tr></thead>
        <tbody>
          <tr><td>האתר לא נטען</td><td>בעיית רשת / קאש</td><td>נסו Ctrl+Shift+R לרענון מלא</td></tr>
          <tr><td>ההתקדמות לא נשמרת</td><td>localStorage מלא או חסום</td><td>ודאו שקוקיז מופעלים בדפדפן</td></tr>
          <tr><td>דשבורד ריק</td><td>תלמידים לא הזינו שם</td><td>בקשו מתלמידים להזין שם ולרענן</td></tr>
          <tr><td>הקראה לא עובדת</td><td>TTS לא נתמך בדפדפן</td><td>השתמשו ב-Chrome או Edge</td></tr>
          <tr><td>שאלות לא מופיעות</td><td>קובץ שאלות לא נטען</td><td>רעננו את הדף. אם לא עוזר – בדקו קונסול</td></tr>
          <tr><td>גופן קטן מדי</td><td>ברירת מחדל של הדפדפן</td><td>כפתור ♿ > גודל גופן > גדול</td></tr>
          <tr><td>נתונים לא מסתנכרנים</td><td>בעיית חיבור לשרת</td><td>בדקו חיבור אינטרנט + רעננו דשבורד</td></tr>
        </tbody>
      </table>

      <h3>📞 תמיכה טכנית</h3>
      <p>לבעיות שלא נפתרות, פנו למנהל הפרויקט:</p>
      <ul>
        <li>📧 דרך מנהל מערכת בית הספר</li>
        <li>🔗 GitHub: <a href="https://github.com/avihaik-source/civics2026" target="_blank" class="tg-link">github.com/avihaik-source/civics2026</a></li>
      </ul>
    </div>`);

  // ===== Section 10: Quick Reference =====
  html += section('quick-ref', 'fas fa-bookmark', 'כרטיס עזר מהיר (להדפסה)', `
    <div class="tg-body tg-quick-ref">
      <div class="tg-ref-grid">
        <div class="tg-ref-card">
          <h4>🔗 כתובות חשובות</h4>
          <ul>
            <li><strong>אתר:</strong> <a href="https://civics2026.pages.dev" target="_blank" class="tg-link">civics2026.pages.dev</a></li>
            <li><strong>שאלות:</strong> civics2026.pages.dev/#questions</li>
            <li><strong>תרגול:</strong> civics2026.pages.dev/#question-list</li>
            <li><strong>דשבורד:</strong> civics2026.pages.dev/#dashboard</li>
          </ul>
        </div>
        <div class="tg-ref-card">
          <h4>⌨️ קיצורי מקלדת</h4>
          <ul>
            <li><code>Alt+P</code> – הפסקה / המשך</li>
            <li><code>Alt+A</code> – נגישות</li>
            <li><code>Escape</code> – סגור תפריט / פאנל</li>
            <li><code>Tab</code> – ניווט בין אלמנטים</li>
          </ul>
        </div>
        <div class="tg-ref-card">
          <h4>📊 נתוני הפלטפורמה</h4>
          <ul>
            <li><strong>${unitCount}</strong> יחידות לימוד</li>
            <li><strong>${questionCount}</strong> שאלות בגרות</li>
            <li><strong>63</strong> שאלות תרגול</li>
            <li><strong>248</strong> מושגי מפתח</li>
          </ul>
        </div>
        <div class="tg-ref-card">
          <h4>🎯 טיפים לתלמידים</h4>
          <ul>
            <li>התחילו ביחידות 1-4</li>
            <li>ענו על שאלות <strong>בכתב</strong></li>
            <li>השתמשו בפיגומים</li>
            <li>עשו סימולציה לפני בחינה</li>
          </ul>
        </div>
      </div>
    </div>`);

  html += `</div>`;
  return html;
}

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
    case 'teacher-guide': return renderTeacherGuide();
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
  renderTeacherGuide,
  toggleTeacherSection,
  expandAllTeacherSections,
  collapseAllTeacherSections,
  printTeacherGuide,
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
