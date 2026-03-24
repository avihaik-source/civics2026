import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { cache } from 'hono/cache'

type Bindings = {
  DB: D1Database;
  TEACHER_PASSWORD?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// Cache static assets for 1 day
app.use('/static/*', cache({
  cacheName: 'civics2026-static',
  cacheControl: 'public, max-age=86400, s-maxage=604800',
}))

// Service Worker - Offline Support
app.get('/sw.js', async (c) => {
  const swCode = `// Civics2026 Service Worker - Offline Support
const CACHE_NAME='civics2026-v5';
const STATIC_ASSETS=['/','/static/app.js','/static/data.js','/static/questions-data.js','/static/scaffolding.js','/static/study-materials.js','/static/features.js','/static/styles.css','/static/exam-questions-official.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// 1. סגירה תקינה של מחרוזת ה-Service Worker. שימוש ב-const swCode כדי לאחסן את הטקסט.
const swCode = `
  self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request).catch(()=>new Response(JSON.stringify({ok:false,offline:true,message:'אתם במצב לא מקוון'}),{headers:{'Content-Type':'application/json'}})));return}e.respondWith(caches.match(e.request).then(c=>{if(c){fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(ca=>ca.put(e.request,r))}).catch(()=>{});return c}return fetch(e.request).then(r=>{if(r.ok&&u.origin===self.location.origin){const cl=r.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,cl))}return r})}))});
`;

// 2. פונקציית הקומפוננטה (וודא שזה בתוך פונקציית ה-App או ה-Component שלך)
return (
  <header className="header-area">
    <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40">
        <rect x="80" y="20" width="15" height="15" rx="3" fill="#1E3A8A" />
        <rect x="60" y="10" width="15" height="25" rx="3" fill="#1E3A8A" />
        <path d="M40 5 h10 a3 3 0 0 1 3 3 v20 a3 3 0 0 1 -3 3 h-2 l-4 4 v-4 h-4 a3 3 0 0 1 -3 -3 v-20 a3 3 0 0 1 3 -3 z" fill="#D97706" />
        <text x="30" y="26" fontFamily="Rubik, sans-serif" fontWeight="500" fontSize="16" fill="#334155" textAnchor="end">אזרחות 2026</text>
      </svg>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <a href="/static/חוברת_מותאמת_לבגרות.html" role="button" className="outline" style={{ border: '2px solid #1E3A8A', color: '#1E3A8A', fontWeight: 'bold', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#eff6ff', textDecoration: 'none', padding: '6px 16px' }} title="מעבר למרחב תומכי הזיכרון">
        <span style={{ fontSize: '1.2em' }}>⚓</span> תומכי זיכרון
      </a>
      <div id="user-controls"></div>
    </div>
  </header>
);
  
  <div style="display: flex; align-items: center; gap: 15px;">
    <a href="/static/חוברת_מותאמת_לבגרות.html" role="button" class="outline" style="border: 2px solid #1E3A8A; color: #1E3A8A; font-weight: bold; border-radius: 8px; display: flex; align-items: center; gap: 8px; background-color: #eff6ff; text-decoration: none; padding: 6px 16px;" title="מעבר למרחב תומכי הזיכרון">
      <span style="font-size: 1.2em;">⚓</span> תומכי זיכרון
    </a>
    <div id="user-controls"></div>
  </div>
</header>
  })

// === MAIN HTML PAGE (UPDATED WITH ASD UX/UI VISION) ===
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>הכנה לבגרות באזרחות 2026</title>
<meta name="description" content="סביבת למידה חכמה ומונגשת לבגרות באזרחות.">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link href="https://fonts.googleapis.com/css2?family=Alef:wght@400;700&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/styles.css" rel="stylesheet">
<style>
  /* משתני עיצוב קוגניטיבי (ASD Guidelines) */
  :root {
    --bg-color: #F8F9F3; /* אבן ירושלמית בהירה / חול - לא מסנוור */
    --text-primary: #334155; /* אפור-פחם רך */
    --brand-blue: #1E3A8A; /* כחול ים תיכון עמוק */
    --brand-orange: #D97706; /* כתום אדמה */
    --shadow-light: #ffffff;
    --shadow-dark: #dcdedd;
  }
  body {
    background-color: var(--bg-color);
    color: var(--text-primary);
    font-family: 'Alef', sans-serif;
    margin: 0; padding: 0;
  }
  h1, h2, h3, .brand-font { font-family: 'Rubik', sans-serif; }
  
  /* הלוגו בפינה */
  .header-area {
    display: flex; justify-content: space-between; align-items: center;
    padding: 15px 30px; background: transparent;
  }
  
  /* סרגל תחנות (מפת שיעור) מובנה */
  .lesson-roadmap {
    display: flex; justify-content: center; gap: 30px;
    background: var(--bg-color); padding: 15px 30px;
    border-radius: 12px; margin: 10px auto; max-width: 800px;
    box-shadow: 4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light);
  }
  .station {
    display: flex; align-items: center; gap: 8px; font-family: 'Rubik', sans-serif;
    color: #94a3b8; font-weight: 500; transition: all 0.3s;
  }
  .station.active { color: var(--brand-blue); font-weight: 700; transform: scale(1.05); }
  .station-num {
    background: #e2e8f0; border-radius: 50%; width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .station.active .station-num { background: var(--brand-blue); color: white; }
  
  /* מסכת הקריאה */
  #focus-mask {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15, 23, 42, 0.85); z-index: 9999;
    display: none; pointer-events: none;
  }

  /* תוספת: עיצוב ננו בננה - נקי, סטטי ומוכן לדינמיות */
  .nano-grid { display: grid; grid-template-columns: 180px 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
  .nano-cell { padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 15px; background: white; }
  .header-blue { border-top: 6px solid #3b82f6; background: #eff6ff; font-weight: bold; text-align: center; }
  .header-red { border-top: 6px solid #ef4444; background: #fef2f2; font-weight: bold; text-align: center; }
  .header-green { border-top: 6px solid #10b981; background: #ecfdf5; font-weight: bold; text-align: center; }
  .label-cell { background: #f1f5f9; font-weight: bold; display: flex; align-items: center; }
  .editable-cell { border: 2px dashed #cbd5e1; cursor: text; transition: border-color 0.2s; min-height: 60px; outline: none; }
  .editable-cell:focus { border-color: var(--brand-blue); background: #f8fafc; }
  .action-btn { background: var(--brand-blue); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-family: 'Rubik', sans-serif; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; }
  .action-btn:hover { background: #152c6a; }
  @media (max-width: 768px) { .nano-grid { grid-template-columns: 1fr; } .label-cell { display: none; } }
</style>
</head>
<body>

<header class="header-area">
  <div class="logo-container" style="display: flex; align-items: center; gap: 10px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40">
      <rect x="80" y="20" width="15" height="15" rx="3" fill="#1E3A8A" />
      <rect x="60" y="10" width="15" height="25" rx="3" fill="#1E3A8A" />
      <path d="M40 5 h10 a3 3 0 0 1 3 3 v20 a3 3 0 0 1 -3 3 h-2 l-4 4 v-4 h-4 a3 3 0 0 1 -3 -3 v-20 a3 3 0 0 1 3 -3 z" fill="#D97706" />
      <text x="30" y="26" font-family="Rubik, sans-serif" font-weight="500" font-size="16" fill="#334155" text-anchor="end">אזרחות 2026</text>
    </svg>
  </div>
  <div id="user-controls"></div>
</header>

<nav class="lesson-roadmap" id="roadmap">
  <div class="station active" id="st-1"><div class="station-num">1</div> עוגן זיכרון</div>
  <div class="station" id="st-2"><div class="station-num">2</div> המושג הרשמי</div>
  <div class="station" id="st-3"><div class="station-num">3</div> פירוק והבנה</div>
  <div class="station" id="st-4"><div class="station-num">4</div> זירת תרגול</div>
</nav>

<main style="max-width: 1000px; margin: 0 auto; padding: 20px;">
  
  <section id="nano-banana-section" style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 30px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
          <h2 class="brand-font" style="color: var(--brand-blue); margin: 0; font-size: 24px;">🎯 זירת הניתוח: ננו בננה</h2>
          <button id="voice-record-btn" class="action-btn"><i class="fas fa-microphone"></i> הקלט תשובה במקום להקליד</button>
      </div>
      
      <div class="nano-grid">
          <div class="p-2"></div>
          <div class="nano-cell header-blue">🔵 הבחנה מותרת</div>
          <div class="nano-cell header-red">🔴 אפליה פסולה</div>
          <div class="nano-cell header-green">🟢 העדפה מתקנת</div>

          <div class="nano-cell label-cell">הסיבה (למה?)</div>
          <div class="nano-cell" style="background: #eff6ff">שוני רלוונטי לנושא</div>
          <div class="nano-cell" style="background: #fef2f2">דעה קדומה וסטריאוטיפים</div>
          <div class="nano-cell" style="background: #ecfdf5">תיקון עוול היסטורי</div>
          
          <div class="nano-cell label-cell">תרגול עצמי</div>
          <div class="nano-cell editable-cell" contenteditable="true" id="ans-bchana" placeholder="כתוב דוגמה..."></div>
          <div class="nano-cell editable-cell" contenteditable="true" id="ans-aflaya" placeholder="כתוב דוגמה..."></div>
          <div class="nano-cell editable-cell" contenteditable="true" id="ans-hadafa" placeholder="כתוב דוגמה..."></div>
      </div>
  </section>

  <div id="app">
    <div style="display:flex;justify-content:center;align-items:center;height:40vh;">
      <div style="text-align:center;">
        <i class="fas fa-circle-notch fa-spin" style="font-size: 40px; color: #1E3A8A; margin-bottom: 20px;"></i>
        <div class="brand-font" style="font-size:22px; color: #334155;">מכין את סביבת הלמידה...</div>
      </div>
    </div>
  </div>

</main>

<div id="focus-mask"></div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" defer></script>
<script src="/static/data.js" defer></script>
<script src="/static/mikud-data.js" defer></script>
<script src="/static/comparison-tables.js" defer></script>
<script src="/static/scaffolding.js" defer></script>
<script src="/static/app.js" defer></script>
<script src="/static/features.js" defer></script>
<script>
window.addEventListener('load',function(){
  var files=['/static/questions-data.js','/static/study-materials.js'];
  files.forEach(function(src){var s=document.createElement('script');s.src=src;s.async=true;document.body.appendChild(s)});
});
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}

window.toggleFocusMask = function(targetElementId) {
  const mask = document.getElementById('focus-mask');
  const target = document.getElementById(targetElementId);
  if (mask.style.display === 'block') {
    mask.style.display = 'none';
  } else if (target) {
    const rect = target.getBoundingClientRect();
    mask.style.display = 'block';
    mask.style.clipPath = \`polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 
      \${rect.left - 10}px \${rect.top - 10}px, 
      \${rect.left - 10}px \${rect.bottom + 10}px, 
      \${rect.right + 10}px \${rect.bottom + 10}px, 
      \${rect.right + 10}px \${rect.top - 10}px, 
      \${rect.left - 10}px \${rect.top - 10}px)\`;
  }
};
</script>
</body>
</html>`)
})

// === HEALTH CHECK ===
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', version: 'phase6-qa', timestamp: new Date().toISOString() })
})

// === HELPER: Ensure tables exist (for first request on fresh D1) ===
let tablesReady = false;
async function ensureTables(db: D1Database) {
  if (tablesReady) return;
  try {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', grade TEXT DEFAULT '', class_name TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS progress (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, unit_id INTEGER NOT NULL, checklist TEXT DEFAULT '[]', answers TEXT DEFAULT '{}', mood TEXT DEFAULT '', completed INTEGER DEFAULT 0, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, UNIQUE(student_id, unit_id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, note_key TEXT NOT NULL, content TEXT DEFAULT '', updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, UNIQUE(student_id, note_key))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS highlights (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, highlight_id TEXT NOT NULL, data TEXT DEFAULT '[]', updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, UNIQUE(student_id, highlight_id))`),
      db.prepare(`CREATE TABLE IF NOT EXISTS sync_log (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, action TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS analytics (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, event_type TEXT NOT NULL, event_data TEXT DEFAULT '{}', timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE)`),
    ]);
    tablesReady = true;
  } catch (e) {
    tablesReady = true;
  }
}

// === SYNC API - Full D1 persistence ===
app.post('/api/sync', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json({ ok: true, message: 'Sync acknowledged (no DB binding)' })
    await ensureTables(db);
    const body = await c.req.json();
    const { studentId, studentName, studentGrade, progress, notes, highlights } = body;
    if (!studentId) return c.json({ ok: false, error: 'Missing studentId' }, 400);

    await db.prepare(`INSERT INTO students (id, name, grade, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET name=excluded.name, grade=excluded.grade, updated_at=datetime('now')`).bind(studentId, studentName || '', studentGrade || '').run();

    if (progress && typeof progress === 'object') {
      const batch: D1PreparedStatement[] = [];
      for (const [unitId, data] of Object.entries(progress)) {
        const d = data as any;
        batch.push(db.prepare(`INSERT INTO progress (student_id, unit_id, checklist, answers, mood, completed, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now')) ON CONFLICT(student_id, unit_id) DO UPDATE SET checklist=excluded.checklist, answers=excluded.answers, mood=excluded.mood, completed=excluded.completed, updated_at=datetime('now')`).bind(studentId, parseInt(unitId), JSON.stringify(d.checklist || []), JSON.stringify(d.answers || {}), d.mood || '', d.completed ? 1 : 0));
      }
      if (batch.length > 0) await db.batch(batch);
    }
    await db.prepare(`INSERT INTO sync_log (student_id, action) VALUES (?, 'sync')`).bind(studentId).run();
    return c.json({ ok: true, message: 'Synced to D1', studentId });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

app.get('/api/sync/:studentId', async (c) => {
  try {
    const db = c.env.DB;
    const studentId = c.req.param('studentId');
    if (!db) return c.json({ found: false, data: null });
    await ensureTables(db);
    const student = await db.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first();
    if (!student) return c.json({ found: false, data: null });
    
    const progressRows = await db.prepare('SELECT * FROM progress WHERE student_id = ?').bind(studentId).all();
    const progress: Record<string, any> = {};
    for (const row of progressRows.results) {
      progress[String(row.unit_id)] = {
        checklist: JSON.parse(String(row.checklist || '[]')),
        answers: JSON.parse(String(row.answers || '{}')),
        mood: row.mood || '',
        completed: !!row.completed
      };
    }
    return c.json({ found: true, data: { studentName: student.name, studentGrade: student.grade, progress, notes: {}, highlights: {} } });
  } catch (e: any) {
    return c.json({ found: false, data: null, error: e.message });
  }
});

async function getTeacherPassword(db: D1Database | null, envPassword?: string): Promise<string> {
  if (db) {
    try {
      await ensureTables(db);
      await db.prepare(`CREATE TABLE IF NOT EXISTS teacher_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
      const row = await db.prepare(`SELECT value FROM teacher_settings WHERE key = 'password'`).first();
      if (row && row.value) return String(row.value);
    } catch (e) { }
  }
  return envPassword || '0512';
}

async function verifyTeacherPassword(c: any): Promise<boolean> {
  const password = c.req.query('password') || c.req.header('X-Teacher-Password') || '';
  const db = c.env.DB;
  const expected = await getTeacherPassword(db, c.env.TEACHER_PASSWORD);
  return password === expected;
}

export default app