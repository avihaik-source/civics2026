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

// === SERVICE WORKER ===
app.get('/sw.js', async (c) => {
  const swCode = `// Civics2026 Service Worker - Offline Support
const CACHE_NAME='civics2026-v5';
const STATIC_ASSETS=['/','/static/app.js','/static/data.js','/static/questions-data.js','/static/scaffolding.js','/static/study-materials.js','/static/features.js','/static/styles.css','/static/exam-questions-official.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request).catch(()=>new Response(JSON.stringify({ok:false,offline:true,message:'אתם במצב לא מקוון'}),{headers:{'Content-Type':'application/json'}})));return}e.respondWith(caches.match(e.request).then(c=>{if(c){fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(ca=>ca.put(e.request,r))}).catch(()=>{});return c}return fetch(e.request).then(r=>{if(r.ok&&u.origin===self.location.origin){const cl=r.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,cl))}return r})}))});`;
  
  return c.text(swCode, 200, { 'Content-Type': 'application/javascript' });
})

// === MAIN HTML PAGE ===
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>הכנה לבגרות באזרחות 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Alef:wght@400;700&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/styles.css" rel="stylesheet">
<style>
  :root {
    --bg-color: #F8F9F3;
    --text-primary: #334155;
    --brand-blue: #1E3A8A;
    --brand-orange: #D97706;
    --shadow-light: #ffffff;
    --shadow-dark: #dcdedd;
  }
  body { background-color: var(--bg-color); color: var(--text-primary); font-family: 'Alef', sans-serif; margin: 0; padding: 0; }
  h1, h2, h3, .brand-font { font-family: 'Rubik', sans-serif; }
  .header-area { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; }
  .lesson-roadmap { display: flex; justify-content: center; gap: 30px; background: var(--bg-color); padding: 15px 30px; border-radius: 12px; margin: 10px auto; max-width: 800px; box-shadow: 4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light); }
  .station { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-weight: 500; }
  .station.active { color: var(--brand-blue); font-weight: 700; }
  .station-num { background: #e2e8f0; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .station.active .station-num { background: var(--brand-blue); color: white; }
  .nano-grid { display: grid; grid-template-columns: 180px 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
  .nano-cell { padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; }
  .header-blue { border-top: 6px solid #3b82f6; background: #eff6ff; font-weight: bold; text-align: center; }
  .header-red { border-top: 6px solid #ef4444; background: #fef2f2; font-weight: bold; text-align: center; }
  .header-green { border-top: 6px solid #10b981; background: #ecfdf5; font-weight: bold; text-align: center; }
  .label-cell { background: #f1f5f9; font-weight: bold; display: flex; align-items: center; }
  .editable-cell { border: 2px dashed #cbd5e1; min-height: 60px; outline: none; }
  .action-btn { background: var(--brand-blue); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
  #focus-mask { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.85); z-index: 9999; display: none; pointer-events: none; }
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
  <div style="display: flex; align-items: center; gap: 15px;">
    <a href="/static/חוברת_מותאמת_לבגרות.html" role="button" style="border: 2px solid #1E3A8A; color: #1E3A8A; font-weight: bold; border-radius: 8px; display: flex; align-items: center; gap: 8px; background-color: #eff6ff; text-decoration: none; padding: 6px 16px;">
      <span>⚓</span> תומכי זיכרון
    </a>
    <div id="user-controls"></div>
  </div>
</header>

<nav class="lesson-roadmap" id="roadmap">
  <div class="station active"><div class="station-num">1</div> עוגן זיכרון</div>
  <div class="station"><div class="station-num">2</div> המושג הרשמי</div>
  <div class="station"><div class="station-num">3</div> פירוק והבנה</div>
  <div class="station"><div class="station-num">4</div> זירת תרגול</div>
</nav>

<main style="max-width: 1000px; margin: 0 auto; padding: 20px;">
  <section style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 30px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 class="brand-font" style="color: var(--brand-blue); margin: 0;">🎯 זירת הניתוח: ננו בננה</h2>
          <button id="voice-record-btn" class="action-btn"><i class="fas fa-microphone"></i> הקלט תשובה</button>
      </div>
      
      <div class="nano-grid">
          <div class="p-2"></div>
          <div class="nano-cell header-blue">🔵 הבחנה מותרת</div>
          <div class="nano-cell header-red">🔴 אפליה פסולה</div>
          <div class="nano-cell header-green">🟢 העדפה מתקנת</div>
          <div class="nano-cell label-cell">הסיבה (למה?)</div>
          <div class="nano-cell" style="background: #eff6ff">שוני רלוונטי</div>
          <div class="nano-cell" style="background: #fef2f2">דעה קדומה</div>
          <div class="nano-cell" style="background: #ecfdf5">תיקון עוול</div>
          <div class="nano-cell label-cell">תרגול עצמי</div>
          <div class="nano-cell editable-cell" contenteditable="true" id="ans-bchana"></div>
          <div class="nano-cell editable-cell" contenteditable="true" id="ans-aflaya"></div>
          <div class="nano-cell editable-cell" contenteditable="true" id="ans-hadafa"></div>
      </div>
  </section>

  <div id="app">
    <div style="text-align:center; padding: 40px;">
      <i class="fas fa-circle-notch fa-spin" style="font-size: 40px; color: #1E3A8A;"></i>
      <div style="margin-top:20px;">טוען נתונים...</div>
    </div>
  </div>
</main>

<div id="focus-mask"></div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" defer></script>
<script src="/static/data.js" defer></script>
<script src="/static/app.js" defer></script>
<script>
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}
</script>
</body>
</html>`)
})

// === SYNC API ===
app.post('/api/sync', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json({ ok: true });
    const body = await c.req.json();
    const { studentId, studentName, studentGrade } = body;
    await db.prepare("INSERT INTO students (id, name, grade) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, grade=excluded.grade").bind(studentId, studentName || '', studentGrade || '').run();
    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

export default app