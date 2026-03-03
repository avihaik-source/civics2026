// ===== CIVICS 2026 - MAIN APPLICATION (Universal Accessibility Edition) =====
(function() {
'use strict';

// ===== SKIP LINK (injected before app mounts) =====
(function injectSkipLink() {
  if (document.getElementById('skip-link')) return;
  const skip = document.createElement('a');
  skip.id = 'skip-link';
  skip.href = '#main-content';
  skip.className = 'skip-link';
  skip.textContent = 'דלג לתוכן הראשי';
  document.body.prepend(skip);
})();

// ===== ACCESSIBILITY STATE =====
const A11Y = {
  theme: 'light',        // light, dark, soft
  fontSize: 100,          // 100-200 %
  fontType: 'sans',       // sans, serif, mono
  quietMode: false,       // mute all sounds/animations
  paused: false,          // pause button active
  hideTimers: false,      // hide timer elements
  hideImages: false,      // hide decorative images
  reducedMotion: false,   // reduce animations
  ttsEnabled: false,      // text-to-speech
  chunkSize: 5,           // concepts per page (7±2 rule)
  chunkPage: {},          // unitId -> current chunk page
  studyMatPage: {},       // unitId -> current study material page
  scaffoldLevel: 'original', // original, simplified, template, settings
  scaffoldDefault: 'original', // default scaffold level
  minimalMode: false, // sensory overload protection
  supportLevel: 2, // 1=minimal, 2=medium(default), 3=maximal
  dualViewOpen: {}, // per-question dual view state: qId -> bool
  viewMode: {}, // per-question: 'a'=original, 'b'=side-by-side, 'c'=explanation-only
  contrast: 'normal' // low, normal, high
};

// ===== OFFLINE / NETWORK STATE =====
let _isOnline = navigator.onLine;
let _offlineEl = null;
function setupOfflineDetection() {
  window.addEventListener('online', () => { _isOnline = true; hideOfflineIndicator(); debouncedSync(); });
  window.addEventListener('offline', () => { _isOnline = false; showOfflineIndicator(); });
}
function showOfflineIndicator() {
  if (!_offlineEl) {
    _offlineEl = document.createElement('div');
    _offlineEl.className = 'offline-indicator';
    _offlineEl.setAttribute('role', 'alert');
    _offlineEl.innerHTML = '<i class="fas fa-wifi-slash"></i> <span>אין חיבור לאינטרנט – הנתונים נשמרים מקומית</span> <button class="btn-retry" onclick="window.CivicsApp.retryConnection()">נסה שוב</button>';
    document.body.appendChild(_offlineEl);
  }
  setTimeout(() => _offlineEl.classList.add('visible'), 50);
}
function hideOfflineIndicator() {
  if (_offlineEl) { _offlineEl.classList.remove('visible'); }
}
function retryConnection() {
  if (navigator.onLine) { _isOnline = true; hideOfflineIndicator(); debouncedSync(); announceToSR('החיבור חזר!'); }
  else { announceToSR('עדיין אין חיבור'); }
}

// ===== SCAFFOLD PROGRESS STATE (per-question checklist) =====
const SCAFFOLD_PROGRESS = {}; // qId -> { checks: [bool], templateFills: {stepIdx: text} }
function loadScaffoldProgress() {
  try {
    const s = localStorage.getItem('civics2026_scaffold_progress');
    if (s) Object.assign(SCAFFOLD_PROGRESS, JSON.parse(s));
  } catch(e) {}
}
function saveScaffoldProgress() {
  try { localStorage.setItem('civics2026_scaffold_progress', JSON.stringify(SCAFFOLD_PROGRESS)); } catch(e) {}
}
function getScaffoldProg(qId) {
  if (!SCAFFOLD_PROGRESS[qId]) SCAFFOLD_PROGRESS[qId] = { checks: [], templateFills: {} };
  return SCAFFOLD_PROGRESS[qId];
}

// ===== SCAFFOLDING LEVELS LOOKUP =====
// Finds the best matching scaffolding topic data for a question
function findScaffoldingLevel(q) {
  if (typeof SCAFFOLDING_LEVELS === 'undefined') return null;
  // Try each unitId the question belongs to
  for (const uid of q.unitIds) {
    const topics = SCAFFOLDING_LEVELS[uid];
    if (!topics || !topics.length) continue;
    // Try to match by question text containing the topic name
    const qText = (q.question + ' ' + (q.passage || '')).toLowerCase();
    for (const tp of topics) {
      if (qText.includes(tp.t.toLowerCase()) || tp.t.toLowerCase().includes(qText.substring(0, 20).toLowerCase())) {
        return tp;
      }
    }
    // Fallback: return first topic for that unit
    return topics[0];
  }
  return null;
}

// ===== CHUNKED DESCRIPTION HELPER (Cognitive Load Reduction) =====
// Based on Sweller (1988) Cognitive Load Theory & Miller (1956) 7±2 chunking
// Converts comma-separated descriptions to visual bullet lists
function chunkDesc(desc, mode) {
  if (!desc) return '';
  const parts = desc.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    // Single item - no need to chunk
    return mode === 'card'
      ? `<div class="unit-desc">${desc}</div>`
      : `<div class="unit-subtitle">${desc}</div>`;
  }
  const cls = mode === 'card' ? 'unit-desc chunked' : 'unit-subtitle chunked';
  const items = parts.map(p => `<li>${p}</li>`).join('');
  return `<ul class="${cls}" dir="rtl">${items}</ul>`;
}

// ===== PERSONAL NOTES STATE =====
const NOTES = {};

// ===== STATE =====
const STATE = {
  currentPage: 'home',
  currentUnit: null,
  currentTab: 'learn',
  studentId: '',
  studentName: '',
  studentGrade: '',
  progress: {},    // unitId -> { checklist: [], answers: {}, mood: '', completed: false }
  timerActive: false,
  timerPhase: 0,
  timerRemaining: 0,
  timerInterval: null,
  sidebarOpen: false,
  examSim: null,
  teacherAuth: false,
  teacherPassword: null,
  teacherStudents: [],
  teacherLoading: false,
  syncStatus: 'idle',
  autoSaveInterval: null,
  breathingActive: false,
  dailyGoal: 2,
  dailyCompleted: 0,
  dailyGoalDate: '',
  studyStartTime: null,
  breakReminderShown: false,
  sessionMinutes: 0,
  lastTransitionPage: null
};

const PHASES = [
  { name: '\u05D7\u05D6\u05E8\u05D4 \u05D5\u05E7\u05D9\u05E9\u05D5\u05E8', duration: 7*60 },
  { name: '\u05D4\u05E7\u05E0\u05D9\u05D4', duration: 10*60 },
  { name: '\u05EA\u05E8\u05D2\u05D5\u05DC', duration: 20*60 },
  { name: '\u05E1\u05D9\u05DB\u05D5\u05DD', duration: 8*60 }
];

const EXAM_PHASES = [
  { name: '\u05E7\u05E8\u05D9\u05D0\u05EA \u05D4\u05D7\u05D5\u05DE\u05E8', duration: 10*60, cls: 'reading' },
  { name: '\u05DB\u05EA\u05D9\u05D1\u05EA \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA', duration: 30*60, cls: 'writing' },
  { name: '\u05DE\u05E2\u05E0\u05D4 \u05D1\u05E2\u05DC-\u05E4\u05D4', duration: 10*60, cls: 'speaking' }
];

// ===== STUDENT ID =====
function getOrCreateStudentId() {
  let id = localStorage.getItem('civics2026_studentId');
  if (!id) {
    id = 'stu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('civics2026_studentId', id);
  }
  return id;
}

// ===== ACCESSIBILITY FUNCTIONS =====
function loadA11ySettings() {
  try {
    const saved = localStorage.getItem('civics2026_a11y');
    if (saved) {
      const d = JSON.parse(saved);
      Object.assign(A11Y, d);
    }
  } catch(e) {}
  // Check system preference for reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    A11Y.reducedMotion = true;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('civics2026_a11y')) {
    A11Y.theme = 'dark';
  }
  applyA11ySettings();
}

function saveA11ySettings() {
  try {
    localStorage.setItem('civics2026_a11y', JSON.stringify(A11Y));
  } catch(e) {}
}

function applyA11ySettings() {
  const root = document.documentElement;
  // Theme
  root.setAttribute('data-theme', A11Y.theme);
  // Font size
  root.style.fontSize = A11Y.fontSize + '%';
  // Font type
  const fontMap = { sans: "'Assistant','Open Sans',Arial,sans-serif", serif: "'David Libre','Times New Roman',serif", mono: "'Courier New',monospace" };
  document.body.style.fontFamily = fontMap[A11Y.fontType] || fontMap.sans;
  // Reduced motion
  if (A11Y.reducedMotion || A11Y.quietMode) {
    root.classList.add('reduced-motion');
  } else {
    root.classList.remove('reduced-motion');
  }
  // Quiet mode
  if (A11Y.quietMode) {
    root.classList.add('quiet-mode');
  } else {
    root.classList.remove('quiet-mode');
  }
  // Minimal mode
  root.classList.toggle('minimal-mode', !!A11Y.minimalMode);
  // Hide images mode
  root.classList.toggle('hide-images', !!A11Y.hideImages);
  // Contrast level
  root.setAttribute('data-contrast', A11Y.contrast === 'normal' ? '' : (A11Y.contrast || ''));
}

function toggleHideImages() {
  A11Y.hideImages = !A11Y.hideImages;
  applyA11ySettings();
  saveA11ySettings();
  render();
  announceToSR(A11Y.hideImages ? 'תמונות הוסתרו' : 'תמונות מוצגות');
}

function setTheme(theme) {
  A11Y.theme = theme;
  applyA11ySettings();
  saveA11ySettings();
  render();
}

function setFontSize(size) {
  A11Y.fontSize = Math.max(100, Math.min(200, size));
  applyA11ySettings();
  saveA11ySettings();
  const el = document.getElementById('font-size-val');
  if (el) el.textContent = A11Y.fontSize + '%';
}

function setFontType(type) {
  A11Y.fontType = type;
  applyA11ySettings();
  saveA11ySettings();
  render();
}

function setContrast(level) {
  A11Y.contrast = level; // 'low', 'normal', 'high'
  document.documentElement.setAttribute('data-contrast', level === 'normal' ? '' : level);
  saveA11ySettings();
  render();
  announceToSR(level === 'high' ? 'ניגודיות גבוהה' : level === 'low' ? 'ניגודיות נמוכה' : 'ניגודיות רגילה');
}

function toggleTTS() {
  A11Y.ttsEnabled = !A11Y.ttsEnabled;
  saveA11ySettings();
  render();
}

function speakText(text) {
  if (!A11Y.ttsEnabled || A11Y.quietMode) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/<[^>]*>/g,'').replace(/[\u200f\u200e]/g,'').trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'he-IL'; u.rate = 0.85; u.pitch = 1.0;
  // Try to find Hebrew voice
  const voices = window.speechSynthesis.getVoices();
  const heVoice = voices.find(v => v.lang.startsWith('he'));
  if (heVoice) u.voice = heVoice;
  window.speechSynthesis.speak(u);
}

// TTS button builder helper - inserts inline TTS buttons
function ttsBtn(text, label) {
  if (!A11Y.ttsEnabled) return '';
  const safeText = String(text).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
  return `<button class="btn-tts-inline" onclick="window.CivicsApp.speakText('${safeText}')" title="הקראה: ${label || ''}" aria-label="הקרא ${label || 'טקסט'}"><i class="fas fa-volume-up"></i></button>`;
}

function stopTTS() {
  window.speechSynthesis.cancel();
}

function setScaffoldLevel(level) {
  A11Y.scaffoldLevel = level;
  saveA11ySettings();
  render();
  const names = {original: 'נוסח מקורי', simplified: 'הסבר מפושט', template: 'תבנית תשובה', settings: 'הגדרות'};
  announceToSR('רמת תמיכה: ' + (names[level] || level));
  // Focus the scaffold guide panel
  setTimeout(() => {
    const guide = document.querySelector('.scaffold-guide');
    if (guide) guide.focus();
  }, 100);
}

// ===== MINIMAL MODE (Sensory Overload Protection) =====
function toggleMinimalMode() {
  A11Y.minimalMode = !A11Y.minimalMode;
  document.documentElement.classList.toggle('minimal-mode', A11Y.minimalMode);
  saveA11ySettings();
  render();
  announceToSR(A11Y.minimalMode ? 'מצב מינימלי הופעל - הוסרו עיטורים' : 'מצב מינימלי כובה');
}

// ===== DUAL VIEW TOGGLE (Mode A ↔ B per question) =====
function toggleDualView(qId) {
  // Per-question toggle: open/close the explanation panel
  if (!A11Y.dualViewOpen) A11Y.dualViewOpen = {};
  A11Y.dualViewOpen[qId] = !A11Y.dualViewOpen[qId];
  saveA11ySettings();
  render();
  const isOpen = A11Y.dualViewOpen[qId];
  announceToSR(isOpen ? 'הסבר מפושט מוצג' : 'הסבר מפושט הוסתר');
  setTimeout(() => {
    const panel = document.getElementById('scaffold-panel-' + qId);
    if (panel && isOpen) panel.focus();
  }, 120);
}

// ===== VIEW MODE (Mode A / B / C per question) =====
function setViewMode(qId, mode) {
  if (!A11Y.viewMode) A11Y.viewMode = {};
  A11Y.viewMode[qId] = mode;
  // Also sync with dualViewOpen for backwards compat
  if (mode === 'b' || mode === 'c') {
    A11Y.dualViewOpen[qId] = true;
  } else {
    A11Y.dualViewOpen[qId] = false;
  }
  saveA11ySettings();
  render();
  const names = { a: 'שאלה מקורית בלבד', b: 'תצוגה כפולה', c: 'הסבר בלבד' };
  announceToSR('מצב תצוגה: ' + (names[mode] || mode));
}

function getViewMode(qId) {
  if (A11Y.supportLevel === 1) return 'a';
  if (A11Y.supportLevel === 3) return A11Y.viewMode?.[qId] || 'b';
  return isDualViewOpen(qId) ? (A11Y.viewMode?.[qId] || 'b') : 'a';
}

function isDualViewOpen(qId) {
  // Level 3 always open; Level 1 always closed; Level 2 per toggle
  if (A11Y.supportLevel === 3) return true;
  if (A11Y.supportLevel === 1) return false;
  return !!(A11Y.dualViewOpen && A11Y.dualViewOpen[qId]);
}

// ===== SUPPORT LEVEL (1=minimal, 2=medium, 3=maximal) =====
function setSupportLevel(level) {
  A11Y.supportLevel = Math.max(1, Math.min(3, parseInt(level)));
  saveA11ySettings();
  render();
  const names = {1: 'מינימלי – נוסח מקורי בלבד', 2: 'בינוני – נוסח + הסבר (ברירת מחדל)', 3: 'מקסימלי – תצוגה כפולה תמידית + תבניות'};
  announceToSR('רמת תמיכה: ' + (names[A11Y.supportLevel] || ''));
}

function setScaffoldDefault(level) {
  A11Y.scaffoldDefault = level;
  A11Y.scaffoldLevel = level;
  saveA11ySettings();
  render();
}

// ===== PERSONAL NOTES =====
function loadNotes() {
  try {
    const s = localStorage.getItem('civics2026_notes');
    if (s) Object.assign(NOTES, JSON.parse(s));
  } catch(e) {}
}
function saveNotes() {
  try { localStorage.setItem('civics2026_notes', JSON.stringify(NOTES)); } catch(e) {}
}
function saveNote(key, val) {
  NOTES[key] = val;
  saveNotes();
}
function getNote(key) { return NOTES[key] || ''; }

// ===== DAILY GOALS =====
function checkDailyGoal() {
  const today = new Date().toISOString().split('T')[0];
  if (STATE.dailyGoalDate !== today) {
    STATE.dailyGoalDate = today;
    STATE.dailyCompleted = 0;
  }
  const completed = UNITS_DATA.filter(u => !u.excluded && getUnitProgress(u.id) === 100).length;
  STATE.dailyCompleted = completed;
}
function setDailyGoal(n) {
  STATE.dailyGoal = Math.max(1, Math.min(16, n));
  saveState();
  render();
}

// ===== RESET DATA =====
function resetAllData() {
  if (!confirm('האם אתם בטוחים? כל הנתונים ימחקו לצמיתות!')) return;
  if (!confirm('פעולה זו בלתי הפיכה. להמשיך?')) return;
  localStorage.removeItem('civics2026_state');
  localStorage.removeItem('civics2026_a11y');
  localStorage.removeItem('civics2026_notes');
  localStorage.removeItem('civics2026_studentId');
  location.reload();
}

function toggleQuietMode() {
  A11Y.quietMode = !A11Y.quietMode;
  applyA11ySettings();
  saveA11ySettings();
  render();
}

function toggleHideTimers() {
  A11Y.hideTimers = !A11Y.hideTimers;
  saveA11ySettings();
  render();
}

function toggleReducedMotion() {
  A11Y.reducedMotion = !A11Y.reducedMotion;
  applyA11ySettings();
  saveA11ySettings();
}

// ===== PAUSE / CALM SCREEN =====
function togglePause() {
  A11Y.paused = !A11Y.paused;
  if (A11Y.paused) {
    // Freeze all timers
    if (STATE.timerInterval) clearInterval(STATE.timerInterval);
    if (STATE.examSim && STATE.examSim.interval) clearInterval(STATE.examSim.interval);
  } else {
    // Resume timers
    if (STATE.timerActive) STATE.timerInterval = setInterval(tickTimer, 1000);
    if (STATE.examSim) STATE.examSim.interval = setInterval(tickExamSim, 1000);
  }
  render();
}

function renderCalmScreen() {
  return `<div class="calm-screen" role="dialog" aria-label="מסך הרגעה">
    <div class="calm-content">
      <div class="calm-icon">🌿</div>
      <h2>הפסקה</h2>
      <p>קחו רגע לנשום. הכל בסדר.</p>
      <div class="calm-breathing" id="calm-breathing">
        <div class="breath-circle"></div>
        <div class="breath-text" id="breath-text">שאפו...</div>
      </div>
      <p class="calm-tip">הטיימרים מוקפאים - קחו את הזמן שלכם</p>
      <button class="btn btn-calm-resume" onclick="window.CivicsApp.togglePause()" aria-label="חזרה ללמידה">
        <i class="fas fa-play"></i> חזרה ללמידה
      </button>
    </div>
  </div>`;
}

// ===== BREATHING EXERCISE =====
function startBreathing() {
  STATE.breathingActive = true;
  render();
  runBreathingCycle();
}

function stopBreathing() {
  STATE.breathingActive = false;
  render();
}

function runBreathingCycle() {
  if (!STATE.breathingActive) return;
  const phases = [
    { text: 'שאפו...', duration: 4000, cls: 'inhale' },
    { text: 'החזיקו...', duration: 7000, cls: 'hold' },
    { text: 'נשפו...', duration: 8000, cls: 'exhale' }
  ];
  let i = 0;
  function nextPhase() {
    if (!STATE.breathingActive) return;
    const phase = phases[i % phases.length];
    const textEl = document.getElementById('breathing-text');
    const circleEl = document.getElementById('breathing-circle');
    if (textEl) textEl.textContent = phase.text;
    if (circleEl) {
      circleEl.className = 'breathing-circle ' + phase.cls;
    }
    i++;
    setTimeout(nextPhase, phase.duration);
  }
  nextPhase();
}

function renderBreathingPage() {
  return `<div class="breathing-page" role="main" aria-label="תרגיל נשימה">
    <div class="breathing-container">
      <h2><i class="fas fa-wind"></i> תרגיל נשימה 4-7-8</h2>
      <p class="breathing-desc">טכניקה מוכחת להרגעת מערכת העצבים. עקבו אחרי העיגול.</p>
      <div class="breathing-visual">
        <div class="breathing-circle inhale" id="breathing-circle">
          <span class="breathing-text" id="breathing-text">שאפו...</span>
        </div>
      </div>
      <div class="breathing-legend">
        <span><strong>4</strong> שניות - שאיפה</span>
        <span><strong>7</strong> שניות - החזקה</span>
        <span><strong>8</strong> שניות - נשיפה</span>
      </div>
      <button class="btn btn-primary btn-lg" onclick="window.CivicsApp.stopBreathing()">
        <i class="fas fa-check"></i> סיימתי, חזרה ללמידה
      </button>
    </div>
  </div>`;
}

// ===== INIT =====
function init() {
  STATE.studentId = getOrCreateStudentId();
  loadA11ySettings();
  loadState();
  loadNotes();
  loadScaffoldProgress();
  // Apply minimal mode if saved
  if (A11Y.minimalMode) document.documentElement.classList.add('minimal-mode');
  if (A11Y.hideImages) document.documentElement.classList.add('hide-images');
  checkDailyGoal();
  STATE.studyStartTime = Date.now();
  setupOfflineDetection();
  render();
  window.addEventListener('hashchange', onHashChange);
  onHashChange();
  loadFromServer();
  // Auto-save every 30 seconds
  STATE.autoSaveInterval = setInterval(() => {
    saveState();
    debouncedSync();
  }, 30000);
  // Break reminder check every 60 seconds
  setInterval(checkBreakReminder, 60000);
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboard);
}

// ===== BREAK REMINDER SYSTEM =====
function checkBreakReminder() {
  if (!STATE.studyStartTime || A11Y.paused) return;
  const minutesStudied = Math.floor((Date.now() - STATE.studyStartTime) / 60000);
  STATE.sessionMinutes = minutesStudied;
  // Remind every 25 minutes (Pomodoro-style)
  if (minutesStudied > 0 && minutesStudied % 25 === 0 && !STATE.breakReminderShown) {
    STATE.breakReminderShown = true;
    showBreakReminder(minutesStudied);
    setTimeout(() => { STATE.breakReminderShown = false; }, 120000); // Reset after 2 min
  }
}

function showBreakReminder(minutes) {
  const existing = document.getElementById('break-reminder');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id = 'break-reminder';
  div.className = 'break-reminder';
  div.setAttribute('role', 'alert');
  div.innerHTML = `
    <div class="break-reminder-content">
      <span class="break-icon">☕</span>
      <div class="break-text">
        <strong>הגיע זמן להפסקה!</strong>
        <span>כבר ${minutes} דקות שאתם לומדים. הפסקה קצרה תעזור לריכוז.</span>
      </div>
      <div class="break-actions">
        <button class="btn btn-sm" onclick="location.hash='breathing';this.closest('.break-reminder').remove()">🌬️ נשימה</button>
        <button class="btn btn-sm" onclick="STATE.studyStartTime=Date.now();this.closest('.break-reminder').remove()">⏰ עוד 25 דק'</button>
        <button class="btn btn-sm" onclick="this.closest('.break-reminder').remove()" aria-label="סגור">✕</button>
      </div>
    </div>`;
  document.body.appendChild(div);
  announceToSR('תזכורת הפסקה: כבר ' + minutes + ' דקות שאתם לומדים');
  // Auto-dismiss after 30 seconds
  setTimeout(() => { if (div.parentNode) div.remove(); }, 30000);
}

function dismissBreakReminder() {
  const el = document.getElementById('break-reminder');
  if (el) el.remove();
}

function handleKeyboard(e) {
  // Escape to close sidebar or pause
  if (e.key === 'Escape') {
    if (A11Y.paused) { togglePause(); return; }
    if (STATE.sidebarOpen) { toggleSidebar(); return; }
  }
  // Alt+P for pause
  if (e.altKey && e.key === 'p') { e.preventDefault(); togglePause(); }
  // Alt+S for TTS
  if (e.altKey && e.key === 's') { e.preventDefault(); toggleTTS(); }
  // Alt+A for accessibility panel
  if (e.altKey && e.key === 'a') { e.preventDefault(); toggleA11yPanel(); }
  // Alt+H for home
  if (e.altKey && e.key === 'h') { e.preventDefault(); location.hash = ''; }
}

function loadState() {
  try {
    const saved = localStorage.getItem('civics2026');
    if (saved) {
      const d = JSON.parse(saved);
      STATE.studentName = d.studentName || '';
      STATE.studentGrade = d.studentGrade || '';
      STATE.progress = d.progress || {};
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('civics2026', JSON.stringify({
      studentName: STATE.studentName,
      studentGrade: STATE.studentGrade,
      progress: STATE.progress
    }));
    showSave(true);
  } catch(e) { showSave(false); }
}

function showSave(ok) {
  const el = document.getElementById('save-badge');
  if (!el) return;
  el.textContent = ok ? '\u2713 \u05E0\u05E9\u05DE\u05E8' : '\u26A0 \u05E9\u05D2\u05D9\u05D0\u05D4';
  el.className = 'save-badge' + (ok ? '' : ' error');
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0.4'; }, 2000);
}

// ===== SERVER SYNC =====
function syncToServer() {
  if (!STATE.studentName || STATE.studentName.trim().length < 2) return;
  if (!_isOnline) { STATE.syncStatus = 'offline'; updateSyncBadge(); return; }
  STATE.syncStatus = 'syncing';
  updateSyncBadge();
  
  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: STATE.studentId,
      studentName: STATE.studentName,
      studentGrade: STATE.studentGrade,
      progress: STATE.progress,
      notes: NOTES
    })
  })
  .then(r => r.json())
  .then(data => {
    STATE.syncStatus = data.ok ? 'synced' : 'error';
    updateSyncBadge();
  })
  .catch(() => {
    STATE.syncStatus = 'error';
    updateSyncBadge();
  });
}

function loadFromServer() {
  if (!_isOnline) return;
  fetch('/api/sync/' + STATE.studentId)
  .then(r => r.json())
  .then(data => {
    if (data.found && data.data) {
      const local = Object.keys(STATE.progress).length;
      if (local === 0 && data.data.progress) {
        STATE.progress = data.data.progress;
        STATE.studentName = data.data.studentName || STATE.studentName;
        saveState();
        render();
      }
      // Load notes from server if local is empty
      if (Object.keys(NOTES).length === 0 && data.data.notes) {
        Object.assign(NOTES, data.data.notes);
        saveNotes();
      }
    }
  })
  .catch(() => {});
}

function updateSyncBadge() {
  const el = document.getElementById('sync-badge');
  if (!el) return;
  if (STATE.syncStatus === 'offline') {
    el.textContent = '📴 לא מקוון';
    el.className = 'sync-badge error';
  } else if (STATE.syncStatus === 'syncing') {
    el.textContent = '\u23F3 \u05DE\u05E1\u05E0\u05DB\u05E8\u05DF...';
    el.className = 'sync-badge syncing';
  } else if (STATE.syncStatus === 'synced') {
    el.textContent = '\u2601\uFE0F \u05DE\u05E1\u05D5\u05E0\u05DB\u05E8\u05DF';
    el.className = 'sync-badge synced';
    setTimeout(() => { el.className = 'sync-badge synced fade'; }, 3000);
  } else if (STATE.syncStatus === 'error') {
    el.textContent = '\u26A0\uFE0F \u05E9\u05DE\u05D5\u05E8 \u05DE\u05E7\u05D5\u05DE\u05D9\u05EA';
    el.className = 'sync-badge error';
  }
}

let _syncDebounce = null;
function debouncedSync() {
  clearTimeout(_syncDebounce);
  _syncDebounce = setTimeout(syncToServer, 3000);
}

function getProgress(unitId) {
  if (!STATE.progress[unitId]) {
    STATE.progress[unitId] = { checklist: [], answers: {}, mood: '', completed: false };
  }
  return STATE.progress[unitId];
}

function calcTotalProgress() {
  let total = 0, done = 0;
  UNITS_DATA.forEach(u => {
    total += u.checklist.length;
    const p = STATE.progress[u.id];
    if (p && p.checklist) done += p.checklist.filter(Boolean).length;
  });
  return total > 0 ? Math.round(done/total*100) : 0;
}

function getUnitProgress(unitId) {
  const unit = UNITS_DATA.find(u => u.id === unitId);
  if (!unit) return 0;
  const p = STATE.progress[unitId];
  if (!p || !p.checklist) return 0;
  const done = p.checklist.filter(Boolean).length;
  return Math.round(done / unit.checklist.length * 100);
}

function calcTotalProgressFrom(progress) {
  let total = 0, done = 0;
  UNITS_DATA.forEach(u => {
    total += u.checklist.length;
    const p = progress[u.id];
    if (p && p.checklist) done += p.checklist.filter(Boolean).length;
  });
  return total > 0 ? Math.round(done/total*100) : 0;
}

function getUnitProgressFrom(unitId, progress) {
  const unit = UNITS_DATA.find(u => u.id === unitId);
  if (!unit) return 0;
  const p = progress[unitId];
  if (!p || !p.checklist) return 0;
  const done = p.checklist.filter(Boolean).length;
  return Math.round(done / unit.checklist.length * 100);
}

function countAnsweredFrom(progress) {
  return Object.values(progress).reduce((sum, p) => sum + Object.keys(p.answers||{}).length, 0);
}

// ===== PROGRESS PREDICTION =====
function predictScore() {
  let score = 0;
  let maxScore = 0;
  const totalUnits = UNITS_DATA.filter(u => !u.excluded).length;
  
  UNITS_DATA.forEach(u => {
    if (u.excluded) return;
    const unitWeight = u.frequency === 'גבוהה' ? 1.5 : (u.frequency === 'בינונית' ? 1.0 : 0.7);
    maxScore += 100 * unitWeight;
    
    const pct = getUnitProgress(u.id);
    const p = STATE.progress[u.id] || {};
    const answered = Object.keys(p.answers || {}).length;
    const questions = EXAM_QUESTIONS.filter(q => q.unitIds.includes(u.id)).length;
    const answerPct = questions > 0 ? answered / questions : 0;
    const mood = p.mood;
    const moodBonus = mood === 'calm' ? 1.1 : (mood === 'neutral' ? 1.0 : (mood === 'anxious' ? 0.85 : 0.9));
    
    // Scaffold usage bonus: did the student use dual-view / simplified view?
    const scaffoldUsed = Object.keys(A11Y.dualViewOpen || {}).filter(k => {
      const q = EXAM_QUESTIONS.find(qq => String(qq.id) === k);
      return q && q.unitIds.includes(u.id) && A11Y.dualViewOpen[k];
    }).length;
    const scaffoldBonus = questions > 0 ? Math.min(scaffoldUsed / questions, 1) * 5 : 0;
    
    // Score = checklist progress (35%) + answers written (35%) + mood factor (15%) + scaffold usage (15%)
    const unitScore = ((pct / 100) * 35 + answerPct * 35 + (mood ? 15 : 7) + scaffoldBonus * 3) * moodBonus;
    score += unitScore * unitWeight;
  });
  
  return maxScore > 0 ? Math.min(100, Math.round(score / maxScore * 100)) : 0;
}

function renderPrediction() {
  const predicted = predictScore();
  const pct = calcTotalProgress();
  const totalAnswered = Object.values(STATE.progress).reduce((sum, p) => sum + Object.keys(p.answers || {}).length, 0);
  const totalMoods = Object.values(STATE.progress).filter(p => p.mood).length;
  const scaffoldUsage = Object.values(A11Y.dualViewOpen || {}).filter(v => v).length;
  
  const answeredClass = totalAnswered >= 30 ? 'good' : (totalAnswered >= 15 ? 'mid' : 'low');
  const progressClass = pct >= 70 ? 'good' : (pct >= 40 ? 'mid' : 'low');
  const moodClass = totalMoods >= 10 ? 'good' : (totalMoods >= 5 ? 'mid' : 'low');
  const scaffoldClass = scaffoldUsage >= 20 ? 'good' : (scaffoldUsage >= 10 ? 'mid' : 'low');
  
  return `<div class="prediction-card" role="region" aria-label="חיזוי ציון">
    <div class="prediction-title"><i class="fas fa-crystal-ball"></i> 🔮 חיזוי ציון צפוי</div>
    <div class="prediction-score">${predicted}</div>
    <div class="prediction-label">מתוך 100 (הערכה לפי ההתקדמות הנוכחית)</div>
    <div class="prediction-breakdown">
      <span class="prediction-factor ${progressClass}"><i class="fas fa-tasks"></i> צ'קליסט: ${pct}%</span>
      <span class="prediction-factor ${answeredClass}"><i class="fas fa-pen"></i> תשובות: ${totalAnswered}</span>
      <span class="prediction-factor ${moodClass}"><i class="fas fa-heart"></i> מצב רוח: ${totalMoods}</span>
      <span class="prediction-factor ${scaffoldClass}"><i class="fas fa-lightbulb"></i> שימוש בהסברים: ${scaffoldUsage}</span>
    </div>
  </div>`;
}

// ===== FIRST-THEN SYSTEM =====
function getFirstThenTasks() {
  // Find first incomplete unit
  const incomplete = UNITS_DATA.filter(u => !u.excluded && getUnitProgress(u.id) < 100);
  if (incomplete.length === 0) return { current: null, next: null };
  const current = incomplete[0];
  const next = incomplete.length > 1 ? incomplete[1] : null;
  return { current, next };
}

function renderFirstThen() {
  const { current, next } = getFirstThenTasks();
  if (!current) {
    return `<div class="first-then-box completed" role="status" aria-label="כל היחידות הושלמו">
      <div class="ft-current"><span class="ft-label">הושלם!</span><span class="ft-text">כל הכבוד! סיימת את כל היחידות</span></div>
    </div>`;
  }
  return `<div class="first-then-box" role="navigation" aria-label="עכשיו והבא">
    <div class="ft-current" onclick="location.hash='unit/${current.id}'" tabindex="0" role="button">
      <span class="ft-label">עכשיו</span>
      <span class="ft-icon">${current.icon}</span>
      <span class="ft-text">${current.title}</span>
      <span class="ft-progress">${getUnitProgress(current.id)}%</span>
    </div>
    ${next ? `<div class="ft-arrow"><i class="fas fa-arrow-left"></i></div>
    <div class="ft-next" onclick="location.hash='unit/${next.id}'" tabindex="0" role="button">
      <span class="ft-label">הבא</span>
      <span class="ft-icon">${next.icon}</span>
      <span class="ft-text">${next.title}</span>
    </div>` : ''}
  </div>`;
}

// ===== BREADCRUMBS =====
function renderBreadcrumbs() {
  let crumbs = [{label: 'דף הבית', hash: ''}];
  if (STATE.currentPage === 'unit' && STATE.currentUnit) {
    const unit = UNITS_DATA.find(u => u.id === STATE.currentUnit);
    if (unit) {
      crumbs.push({label: 'יחידה ' + unit.id + ': ' + unit.title, hash: 'unit/' + unit.id});
      const tabNames = {learn: 'לימוד', practice: 'תרגול', summary: 'סיכום'};
      crumbs.push({label: tabNames[STATE.currentTab] || STATE.currentTab, hash: null});
    }
  } else if (STATE.currentPage === 'dashboard') {
    crumbs.push({label: 'דשבורד מורה', hash: null});
  } else if (STATE.currentPage === 'exam-sim') {
    crumbs.push({label: 'סימולציית בחינה', hash: null});
  } else if (STATE.currentPage === 'breathing') {
    crumbs.push({label: 'תרגיל נשימה', hash: null});
  }
  
  return `<nav class="breadcrumbs" aria-label="נתיב ניווט" role="navigation">
    ${crumbs.map((c, i) => {
      const isLast = i === crumbs.length - 1;
      if (isLast || c.hash === null) return `<span class="crumb active" aria-current="page">${c.label}</span>`;
      return `<a class="crumb" href="#${c.hash}" tabindex="0">${c.label}</a><span class="crumb-sep"><i class="fas fa-chevron-left"></i></span>`;
    }).join('')}
  </nav>`;
}

// ===== VISUAL TIMER (SVG CIRCLE) =====
function renderVisualTimer(remaining, total, label) {
  if (A11Y.hideTimers) return '';
  const pct = total > 0 ? remaining / total : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = minutes + ':' + String(secs).padStart(2, '0');
  
  // Color based on time remaining
  let color = '#4A90E2';
  if (pct < 0.25) color = '#FF6B6B';
  else if (pct < 0.5) color = '#F5A623';
  
  return `<div class="visual-timer" role="timer" aria-label="${label} - ${timeStr} נותרו">
    <svg class="timer-svg" viewBox="0 0 100 100" width="90" height="90">
      <circle class="timer-bg-circle" cx="50" cy="50" r="${radius}" fill="none" stroke="#e0e0e0" stroke-width="6"/>
      <circle class="timer-progress-circle" cx="50" cy="50" r="${radius}" fill="none" stroke="${color}" stroke-width="6"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s linear"/>
    </svg>
    <div class="timer-center">
      <div class="timer-time-display">${timeStr}</div>
      <div class="timer-label-display">${label}</div>
    </div>
  </div>`;
}

// ===== TRANSITION WARNING SYSTEM =====
function showTransitionIndicator() {
  let indicator = document.getElementById('transition-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'transition-indicator';
    indicator.className = 'transition-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    document.body.appendChild(indicator);
  }
  indicator.innerHTML = '<div class="transition-bar"></div>';
  indicator.classList.add('active');
  setTimeout(() => indicator.classList.remove('active'), 600);
}

// ===== ROUTING =====
function onHashChange() {
  const hash = location.hash.slice(1);
  const prevPage = STATE.currentPage;
  const prevUnit = STATE.currentUnit;
  
  // Transition warning - announce upcoming change for accessibility
  if (prevPage !== 'home' || hash !== '') {
    // Brief visual transition indicator
    showTransitionIndicator();
  }
  if (hash.startsWith('unit/')) {
    const id = parseInt(hash.split('/')[1]);
    STATE.currentPage = 'unit';
    STATE.currentUnit = id;
    STATE.currentTab = 'learn';
  } else if (hash === 'questions') {
    STATE.currentPage = 'questions';
  } else if (hash === 'dashboard') {
    STATE.currentPage = 'dashboard';
  } else if (hash === 'exam-sim') {
    STATE.currentPage = 'exam-sim';
  } else if (hash === 'breathing') {
    STATE.currentPage = 'breathing';
    startBreathing();
  } else {
    STATE.currentPage = 'home';
    STATE.currentUnit = null;
  }
  // Transition announcement for accessibility
  if (prevPage !== STATE.currentPage) {
    const pageNames = {home: 'דף הבית', unit: 'יחידת לימוד', questions: 'שאלות בגרות', dashboard: 'לוח מחוונים', 'exam-sim': 'סימולציית בחינה', breathing: 'תרגיל נשימה'};
    announceToSR('עוברים ל' + (pageNames[STATE.currentPage] || STATE.currentPage));
  }
  // Track study time for break reminders
  if (!STATE.studyStartTime) STATE.studyStartTime = Date.now();
  checkBreakReminder();
  render();
  // Focus main content on navigation
  setTimeout(() => {
    const main = document.getElementById('main-content');
    if (main) { main.focus(); window.scrollTo(0, 0); }
  }, 120);
}

function navigate(page, unitId) {
  if (page === 'unit') location.hash = 'unit/' + unitId;
  else if (page === 'dashboard') location.hash = 'dashboard';
  else if (page === 'questions') location.hash = 'questions';
  else if (page === 'exam-sim') location.hash = 'exam-sim';
  else if (page === 'breathing') location.hash = 'breathing';
  else location.hash = '';
}

// ===== RENDER =====
function render() {
  const app = document.getElementById('app');

  // Dynamic page titles
  const titleMap = {
    'home': 'אזרחות 2026 - דף הבית',
    'unit': () => {
      const u = UNITS_DATA.find(x => x.id === STATE.currentUnit);
      return u ? `אזרחות 2026 - יחידה ${u.id}: ${u.title}` : 'אזרחות 2026 - יחידה';
    },
    'questions': 'אזרחות 2026 - שאלות בגרות',
    'exam-sim': 'אזרחות 2026 - סימולציית בחינה',
    'dashboard': 'אזרחות 2026 - דשבורד מורה',
    'breathing': 'אזרחות 2026 - תרגיל נשימה'
  };
  const titleVal = titleMap[STATE.currentPage];
  document.title = typeof titleVal === 'function' ? titleVal() : (titleVal || 'אזרחות 2026');

  if (A11Y.paused) {
    app.innerHTML = renderCalmScreen();
    return;
  }
  if (STATE.breathingActive && STATE.currentPage === 'breathing') {
    app.innerHTML = renderBreathingPage();
    return;
  }
  app.innerHTML = renderLayout();
  bindEvents();
}

function renderLayout() {
  return `
    <button class="sidebar-toggle" onclick="window.CivicsApp.toggleSidebar()" aria-label="${STATE.sidebarOpen ? 'סגור תפריט' : 'פתח תפריט'}" aria-expanded="${STATE.sidebarOpen}" tabindex="0"><i class="fas fa-bars"></i></button>
    ${renderPauseButton()}
    ${renderA11yToggle()}
    <div class="layout">
      ${renderSidebar()}
      <main class="main-content" role="main" id="main-content" tabindex="-1">
        ${renderTopBar()}
        ${renderBreadcrumbs()}
        <div aria-live="polite" id="live-status" class="sr-only"></div>
        ${STATE.currentPage === 'home' ? renderHomePage() :
          STATE.currentPage === 'unit' ? renderUnitPage() :
          STATE.currentPage === 'questions' ? renderQuestionsPage() :
          STATE.currentPage === 'dashboard' ? renderDashboard() :
          STATE.currentPage === 'exam-sim' ? renderExamSim() : ''}
      </main>
    </div>
    ${renderA11yPanel()}`;
}

// ===== PAUSE BUTTON (always visible) =====
function renderPauseButton() {
  return `<button class="pause-fab" onclick="window.CivicsApp.togglePause()" aria-label="הפסקה - הקפאת טיימרים ומעבר למסך רגיעה" tabindex="0" title="הפסקה (Alt+P)">
    <i class="fas fa-pause"></i>
    <span class="pause-fab-text">הפסקה</span>
  </button>`;
}

// ===== ACCESSIBILITY TOGGLE BUTTON =====
function renderA11yToggle() {
  return `<button class="a11y-fab" onclick="window.CivicsApp.toggleA11yPanel()" aria-label="הגדרות נגישות" tabindex="0" title="נגישות (Alt+A)">
    <i class="fas fa-universal-access"></i>
  </button>`;
}

// ===== ACCESSIBILITY PANEL =====
let a11yPanelOpen = false;
function toggleA11yPanel() {
  a11yPanelOpen = !a11yPanelOpen;
  const panel = document.getElementById('a11y-panel');
  if (panel) {
    panel.classList.toggle('open', a11yPanelOpen);
    if (a11yPanelOpen) {
      // Focus the close button when opening
      setTimeout(() => {
        const closeBtn = panel.querySelector('.a11y-close');
        if (closeBtn) closeBtn.focus();
      }, 100);
      // Setup focus trap
      setupFocusTrap(panel);
    } else {
      removeFocusTrap();
      // Return focus to toggle button
      const fab = document.querySelector('.a11y-fab');
      if (fab) fab.focus();
    }
  }
}

// ===== FOCUS TRAP =====
let _focusTrapHandler = null;
function setupFocusTrap(container) {
  removeFocusTrap();
  _focusTrapHandler = function(e) {
    if (e.key === 'Tab') {
      const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key === 'Escape') { toggleA11yPanel(); }
  };
  document.addEventListener('keydown', _focusTrapHandler);
}
function removeFocusTrap() {
  if (_focusTrapHandler) {
    document.removeEventListener('keydown', _focusTrapHandler);
    _focusTrapHandler = null;
  }
}

function renderA11yPanel() {
  return `<div id="a11y-panel" class="a11y-panel${a11yPanelOpen ? ' open' : ''}" role="dialog" aria-label="הגדרות נגישות">
    <div class="a11y-panel-header">
      <h3><i class="fas fa-universal-access"></i> הגדרות נגישות</h3>
      <button class="a11y-close" onclick="window.CivicsApp.toggleA11yPanel()" aria-label="סגור">&times;</button>
    </div>
    <div class="a11y-panel-body">
      <div class="a11y-group">
        <label class="a11y-label">ערכת צבעים</label>
        <div class="a11y-themes">
          <button class="a11y-theme-btn${A11Y.theme==='light'?' active':''}" onclick="window.CivicsApp.setTheme('light')" aria-pressed="${A11Y.theme==='light'}">
            <span class="theme-preview light-preview"></span> בהיר
          </button>
          <button class="a11y-theme-btn${A11Y.theme==='soft'?' active':''}" onclick="window.CivicsApp.setTheme('soft')" aria-pressed="${A11Y.theme==='soft'}">
            <span class="theme-preview soft-preview"></span> רך
          </button>
          <button class="a11y-theme-btn${A11Y.theme==='dark'?' active':''}" onclick="window.CivicsApp.setTheme('dark')" aria-pressed="${A11Y.theme==='dark'}">
            <span class="theme-preview dark-preview"></span> כהה
          </button>
        </div>
      </div>
      <div class="a11y-group">
        <label class="a11y-label">גודל גופן: <span id="font-size-val">${A11Y.fontSize}%</span></label>
        <div class="a11y-font-controls">
          <button class="btn btn-sm" onclick="window.CivicsApp.setFontSize(${A11Y.fontSize - 10})" aria-label="הקטן">א-</button>
          <input type="range" min="100" max="200" step="10" value="${A11Y.fontSize}" onchange="window.CivicsApp.setFontSize(parseInt(this.value))" aria-label="גודל גופן">
          <button class="btn btn-sm" onclick="window.CivicsApp.setFontSize(${A11Y.fontSize + 10})" aria-label="הגדל">א+</button>
        </div>
      </div>
      <div class="a11y-group">
        <label class="a11y-label">סוג גופן</label>
        <div class="a11y-themes">
          <button class="a11y-theme-btn${A11Y.fontType==='sans'?' active':''}" onclick="window.CivicsApp.setFontType('sans')">ללא תגים</button>
          <button class="a11y-theme-btn${A11Y.fontType==='serif'?' active':''}" onclick="window.CivicsApp.setFontType('serif')">עם תגים</button>
          <button class="a11y-theme-btn${A11Y.fontType==='mono'?' active':''}" onclick="window.CivicsApp.setFontType('mono')">קבוע</button>
        </div>
      </div>
      <div class="a11y-group">
        <label class="a11y-toggle-row">
          <input type="checkbox" ${A11Y.ttsEnabled?'checked':''} onchange="window.CivicsApp.toggleTTS()">
          <span>🔊 הקראת טקסט</span>
          <small>קורא בקול רם (לחצו על טקסט כדי לשמוע)</small>
        </label>
      </div>
      <div class="a11y-group">
        <label class="a11y-toggle-row">
          <input type="checkbox" ${A11Y.quietMode?'checked':''} onchange="window.CivicsApp.toggleQuietMode()">
          <span>🔇 מצב שקט</span>
          <small>כיבוי כל צליל ואנימציה</small>
        </label>
      </div>
      <div class="a11y-group">
        <label class="a11y-toggle-row">
          <input type="checkbox" ${A11Y.hideTimers?'checked':''} onchange="window.CivicsApp.toggleHideTimers()">
          <span>⏱️ הסתר טיימרים</span>
          <small>מסתיר את כל הטיימרים</small>
        </label>
      </div>
      <div class="a11y-group">
        <label class="a11y-toggle-row">
          <input type="checkbox" ${A11Y.hideImages?'checked':''} onchange="window.CivicsApp.toggleHideImages()">
          <span>🖼️ הסתר תמונות</span>
          <small>מסתיר תמונות ואיורים דקורטיביים</small>
        </label>
      </div>
      <div class="a11y-group">
        <label class="a11y-toggle-row">
          <input type="checkbox" ${A11Y.minimalMode?'checked':''} onchange="window.CivicsApp.toggleMinimalMode()">
          <span>🧘 מצב מינימלי</span>
          <small>מפחית עומס חזותי - מסתיר עיטורים, צבעים עדינים, אנימציות</small>
        </label>
      </div>
      <div class="a11y-group">
        <label class="a11y-toggle-row">
          <input type="checkbox" ${A11Y.reducedMotion?'checked':''} onchange="window.CivicsApp.toggleReducedMotion()">
          <span>🎬 צמצם תנועה</span>
          <small>מפחית אנימציות ומעברים</small>
        </label>
      </div>
      <div class="a11y-group">
        <label class="a11y-label">🔆 רמת ניגודיות</label>
        <div class="contrast-selector">
          <button class="contrast-btn${A11Y.contrast==='low'?' active':''}" onclick="window.CivicsApp.setContrast('low')" aria-pressed="${A11Y.contrast==='low'}">נמוכה</button>
          <button class="contrast-btn${A11Y.contrast==='normal'||!A11Y.contrast?' active':''}" onclick="window.CivicsApp.setContrast('normal')" aria-pressed="${A11Y.contrast==='normal'||!A11Y.contrast}">רגילה</button>
          <button class="contrast-btn${A11Y.contrast==='high'?' active':''}" onclick="window.CivicsApp.setContrast('high')" aria-pressed="${A11Y.contrast==='high'}">גבוהה</button>
        </div>
      </div>
      <div class="a11y-group">
        <button class="btn btn-calm-breathe" onclick="location.hash='breathing'"><i class="fas fa-wind"></i> תרגיל נשימה 4-7-8</button>
      </div>
      <div class="a11y-group">
        <label class="a11y-label">🎓 רמת תמיכה (Scaffolding)</label>
        <div class="support-level-selector">
          <button class="support-level-btn${A11Y.supportLevel===1?' active':''}" onclick="window.CivicsApp.setSupportLevel(1)" aria-pressed="${A11Y.supportLevel===1}">
            <span class="sl-num">1</span>
            <span class="sl-label">📘 רמה 1</span>
            <span class="sl-desc">פירוק + מפת דרכים + רובריקה</span>
          </button>
          <button class="support-level-btn${A11Y.supportLevel===2?' active':''}" onclick="window.CivicsApp.setSupportLevel(2)" aria-pressed="${A11Y.supportLevel===2}">
            <span class="sl-num">2</span>
            <span class="sl-label">📗 רמה 2</span>
            <span class="sl-desc">שאלות מנחות + בנק מילים</span>
          </button>
          <button class="support-level-btn${A11Y.supportLevel===3?' active':''}" onclick="window.CivicsApp.setSupportLevel(3)" aria-pressed="${A11Y.supportLevel===3}">
            <span class="sl-num">3</span>
            <span class="sl-label">📕 רמה 3</span>
            <span class="sl-desc">תבנית מלאה + צ'קליסט</span>
          </button>
        </div>
      </div>
      <div class="a11y-group">
        <button class="btn" style="background:var(--error-red);color:#fff;width:100%;justify-content:center" onclick="window.CivicsApp.resetAllData()"><i class="fas fa-trash-alt"></i> איפוס כל הנתונים</button>
      </div>
      <div class="a11y-shortcuts">
        <h4>קיצורי מקלדת</h4>
        <div><kbd>Alt+P</kbd> הפסקה</div>
        <div><kbd>Alt+A</kbd> נגישות</div>
        <div><kbd>Alt+H</kbd> דף הבית</div>
        <div><kbd>Alt+S</kbd> הקראת טקסט</div>
        <div><kbd>Esc</kbd> סגירה</div>
      </div>
    </div>
  </div>`;
}

function renderSidebar() {
  const phases = [
    { name: 'שלב א\': יסודות', ids: [1,2,3,4,5,6] },
    { name: 'שלב ב\': דמוקרטיה וזכויות', ids: [7,8,9,10] },
    { name: 'שלב ג\': מוסדות שלטון', ids: [11,12,13] },
    { name: 'שלב ד\': חברה ותרבות', ids: [14,15,16] }
  ];
  let html = `<aside class="sidebar${STATE.sidebarOpen ? ' open' : ''}" role="navigation" aria-label="תפריט ניווט ראשי">
    <div class="sidebar-header">
      <h2>🎓 אזרחות 2026</h2>
      <div class="subtitle">הכנה לבגרות בעל-פה</div>
    </div>
    <nav class="sidebar-nav">
      <a class="sidebar-item${STATE.currentPage==='home'?' active':''}" href="#" tabindex="0" aria-label="דף הבית" aria-current="${STATE.currentPage==='home'?'page':'false'}">
        <span class="item-icon"><i class="fas fa-home"></i></span> דף הבית
      </a>
      <a class="sidebar-item${STATE.currentPage==='questions'?' active':''}" href="#questions" tabindex="0" aria-label="96 שאלות בגרות" aria-current="${STATE.currentPage==='questions'?'page':'false'}">
        <span class="item-icon"><i class="fas fa-file-alt"></i></span> שאלות בגרות (96)
      </a>
      <a class="sidebar-item${STATE.currentPage==='exam-sim'?' active':''}" href="#exam-sim" tabindex="0" aria-label="סימולציית בחינה" aria-current="${STATE.currentPage==='exam-sim'?'page':'false'}">
        <span class="item-icon"><i class="fas fa-stopwatch"></i></span> סימולציית בחינה
      </a>
      <a class="sidebar-item" href="#breathing" tabindex="0" aria-label="תרגיל נשימה">
        <span class="item-icon"><i class="fas fa-wind"></i></span> תרגיל נשימה
      </a>
      <a class="sidebar-item${STATE.currentPage==='dashboard'?' active':''}" href="#dashboard" tabindex="0" aria-label="דשבורד מורה" aria-current="${STATE.currentPage==='dashboard'?'page':'false'}">
        <span class="item-icon"><i class="fas fa-chart-bar"></i></span> דשבורד מורה
      </a>`;
  phases.forEach(phase => {
    html += `<div class="sidebar-section-title">${phase.name}</div>`;
    phase.ids.forEach(id => {
      const u = UNITS_DATA.find(x => x.id === id);
      const prog = getUnitProgress(id);
      const active = STATE.currentPage === 'unit' && STATE.currentUnit === id;
      html += `<a class="sidebar-item${active?' active':''}" href="#unit/${id}" tabindex="0" aria-label="יחידה ${id}: ${u.title} - ${prog}% הושלם" aria-current="${active?'page':'false'}">
        <span class="item-icon">${u.icon}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.title}</span>
        <span class="item-progress${prog===100?' done':''}">${prog}%</span>
      </a>`;
    });
  });
  html += `</nav></aside>`;
  return html;
}

function renderTopBar() {
  let timerHtml = '';
  if (!A11Y.hideTimers) {
    if (STATE.timerActive) {
      const total = PHASES[STATE.timerPhase]?.duration || 1;
      timerHtml = `<div class="timer-widget" role="timer" aria-label="טיימר שיעור">
        ${renderVisualTimer(STATE.timerRemaining, total, PHASES[STATE.timerPhase]?.name || '')}
        <button class="timer-btn" onclick="window.CivicsApp.stopTimer()" aria-label="עצור טיימר">⏸</button>
      </div>`;
    } else {
      timerHtml = `<button class="btn btn-sm btn-primary" onclick="window.CivicsApp.startTimer()" aria-label="הפעל טיימר שיעור"><i class="fas fa-play"></i> טיימר שיעור</button>`;
    }
  }

  return `<header class="top-bar" role="banner">
    <div class="top-bar-right">
      <label class="sr-only" for="student-name-input">שם התלמיד/ה</label>
      <input type="text" id="student-name-input" class="student-name-input" placeholder="שם התלמיד/ה" value="${esc(STATE.studentName)}"
        onchange="window.CivicsApp.setName(this.value)" aria-label="שם התלמיד/ה">
      <select id="student-grade-select" class="student-grade-select" onchange="window.CivicsApp.setGrade(this.value)" aria-label="כיתה">
        <option value=""${!STATE.studentGrade ? ' selected' : ''}>כיתה...</option>
        <option value="10"${STATE.studentGrade === '10' ? ' selected' : ''}>י׳</option>
        <option value="11"${STATE.studentGrade === '11' ? ' selected' : ''}>יא׳</option>
        <option value="12"${STATE.studentGrade === '12' ? ' selected' : ''}>יב׳</option>
        <option value="other"${STATE.studentGrade === 'other' ? ' selected' : ''}>אחר</option>
      </select>
      <span id="save-badge" class="save-badge" style="opacity:0.4" role="status" aria-live="polite">✓ נשמר</span>
      <span id="sync-badge" class="sync-badge" role="status" aria-live="polite"></span>
      <button class="btn btn-sm" style="background:var(--btn-export-bg, #e8f5e9);color:var(--btn-export-color, #2e7d32)" onclick="window.CivicsApp.exportData()" title="שמור גיבוי" aria-label="ייצוא נתונים"><i class="fas fa-download"></i></button>
      <button class="btn btn-sm" style="background:var(--btn-import-bg, #e3f2fd);color:var(--btn-import-color, #1565c0)" onclick="window.CivicsApp.importData()" title="שחזר גיבוי" aria-label="ייבוא נתונים"><i class="fas fa-upload"></i></button>
    </div>
    <div class="top-bar-center">${timerHtml}</div>
  </header>`;
}

// ===== HOME PAGE =====
function renderHomePage() {
  const pct = calcTotalProgress();
  const completedUnits = UNITS_DATA.filter(u => getUnitProgress(u.id) === 100).length;
  const phases = [
    { name: '🏛️ שלב א\': יסודות היסטוריים ומושגיים', ids: [1,2,3,4,5,6] },
    { name: '⚖️ שלב ב\': עקרונות דמוקרטיה וזכויות [תדירות גבוהה!]', ids: [7,8,9,10] },
    { name: '🏢 שלב ג\': מוסדות שלטון ומנגנונים', ids: [11,12,13] },
    { name: '📺 שלב ד\': חברה ותרבות פוליטית', ids: [14,15,16] }
  ];

  let html = `<div class="home-page">
    <div class="home-hero" role="banner">
      <h1>🎓 מערכת הכנה לבגרות באזרחות 2026</h1>
      <p>16 יחידות לימוד | ${EXAM_QUESTIONS.length} שאלות תרגול | 96 שאלות בגרות אמיתיות | הכנה לבחינה בעל-פה</p>
      <p class="hero-a11y-note"><i class="fas fa-universal-access"></i> גרסה מותאמת נגישות</p>
    </div>
    
    ${renderFirstThen()}
    
    ${renderPrediction()}
    
    <!-- Daily Goal -->
    <div class="daily-goal-section" role="region" aria-label="יעד יומי">
      <div class="daily-goal-header">
        <span>🎯 יעד יומי: השלימו ${STATE.dailyGoal} יחידות היום</span>
        <div class="daily-goal-controls">
          <button class="btn btn-sm" onclick="window.CivicsApp.setDailyGoal(${STATE.dailyGoal - 1})" aria-label="הפחת יעד">-</button>
          <span class="daily-goal-num">${STATE.dailyGoal}</span>
          <button class="btn btn-sm" onclick="window.CivicsApp.setDailyGoal(${STATE.dailyGoal + 1})" aria-label="הגדל יעד">+</button>
        </div>
      </div>
      <div class="daily-goal-bar" role="progressbar" aria-valuenow="${Math.min(STATE.dailyCompleted, STATE.dailyGoal)}" aria-valuemax="${STATE.dailyGoal}">
        <div class="daily-goal-fill" style="width:${Math.min(100, (STATE.dailyCompleted / STATE.dailyGoal) * 100)}%"></div>
      </div>
      <div class="daily-goal-text">${STATE.dailyCompleted >= STATE.dailyGoal ? '🎉 כל הכבוד! השגתם את היעד היומי!' : STATE.dailyCompleted + ' מתוך ' + STATE.dailyGoal + ' יחידות הושלמו'}</div>
    </div>
    
    <div class="important-box" role="alert">הבחינה היא <strong>בעל-פה</strong>! כתבו רק <strong>נקודות</strong> (bullets) - לא משפטים מלאים! 10 דק' קריאה + 30 דק' כתיבה + 5-10 דק' מענה.</div>
    
    <div class="progress-overview" role="region" aria-label="סיכום התקדמות">
      <h3>📊 ההתקדמות שלי</h3>
      <div class="progress-bar-container" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="התקדמות כללית ${pct}%">
        <div class="progress-bar-fill" style="width:${pct}%">${pct}%</div>
      </div>
      <div class="progress-stats">
        <span><i class="fas fa-book"></i> ${completedUnits}/16 יחידות הושלמו</span>
        <span><i class="fas fa-percentage"></i> ${pct}% סה"כ</span>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" onclick="location.hash='exam-sim'" aria-label="התחל סימולציית בחינה">
        <i class="fas fa-stopwatch"></i> סימולציית בחינה בעל-פה
      </button>
      <button class="btn btn-calm-breathe btn-lg" onclick="location.hash='breathing'" aria-label="תרגיל נשימה">
        <i class="fas fa-wind"></i> תרגיל נשימה
      </button>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#2b6cb0 0%,#2c5282 100%);color:white;margin-bottom:20px;padding:20px;border-radius:12px;cursor:pointer" onclick="location.hash='questions'" role="button" tabindex="0" aria-label="צפייה ב-96 שאלות בגרות אמיתיות">
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas fa-file-alt" style="font-size:24px"></i>
        </div>
        <div style="flex:1">
          <h2 style="margin:0 0 4px 0;font-size:20px;font-weight:bold">📋 96 שאלות בגרות אמיתיות</h2>
          <p style="margin:0;opacity:0.85;font-size:14px">5 מבחנים מלאים (2024-2025) עם טקסט מלא מילה במילה - לחצו לצפייה</p>
        </div>
        <div style="flex-shrink:0;font-size:28px;opacity:0.6"><i class="fas fa-arrow-left"></i></div>
      </div>
    </div>`;

  phases.forEach(phase => {
    html += `<div class="phase-title">${phase.name}</div><div class="units-grid" role="list">`;
    phase.ids.forEach(id => {
      const u = UNITS_DATA.find(x => x.id === id);
      const prog = getUnitProgress(id);
      const qs = EXAM_QUESTIONS.filter(q => q.unitIds.includes(id)).length;
      const freqClass = u.frequency.includes('גבוהה מאוד') ? 'high' : (u.excluded ? 'excluded' : '');
      const excludedClass = u.excluded ? ' excluded-unit' : '';
      const excludedBadge = u.excluded ? '<span class="excluded-badge">⚠️ לא במיקוד תשפ"ה</span>' : '';
      html += `<div class="unit-card${prog===100?' completed':''}${excludedClass}" onclick="location.hash='unit/${id}'" role="listitem" tabindex="0" aria-label="יחידה ${id}: ${u.title} - ${prog}% הושלם">
        <span class="unit-num">${id}</span>
        ${excludedBadge}
        <h3>${u.title}</h3>
        ${chunkDesc(u.desc, 'card')}
        <div class="unit-meta">
          <span><i class="fas fa-question-circle"></i> ${qs} שאלות</span>
          <span class="unit-badge ${freqClass}">תדירות: ${u.frequency}</span>
        </div>
        <div class="card-progress" role="progressbar" aria-valuenow="${prog}" aria-valuemin="0" aria-valuemax="100"><div class="card-progress-fill" style="width:${prog}%"></div></div>
      </div>`;
    });
    html += `</div>`;
  });

  // Credits section
  html += `
    <div class="credits-section" role="contentinfo" aria-label="קרדיטים ומקורות">
      <h3><i class="fas fa-book-open"></i> מקורות התכנים</h3>
      <div class="credits-grid">
        <div class="credits-item">
          <strong>📋 שאלות בגרות אמיתיות:</strong>
          <span>משרד החינוך - לשכת הבחינות</span>
          <small>(חורף 2024, קיץ 2024, חורף 2025, קיץ 2025, חורף 2026)</small>
        </div>
        <div class="credits-item">
          <strong>📖 חומר תיאורטי:</strong>
          <span>חוברת "אומץ" - הכנה לבגרות באזרחות תשפ״ו</span>
        </div>
        <div class="credits-item">
          <strong>🎯 מיקוד לבגרות:</strong>
          <span>משרד החינוך - מדור אזרחות (תשפ״ה-תשפ״ו)</span>
        </div>
      </div>
      <div class="credits-footer">
        <p><strong>פיתוח ויזום:</strong> אביחי ק. | פרויקט ללא מטרות רווח</p>
        <p class="credits-purpose">מטרה: הנגשת חומרי לימוד לתלמידי תיכון, במיוחד תלמידים בספקטרום האוטיסטי</p>
        <p class="credits-legal">כל הזכויות במקורות שייכות לבעליהן. שימוש בתכנים למטרות לימוד בלבד.</p>
      </div>
    </div>`;

  html += `</div>`;
  return html;
}

// ===== UNIT PAGE =====
function renderUnitPage() {
  const unit = UNITS_DATA.find(u => u.id === STATE.currentUnit);
  if (!unit) return '<div class="empty-state"><div class="icon">🤷</div><p>יחידה לא נמצאה</p></div>';
  const questions = EXAM_QUESTIONS.filter(q => q.unitIds.includes(unit.id));
  const tabs = [
    { id: 'learn', label: '📖 לימוד', icon: 'book' },
    { id: 'practice', label: '📝 תרגול', icon: 'pen', badge: questions.length },
    { id: 'summary', label: '✓ סיכום', icon: 'check' }
  ];

  let html = `<div class="unit-page">
    <div class="unit-header" role="banner">
      <button class="back-btn" onclick="location.hash=''" aria-label="חזרה לדף הבית"><i class="fas fa-arrow-right"></i> חזרה לדף הבית</button>
      <h1>${unit.icon} יחידה ${unit.id}: ${unit.title}</h1>
      ${chunkDesc(unit.desc, 'header')}
    </div>
    <div class="unit-tabs" role="tablist" aria-label="לשוניות יחידה">
      ${tabs.map(t => `<button class="unit-tab${STATE.currentTab===t.id?' active':''}" onclick="window.CivicsApp.setTab('${t.id}')" 
        role="tab" aria-selected="${STATE.currentTab===t.id}" aria-controls="tab-panel-${t.id}" tabindex="0">
        ${t.label}${t.badge ? ` (${t.badge})` : ''}
      </button>`).join('')}
    </div>
    <div role="tabpanel" id="tab-panel-${STATE.currentTab}">`;

  if (STATE.currentTab === 'learn') html += renderLearnTab(unit);
  else if (STATE.currentTab === 'practice') html += renderPracticeTab(unit, questions);
  else html += renderSummaryTab(unit);

  html += `</div></div>`;
  return html;
}

// ===== LEARN TAB WITH CHUNKING =====
function renderLearnTab(unit) {
  const concepts = unit.concepts;
  const chunkSize = A11Y.chunkSize;
  const totalPages = Math.ceil(concepts.length / chunkSize);
  const currentPage = A11Y.chunkPage[unit.id] || 0;
  const start = currentPage * chunkSize;
  const pageItems = concepts.slice(start, start + chunkSize);
  
  let html = `<div class="content-section" role="region" aria-label="מושגים והגדרות">
    <h2><i class="fas fa-graduation-cap"></i> מושגים והגדרות</h2>
    <div class="text-highlight-bar" role="toolbar" aria-label="כלי הדגשה">
      <button class="highlight-btn hl-yellow${_activeHighlight==='yellow'?' active':''}" onclick="window.CivicsApp.toggleHighlight('yellow')" title="הדגשה צהובה" aria-label="הדגשה צהובה"></button>
      <button class="highlight-btn hl-green${_activeHighlight==='green'?' active':''}" onclick="window.CivicsApp.toggleHighlight('green')" title="הדגשה ירוקה" aria-label="הדגשה ירוקה"></button>
      <button class="highlight-btn hl-blue${_activeHighlight==='blue'?' active':''}" onclick="window.CivicsApp.toggleHighlight('blue')" title="הדגשה כחולה" aria-label="הדגשה כחולה"></button>
      <button class="highlight-btn hl-pink${_activeHighlight==='pink'?' active':''}" onclick="window.CivicsApp.toggleHighlight('pink')" title="הדגשה ורודה" aria-label="הדגשה ורודה"></button>
      <button class="highlight-btn hl-clear" onclick="window.CivicsApp.clearHighlights(document.querySelector('.highlightable'))" title="נקה הדגשות" aria-label="נקה הדגשות"><i class="fas fa-eraser"></i></button>
    </div>
    <div class="chunk-info" role="status">מציג ${start+1}-${Math.min(start+chunkSize, concepts.length)} מתוך ${concepts.length} מושגים</div>`;
  
  pageItems.forEach((c, i) => {
    html += `<div class="definition-box" tabindex="0" role="article" aria-label="מושג: ${esc(c.term)}">
      <div class="def-title">${c.term} ${ttsBtn(c.term + '. ' + c.def, c.term)}</div>
      <div class="def-text highlightable" data-hl-id="concept-${unit.id}-${i}">${c.def}</div>
      <div class="def-source">מקור: ${c.source}</div>
    </div>`;
  });
  
  // Pagination
  if (totalPages > 1) {
    html += `<div class="chunk-pagination" role="navigation" aria-label="עמודי מושגים">`;
    if (currentPage > 0) {
      html += `<button class="btn btn-sm btn-primary" onclick="window.CivicsApp.setChunkPage(${unit.id},${currentPage-1})" aria-label="עמוד קודם"><i class="fas fa-arrow-right"></i> הקודם</button>`;
    }
    html += `<span class="chunk-page-info">עמוד ${currentPage+1} מתוך ${totalPages}</span>`;
    if (currentPage < totalPages - 1) {
      html += `<button class="btn btn-sm btn-primary" onclick="window.CivicsApp.setChunkPage(${unit.id},${currentPage+1})" aria-label="עמוד הבא">הבא <i class="fas fa-arrow-left"></i></button>`;
    }
    html += `</div>`;
  }
  html += `</div>`;

  // Infographics
  if (typeof INFOGRAPHICS !== 'undefined') {
    const infos = INFOGRAPHICS.filter(ig => ig.unitIds.includes(unit.id));
    if (infos.length > 0) {
      html += `<div class="content-section" role="region" aria-label="אינפוגרפיקות">
        <h2><i class="fas fa-project-diagram"></i> אינפוגרף – מפת מושגים</h2>`;
      infos.forEach(info => {
        html += `<div class="infographic-card">
          <div class="infographic-title">${info.title}</div>
          <div class="concept-map">`;
        info.nodes.forEach(node => {
          if (node.central) {
            html += `<div class="cmap-central">${node.label}</div>`;
          } else {
            html += `<div class="cmap-node" tabindex="0">${node.label}</div>`;
          }
        });
        html += `</div></div>`;
      });
      html += `</div>`;
    }
  }

  // Examples
  const examples = getExamplesForUnit(unit.id);
  if (examples.length > 0) {
    html += `<div class="content-section" role="region" aria-label="דוגמאות">
      <h2><i class="fas fa-lightbulb"></i> דוגמאות מעולם התלמידים</h2>`;
    examples.forEach(ex => {
      html += `<div class="example-box">${ex}</div>`;
    });
    html += `</div>`;
  }

  // Comparison tables
  if (typeof COMPARISON_TABLES !== 'undefined') {
    const tables = COMPARISON_TABLES.filter(t => t.unitIds.includes(unit.id));
    if (tables.length > 0) {
      html += `<div class="content-section" role="region" aria-label="טבלאות השוואה">
        <h2><i class="fas fa-table"></i> טבלאות השוואה (מיקוד 2025-26)</h2>`;
      tables.forEach(tbl => {
        html += `<div class="comparison-table-wrapper">
          <h3 class="table-title">${tbl.title}</h3>
          <div class="table-scroll">
          <table class="comparison-table" role="table" aria-label="${esc(tbl.title)}">
            <thead><tr>${tbl.headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
            <tbody>${tbl.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
          </div>
        </div>`;
      });
      html += `</div>`;
    }
  }

  // Mnemonics
  if (typeof MNEMONICS !== 'undefined') {
    const mnems = MNEMONICS.filter(m => m.unitIds.includes(unit.id));
    if (mnems.length > 0) {
      html += `<div class="content-section" role="region" aria-label="תומכי זיכרון">
        <h2><i class="fas fa-brain"></i> תומכי זיכרון</h2>`;
      mnems.forEach(m => {
        html += `<div class="mnemonic-box">
          <div class="mnemonic-title">${m.title}</div>
          <div class="mnemonic-content">${m.content}</div>
        </div>`;
      });
      html += `</div>`;
    }
  }

  // Study Materials from source documents (mikud, ometz, hidud)
  if (typeof STUDY_MATERIALS !== 'undefined' && STUDY_MATERIALS[unit.id] && STUDY_MATERIALS[unit.id].paragraphs.length > 0) {
    var sm = STUDY_MATERIALS[unit.id];
    var smChunkSize = 8;
    var smPage = A11Y.studyMatPage && A11Y.studyMatPage[unit.id] || 0;
    var smTotal = Math.ceil(sm.paragraphs.length / smChunkSize);
    var smStart = smPage * smChunkSize;
    var smItems = sm.paragraphs.slice(smStart, smStart + smChunkSize);
    
    html += '<div class="content-section" role="region" aria-label="חומר מיקוד">';
    html += '<h2><i class="fas fa-file-alt"></i> חומר מיקוד לבגרות</h2>';
    html += '<p style="color:var(--text-gray);font-size:13px;margin-bottom:12px">מקור: מיקוד בגרות 2026, חוברת אומץ, הנחיות משרד החינוך</p>';
    html += '<div class="chunk-info" role="status">מציג ' + (smStart+1) + '-' + Math.min(smStart+smChunkSize, sm.paragraphs.length) + ' מתוך ' + sm.paragraphs.length + ' פסקאות</div>';
    
    smItems.forEach(function(para) {
      var isHeader = para.length < 60 && !para.startsWith('-') && !para.startsWith('*');
      if (isHeader) {
        html += '<h3 style="color:#0038b8;font-size:16px;margin:16px 0 8px 0;font-weight:bold;border-bottom:2px solid #e2e8f0;padding-bottom:4px">' + para + '</h3>';
      } else {
        html += '<div class="definition-box highlightable" style="padding:12px 16px;margin-bottom:8px;line-height:1.9;font-size:' + A11Y.fontSize + '%">' + para + '</div>';
      }
    });
    
    if (smTotal > 1) {
      html += '<div class="chunk-pagination" role="navigation" aria-label="עמודי חומר מיקוד">';
      if (smPage > 0) {
        html += '<button class="btn btn-sm btn-primary" onclick="window.CivicsApp.setStudyMatPage(' + unit.id + ',' + (smPage-1) + ')"><i class="fas fa-arrow-right"></i> הקודם</button>';
      }
      html += '<span class="chunk-page-info">עמוד ' + (smPage+1) + ' מתוך ' + smTotal + '</span>';
      if (smPage < smTotal - 1) {
        html += '<button class="btn btn-sm btn-primary" onclick="window.CivicsApp.setStudyMatPage(' + unit.id + ',' + (smPage+1) + ')">הבא <i class="fas fa-arrow-left"></i></button>';
      }
      html += '</div>';
    }
    html += '</div>';
  }

  return html;
}

function setChunkPage(unitId, page) {
  A11Y.chunkPage[unitId] = page;
  render();
  // Scroll to top of content
  const section = document.querySelector('.content-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function setStudyMatPage(unitId, page) {
  if (!A11Y.studyMatPage) A11Y.studyMatPage = {};
  A11Y.studyMatPage[unitId] = page;
  render();
  var el = document.querySelector('[aria-label="חומר מיקוד"]');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function getExamplesForUnit(id) {
  const map = {
    1: ['החלטת 181 היא כמו כללי המשחק שנקבעו לפני שהמשחק מתחיל - כולם צריכים להסכים על החלוקה.'],
    2: ['מגילת העצמאות היא כמו "About" של המדינה - מספרת מאיפה באנו, מה הערכים שלנו, ומה המטרות.'],
    3: ['לאומיות אתנית = קבוצת חברים שגדלו יחד ומכירים מילדות. לאומיות פוליטית = קבוצת WhatsApp שכולם הצטרפו אליה כי הם גרים באותו בניין.'],
    4: ['הסטטוס קוו הוא כמו הסכם שכנים בבניין - כולם מוותרים על משהו כדי שכולם יוכלו לגור יחד בשלום.'],
    5: ['זכויות מיעוטים = כמו שבליגת האלופות יש כללים שמגנים על קבוצות קטנות ומאפשרות להן להתחרות.'],
    6: ['יחסי ישראל-תפוצות = כמו קבוצת אוהדים גלובלית שתומכת בקבוצה המקומית גם ממרחק.'],
    7: ['פלורליזם = בליגת האלופות יש קבוצות מסגנונות שונים (התקפיות, הגנתיות), וכולן יכולות להתחרות. שוויון = כל שחקן מתחיל את המשחק עם אותם משאבים.'],
    8: ['חופש ביטוי = אפשר לכתוב ביקורת על משחק ב-Steam גם אם היא שלילית, בתנאי שהיא לא משקרת. פרטיות = כמו שאף אחד לא צריך לדעת מה יש לך ב-inventory.'],
    9: ['דמוקרטיה מתגוננת = כמו admin שמנהל שרת Discord ומרחיק משתמשים שמנסים להרוס אותו. חוקי יסוד = כמו ה-Terms of Service - כללים שאף אחד לא יכול לשנות בקלות.'],
    10: ['ליברלית = שוק חופשי כמו Marketplace ב-Fortnite - כל אחד קונה מה שהוא רוצה. סוציאל-דמוקרטית = כמו משחק שבו כולם מתחילים עם ציוד בסיסי זהה.'],
    11: ['הכנסת = קבוצת ה-WhatsApp של כל המחלקות בבית הספר - מחליטים על כללים שחלים על כולם. הממשלה = הצוות שמבצע בפועל את ההחלטות. בית המשפט = השופט ששורק כשמישהו עובר על הכללים.'],
    12: ['מנגנון פיקוח פורמלי = כמו מורה תורן שחובתו לעבור בין הכיתות. בלתי פורמלי = כמו תלמיד שמצלם בטלפון ומעלה לרשת.'],
    13: ['שיטת הבחירות = כמו הצבעה על שיר הכיתה - כולם מצביעים (כלליות), בפתק סגור (חשאיות), כל שנה מחדש (מחזוריות), כל קול שווה (שוויוניות), וכל אחד יכול להציע שיר (התמודדות חופשית).'],
    14: ['התקשורת = כמו מי שמפרסם ברשתות החברתיות של בית הספר - יכול לחשוף עוולות אבל גם להטות דעות. בעלות צולבת = כמו אחד שמנהל גם את האינסטגרם, גם את הטיקטוק וגם את הטוויטר של בית הספר.'],
    15: ['רשות מקומית = כמו מועצת התלמידים - דואגת לדברים הקטנים ביום-יום. קבוצות אינטרס = כמו העצומה שהחתמתם כדי לשנות את תפריט המזנון.'],
    16: ['כל הנושאים מתחברים כמו פאזל: ההיסטוריה (למה יש מדינה) → הערכים (דמוקרטיה, זכויות) → המוסדות (מי שומר על הכללים) → החברה (איך חיים ביחד).']
  };
  return map[id] || [];
}

// ===== PRACTICE TAB WITH SCAFFOLDING SYSTEM =====
function renderPracticeTab(unit, questions) {
  if (questions.length === 0) {
    return `<div class="empty-state"><div class="icon">📝</div><p>אין שאלות מבחינות ליחידה זו</p></div>`;
  }
  let html = `<div class="practice-instructions" role="region" aria-label="הנחיות למענה">
    <div class="practice-instructions-header">
      <h3><i class="fas fa-clipboard-list"></i> הנחיות למענה על שאלות</h3>
      <button class="btn btn-minimal-toggle${A11Y.minimalMode ? ' active' : ''}" onclick="window.CivicsApp.toggleMinimalMode()" aria-label="${A11Y.minimalMode ? 'כבה מצב מינימלי' : 'הפעל מצב מינימלי'}" title="מצב מינימלי - מפחית עומס חזותי">
        <i class="fas fa-${A11Y.minimalMode ? 'eye' : 'eye-slash'}"></i> ${A11Y.minimalMode ? 'מצב רגיל' : 'מצב מינימלי'}
      </button>
    </div>
    <ol class="instructions-list">
      <li><span class="inst-letter">א.</span> קראו בעיון את השאלה בלשון המקור.</li>
      <li><span class="inst-letter">ב.</span> השתמשו בטאבים למעלה: פישוט, תבנית תשובה, או הגדרות.</li>
      <li><span class="inst-letter">ג.</span> עקבו אחרי המדריך שבצד ימין - צעד אחר צעד.</li>
      <li><span class="inst-letter">ד.</span> כתבו נקודות ו/או הקליטו את תשובתכם.</li>
      <li><span class="inst-letter">ה.</span> קראו בעיון את תשובתכם ותקנו במידת הצורך.</li>
    </ol>
  </div>`;
  questions.forEach((q, i) => {
    const prog = getProgress(unit.id);
    const savedNotes = prog.answers[q.id + '_notes'] || '';
    const savedOral = prog.answers[q.id + '_oral'] || '';
    const legacyAnswer = prog.answers[q.id] || '';
    const notesVal = savedNotes || legacyAnswer;
    const noteKey = 'q_' + q.id;
    
    // Generate scaffolding data for this question
    const scaffold = generateScaffold(q);
    // Determine frequency badge
    const freqBadge = unit.frequency === 'גבוהה' ? `<span class="must-know-badge freq-badge-high">חובה לדעת!</span>` :
                      unit.frequency === 'בינונית' ? `<span class="must-know-badge freq-badge-medium">חשוב לדעת</span>` : '';
    
    const dvOpen = isDualViewOpen(q.id);
    const showToggle = A11Y.supportLevel >= 2;
    const showTabs = dvOpen || A11Y.supportLevel === 3;
    const currentMode = getViewMode(q.id);
    const modeClass = currentMode === 'c' ? 'mode-c' : (dvOpen ? 'mode-b' : 'mode-a');
    
    html += `<div class="exam-question-block" role="article" aria-label="שאלה ${i+1}">
      <div class="eq-header">
        <span style="font-weight:700">שאלה ${i+1} מתוך ${questions.length}</span>
        <span class="eq-badge ${q.examClass}">${q.exam}</span>
        ${freqBadge}
        <span class="support-level-indicator" title="רמת תמיכה ${A11Y.supportLevel}">רמה ${A11Y.supportLevel}/3</span>
        ${A11Y.ttsEnabled ? `<button class="btn btn-sm" onclick="window.CivicsApp.speakText(document.getElementById('q-text-${q.id}').textContent)" title="הקראה" aria-label="הקרא שאלה"><i class="fas fa-volume-up"></i></button>` : ''}
      </div>
      
      <!-- Toggle Button (Mode A ↔ B ↔ C) - visible at Level 2+ -->
      ${showToggle ? `<div class="scaffold-toggle-area" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="scaffold-toggle-btn${currentMode==='b'?' open':''}" onclick="window.CivicsApp.${dvOpen ? "toggleDualView('" + q.id + "')" : "toggleDualView('" + q.id + "')"}" aria-expanded="${dvOpen}" aria-controls="scaffold-panel-${q.id}">
          ${dvOpen
            ? '<i class="fas fa-compress-alt"></i> הסתר הסבר'
            : '<i class="fas fa-lightbulb"></i> 💡 הצג הסבר מפושט'}
        </button>
        ${dvOpen ? `<button class="scaffold-toggle-btn${currentMode==='c'?' open':''}" onclick="window.CivicsApp.setViewMode('${q.id}','${currentMode==='c'?'b':'c'}')" aria-label="${currentMode==='c'?'חזור לתצוגה כפולה':'הצג הסבר בלבד'}" style="min-width:120px">
          ${currentMode==='c' ? '<i class="fas fa-columns"></i> תצוגה כפולה' : '<i class="fas fa-file-alt"></i> הסבר בלבד'}
        </button>` : ''}
      </div>` : ''}
      
      <!-- Scaffolding Tabs - 3-Level Support System (per Master Guide) -->
      ${showTabs ? `<div class="scaffold-tabs" role="tablist" aria-label="רמות scaffolding">
        <button class="scaffold-tab${A11Y.scaffoldLevel==='original'?' active':''}" onclick="window.CivicsApp.setScaffoldLevel('original')" role="tab" aria-selected="${A11Y.scaffoldLevel==='original'}">
          <span class="tab-icon">📘</span> רמה 1: פירוק
        </button>
        <button class="scaffold-tab${A11Y.scaffoldLevel==='simplified'?' active':''}" onclick="window.CivicsApp.setScaffoldLevel('simplified')" role="tab" aria-selected="${A11Y.scaffoldLevel==='simplified'}">
          <span class="tab-icon">📗</span> רמה 2: הנחיה
        </button>
        <button class="scaffold-tab${A11Y.scaffoldLevel==='template'?' active':''}" onclick="window.CivicsApp.setScaffoldLevel('template')" role="tab" aria-selected="${A11Y.scaffoldLevel==='template'}">
          <span class="tab-icon">📕</span> רמה 3: תבנית
        </button>
        <button class="scaffold-tab${A11Y.scaffoldLevel==='settings'?' active':''}" onclick="window.CivicsApp.setScaffoldLevel('settings')" role="tab" aria-selected="${A11Y.scaffoldLevel==='settings'}">
          <span class="tab-icon">⚙️</span> הגדרות
        </button>
      </div>` : ''}

      <div class="scaffold-content ${modeClass}">
        <!-- Original Question Panel -->
        <div class="scaffold-question" id="q-text-${q.id}">
          <div class="panel-header">
            <span class="panel-title">📄 נוסח מבחן מקורי</span>
            <span class="panel-badge badge-mandatory">חובה לדעת!</span>
          </div>
          ${q.passage ? `<div class="eq-passage" role="blockquote">${q.passage}</div>` : ''}
          <div class="eq-question">${q.question} ${ttsBtn(q.question, 'שאלה')}</div>
          <div class="eq-meta">
            <span><i class="fas fa-clock"></i> זמן מוצע: ${scaffold.time} דקות</span>
            <span><i class="fas fa-star"></i> ${scaffold.points} נקודות</span>
          </div>
        </div>
        
        <!-- Scaffolding Guide Panel -->
        ${dvOpen ? `<div class="scaffold-guide" id="scaffold-panel-${q.id}" role="region" aria-label="מדריך לתשובה" tabindex="-1">
          <div class="panel-header">
            <span class="panel-title">💡 מדריך לתשובה מנצחת</span>
            <span class="panel-badge badge-help">עזרה להבנה</span>
          </div>
          ${A11Y.scaffoldLevel === 'simplified' ? renderScaffoldSimplified(scaffold, q) : ''}
          ${A11Y.scaffoldLevel === 'template' ? renderScaffoldTemplate(scaffold, q) : ''}
          ${A11Y.scaffoldLevel === 'settings' ? renderScaffoldSettings() : ''}
          ${A11Y.scaffoldLevel === 'original' ? renderScaffoldOriginal(scaffold, q) : ''}
        </div>` : `<div class="scaffold-guide" id="scaffold-panel-${q.id}" role="region" aria-label="מדריך לתשובה" tabindex="-1">
          ${renderScaffoldOriginal(scaffold, q)}
        </div>`}
      </div>

      <div class="scaffold-answers-area">
        <div class="eq-buttons">
          <button class="btn btn-hint" onclick="window.CivicsApp.toggleEl('hint-${q.id}')" aria-expanded="false" aria-controls="hint-${q.id}"><i class="fas fa-lightbulb"></i> רמז</button>
          <button class="btn btn-strategy" onclick="window.CivicsApp.toggleEl('strat-${q.id}')" aria-expanded="false" aria-controls="strat-${q.id}"><i class="fas fa-bullseye"></i> אסטרטגיה</button>
        </div>
        <div id="hint-${q.id}" class="hint-box" role="region" aria-label="רמז">💡 <strong>רמז:</strong> ${q.hint}</div>
        <div id="strat-${q.id}" class="strategy-box" role="region" aria-label="אסטרטגיה">🎯 <strong>אסטרטגיה:</strong> ${q.strategy}</div>

        <div class="practice-split">
          <div class="practice-section notes-section">
            <div class="section-label"><i class="fas fa-pen"></i> שלב 1: כתיבת נקודות</div>
            <div class="section-desc">כתבו 3-5 נקודות מרכזיות (לא משפטים מלאים!)</div>
            <textarea id="ans-${q.id}_notes" placeholder="• נקודה 1...\n• נקודה 2...\n• נקודה 3..." aria-label="כתיבת נקודות לשאלה ${i+1}"
              oninput="window.CivicsApp.saveAnswer('${unit.id}','${q.id}_notes',this.value)">${esc(notesVal)}</textarea>
          </div>
          <div class="practice-section oral-section">
            <div class="section-label"><i class="fas fa-microphone"></i> שלב 2: תשובה מלאה בעל-פה</div>
            <div class="section-desc">הקליטו את תשובתכם המלאה כולל הגדרות, ציטוטים והסברים</div>
            <button class="btn btn-record btn-record-large" id="rec-btn-${q.id}" onclick="window.CivicsApp.toggleRecord('${q.id}')" aria-label="התחל/עצור הקלטה לשאלה ${i+1}"><i class="fas fa-microphone"></i> הקלטת תשובה מלאה בעל-פה</button>
            <textarea id="ans-${q.id}" class="oral-textarea" placeholder="תמליל ההקלטה יופיע כאן...\nניתן גם לכתוב ידנית." aria-label="תמליל תשובה בעל-פה לשאלה ${i+1}"
              oninput="window.CivicsApp.saveAnswer('${unit.id}','${q.id}_oral',this.value)">${esc(savedOral)}</textarea>
          </div>
        </div>

        <!-- Personal Notes -->
        <div class="personal-notes-section">
          <div class="section-label"><i class="fas fa-sticky-note"></i> הערות אישיות</div>
          <textarea class="personal-note-input" placeholder="הערות פרטיות שלכם לשאלה הזו..." aria-label="הערות אישיות"
            oninput="window.CivicsApp.saveNote('${noteKey}',this.value)">${esc(getNote(noteKey))}</textarea>
        </div>

        <button class="btn btn-solution" onclick="window.CivicsApp.toggleEl('sol-${q.id}')" aria-expanded="false" aria-controls="sol-${q.id}"><i class="fas fa-eye"></i> הצג פתרון</button>
        <div id="sol-${q.id}" class="solution-box" role="region" aria-label="פתרון">
          <h4>✓ פתרון מוצע:</h4>
          ${q.solution.map(s => `<div class="solution-point"><strong>${s.label}:</strong> ${s.text}</div>`).join('')}
        </div>
        ${q.modelAnswer ? `
        <button class="btn btn-model-answer" onclick="window.CivicsApp.toggleEl('model-${q.id}')" aria-expanded="false" aria-controls="model-${q.id}"><i class="fas fa-star"></i> תשובה מלאה לדוגמה</button>
        <div id="model-${q.id}" class="model-answer-box" role="region" aria-label="תשובה מלאה לדוגמה">
          <div class="model-answer-header">
            <i class="fas fa-graduation-cap"></i>
            <span>תשובה מלאה לדוגמה — כך צריכה להיראות תשובה בבחינה</span>
          </div>
          <div class="model-answer-content">${q.modelAnswer.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}</div>
          <div class="model-answer-tip">
            <i class="fas fa-info-circle"></i>
            שימו לב למבנה: ציון → הצגה (הגדרה) → ציטוט/קישור → הסבר. זהו המבנה שהבוחנים מצפים לראות.
          </div>
        </div>` : ''}
      </div>
    </div>`;
  });
  return html;
}

// ===== SCAFFOLDING HELPERS =====
function generateScaffold(q) {
  // Use custom scaffolding data if provided on the question
  if (q.scaffold) {
    return {
      verbs: q.scaffold.verbs || extractVerbs(q.question),
      checklist: q.scaffold.checklist || q.solution.map(s => s.label),
      steps: q.scaffold.steps || q.solution.map((s, i) => ({
        num: i + 1, label: s.label,
        icon: i === 0 ? '📌' : i === 1 ? '📝' : i === 2 ? '💬' : '✏️'
      })),
      time: q.scaffold.time || (q.passage ? 6 : 4),
      points: q.scaffold.points || q.solution.length * 3,
      simplified: q.scaffold.simplified || '',
      tip: q.scaffold.tip || 'השתמשו במילים קצרות וברורות. רשמו נקודות, לא משפטים שלמים.'
    };
  }
  // Smart auto-generate scaffolding from question data
  const verbs = extractVerbs(q.question);
  const checklist = buildSmartChecklist(q);
  const icons = ['📌','📝','💬','✏️','🎯','📋','💡','🔍'];
  const steps = q.solution.map((s, i) => ({
    num: i + 1, label: s.label, icon: icons[i] || '✏️'
  }));
  const time = q.passage ? 6 : (q.solution.length > 3 ? 5 : 4);
  const points = q.solution.length * 3;
  const simplified = autoSimplify(q);
  const tip = generateSmartTip(q, verbs);
  return { verbs, checklist, steps, time, points, simplified, tip };
}

function buildSmartChecklist(q) {
  const items = [];
  const qText = q.question;
  
  // Analyze what the question asks for based on verbs
  if (qText.includes('ציינו')) items.push('לזהות ולציין את המושג/עיקרון/זכות');
  if (qText.includes('הציגו')) items.push('להציג ולהגדיר את המושג');
  if (qText.includes('צטטו')) items.push('למצוא ולהעתיק ציטוט מהקטע');
  if (qText.includes('הסבירו')) items.push('להסביר את הקשר');
  if (qText.includes('נמקו')) items.push('לנמק ולהסביר למה');
  if (qText.includes('המחישו')) items.push('לתת דוגמה מהמציאות');
  if (qText.includes('השוו') || qText.includes('דמיון') || qText.includes('הבדל')) {
    items.push('למצוא דמיון או הבדל');
  }
  if (qText.includes('פנייה') || qText.includes('פניות')) items.push('לזהות את הפנייה הרלוונטית');

  // Always add solution-based items if checklist is still small
  if (items.length < 2) {
    q.solution.forEach(s => items.push(s.label));
  }
  
  // Add passage-specific item
  if (q.passage && !items.some(it => it.includes('ציטוט'))) {
    items.push('לקשר לקטע הנתון');
  }
  
  return items;
}

function autoSimplify(q) {
  let text = q.question
    .replace(/ציינו והציגו/g, 'תגידו מה זה ותסבירו')
    .replace(/ציינו/g, 'אמרו מה זה')
    .replace(/הציגו/g, 'הסבירו')
    .replace(/נמקו/g, 'תגידו למה')
    .replace(/צטטו/g, 'תעתיקו משפט')
    .replace(/התייחסו/g, 'דברו על')
    .replace(/באה לידי ביטוי/g, 'רואים את זה')
    .replace(/המחישו/g, 'תנו דוגמה')
    .replace(/בא לידי ביטוי/g, 'רואים את זה')
    .replace(/מנגנון/g, 'כלי / דרך')
    .replace(/עיקרון/g, 'רעיון');
  
  // Add solution summary
  if (q.solution.length > 0) {
    text += '\n\n📝 צריך לכתוב: ' + q.solution.map((s, i) => (i+1) + ') ' + s.label).join(', ') + '.';
  }
  return text;
}

function generateSmartTip(q, verbs) {
  const tips = [];
  if (q.passage) tips.push('קראו את הקטע לפני שעונים. סמנו מילות מפתח.');
  if (verbs.includes('צטטו')) tips.push('חפשו משפט בקטע שאפשר לשים במרכאות.');
  if (verbs.includes('הסבירו')) tips.push('השתמשו במילה "כלומר" לקשר בין הדברים.');
  if (q.question.includes('דמיון') || q.question.includes('הבדל')) {
    tips.push('שימו לב: דמיון = מה דומה, הבדל = מה שונה.');
  }
  if (tips.length === 0) tips.push('כתבו נקודות קצרות וברורות. אל תשכחו לכתוב משפטים שלמים.');
  return tips.join(' ');
}

function extractVerbs(text) {
  const verbs = [];
  const verbMap = [
    ['ציינו', 'ציינו'], ['הציגו', 'הציגו'], ['הסבירו', 'הסבירו'],
    ['צטטו', 'צטטו'], ['השוו', 'השוו'], ['נמקו', 'נמקו'],
    ['התייחסו', 'התייחסו'], ['המחישו', 'המחישו'], ['פרטו', 'פרטו']
  ];
  verbMap.forEach(([search, label]) => {
    if (text.includes(search)) verbs.push(label);
  });
  if (verbs.length === 0) verbs.push('ענו');
  return verbs;
}

function renderScaffoldOriginal(scaffold, q) {
  const sp = getScaffoldProg(q.id);
  const totalChecks = scaffold.checklist.length;
  const doneChecks = sp.checks.filter(Boolean).length;
  const pctDone = totalChecks > 0 ? Math.round(doneChecks / totalChecks * 100) : 0;
  const allDone = doneChecks === totalChecks && totalChecks > 0;
  // Get scaffolding levels data for enriched breakdown and rubric
  const sl = findScaffoldingLevel(q);
  
  return `<div class="scaffold-panel scaffold-level-1" role="region" aria-label="רמה 1 - פירוק השאלה">
    <h4><i class="fas fa-lightbulb"></i> 📘 רמה 1: פירוק השאלה ${ttsBtn(scaffold.checklist.join('. '), 'מדריך')}</h4>
    <div class="scaffold-level-desc">תמיכה מינימלית - לתלמידים שצריכים רק כיוון</div>
    
    <!-- Visual Schedule / Progress Indicator -->
    <div class="scaffold-progress-bar" role="progressbar" aria-valuenow="${pctDone}" aria-valuemin="0" aria-valuemax="100" aria-label="התקדמות במדריך">
      <div class="scaffold-progress-track">
        <div class="scaffold-progress-fill${allDone ? ' complete' : ''}" style="width:${pctDone}%"></div>
      </div>
      <div class="scaffold-progress-label">${allDone ? '✅ הושלם!' : `${doneChecks} מתוך ${totalChecks} שלבים`}</div>
    </div>
    
    ${sl && sl.bd ? `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">🔍</span> פירוק השאלה - שלושת המוקדים:</div>
      <div class="breakdown-list">
        ${sl.bd.map((b, i) => `<div class="breakdown-item"><span class="breakdown-num">${i+1}.</span> ${esc(b)}</div>`).join('')}
      </div>
    </div>` : ''}
    <div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">🎯</span> רשימת בדיקה - מה מבקשים ממני?</div>
      <div class="scaffold-checklist" role="group" aria-label="רשימת בדיקה">
        ${scaffold.checklist.map((item, i) => {
          const checked = sp.checks[i] || false;
          return `<label class="scaffold-check-item scaffold-check-interactive${checked ? ' checked' : ''}" tabindex="0">
          <input type="checkbox" class="scaffold-cb" data-qid="${q.id}" data-idx="${i}" ${checked ? 'checked' : ''} onchange="window.CivicsApp.onScaffoldCheck(this)" aria-label="${esc(item)}">
          <span>${item}</span>
        </label>`;
        }).join('')}
      </div>
    </div>
    <div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">🗺️</span> מפת דרכים - שלבי התשובה</div>
      ${sl && sl.rm ? `<div class="roadmap-display">${esc(sl.rm)}</div>` : ''}
      <div class="scaffold-steps">
        ${scaffold.steps.map((s, i) => `<span class="scaffold-step-pill${sp.checks[i] ? ' step-done' : ''}" tabindex="0">${s.icon} שלב ${s.num}: ${s.label}</span>${i < scaffold.steps.length - 1 ? '<span class="scaffold-arrow">←</span>' : ''}`).join('')}
      </div>
    </div>
    <!-- Rubric / Grading Criteria -->
    <div class="scaffold-section scaffold-criteria-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">⭐</span> רובריקה - קריטריוני הצלחה</div>
      ${sl && sl.rb ? '<div class="rubric-grid">' + Object.entries(sl.rb).map(([k,v]) => { const labels = {definition:'הגדרה',importance:'חשיבות',example:'דוגמה',context:'הקשר',quote:'ציטוט',explanation:'הסבר'}; return '<div class="rubric-item"><span class="rubric-label">' + (labels[k] || k) + '</span><span class="rubric-points">' + esc(v) + '</span></div>'; }).join('') + '</div>' : `<div class="criteria-grid">
        ${scaffold.steps.map((s, i) => { const pts = scaffold.points ? Math.round(scaffold.points / scaffold.steps.length) : 3; return '<div class="criteria-item"><span class="criteria-icon">' + s.icon + '</span><span class="criteria-label">' + s.label + '</span><span class="criteria-points">' + pts + ' נק\u0027</span></div>'; }).join('')}
        <div class="criteria-total">
          <span class="criteria-total-label">סה"כ</span>
          <span class="criteria-total-points">${scaffold.points} נקודות</span>
        </div>
      </div>`}
    </div>
    
    <div class="scaffold-tip">
      <i class="fas fa-info-circle"></i> טיפ: ${scaffold.tip}
    </div>
  </div>`;
}

function renderScaffoldSimplified(scaffold, q) {
  // Use custom simplified text if available, otherwise auto-simplify
  let simplified = scaffold.simplified;
  if (!simplified) {
    simplified = q.question
      .replace(/ציינו והציגו/g, 'תגידו מה זה ותסבירו')
      .replace(/ציינו/g, 'אמרו')
      .replace(/הציגו/g, 'הסבירו')
      .replace(/נמקו/g, 'תגידו למה')
      .replace(/צטטו/g, 'תעתיקו משפט')
      .replace(/התייחסו/g, 'דברו על')
      .replace(/באה לידי ביטוי/g, 'רואים את זה')
      .replace(/המחישו/g, 'תנו דוגמה')
      .replace(/בא לידי ביטוי/g, 'רואים את זה');
  }
  
  // Find related glossary terms
  const glossaryTerms = findGlossaryTerms(q);
  // Get scaffolding levels data for word bank and guiding questions
  const sl = findScaffoldingLevel(q);
    
  return `<div class="scaffold-panel scaffold-simplified scaffold-level-2" role="region" aria-label="רמה 2 - שאלות מנחות">
    <h4><i class="fas fa-comments"></i> 📗 רמה 2: הנחיה ${ttsBtn(simplified, 'הסבר מפושט')}</h4>
    <div class="scaffold-level-desc">תמיכה בינונית - שאלות מנחות ובנק מילים</div>
    ${sl && sl.gq ? `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">❓</span> שאלות מנחות:</div>
      <div class="guiding-questions-list">
        ${sl.gq.map((gq, i) => `<div class="guiding-q-item"><span class="gq-num">${i+1}.</span> ${esc(gq)}</div>`).join('')}
      </div>
    </div>` : ''}
    <div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">🗣️</span> מה רוצים ממני? (בשפה פשוטה)</div>
      <div class="simplified-text">${simplified}</div>
    </div>
    ${sl && sl.wb ? `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">📋</span> בנק מילים - מושגי מפתח:</div>
      <div class="word-bank-grid">
        ${sl.wb.map(w => `<span class="word-bank-tag">${esc(w)}</span>`).join('')}
      </div>
    </div>` : `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">📋</span> צריך לכתוב:</div>
      <div class="scaffold-checklist">
        ${scaffold.checklist.map((item, i) => `<div class="scaffold-check-item"><span class="scaffold-num">${i+1}</span> ${item}</div>`).join('')}
      </div>
    </div>`}
    <div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">💪</span> מילות פעולה נדרשות:</div>
      <div class="scaffold-verbs">
        ${scaffold.verbs.map(v => `<span class="verb-pill">${v}</span>`).join('')}
      </div>
    </div>
    ${sl && sl.at ? `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">📝</span> תבנית תשובה ריקה:</div>
      <div class="answer-template-box">
        ${Object.entries(sl.at).map(([k,v]) => `<div class="template-line">${esc(v)}</div>`).join('')}
      </div>
    </div>` : ''}
    ${glossaryTerms.length > 0 ? `<div class="scaffold-section scaffold-glossary-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">📖</span> מילון מונחים</div>
      <div class="glossary-list">
        ${glossaryTerms.map(t => `<details class="glossary-item">
          <summary class="glossary-term" tabindex="0"><i class="fas fa-book-open"></i> ${esc(t.term)}</summary>
          <div class="glossary-def">${esc(t.def)}</div>
        </details>`).join('')}
      </div>
    </div>` : ''}
    <div class="scaffold-tip">
      <i class="fas fa-info-circle"></i> אל תפחדו מהשאלה! פשוט ענו שלב אחרי שלב.
    </div>
  </div>`;
}

function renderScaffoldTemplate(scaffold, q) {
  const sp = getScaffoldProg(q.id);
  // Get scaffolding levels data for sentence starters, hint dictionary, checklist
  const sl = findScaffoldingLevel(q);
  
  // Use sentence starters from scaffolding data if available, else fallback to scaffold steps
  const hasSentenceStarters = sl && sl.ss && sl.ss.length > 0;
  const hasHintDictionary = sl && sl.hd && Object.keys(sl.hd).length > 0;
  const hasTopicChecklist = sl && sl.cl && sl.cl.length > 0;
  
  return `<div class="scaffold-panel scaffold-template scaffold-level-3">
    <h4><i class="fas fa-file-alt"></i> 📕 רמה 3: תבנית מלאה</h4>
    <div class="scaffold-level-desc">תמיכה מקסימלית - משפטי פתיחה, מילון רמזים, וצ'קליסט</div>
    ${hasSentenceStarters ? `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">✏️</span> משפטי פתיחה - התחילו מכאן:</div>
      <div class="sentence-starters-list">
        ${sl.ss.map((s, i) => { const savedFill = sp.templateFills['ss'+i] || ''; return '<div class="sentence-starter-item"><div class="starter-text">' + esc(s) + '</div><textarea class="template-fill-input starter-fill" data-qid="' + q.id + '" data-step="ss' + i + '" placeholder="המשיכו את המשפט..." aria-label="השלמת משפט ' + (i+1) + '" oninput="window.CivicsApp.saveTemplateFill(\'' + q.id + '\',\'ss' + i + '\',this.value)">' + esc(savedFill) + '</textarea></div>'; }).join('')}
      </div>
    </div>` : `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">📝</span> משפטי פתיחה - מלאו את התבנית:</div>
      <div class="template-steps">
        ${scaffold.steps.map((s, i) => { const savedFill = sp.templateFills[i] || ''; return '<div class="template-step"><div class="template-step-header">' + s.icon + ' שלב ' + s.num + ': ' + s.label + '</div><textarea class="template-fill-input" data-qid="' + q.id + '" data-step="' + i + '" placeholder="כתבו כאן את ' + s.label + '..." aria-label="מילוי שלב ' + s.num + ': ' + s.label + '" oninput="window.CivicsApp.saveTemplateFill(\'' + q.id + '\',' + i + ',this.value)">' + esc(savedFill) + '</textarea></div>'; }).join('')}
      </div>
    </div>`}
    ${q.passage ? `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">💬</span> מצאו ציטוט מהקטע:</div>
      <textarea class="template-fill-input template-quote-input" data-qid="${q.id}" data-step="quote"
        placeholder='העתיקו ציטוט מהקטע...'
        aria-label="ציטוט מהקטע"
        oninput="window.CivicsApp.saveTemplateFill('${q.id}','quote',this.value)">${esc(sp.templateFills['quote'] || '')}</textarea>
    </div>` : ''}
    ${hasHintDictionary ? `<div class="scaffold-section">
      <div class="scaffold-section-title"><span class="scaffold-icon">💡</span> מילון רמזים - לחצו לגילוי:</div>
      <div class="hint-dictionary">
        ${Object.entries(sl.hd).map(([term, hint]) => '<details class="hint-dict-item"><summary class="hint-dict-term" tabindex="0"><i class="fas fa-key"></i> ' + esc(term) + '</summary><div class="hint-dict-hint">' + esc(hint) + '</div></details>').join('')}
      </div>
    </div>` : ''}
    <div class="scaffold-template-actions">
      <button class="btn btn-copy-template" onclick="window.CivicsApp.copyTemplateToAnswer('${q.id}')" aria-label="העתק תבנית לתשובה">
        <i class="fas fa-clipboard"></i> העתק לנקודות
      </button>
    </div>
    <!-- Self-Check Checklist (Level 3 - per Master Guide) -->
    <div class="scaffold-section scaffold-self-check">
      <div class="scaffold-section-title"><span class="scaffold-icon">✅</span> צ'קליסט בקרה עצמית:</div>
      <div class="self-check-list">
        ${hasTopicChecklist ? sl.cl.map((item, i) => '<label class="self-check-item" tabindex="0"><input type="checkbox" aria-label="' + esc(item) + '"> <span>' + esc(item) + '</span></label>').join('') : scaffold.checklist.map((item, i) => '<label class="self-check-item" tabindex="0"><input type="checkbox" aria-label="' + esc(item) + '"> <span>☑ ' + item + '</span></label>').join('')}
        <label class="self-check-item" tabindex="0">
          <input type="checkbox" aria-label="בדקתי איות ופיסוק"> <span>☑ בדקתי איות ופיסוק</span>
        </label>
        <label class="self-check-item" tabindex="0">
          <input type="checkbox" aria-label="כתבתי במשפטים מלאים"> <span>☑ כתבתי במשפטים מלאים</span>
        </label>
      </div>
    </div>
    <div class="scaffold-tip">
      <i class="fas fa-info-circle"></i> מלאו את השדות ולחצו "העתק לנקודות" כדי להעביר לתשובה. סמנו בצ'קליסט מה בדקתם.
    </div>
  </div>`;
}

function renderScaffoldSettings() {
  return `<div class="scaffold-panel scaffold-settings">
    <h4><i class="fas fa-cog"></i> הגדרות תמיכה</h4>
    <div class="scaffold-setting-group">
      <label>🎓 רמת תמיכה (Support Level)</label>
      <div class="setting-desc">בחרו את רמת הסיוע הרצויה</div>
      <div class="support-level-selector compact">
        <button class="support-level-btn${A11Y.supportLevel===1?' active':''}" onclick="window.CivicsApp.setSupportLevel(1)">
          <span class="sl-num">1</span>
          <span class="sl-label">📘 תלמיד חזק</span>
          <span class="sl-desc">פירוק שאלה + מפת דרכים + רובריקה</span>
        </button>
        <button class="support-level-btn${A11Y.supportLevel===2?' active':''}" onclick="window.CivicsApp.setSupportLevel(2)">
          <span class="sl-num">2</span>
          <span class="sl-label">📗 תלמיד ממוצע</span>
          <span class="sl-desc">שאלות מנחות + בנק מילים + תבנית ריקה</span>
        </button>
        <button class="support-level-btn${A11Y.supportLevel===3?' active':''}" onclick="window.CivicsApp.setSupportLevel(3)">
          <span class="sl-num">3</span>
          <span class="sl-label">📕 תלמיד מתקשה</span>
          <span class="sl-desc">משפטי פתיחה + מילון רמזים + צ'קליסט</span>
        </button>
      </div>
    </div>
    <div class="scaffold-setting-group">
      <label>ברירת מחדל לתצוגה כפולה</label>
      <div class="setting-desc">בחרו את הלשונית שתופיע ראשונה כשפותחים הסבר</div>
      <div class="scaffold-setting-options">
        <button class="scaffold-setting-btn${A11Y.scaffoldDefault==='original'?' active':''}" onclick="window.CivicsApp.setScaffoldDefault('original')">📘 רמה 1</button>
        <button class="scaffold-setting-btn${A11Y.scaffoldDefault==='simplified'?' active':''}" onclick="window.CivicsApp.setScaffoldDefault('simplified')">📗 רמה 2</button>
        <button class="scaffold-setting-btn${A11Y.scaffoldDefault==='template'?' active':''}" onclick="window.CivicsApp.setScaffoldDefault('template')">📕 רמה 3</button>
      </div>
    </div>
    <div class="scaffold-setting-group">
      <label>גודל טקסט בשאלות</label>
      <div class="setting-desc">הגדילו אם קשה לקרוא</div>
      <div class="scaffold-setting-options">
        <button class="scaffold-setting-btn${A11Y.fontSize<=110?' active':''}" onclick="window.CivicsApp.setFontSize(100)">רגיל</button>
        <button class="scaffold-setting-btn${A11Y.fontSize>110&&A11Y.fontSize<=140?' active':''}" onclick="window.CivicsApp.setFontSize(130)">גדול</button>
        <button class="scaffold-setting-btn${A11Y.fontSize>140?' active':''}" onclick="window.CivicsApp.setFontSize(160)">גדול מאוד</button>
      </div>
    </div>
    <div class="scaffold-setting-group">
      <label>הקראת שאלות</label>
      <div class="setting-desc">הפעלת הקראה בקול של השאלות</div>
      <div class="scaffold-setting-options">
        <button class="scaffold-setting-btn${A11Y.ttsEnabled?' active':''}" onclick="window.CivicsApp.toggleTTS()">${A11Y.ttsEnabled ? '🔊 פעיל - לחצו לכיבוי' : '🔇 כבוי - לחצו להפעלה'}</button>
      </div>
    </div>
    <div class="scaffold-setting-group">
      <label>ערכת צבעים</label>
      <div class="scaffold-setting-options">
        <button class="scaffold-setting-btn${A11Y.theme==='light'?' active':''}" onclick="window.CivicsApp.setTheme('light')">☀️ בהיר</button>
        <button class="scaffold-setting-btn${A11Y.theme==='dark'?' active':''}" onclick="window.CivicsApp.setTheme('dark')">🌙 כהה</button>
        <button class="scaffold-setting-btn${A11Y.theme==='soft'?' active':''}" onclick="window.CivicsApp.setTheme('soft')">🌸 רך</button>
      </div>
    </div>
    <div class="scaffold-tip">
      <i class="fas fa-info-circle"></i> ההגדרות נשמרות אוטומטית ויחולו על כל השאלות.
    </div>
  </div>`;
}

// ===== SUMMARY TAB =====
function renderSummaryTab(unit) {
  const prog = getProgress(unit.id);
  let html = `<div class="checklist-section" role="region" aria-label="רשימת מעקב">
    <h3>✓ מה למדתי ביחידה הזו?</h3>`;
  unit.checklist.forEach((item, i) => {
    const checked = prog.checklist[i] || false;
    html += `<label class="check-item${checked?' checked':''}" tabindex="0">
      <input type="checkbox" ${checked?'checked':''} aria-label="${item}"
        onchange="window.CivicsApp.toggleCheck(${unit.id},${i},this.checked)">
      ${item}
    </label>`;
  });
  html += `</div>`;

  // Enhanced emotional tracker
  html += `<div class="anxiety-section" role="region" aria-label="מד רגשי">
    <h3>😊 איך אתם מרגישים לגבי היחידה?</h3>
    <p class="anxiety-desc">הדיווח עוזר למורה להבין מה להחזק. אין תשובה נכונה או לא נכונה.</p>
    <div class="mood-buttons">
      <button class="mood-btn${prog.mood==='calm'?' selected':''}" onclick="window.CivicsApp.setMood(${unit.id},'calm')" aria-pressed="${prog.mood==='calm'}" aria-label="רגוע">
        <span class="mood-emoji">😊</span><span class="mood-text">מרגיש/ה בטוח/ה</span>
      </button>
      <button class="mood-btn${prog.mood==='neutral'?' selected':''}" onclick="window.CivicsApp.setMood(${unit.id},'neutral')" aria-pressed="${prog.mood==='neutral'}" aria-label="בסדר">
        <span class="mood-emoji">😐</span><span class="mood-text">עוד צריך/ה לחזור</span>
      </button>
      <button class="mood-btn${prog.mood==='anxious'?' selected':''}" onclick="window.CivicsApp.setMood(${unit.id},'anxious')" aria-pressed="${prog.mood==='anxious'}" aria-label="לחוץ">
        <span class="mood-emoji">😟</span><span class="mood-text">מרגיש/ה לחץ</span>
      </button>
    </div>
    <div id="mood-tip" class="mood-tip${prog.mood?' show':''}" role="status" aria-live="polite">
      ${prog.mood==='calm'?'👍 נהדר! אתם במקום טוב. המשיכו ככה!':
        prog.mood==='neutral'?'💪 זה לגמרי בסדר. חזרו שוב ותרגישו יותר בטוחים!':
        prog.mood==='anxious'?'🌟 זה בסדר להרגיש לחץ. קחו נשימה עמוקה. <button class="btn btn-sm btn-calm-breathe" onclick="location.hash=\'breathing\'"><i class="fas fa-wind"></i> תרגיל נשימה</button>':''}
    </div>
  </div>`;

  // Navigation
  const nextUnit = UNITS_DATA.find(u => u.id === unit.id + 1);
  const prevUnit = UNITS_DATA.find(u => u.id === unit.id - 1);
  html += `<div style="display:flex;justify-content:space-between;margin-top:20px;flex-wrap:wrap;gap:10px">
    ${prevUnit ? `<button class="btn btn-primary btn-lg" onclick="location.hash='unit/${prevUnit.id}'" aria-label="יחידה קודמת: ${prevUnit.title}"><i class="fas fa-arrow-right"></i> יחידה ${prevUnit.id}: ${prevUnit.title}</button>` : '<div></div>'}
    ${nextUnit ? `<button class="btn btn-success btn-lg" onclick="location.hash='unit/${nextUnit.id}'" aria-label="יחידה הבאה: ${nextUnit.title}">יחידה ${nextUnit.id}: ${nextUnit.title} <i class="fas fa-arrow-left"></i></button>` : '<div></div>'}
  </div>`;
  return html;
}

// ===== EXAM QUESTIONS PAGE (96 real exam questions) =====
const _questionsState = {
  currentExam: 0,
  searchQuery: '',
  expandedQuestion: null,
  answeredQuestions: JSON.parse(localStorage.getItem('civics2026_answered_questions') || '[]'),
  filterUnit: 0
};

function _saveQuestionsState() {
  localStorage.setItem('civics2026_answered_questions', JSON.stringify(_questionsState.answeredQuestions));
}

function _escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _getPreview(text) {
  if (!text) return '';
  const clean = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  return clean.length > 200 ? clean.substring(0, 200) + '...' : clean;
}

function _formatQText(text, search) {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { html += '<div style="height:10px"></div>'; continue; }
    let lineClass = '';
    let prefix = '';
    if (/^(ציין|ציינו|הצג|הציגו|הסבר|הסבירו|צטטו)[\s–\-]/.test(trimmed)) {
      lineClass = 'q-task-line';
      prefix = '<i class="fas fa-lightbulb" style="color:#4299e1;margin-left:8px"></i>';
    } else if (/^(א\.|ב\.|ג\.|ד\.|ה\.)\s/.test(trimmed)) {
      lineClass = 'q-sub-line';
    } else if (/^".*"$/.test(trimmed) || /^\".*\"$/.test(trimmed)) {
      lineClass = 'q-quote-line';
      prefix = '<i class="fas fa-quote-right" style="color:#d69e2e;margin-left:8px"></i>';
    } else if (/^(בעד|נגד|תומך|מתנגד)[\s–\-]/.test(trimmed)) {
      lineClass = 'q-stance-line';
    }
    let escaped = _escHtml(trimmed);
    if (search) escaped = _highlightQSearch(escaped, search);
    html += `<div class="${lineClass}">${prefix}${escaped}</div>`;
  }
  return html;
}

function _highlightQSearch(text, search) {
  if (!search || !search.trim()) return text;
  try {
    const esc = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(esc, 'gi'), m => `<mark style="background:#fefcbf;padding:1px 4px;border-radius:3px">${m}</mark>`);
  } catch(e) { return text; }
}

function renderQuestionsPage() {
  const exams = typeof EXAMS_DATA !== 'undefined' ? EXAMS_DATA : [];
  if (!exams.length) {
    return `<div class="home-page"><div class="card" style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin" style="font-size:2em;color:#4299e1"></i><p style="margin-top:16px">טוען שאלות בגרות...</p></div></div>`;
  }
  const currentExam = exams[_questionsState.currentExam] || exams[0];

  // Filter questions
  let filtered = currentExam.questions;
  const unitMap = typeof QUESTION_UNIT_MAP !== 'undefined' ? QUESTION_UNIT_MAP : {};
  if (_questionsState.filterUnit > 0) {
    filtered = filtered.filter(function(question) {
      var m = unitMap[question.id];
      return m && m.indexOf(_questionsState.filterUnit) !== -1;
    });
  }
  if (_questionsState.searchQuery.trim()) {
    const q = _questionsState.searchQuery.trim().toLowerCase();
    filtered = filtered.filter(question => 
      question.full_text.toLowerCase().includes(q) || question.number.includes(q)
    );
  }

  // Exam tabs
  const tabs = exams.map((exam, i) => {
    const shortName = exam.name.replace('מועד ', '').replace('שאלון ', '');
    const isActive = _questionsState.currentExam === i;
    return `<button class="btn btn-sm ${isActive ? 'btn-primary' : ''}" style="${isActive ? '' : 'background:var(--bg-section);color:var(--text-gray)'}" 
      onclick="window.CivicsApp.setQExam(${i})">${shortName}</button>`;
  }).join(' ');

  // Stats
  const answeredInExam = currentExam.questions.filter(q => _questionsState.answeredQuestions.includes(q.id)).length;
  const totalAnswered = _questionsState.answeredQuestions.length;
  const examPct = Math.round((answeredInExam / currentExam.questions.length) * 100);

  // Questions list
  let questionsHtml = '';
  filtered.forEach((q, idx) => {
    const isAnswered = _questionsState.answeredQuestions.includes(q.id);
    const isExpanded = _questionsState.expandedQuestion === '__all__' || _questionsState.expandedQuestion === q.id;
    const preview = _getPreview(q.full_text);
    const lenLabel = q.length > 2000 ? 'ארוכה' : q.length > 1000 ? 'בינונית' : 'קצרה';
    const lenColor = q.length > 2000 ? '#e53e3e' : q.length > 1000 ? '#dd6b20' : '#38a169';

    questionsHtml += `
    <div class="card q-card ${isAnswered ? 'q-answered' : ''}" style="margin-bottom:12px;border-right:4px solid ${isAnswered ? '#38a169' : '#4299e1'};cursor:pointer" onclick="window.CivicsApp.toggleQExpand('${q.id}')">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0">
          <div style="width:42px;height:42px;border-radius:8px;background:${isAnswered ? '#c6f6d5' : '#ebf4ff'};display:flex;align-items:center;justify-content:center">
            <strong style="color:${isAnswered ? '#22543d' : '#2b6cb0'};font-size:14px">${q.number}</strong>
          </div>
          <label style="cursor:pointer" onclick="event.stopPropagation()">
            <input type="checkbox" ${isAnswered ? 'checked' : ''} onchange="window.CivicsApp.toggleQAnswer('${q.id}')" style="width:18px;height:18px;cursor:pointer" aria-label="סמן שאלה ${q.number} כנענתה">
          </label>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:12px;color:var(--text-gray)">שאלה ${q.number}</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${lenColor}15;color:${lenColor}">${lenLabel} (${q.length} תווים)</span>
            ${isAnswered ? '<span style="font-size:12px;color:#38a169"><i class="fas fa-check"></i> נענתה</span>' : ''}
            ${unitMap[q.id] ? unitMap[q.id].map(function(uid) { var u = (typeof UNITS_DATA !== 'undefined' ? UNITS_DATA : []).find(function(x){return x.id===uid}); return u ? '<span style="font-size:11px;padding:2px 8px;border-radius:12px;background:#ebf8ff;color:#2b6cb0">' + u.icon + ' יח\' ' + uid + '</span>' : ''; }).join(' ') : ''}
          </div>
          ${isExpanded ? 
            `<div class="q-full-text" style="white-space:pre-wrap;line-height:2;margin-top:8px;padding:16px;background:var(--bg-section);border-radius:8px;border:1px solid var(--border-color);font-size:${A11Y.fontSize}%">${_formatQText(q.full_text, _questionsState.searchQuery)}</div>
             <button class="btn btn-sm" style="margin-top:8px" onclick="event.stopPropagation();window.CivicsApp.toggleQExpand('${q.id}')"><i class="fas fa-compress-alt"></i> כווץ</button>` :
            `<p style="color:var(--text-gray);font-size:14px;line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${_highlightQSearch(_escHtml(preview), _questionsState.searchQuery)}</p>
             <button class="btn btn-sm" style="margin-top:4px"><i class="fas fa-expand-alt"></i> הצג שאלה מלאה</button>`
          }
        </div>
      </div>
    </div>`;
  });

  if (filtered.length === 0) {
    questionsHtml = `<div class="card" style="text-align:center;padding:40px;color:var(--text-gray)"><i class="fas fa-search" style="font-size:2.5em;margin-bottom:12px;opacity:0.4"></i><p>לא נמצאו שאלות</p></div>`;
  }

  return `<div class="home-page">
    <div class="card" style="background:linear-gradient(135deg, #2b6cb0 0%, #2c5282 100%);color:white;margin-bottom:20px;padding:20px">
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas fa-file-alt" style="font-size:24px"></i>
        </div>
        <div style="flex:1">
          <h2 style="margin:0 0 4px 0;font-size:20px">96 שאלות בגרות אמיתיות</h2>
          <p style="margin:0;opacity:0.85;font-size:14px">5 מבחנים מלאים (2024-2025) עם טקסט מלא מילה במילה</p>
        </div>
        <div style="text-align:center;flex-shrink:0">
          <div style="font-size:28px;font-weight:bold">${totalAnswered}/96</div>
          <div style="font-size:12px;opacity:0.8">נענו</div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px">
      <div class="card" style="text-align:center;padding:12px">
        <div style="font-size:22px;font-weight:bold;color:#2b6cb0">${currentExam.questions.length}</div>
        <div style="font-size:12px;color:var(--text-gray)">שאלות במבחן</div>
      </div>
      <div class="card" style="text-align:center;padding:12px">
        <div style="font-size:22px;font-weight:bold;color:#38a169">${answeredInExam}</div>
        <div style="font-size:12px;color:var(--text-gray)">נענו במבחן</div>
      </div>
      <div class="card" style="text-align:center;padding:12px">
        <div style="font-size:22px;font-weight:bold;color:#805ad5">${examPct}%</div>
        <div style="font-size:12px;color:var(--text-gray)">התקדמות מבחן</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;padding:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong style="font-size:14px">${currentExam.name}</strong>
        <span style="font-size:13px;color:#2b6cb0;font-weight:bold">${examPct}%</span>
      </div>
      <div style="width:100%;height:8px;background:var(--bg-section);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${examPct}%;background:linear-gradient(90deg,#48bb78,#38a169);border-radius:4px;transition:width 0.4s"></div>
      </div>
    </div>

    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
      ${tabs}
    </div>

    <div style="position:relative;margin-bottom:16px">
      <i class="fas fa-search" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-gray);opacity:0.5"></i>
      <input type="text" id="q-search-input" value="${_escHtml(_questionsState.searchQuery)}" placeholder="חיפוש בשאלות..." 
        style="width:100%;padding:10px 40px 10px 16px;border:1px solid var(--border-color);border-radius:8px;background:var(--card-bg);font-size:14px;box-sizing:border-box"
        oninput="window.CivicsApp.setQSearch(this.value)">
      ${_questionsState.searchQuery ? `<button onclick="window.CivicsApp.setQSearch('');document.getElementById('q-search-input').value=''" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-gray)"><i class="fas fa-times"></i></button>` : ''}
    </div>

    <div style="margin-bottom:12px">
      <select id="q-unit-filter" onchange="window.CivicsApp.setQUnit(parseInt(this.value))" 
        style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--card-bg);font-size:13px;cursor:pointer">
        <option value="0" ${_questionsState.filterUnit === 0 ? 'selected' : ''}>📚 כל היחידות</option>
        ${(typeof UNITS_DATA !== 'undefined' ? UNITS_DATA : []).filter(function(u){return u.id <= 15}).map(function(u) {
          var count = currentExam.questions.filter(function(q) { var m = unitMap[q.id]; return m && m.indexOf(u.id) !== -1; }).length;
          return '<option value=\"' + u.id + '\" ' + (_questionsState.filterUnit === u.id ? 'selected' : '') + '>' + u.icon + ' יח\u0027 ' + u.id + ': ' + u.title + ' (' + count + ')</option>';
        }).join('')}
      </select>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="font-size:13px;color:var(--text-gray)">${_questionsState.filterUnit > 0 ? filtered.length + ' שאלות ביחידה' : (_questionsState.searchQuery ? 'נמצאו ' + filtered.length + ' שאלות' : currentExam.questions.length + ' שאלות במבחן')}</span>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm" onclick="window.CivicsApp.expandAllQ()"><i class="fas fa-expand"></i> פתח הכל</button>
        <button class="btn btn-sm" onclick="window.CivicsApp.collapseAllQ()"><i class="fas fa-compress"></i> כווץ הכל</button>
      </div>
    </div>

    ${questionsHtml}
  </div>`;
}

// ===== EXAM SIMULATION =====
function renderExamSim() {
  if (STATE.examSim) return renderExamSimActive();
  let html = `<div class="home-page">
    <div class="exam-sim-banner" role="banner">
      <h2><i class="fas fa-stopwatch"></i> סימולציית בחינה בעל-פה</h2>
      <p>תרגול מלא של מבנה הבחינה: קריאה → כתיבת נקודות → מענה בעל-פה</p>
      <button class="btn btn-lg" onclick="window.CivicsApp.startExamSim()" aria-label="התחל סימולציה"><i class="fas fa-play"></i> התחל סימולציה</button>
    </div>
    <div class="important-box" role="note">
      <strong>מבנה הבחינה בעל-פה:</strong><br>
      1. שלב קריאה: 10 דקות לקרוא את החומר<br>
      2. שלב כתיבה: 30 דקות לכתוב <strong>רק נקודות</strong> (bullets)<br>
      3. שלב מענה בעל-פה: 5-10 דקות לכל שאלה
    </div>
    <div class="content-section">
      <h2><i class="fas fa-info-circle"></i> כללי מענה חשובים</h2>
      <div class="practice-instructions" style="margin-bottom:16px">
        <h3><i class="fas fa-clipboard-list"></i> הנחיות לתלמיד/ה</h3>
        <ol class="instructions-list">
          <li><span class="inst-letter">א.</span> קראו בעיון את השאלה.</li>
          <li><span class="inst-letter">ב.</span> זהו והדגישו מושגים והסיקו קשר.</li>
          <li><span class="inst-letter">ג.</span> במידה ויש צורך – הדגישו ציטוט.</li>
          <li><span class="inst-letter">ד.</span> הקליטו את תשובתכם המלאה.</li>
          <li><span class="inst-letter">ה.</span> קראו בעיון את תשובתכם ותקנו במידת הצורך.</li>
        </ol>
      </div>
      <ul class="key-points">
        <li><span class="kp-bullet">1</span> <strong>ציינו</strong> - זהו את המושג/זכות/עיקרון</li>
        <li><span class="kp-bullet">2</span> <strong>הציגו</strong> - הגדירו את המושג</li>
        <li><span class="kp-bullet">3</span> <strong>ציטוט</strong> - מהקטע שבבחינה</li>
        <li><span class="kp-bullet">4</span> <strong>הסבירו</strong> - קשרו בין הציטוט למושג</li>
      </ul>
      ${typeof MNEMONICS !== 'undefined' ? MNEMONICS.map(m => `<div class="mnemonic" role="note">${m.title}: ${m.content}</div>`).join('') : ''}
    </div>
  </div>`;
  return html;
}

function renderExamSimActive() {
  const sim = STATE.examSim;
  const phase = EXAM_PHASES[sim.phase];
  const total = phase.duration;
  const qs = sim.questions;
  let html = `<div class="home-page">
    <div class="exam-phase-indicator ${phase.cls}" role="status" aria-live="polite">
      ${phase.name}
    </div>
    <div class="exam-timer-area" style="text-align:center">
      ${renderVisualTimer(sim.remaining, total, phase.name)}
    </div>
    <div style="text-align:center;margin-bottom:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" onclick="window.CivicsApp.nextExamPhase()" aria-label="עבור לשלב הבא"><i class="fas fa-forward"></i> שלב הבא</button>
      <button class="btn btn-lg" style="background:var(--btn-stop-bg, #eee);color:var(--btn-stop-color, #333)" onclick="window.CivicsApp.stopExamSim()" aria-label="סיים סימולציה"><i class="fas fa-stop"></i> סיים סימולציה</button>
      <button class="btn btn-calm-breathe btn-lg" onclick="window.CivicsApp.togglePause()" aria-label="הפסקה"><i class="fas fa-pause"></i> הפסקה</button>
    </div>`;

  qs.forEach((q, i) => {
    html += `<div class="exam-question-block" role="article" aria-label="שאלה ${i+1}">
      <div class="eq-header">
        <span style="font-weight:700">שאלה ${i+1}</span>
        <span class="eq-badge ${q.examClass}">${q.exam}</span>
      </div>
      ${q.passage ? `<div class="eq-passage">${q.passage}</div>` : ''}
      <div class="eq-question">${q.question}</div>
      ${sim.phase >= 1 ? `<div class="practice-split">
        <div class="practice-section notes-section">
          <div class="section-label"><i class="fas fa-pen"></i> נקודות</div>
          <textarea placeholder="• נקודה 1...\n• נקודה 2...\n• נקודה 3..." rows="6" aria-label="נקודות לשאלה ${i+1}"></textarea>
        </div>
        ${sim.phase >= 2 ? `<div class="practice-section oral-section">
          <div class="section-label"><i class="fas fa-microphone"></i> תשובה בעל-פה</div>
          <button class="btn btn-record" id="rec-btn-sim-${i}" onclick="window.CivicsApp.toggleRecord('sim-${i}')" aria-label="הקלטה קולית לשאלה ${i+1}"><i class="fas fa-microphone"></i> הקלטה קולית</button>
          <textarea id="ans-sim-${i}" class="oral-textarea" placeholder="תמליל ההקלטה יופיע כאן..." rows="4" aria-label="תמליל תשובה לשאלה ${i+1}"></textarea>
        </div>` : ''}
      </div>` : ''}
    </div>`;
  });

  html += `</div>`;
  return html;
}

// ===== DASHBOARD =====
function renderDashboard() {
  if (!STATE.teacherAuth) {
    return `<div class="home-page">
      <div class="teacher-password-overlay">
        <h2><i class="fas fa-lock"></i> דשבורד מורה</h2>
        <p>הזינו את הסיסמה כדי לגשת לדשבורד:</p>
        <input type="password" id="teacher-pass" placeholder="סיסמה" aria-label="סיסמה לדשבורד מורה"
          onkeydown="if(event.key==='Enter')window.CivicsApp.checkTeacherPass()">
        <br>
        <button class="btn btn-primary btn-lg" onclick="window.CivicsApp.checkTeacherPass()" style="margin-top:10px">
          <i class="fas fa-sign-in-alt"></i> כניסה
        </button>
        <div class="error-msg" id="pass-error" role="alert">סיסמה שגויה</div>
        <p style="font-size:12px;color:var(--text-gray);margin-top:14px">הסיסמה נקבעת ע"י מנהל המערכת</p>
      </div>
    </div>`;
  }

  const students = STATE.teacherStudents;

  let html = `<div class="dashboard-page">
    <h1 style="margin-bottom:10px"><i class="fas fa-chart-bar"></i> דשבורד מורה</h1>
    <p style="color:var(--text-gray);margin-bottom:20px">כל ההתקדמויות מסונכרנות מהשרת בזמן אמת</p>
    <div style="margin-bottom:20px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" onclick="window.CivicsApp.loadTeacherData()" aria-label="רענן נתונים">
        <i class="fas fa-sync-alt"></i> רענן נתונים
      </button>
      <button class="btn btn-success btn-lg" onclick="window.CivicsApp.exportAllData()" aria-label="ייצוא כל התלמידים">
        <i class="fas fa-download"></i> ייצוא כל התלמידים (JSON)
      </button>
    </div>`;

  // Lesson planner
  html += `<div class="content-section lesson-planner" style="margin-bottom:24px">
    <h2><i class="fas fa-chalkboard-teacher"></i> תכנון שיעור 45 דקות</h2>
    <p style="color:var(--text-gray);margin-bottom:16px">בחרו יחידה ותקבלו מתווה שיעור מובנה עם 4 שלבים:</p>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
      <select id="lesson-unit-select" class="student-grade-select" style="min-width:250px" aria-label="בחרו יחידת לימוד">
        ${UNITS_DATA.filter(u=>!u.excluded).map(u=>'<option value="'+u.id+'">'+u.icon+' יחידה '+u.id+': '+u.title+'</option>').join('')}
      </select>
      <button class="btn btn-primary" onclick="window.CivicsApp.generateLesson()">
        <i class="fas fa-magic"></i> צור מתווה שיעור
      </button>
    </div>
    <div id="lesson-output"></div>
  </div>`;

  // Password reset
  html += `<div class="content-section" style="margin-bottom:24px">
    <h2><i class="fas fa-key"></i> שינוי סיסמת מורה</h2>
    <div style="max-width:350px">
      <input type="password" id="reset-current-pass" placeholder="סיסמה נוכחית" class="student-name-input" style="width:100%;margin-bottom:8px" aria-label="סיסמה נוכחית">
      <input type="password" id="reset-new-pass" placeholder="סיסמה חדשה (מינימום 4 תווים)" class="student-name-input" style="width:100%;margin-bottom:8px" aria-label="סיסמה חדשה">
      <input type="password" id="reset-confirm-pass" placeholder="אימות סיסמה חדשה" class="student-name-input" style="width:100%;margin-bottom:12px" aria-label="אימות סיסמה חדשה">
      <button class="btn btn-primary" onclick="window.CivicsApp.resetTeacherPassword()"><i class="fas fa-save"></i> שנה סיסמה</button>
      <div id="reset-error" class="error-msg" role="alert" style="display:none;margin-top:8px"></div>
      <div id="reset-success" style="display:none;margin-top:8px;padding:10px;background:#C6F6D5;color:#22543D;border-radius:8px;text-align:center"><i class="fas fa-check"></i> הסיסמה שונתה בהצלחה!</div>
    </div>
  </div>`;

  // Analytics section
  html += `<div class="content-section" id="analytics-section" style="margin-bottom:24px">
    <h3><i class="fas fa-chart-line"></i> סטטיסטיקות שרת</h3>
    <p style="color:var(--text-gray)">לחצו "רענן נתונים" כדי לטעון סטטיסטיקות מהשרת</p>
  </div>`;

  if (STATE.teacherLoading) {
    html += `<div style="text-align:center;padding:40px" role="status"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px">טוען נתוני תלמידים מהשרת...</p></div>`;
  } else if (students.length === 0) {
    html += `<div class="content-section" style="text-align:center;padding:40px">
      <div style="font-size:48px;margin-bottom:12px">📭</div>
      <h3>אין עדיין תלמידים מסונכרנים</h3>
      <p style="color:var(--text-gray);margin-top:8px">ברגע שתלמידים יזינו את שמם ויתחילו לעבוד, הנתונים יופיעו כאן אוטומטית.</p>
    </div>`;
  } else {
    const avgProgress = Math.round(students.reduce((sum, s) => sum + calcTotalProgressFrom(s.progress||{}), 0) / students.length);
    const totalAnswered = students.reduce((sum, s) => sum + countAnsweredFrom(s.progress||{}), 0);
    
    html += `<div class="dash-stats">
      <div class="dash-stat"><div class="stat-num">${students.length}</div><div class="stat-label">תלמידים</div></div>
      <div class="dash-stat"><div class="stat-num">${avgProgress}%</div><div class="stat-label">ממוצע התקדמות</div></div>
      <div class="dash-stat"><div class="stat-num">${totalAnswered}</div><div class="stat-label">סה"כ תשובות</div></div>
    </div>`;

    html += `<div class="dash-table">
      <h3 style="margin-bottom:12px">סיכום תלמידים</h3>
      <table role="table" aria-label="טבלת תלמידים">
        <thead><tr><th scope="col">שם</th><th scope="col">התקדמות</th><th scope="col">תשובות</th><th scope="col">עדכון אחרון</th><th scope="col">פרטים</th></tr></thead>
        <tbody>`;
    
    students.forEach((s, idx) => {
      const pct = calcTotalProgressFrom(s.progress||{});
      const answered = countAnsweredFrom(s.progress||{});
      const lastUpdate = s.updatedAt ? new Date(s.updatedAt).toLocaleString('he-IL') : '-';
      html += `<tr>
        <td><strong>${esc(s.studentName || 'ללא שם')}</strong></td>
        <td><div class="progress-bar-container" style="height:14px" role="progressbar" aria-valuenow="${pct}"><div class="progress-bar-fill" style="width:${pct}%;font-size:10px">${pct}%</div></div></td>
        <td>${answered}/${EXAM_QUESTIONS.length}</td>
        <td style="font-size:12px">${lastUpdate}</td>
        <td><button class="btn btn-sm btn-primary" onclick="window.CivicsApp.showStudentDetail(${idx})" aria-label="הצג פרטי תלמיד"><i class="fas fa-eye"></i></button></td>
      </tr>`;
    });
    
    html += `</tbody></table></div>`;

    if (STATE.teacherSelectedStudent !== undefined && STATE.teacherSelectedStudent !== null) {
      const s = students[STATE.teacherSelectedStudent];
      if (s) html += renderStudentDetail(s);
    }
  }

  html += `</div>`;
  return html;
}

function renderStudentDetail(student) {
  const progress = student.progress || {};
  let html = `<div class="content-section" style="margin-top:20px;border-right:4px solid var(--primary-blue)">
    <h2><i class="fas fa-user"></i> ${esc(student.studentName)} - פירוט מלא</h2>
    <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-sm" style="background:var(--bg-section);color:var(--text-dark)" onclick="window.CivicsApp.closeStudentDetail()"><i class="fas fa-times"></i> סגור פירוט</button>
      <button class="btn btn-sm btn-primary" onclick="window.CivicsApp.exportStudentData(${STATE.teacherSelectedStudent})"><i class="fas fa-download"></i> ייצוא נתוני תלמיד</button>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px" role="table" aria-label="פירוט התקדמות תלמיד">
      <thead><tr><th scope="col" style="text-align:right;padding:8px;background:var(--bg-section)">#</th><th scope="col" style="text-align:right;padding:8px;background:var(--bg-section)">יחידה</th><th scope="col" style="text-align:right;padding:8px;background:var(--bg-section)">התקדמות</th><th scope="col" style="text-align:right;padding:8px;background:var(--bg-section)">שאלות</th><th scope="col" style="text-align:right;padding:8px;background:var(--bg-section)">מצב רוח</th></tr></thead>
      <tbody>`;
  
  UNITS_DATA.forEach(u => {
    const p = progress[u.id] || {};
    const pct = getUnitProgressFrom(u.id, progress);
    const totalQs = EXAM_QUESTIONS.filter(q => q.unitIds.includes(u.id)).length;
    const answered = Object.keys(p.answers||{}).length;
    const mood = p.mood === 'calm' ? '😊' : p.mood === 'neutral' ? '😐' : p.mood === 'anxious' ? '😟' : '-';
    html += `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border-color, #eee)">${u.id}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border-color, #eee)">${u.icon} ${u.title}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border-color, #eee)"><div class="progress-bar-container" style="height:12px"><div class="progress-bar-fill" style="width:${pct}%;font-size:9px">${pct}%</div></div></td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border-color, #eee)">${answered}/${totalQs}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border-color, #eee)">${mood}</td>
    </tr>`;
  });
  
  html += `</tbody></table>`;

  const allAnswers = [];
  Object.entries(progress).forEach(([unitId, p]) => {
    Object.entries(p.answers||{}).forEach(([qId, ans]) => {
      if (ans && ans.trim()) {
        const q = EXAM_QUESTIONS.find(x => x.id === qId);
        allAnswers.push({ qId, question: q ? q.question : qId, answer: ans, exam: q ? q.exam : '' });
      }
    });
  });

  if (allAnswers.length > 0) {
    html += `<h3 style="margin-top:20px;margin-bottom:12px"><i class="fas fa-pen"></i> תשובות התלמיד/ה (${allAnswers.length})</h3>`;
    allAnswers.forEach(a => {
      html += `<div style="background:var(--bg-section);padding:12px;border-radius:8px;margin:8px 0;border-right:3px solid var(--warning-orange)">
        <div style="font-size:12px;color:var(--text-gray);margin-bottom:4px">${esc(a.exam)}</div>
        <div style="font-weight:600;font-size:14px;margin-bottom:6px">${esc(a.question)}</div>
        <div style="white-space:pre-wrap;font-size:14px;background:var(--bg-white);padding:8px;border-radius:6px;border:1px solid var(--border-color, #eee)">${esc(a.answer)}</div>
      </div>`;
    });
  }

  html += `</div>`;
  return html;
}

// ===== EVENT HANDLERS =====
function bindEvents() {}

// ===== TIMER =====
function startTimer() {
  if (STATE.timerActive) return;
  STATE.timerActive = true;
  STATE.timerPhase = 0;
  STATE.timerRemaining = PHASES[0].duration;
  STATE.timerInterval = setInterval(tickTimer, 1000);
  render();
}

function stopTimer() {
  STATE.timerActive = false;
  clearInterval(STATE.timerInterval);
  render();
}

function tickTimer() {
  if (A11Y.paused) return;
  STATE.timerRemaining--;
  if (STATE.timerRemaining <= 0) {
    STATE.timerPhase++;
    if (STATE.timerPhase < PHASES.length) {
      STATE.timerRemaining = PHASES[STATE.timerPhase].duration;
      // Notification for phase change (only if not quiet)
      if (!A11Y.quietMode) {
        try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play(); } catch(e) {}
      }
    } else {
      stopTimer();
      return;
    }
  }
  // Update visual timer without full re-render
  const timerWidget = document.querySelector('.timer-widget');
  if (timerWidget) {
    const total = PHASES[STATE.timerPhase]?.duration || 1;
    timerWidget.innerHTML = renderVisualTimer(STATE.timerRemaining, total, PHASES[STATE.timerPhase]?.name || '') +
      `<button class="timer-btn" onclick="window.CivicsApp.stopTimer()" aria-label="עצור טיימר">⏸</button>`;
  }
}

// ===== EXAM SIM =====
function startExamSim() {
  const activeQuestions = EXAM_QUESTIONS.filter(q => {
    return !q.unitIds.some(uid => {
      const unit = UNITS_DATA.find(u => u.id === uid);
      return unit && unit.excluded;
    });
  });
  const shuffled = [...activeQuestions].sort(() => Math.random()-0.5);
  STATE.examSim = {
    phase: 0,
    remaining: EXAM_PHASES[0].duration,
    questions: shuffled.slice(0, 3)
  };
  STATE.examSim.interval = setInterval(tickExamSim, 1000);
  render();
}

function tickExamSim() {
  if (!STATE.examSim || A11Y.paused) return;
  STATE.examSim.remaining--;
  if (STATE.examSim.remaining <= 0) {
    nextExamPhase();
    return;
  }
  // Update visual timer
  const timerArea = document.querySelector('.exam-timer-area');
  if (timerArea) {
    const phase = EXAM_PHASES[STATE.examSim.phase];
    timerArea.innerHTML = renderVisualTimer(STATE.examSim.remaining, phase.duration, phase.name);
  }
}

function nextExamPhase() {
  if (!STATE.examSim) return;
  STATE.examSim.phase++;
  if (STATE.examSim.phase >= EXAM_PHASES.length) {
    stopExamSim();
    return;
  }
  STATE.examSim.remaining = EXAM_PHASES[STATE.examSim.phase].duration;
  render();
}

function stopExamSim() {
  if (STATE.examSim && STATE.examSim.interval) clearInterval(STATE.examSim.interval);
  STATE.examSim = null;
  render();
}

// ===== SPEECH RECOGNITION =====
let recognition = null;
let recTarget = null;

// Phase 3.2: Text highlighting
let _activeHighlight = '';
const _savedHighlights = JSON.parse(localStorage.getItem('civics2026_highlights') || '{}');

function toggleRecord(qId) {
  if (A11Y.quietMode) { alert('מצב שקט פעיל. כבו אותו כדי להקליט.'); return; }
  const btn = document.getElementById('rec-btn-' + qId);
  if (recognition && recTarget === qId) {
    recognition.stop();
    recognition = null;
    recTarget = null;
    if (btn) { btn.className = 'btn btn-record'; btn.innerHTML = '<i class="fas fa-microphone"></i> הקלטה קולית'; }
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { alert('הדפדפן לא תומך בהקלטה קולית. נסו Chrome.'); return; }
  recognition = new SpeechRecognition();
  recognition.lang = 'he-IL';
  recognition.continuous = true;
  recognition.interimResults = true;
  recTarget = qId;
  if (btn) { btn.className = 'btn btn-record recording'; btn.innerHTML = '<i class="fas fa-stop"></i> עצור הקלטה'; }
  recognition.onresult = (e) => {
    let t = '';
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + '\n';
    const ta = document.getElementById('ans-' + qId);
    if (ta) {
      ta.value = t;
      const unitId = STATE.currentUnit;
      if (unitId) {
        const p = getProgress(unitId);
        p.answers[qId] = t;
        clearTimeout(window._saveDebounce);
        window._saveDebounce = setTimeout(() => { saveState(); debouncedSync(); }, 1000);
      }
    }
  };
  recognition.onerror = () => { toggleRecord(qId); };
  recognition.onend = () => { if (recTarget === qId) { recTarget = null; if (btn) { btn.className = 'btn btn-record'; btn.innerHTML = '<i class="fas fa-microphone"></i> הקלטה קולית'; } } };
  recognition.start();
}

// ===== HELPERS =====
function toggleEl(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle('show');
    // Update aria-expanded on trigger button
    const btn = document.querySelector(`[aria-controls="${id}"]`);
    if (btn) btn.setAttribute('aria-expanded', el.classList.contains('show'));
  }
}

function setTab(tab) {
  STATE.currentTab = tab;
  render();
  announceToSR('עברתם ללשונית ' + ({learn: 'לימוד', practice: 'תרגול', summary: 'סיכום'}[tab] || tab));
  // Focus the tabpanel
  setTimeout(() => {
    const panel = document.getElementById('tab-panel-' + tab);
    if (panel) panel.focus();
  }, 100);
}

function setName(name) {
  STATE.studentName = name;
  saveState();
  debouncedSync();
}

function setGrade(grade) {
  STATE.studentGrade = grade;
  saveState();
  debouncedSync();
}

function saveAnswer(unitId, qId, val) {
  const p = getProgress(unitId);
  p.answers[qId] = val;
  clearTimeout(window._saveDebounce);
  window._saveDebounce = setTimeout(() => { saveState(); debouncedSync(); }, 2000);
}

function toggleCheck(unitId, idx, checked) {
  const p = getProgress(unitId);
  p.checklist[idx] = checked;
  if (p.checklist.every(Boolean) && p.checklist.length > 0) {
    p.completed = true;
    showPositiveFeedback('כל הכבוד! סיימתם את היחידה! 🎉');
    checkDailyGoal();
  } else if (checked) {
    showPositiveFeedback('יופי! עוד צעד קדימה! ✨');
  }
  saveState();
  debouncedSync();
  render();
}

function showPositiveFeedback(msg) {
  let fb = document.getElementById('positive-feedback');
  if (!fb) {
    fb = document.createElement('div');
    fb.id = 'positive-feedback';
    fb.className = 'positive-feedback';
    document.body.appendChild(fb);
  }
  fb.textContent = msg;
  fb.classList.add('show');
  setTimeout(() => fb.classList.remove('show'), 2500);
}

function setMood(unitId, mood) {
  getProgress(unitId).mood = mood;
  saveState();
  debouncedSync();
  render();
}

function toggleSidebar() {
  STATE.sidebarOpen = !STATE.sidebarOpen;
  const sb = document.querySelector('.sidebar');
  if (sb) sb.classList.toggle('open');
}

function exportData() {
  const data = JSON.stringify({ 
    studentId: STATE.studentId,
    studentName: STATE.studentName, 
    progress: STATE.progress, 
    exportDate: new Date().toISOString() 
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `civics2026_${STATE.studentName||'student'}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.progress) {
          Object.entries(data.progress).forEach(([unitId, p]) => {
            if (!STATE.progress[unitId] || Object.keys(STATE.progress[unitId].answers||{}).length === 0) {
              STATE.progress[unitId] = p;
            } else {
              Object.entries(p.answers||{}).forEach(([qId, ans]) => {
                if (!STATE.progress[unitId].answers[qId]) {
                  STATE.progress[unitId].answers[qId] = ans;
                }
              });
            }
          });
          if (data.studentName && !STATE.studentName) STATE.studentName = data.studentName;
          saveState();
          debouncedSync();
          render();
          alert('הנתונים יובאו בהצלחה! ✓');
        } else {
          alert('הקובץ אינו תקין - לא נמצאו נתוני התקדמות');
        }
      } catch(err) {
        alert('שגיאה בקריאת הקובץ: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportAllData() {
  const data = JSON.stringify({ students: STATE.teacherStudents, exportDate: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `civics2026_all_students_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function exportStudentData(idx) {
  const student = STATE.teacherStudents[idx];
  if (!student) return;
  const data = JSON.stringify({
    studentName: student.studentName,
    studentId: student.studentId,
    progress: student.progress || {},
    updatedAt: student.updatedAt,
    exportDate: new Date().toISOString()
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `civics2026_${student.studentName||'student'}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function fmtTime(s) {
  const m = Math.floor(s/60);
  const sec = s % 60;
  return m + ':' + String(sec).padStart(2,'0');
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== TEACHER FUNCTIONS =====
function checkTeacherPass() {
  const input = document.getElementById('teacher-pass');
  if (!input || !input.value) return;
  const pass = input.value;
  // Verify against server
  fetch('/api/teacher/students?password=' + encodeURIComponent(pass))
  .then(function(r) {
    if (r.ok) {
      STATE.teacherPassword = pass;
      STATE.teacherAuth = true;
      try { localStorage.setItem('civics2026_teacher_pass', pass); } catch(e) {}
      return r.json().then(function(data) {
        STATE.teacherStudents = data.students || [];
        STATE.teacherLoading = false;
        render();
      });
    } else {
      var err = document.getElementById('pass-error');
      if (err) err.style.display = 'block';
      if (input) { input.value = ''; input.focus(); }
    }
  })
  .catch(function() {
    // Offline fallback — try localStorage password
    var saved = null;
    try { saved = localStorage.getItem('civics2026_teacher_pass'); } catch(e) {}
    if (saved && pass === saved) {
      STATE.teacherPassword = pass;
      STATE.teacherAuth = true;
      render();
    } else {
      var err = document.getElementById('pass-error');
      if (err) err.style.display = 'block';
      if (input) { input.value = ''; input.focus(); }
    }
  });
}

function loadTeacherData() {
  STATE.teacherLoading = true;
  render();
  if (!STATE.teacherPassword) return;
  fetch('/api/teacher/students?password=' + encodeURIComponent(STATE.teacherPassword))
  .then(r => r.json())
  .then(data => {
    STATE.teacherStudents = data.students || [];
    STATE.teacherLoading = false;
    render();
  })
  .catch(() => {
    STATE.teacherStudents = [];
    STATE.teacherLoading = false;
    render();
  });
}

function showStudentDetail(idx) {
  STATE.teacherSelectedStudent = idx;
  render();
  setTimeout(() => {
    const detail = document.querySelector('.content-section[style*="border-right"]');
    if (detail) detail.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function closeStudentDetail() {
  STATE.teacherSelectedStudent = null;
  render();
}

// ===== SCAFFOLD INTERACTIVE CHECKLIST (with persistence) =====
function onScaffoldCheck(cb) {
  const qId = cb.dataset.qid;
  const idx = parseInt(cb.dataset.idx);
  const sp = getScaffoldProg(qId);
  sp.checks[idx] = cb.checked;
  saveScaffoldProgress();
  
  const allChecks = document.querySelectorAll(`.scaffold-cb[data-qid="${qId}"]`);
  const checked = document.querySelectorAll(`.scaffold-cb[data-qid="${qId}"]:checked`);
  if (checked.length === allChecks.length && allChecks.length > 0) {
    showPositiveFeedback('🎉 כל הכבוד! סיימתם את כל הנקודות!');
  } else if (cb.checked) {
    showPositiveFeedback('✅ יופי! עוד שלב הושלם!');
  }
  // Update visual - mark parent label
  cb.closest('label').classList.toggle('checked', cb.checked);
  
  // Update progress bar without full re-render
  const progressFill = document.querySelector('.scaffold-progress-fill');
  const progressLabel = document.querySelector('.scaffold-progress-label');
  if (progressFill && progressLabel) {
    const done = checked.length;
    const total = allChecks.length;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    progressFill.style.width = pct + '%';
    progressFill.classList.toggle('complete', done === total);
    progressLabel.textContent = done === total ? '✅ הושלם!' : `${done} מתוך ${total} שלבים`;
  }
  
  // Update step pills visual
  const pills = document.querySelectorAll('.scaffold-step-pill');
  pills.forEach((pill, i) => {
    const isChecked = sp.checks[i] || false;
    pill.classList.toggle('step-done', isChecked);
  });
}

// ===== TEMPLATE FILL PERSISTENCE =====
function saveTemplateFill(qId, stepIdx, value) {
  const sp = getScaffoldProg(qId);
  sp.templateFills[stepIdx] = value;
  clearTimeout(window._scaffoldSaveDebounce);
  window._scaffoldSaveDebounce = setTimeout(saveScaffoldProgress, 1000);
}

// ===== COPY TEMPLATE TO ANSWER =====
function copyTemplateToAnswer(qId) {
  const sp = getScaffoldProg(qId);
  const fills = sp.templateFills || {};
  // Build formatted answer from template fills
  let text = '';
  const steps = Object.entries(fills)
    .filter(([key, val]) => val && val.trim())
    .sort(([a], [b]) => {
      if (a === 'quote') return 1;
      if (b === 'quote') return -1;
      return parseInt(a) - parseInt(b);
    });
  steps.forEach(([key, val]) => {
    if (key === 'quote') {
      text += `• ציטוט: "${val.trim()}"\n`;
    } else {
      text += `• ${val.trim()}\n`;
    }
  });
  
  if (!text.trim()) {
    showPositiveFeedback('⚠️ מלאו קודם את השדות בתבנית');
    return;
  }
  
  // Find the notes textarea for this question
  const ta = document.getElementById('ans-' + qId + '_notes');
  if (ta) {
    const existing = ta.value.trim();
    ta.value = existing ? existing + '\n' + text : text;
    // Trigger save
    const unitId = STATE.currentUnit;
    if (unitId) {
      const p = getProgress(unitId);
      p.answers[qId + '_notes'] = ta.value;
      saveState();
      debouncedSync();
    }
    showPositiveFeedback('📋 הועתק לנקודות בהצלחה!');
    // Scroll to the textarea
    ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ta.focus();
  }
}

// ===== GLOSSARY SYSTEM =====
function findGlossaryTerms(q) {
  // Extract relevant glossary terms from the question's unit concepts
  const terms = [];
  const unitIds = q.unitIds || [];
  const qText = (q.question || '') + ' ' + (q.passage || '');
  
  unitIds.forEach(uid => {
    const unit = UNITS_DATA.find(u => u.id === uid);
    if (!unit || !unit.concepts) return;
    unit.concepts.forEach(c => {
      // Check if the concept term appears in the question text
      const termClean = c.term.replace(/\s*\(.*?\)\s*/g, '').trim();
      if (qText.includes(termClean) || qText.includes(c.term)) {
        // Shorten definition for glossary display
        const shortDef = c.def.length > 120 ? c.def.substring(0, 117) + '...' : c.def;
        terms.push({ term: c.term, def: shortDef });
      }
    });
  });
  
  // If no terms found by text matching, show first 3 concepts from unit
  if (terms.length === 0 && unitIds.length > 0) {
    const unit = UNITS_DATA.find(u => u.id === unitIds[0]);
    if (unit && unit.concepts) {
      unit.concepts.slice(0, 3).forEach(c => {
        const shortDef = c.def.length > 120 ? c.def.substring(0, 117) + '...' : c.def;
        terms.push({ term: c.term, def: shortDef });
      });
    }
  }
  
  return terms.slice(0, 5); // Max 5 terms
}

// ===== FOCUS MANAGEMENT =====
function announceToSR(msg) {
  const el = document.getElementById('live-status');
  if (el) { el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 50); }
}

// ===== PHASE 3: LESSON PLANNER =====
function generateLesson() {
  const sel = document.getElementById('lesson-unit-select');
  if (!sel) return;
  const unitId = parseInt(sel.value);
  const unit = UNITS_DATA.find(u => u.id === unitId);
  if (!unit) return;
  const concepts = unit.concepts || [];
  const checklist = unit.checklist || [];
  const examQs = (typeof EXAM_QUESTIONS !== 'undefined' ? EXAM_QUESTIONS : []).filter(q => q.unitIds && q.unitIds.includes(unitId));
  const keyTerms = concepts.slice(0, 5).map(c => c.term || c.name || '').filter(Boolean);
  const firstQ = examQs.length > 0 ? examQs[0] : null;
  const lessonHtml = '<div class="lesson-plan" dir="rtl">'
    + '<div class="lesson-header"><h3>' + unit.icon + ' מתווה שיעור: יחידה ' + unit.id + ' - ' + unit.title + '</h3>'
    + '<div class="lesson-meta"><span><i class="fas fa-clock"></i> 45 דקות</span>'
    + '<span><i class="fas fa-book"></i> ' + concepts.length + ' מושגים</span>'
    + '<span><i class="fas fa-file-alt"></i> ' + examQs.length + ' שאלות בגרות</span></div></div>'
    + '<div class="lesson-phase phase-1"><div class="phase-header"><span class="phase-num">1</span> חזרה וקישור <span class="phase-time">7 דקות</span></div><ul>'
    + '<li>פתיחה: "מה זוכרים מהשיעור הקודם?"</li>'
    + '<li>חזרה על מושגי מפתח: <strong>' + (keyTerms.slice(0,3).join(', ') || 'ראו רשימת מושגים') + '</strong></li>'
    + '<li>שאלה מקשרת לחיי היומיום: "איך ' + unit.title + ' קשור לחיים שלכם?"</li>'
    + '<li>הצגת יעדי השיעור על הלוח</li></ul></div>'
    + '<div class="lesson-phase phase-2"><div class="phase-header"><span class="phase-num">2</span> הקניה <span class="phase-time">12 דקות</span></div><ul>'
    + '<li>הצגת מושגים חדשים: <strong>' + (keyTerms.join(', ') || 'כל מושגי היחידה') + '</strong></li>'
    + concepts.slice(0,3).map(c => '<li>📌 <strong>' + (c.term||'') + '</strong>: ' + (c.definition || c.def || '').substring(0,80) + '...</li>').join('')
    + '<li>שימוש בדוגמאות מעולם התלמיד</li>'
    + '<li>בדיקת הבנה: "מי יכול לנסח את ההגדרה במילים שלו?"</li></ul></div>'
    + '<div class="lesson-phase phase-3"><div class="phase-header"><span class="phase-num">3</span> תרגול <span class="phase-time">18 דקות</span></div><ul>'
    + (firstQ ? '<li>שאלת בגרות לתרגול: <strong>' + (firstQ.number||'') + '</strong> (' + (firstQ.exam||'') + ')</li>' : '<li>בחרו שאלת תרגול מהאתר</li>')
    + '<li>עבודה בזוגות: כל זוג פותר שאלה אחת</li>'
    + '<li>שימוש בפיגומים (רמה ' + (concepts.length > 8 ? '2-3' : '1-2') + ' לפי רמת הכיתה)</li>'
    + '<li>הצגת תשובות: 2-3 תלמידים מציגים בעל-פה</li>'
    + (examQs.length > 1 ? '<li>שאלה נוספת למתקדמים: שאלה ' + (examQs[1].number||'') + '</li>' : '')
    + '</ul></div>'
    + '<div class="lesson-phase phase-4"><div class="phase-header"><span class="phase-num">4</span> סיכום <span class="phase-time">8 דקות</span></div><ul>'
    + '<li>סיכום: "מה למדנו היום?" - 3 נקודות עיקריות</li>'
    + '<li>צ\'קליסט ביחד עם הכיתה:</li>'
    + checklist.slice(0,4).map(c => '<li>☑️ ' + c + '</li>').join('')
    + '<li>מטלה לבית: תרגלו באתר - יחידה ' + unit.id + ' (תרגול + שאלות בגרות)</li>'
    + '<li>תזכורת: "אפשר להשתמש בפיגומים בכל רמה שנוחה לכם"</li></ul></div>'
    + '<div class="lesson-footer"><button class="btn btn-primary" onclick="window.CivicsApp.printLesson()"><i class="fas fa-print"></i> הדפסה</button>'
    + '<button class="btn" style="background:var(--btn-export-bg);color:var(--btn-export-color)" onclick="window.CivicsApp.copyLesson()"><i class="fas fa-copy"></i> העתקה</button></div></div>';
  const output = document.getElementById('lesson-output');
  if (output) output.innerHTML = lessonHtml;
  announceToSR('מתווה שיעור נוצר ליחידה ' + unit.id);
}

function printLesson() {
  const el = document.getElementById('lesson-output');
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write('<html dir="rtl" lang="he"><head><title>מתווה שיעור</title><style>body{font-family:Assistant,sans-serif;padding:20px;direction:rtl}h3{color:#0038b8}.phase-header{font-weight:700;font-size:16px;margin:16px 0 8px;padding:8px;background:#E8F0FE;border-radius:8px;border-right:4px solid #0038b8}.phase-num{display:inline-block;width:24px;height:24px;background:#0038b8;color:#fff;border-radius:50%;text-align:center;line-height:24px;margin-left:8px;font-size:13px}.phase-time{float:left;font-size:13px;color:#666}ul{padding-right:24px}li{margin:4px 0;line-height:1.7}.lesson-meta{display:flex;gap:16px;margin:8px 0 16px;color:#666;font-size:14px}.lesson-footer{display:none}</style></head><body>');
  w.document.write(el.innerHTML);
  w.document.write('</body></html>');
  w.document.close();
  w.print();
}

function copyLesson() {
  const el = document.getElementById('lesson-output');
  if (!el) return;
  const text = el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    announceToSR('מתווה השיעור הועתק ללוח');
    const btn = el.querySelector('.btn:last-child');
    if (btn) { const orig = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check"></i> הועתק!'; setTimeout(() => btn.innerHTML = orig, 2000); }
  }).catch(() => {});
}

// ===== PHASE 3: TEXT HIGHLIGHTING =====
function toggleHighlight(color) {
  _activeHighlight = _activeHighlight === color ? '' : color;
  document.querySelectorAll('.highlight-btn').forEach(b => b.classList.remove('active'));
  if (_activeHighlight) {
    const btn = document.querySelector('.highlight-btn.hl-' + _activeHighlight);
    if (btn) btn.classList.add('active');
  }
}

function clearHighlights(el) {
  if (!el) return;
  el.querySelectorAll('mark').forEach(m => {
    const txt = document.createTextNode(m.textContent);
    m.parentNode.replaceChild(txt, m);
  });
  const hlId = el.dataset && el.dataset.hlId;
  if (hlId) {
    delete _savedHighlights[hlId];
    try { localStorage.setItem('civics2026_highlights', JSON.stringify(_savedHighlights)); } catch(e) {}
  }
}

// Mouseup handler for highlighting
document.addEventListener('mouseup', function() {
  if (!_activeHighlight) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  if (!container || !container.closest || !container.closest('.highlightable')) return;
  const mark = document.createElement('mark');
  mark.className = 'hl-' + _activeHighlight;
  try {
    range.surroundContents(mark);
    sel.removeAllRanges();
    const hlEl = container.closest('.highlightable');
    const hlId = hlEl && hlEl.dataset && hlEl.dataset.hlId;
    if (hlId) {
      _savedHighlights[hlId] = hlEl.innerHTML;
      try { localStorage.setItem('civics2026_highlights', JSON.stringify(_savedHighlights)); } catch(e) {}
    }
  } catch(e) {}
});

// ===== PHASE 3: TEACHER PASSWORD RESET =====
function resetTeacherPassword() {
  const cur = document.getElementById('reset-current-pass');
  const newP = document.getElementById('reset-new-pass');
  const conf = document.getElementById('reset-confirm-pass');
  const err = document.getElementById('reset-error');
  if (!cur || !newP || !conf) return;
  if (!cur.value || !newP.value || !conf.value) {
    if (err) { err.textContent = 'נא למלא את כל השדות'; err.style.display = 'block'; }
    return;
  }
  if (!cur.value || !newP.value || !conf.value) {
    if (err) { err.textContent = 'נא למלא את כל השדות'; err.style.display = 'block'; }
    return;
  }
  if (newP.value.length < 4) {
    if (err) { err.textContent = 'הסיסמה החדשה חייבת להיות לפחות 4 תווים'; err.style.display = 'block'; }
    return;
  }
  if (newP.value !== conf.value) {
    if (err) { err.textContent = 'הסיסמאות אינן תואמות'; err.style.display = 'block'; }
    return;
  }
  // Change password via server
  fetch('/api/teacher/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword: cur.value, newPassword: newP.value })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.ok) {
      STATE.teacherPassword = newP.value;
      try { localStorage.setItem('civics2026_teacher_pass', newP.value); } catch(e) {}
      if (err) err.style.display = 'none';
      announceToSR('הסיסמה שונתה בהצלחה');
      var ok = document.getElementById('reset-success');
      if (ok) { ok.style.display = 'block'; setTimeout(function() { ok.style.display = 'none'; }, 3000); }
    } else {
      if (err) { err.textContent = data.error === 'Wrong current password' ? 'הסיסמה הנוכחית שגויה' : (data.error || 'שגיאה'); err.style.display = 'block'; }
    }
  })
  .catch(function() {
    if (err) { err.textContent = 'שגיאת חיבור לשרת'; err.style.display = 'block'; }
  });
}

// ===== PUBLIC API =====
window.CivicsApp = {
  toggleSidebar, startTimer, stopTimer, setTab, setName, setGrade, saveAnswer,
  toggleCheck, setMood, toggleEl, toggleRecord, startExamSim,
  nextExamPhase, stopExamSim, exportData, importData, checkTeacherPass,
  loadTeacherData, showStudentDetail, closeStudentDetail, exportAllData,
  exportStudentData, togglePause, setTheme, setFontSize, setFontType,
  toggleQuietMode, toggleHideTimers, toggleReducedMotion, toggleA11yPanel,
  startBreathing, stopBreathing, setChunkPage, setStudyMatPage, toggleTTS, speakText,
  stopTTS, setScaffoldLevel, setScaffoldDefault, saveNote, resetAllData, setDailyGoal,
  showPositiveFeedback, onScaffoldCheck, announceToSR,
  toggleMinimalMode, saveTemplateFill, copyTemplateToAnswer,
  toggleDualView, setSupportLevel, toggleHideImages, setViewMode,
  retryConnection, predictScore, setContrast,
  generateLesson, printLesson, copyLesson,
  toggleHighlight, clearHighlights, resetTeacherPassword,
  // Exam questions API
  setQExam(idx) { _questionsState.currentExam = idx; _questionsState.expandedQuestion = null; _questionsState.filterUnit = 0; render(); },
  setQSearch(q) { _questionsState.searchQuery = q; _questionsState.expandedQuestion = null; render(); setTimeout(() => { const el = document.getElementById('q-search-input'); if (el) { el.focus(); el.value = q; } }, 50); },
  setQUnit(uid) { _questionsState.filterUnit = uid; _questionsState.expandedQuestion = null; render(); },
  toggleQAnswer(id) { const idx = _questionsState.answeredQuestions.indexOf(id); if (idx === -1) _questionsState.answeredQuestions.push(id); else _questionsState.answeredQuestions.splice(idx, 1); _saveQuestionsState(); render(); },
  toggleQExpand(id) { _questionsState.expandedQuestion = _questionsState.expandedQuestion === id ? null : id; render(); },
  expandAllQ() { _questionsState.expandedQuestion = '__all__'; render(); },
  collapseAllQ() { _questionsState.expandedQuestion = null; render(); }
};

// ===== BOOT =====
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
