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

// Service Worker - must be served from root for scope
app.get('/sw.js', async (c) => {
  const swCode = `// Civics2026 Service Worker - Offline Support
const CACHE_NAME='civics2026-v3';
const STATIC_ASSETS=['/','/static/app.js','/static/data.js','/static/questions-data.js','/static/scaffolding.js','/static/styles.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request).catch(()=>new Response(JSON.stringify({ok:false,offline:true,message:'אתם במצב לא מקוון'}),{headers:{'Content-Type':'application/json'}})));return}e.respondWith(caches.match(e.request).then(c=>{if(c){fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(ca=>ca.put(e.request,r))}).catch(()=>{});return c}return fetch(e.request).then(r=>{if(r.ok&&u.origin===self.location.origin){const cl=r.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,cl))}return r})}))});`;
  return new Response(swCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    }
  });
})

// === MAIN HTML PAGE ===
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>הכנה לבגרות באזרחות 2026</title>
<meta name="description" content="אתר הכנה אינטראקטיבי לבחינת הבגרות באזרחות - 96 שאלות בגרות אמיתיות מ-5 מבחנים (2024-2025), 51 שאלות תרגול עם פיגומים תלת-רמתיים, ו-16 יחידות לימוד עם 111 מושגים. נגיש, חינמי, ומותאם ASD.">
<meta property="og:title" content="הכנה לבגרות באזרחות 2026">
<meta property="og:description" content="96 שאלות בגרות אמיתיות + 51 שאלות תרגול עם פיגומים + 16 יחידות לימוד - חינם ונגיש לכולם">
<meta property="og:type" content="website">
<meta property="og:locale" content="he_IL">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="/static/styles.css" as="style">
<link rel="preload" href="/static/app.js" as="script">
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&family=David+Libre:wght@400;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/styles.css" rel="stylesheet">
</head>
<body>
<div id="app"><div style="display:flex;justify-content:center;align-items:center;height:100vh;direction:rtl;font-family:Assistant,sans-serif"><div style="text-align:center"><div style="font-size:48px;margin-bottom:16px">🎓</div><div style="font-size:20px;color:#0038b8;font-weight:700">טוען את אזרחות 2026...</div></div></div></div>
<script src="/static/data.js" defer></script>
<script src="/static/scaffolding.js" defer></script>
<script src="/static/questions-data.js" defer></script>
<script src="/static/app.js" defer></script>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}</script>
</body>
</html>`)
})

// === HEALTH CHECK ===
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', version: 'phase4', timestamp: new Date().toISOString() })
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
    // Tables likely already exist from migration
    tablesReady = true;
  }
}

// === SYNC API - Full D1 persistence ===

// POST /api/sync - Save student data to D1
app.post('/api/sync', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) {
      // Fallback: no D1 binding (local dev without --d1)
      return c.json({ ok: true, message: 'Sync acknowledged (no DB binding)', timestamp: new Date().toISOString() })
    }

    await ensureTables(db);

    const body = await c.req.json();
    const { studentId, studentName, studentGrade, progress, notes, highlights } = body;

    if (!studentId) {
      return c.json({ ok: false, error: 'Missing studentId' }, 400);
    }

    // Upsert student record
    await db.prepare(`
      INSERT INTO students (id, name, grade, updated_at) VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, grade=excluded.grade, updated_at=datetime('now')
    `).bind(studentId, studentName || '', studentGrade || '').run();

    // Upsert progress per unit
    if (progress && typeof progress === 'object') {
      const batch: D1PreparedStatement[] = [];
      for (const [unitId, data] of Object.entries(progress)) {
        const d = data as any;
        batch.push(
          db.prepare(`
            INSERT INTO progress (student_id, unit_id, checklist, answers, mood, completed, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(student_id, unit_id) DO UPDATE SET
              checklist=excluded.checklist, answers=excluded.answers, mood=excluded.mood,
              completed=excluded.completed, updated_at=datetime('now')
          `).bind(
            studentId,
            parseInt(unitId),
            JSON.stringify(d.checklist || []),
            JSON.stringify(d.answers || {}),
            d.mood || '',
            d.completed ? 1 : 0
          )
        );
      }
      if (batch.length > 0) {
        await db.batch(batch);
      }
    }

    // Upsert notes
    if (notes && typeof notes === 'object') {
      const batch: D1PreparedStatement[] = [];
      for (const [key, content] of Object.entries(notes)) {
        if (content) {
          batch.push(
            db.prepare(`
              INSERT INTO notes (student_id, note_key, content, updated_at) VALUES (?, ?, ?, datetime('now'))
              ON CONFLICT(student_id, note_key) DO UPDATE SET content=excluded.content, updated_at=datetime('now')
            `).bind(studentId, key, String(content))
          );
        }
      }
      if (batch.length > 0) {
        await db.batch(batch);
      }
    }

    // Upsert highlights
    if (highlights && typeof highlights === 'object') {
      const batch: D1PreparedStatement[] = [];
      for (const [hlId, data] of Object.entries(highlights)) {
        batch.push(
          db.prepare(`
            INSERT INTO highlights (student_id, highlight_id, data, updated_at) VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(student_id, highlight_id) DO UPDATE SET data=excluded.data, updated_at=datetime('now')
          `).bind(studentId, hlId, JSON.stringify(data))
        );
      }
      if (batch.length > 0) {
        await db.batch(batch);
      }
    }

    // Log sync event
    await db.prepare(`INSERT INTO sync_log (student_id, action) VALUES (?, 'sync')`).bind(studentId).run();

    return c.json({
      ok: true,
      message: 'Synced to D1',
      studentId,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    console.error('Sync error:', e);
    return c.json({ ok: false, error: e.message || 'Sync failed' }, 500);
  }
});

// GET /api/sync/:studentId - Fetch student data from D1
app.get('/api/sync/:studentId', async (c) => {
  try {
    const db = c.env.DB;
    const studentId = c.req.param('studentId');

    if (!db) {
      return c.json({ found: false, data: null, message: 'No DB binding' });
    }

    await ensureTables(db);

    // Get student
    const student = await db.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first();
    if (!student) {
      return c.json({ found: false, data: null });
    }

    // Get progress
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

    // Get notes
    const noteRows = await db.prepare('SELECT * FROM notes WHERE student_id = ?').bind(studentId).all();
    const notes: Record<string, string> = {};
    for (const row of noteRows.results) {
      notes[String(row.note_key)] = String(row.content || '');
    }

    // Get highlights
    const hlRows = await db.prepare('SELECT * FROM highlights WHERE student_id = ?').bind(studentId).all();
    const highlights: Record<string, any> = {};
    for (const row of hlRows.results) {
      highlights[String(row.highlight_id)] = JSON.parse(String(row.data || '[]'));
    }

    return c.json({
      found: true,
      data: {
        studentName: student.name,
        studentGrade: student.grade,
        progress,
        notes,
        highlights
      }
    });
  } catch (e: any) {
    console.error('Sync fetch error:', e);
    return c.json({ found: false, data: null, error: e.message });
  }
});

// === TEACHER PASSWORD HELPER ===
async function getTeacherPassword(db: D1Database | null, envPassword?: string): Promise<string> {
  // Priority: 1) D1 stored password, 2) env variable, 3) default
  if (db) {
    try {
      await ensureTables(db);
      // Check if teacher_settings table exists and has password
      await db.prepare(`CREATE TABLE IF NOT EXISTS teacher_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
      const row = await db.prepare(`SELECT value FROM teacher_settings WHERE key = 'password'`).first();
      if (row && row.value) return String(row.value);
    } catch (e) { /* table might not exist yet */ }
  }
  return envPassword || 'civics2026!';
}

async function verifyTeacherPassword(c: any): Promise<boolean> {
  const password = c.req.query('password') || c.req.header('X-Teacher-Password') || '';
  const db = c.env.DB;
  const expected = await getTeacherPassword(db, c.env.TEACHER_PASSWORD);
  return password === expected;
}

// === TEACHER API ===

// POST /api/teacher/change-password - Change teacher password
app.post('/api/teacher/change-password', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json({ ok: false, error: 'No DB binding' }, 500);

    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
      return c.json({ ok: false, error: 'Missing fields' }, 400);
    }
    if (newPassword.length < 4) {
      return c.json({ ok: false, error: 'Password too short (min 4)' }, 400);
    }

    const expected = await getTeacherPassword(db, c.env.TEACHER_PASSWORD);
    if (currentPassword !== expected) {
      return c.json({ ok: false, error: 'Wrong current password' }, 401);
    }

    await db.prepare(`CREATE TABLE IF NOT EXISTS teacher_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
    await db.prepare(`INSERT INTO teacher_settings (key, value, updated_at) VALUES ('password', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`).bind(newPassword).run();

    return c.json({ ok: true, message: 'Password changed successfully' });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// GET /api/teacher/students - Get all students with progress
app.get('/api/teacher/students', async (c) => {
  const authorized = await verifyTeacherPassword(c);
  if (!authorized) {
    return c.json({ error: 'Unauthorized', students: [] }, 401);
  }

  try {
    const db = c.env.DB;
    if (!db) {
      return c.json({ students: [], message: 'No DB binding' });
    }

    await ensureTables(db);

    // Get all students with their progress summary
    const students = await db.prepare(`
      SELECT s.id, s.name, s.grade, s.class_name, s.created_at, s.updated_at,
        (SELECT COUNT(*) FROM progress p WHERE p.student_id = s.id AND p.completed = 1) as completed_units,
        (SELECT COUNT(*) FROM progress p WHERE p.student_id = s.id) as total_progress_entries,
        (SELECT COUNT(*) FROM notes n WHERE n.student_id = s.id) as notes_count
      FROM students s
      ORDER BY s.updated_at DESC
    `).all();

    // For each student, get full progress data
    const enrichedStudents = [];
    for (const student of students.results) {
      const progressRows = await db.prepare('SELECT * FROM progress WHERE student_id = ?')
        .bind(String(student.id)).all();

      const progress: Record<string, any> = {};
      let totalAnswers = 0;
      for (const row of progressRows.results) {
        const answers = JSON.parse(String(row.answers || '{}'));
        totalAnswers += Object.keys(answers).length;
        progress[String(row.unit_id)] = {
          checklist: JSON.parse(String(row.checklist || '[]')),
          answers,
          mood: row.mood || '',
          completed: !!row.completed
        };
      }

      enrichedStudents.push({
        id: student.id,
        name: student.name,
        grade: student.grade,
        className: student.class_name,
        createdAt: student.created_at,
        updatedAt: student.updated_at,
        completedUnits: student.completed_units,
        totalAnswers,
        notesCount: student.notes_count,
        progress
      });
    }

    return c.json({
      students: enrichedStudents,
      total: enrichedStudents.length,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    console.error('Teacher API error:', e);
    return c.json({ students: [], error: e.message }, 500);
  }
});

// === ANALYTICS API ===

// POST /api/analytics - Log analytics event
app.post('/api/analytics', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json({ ok: true, message: 'No DB' });

    await ensureTables(db);

    const { studentId, eventType, eventData } = await c.req.json();
    if (!studentId || !eventType) {
      return c.json({ ok: false, error: 'Missing fields' }, 400);
    }

    await db.prepare(`
      INSERT INTO analytics (student_id, event_type, event_data) VALUES (?, ?, ?)
    `).bind(studentId, eventType, JSON.stringify(eventData || {})).run();

    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// GET /api/analytics/summary - Get analytics summary for teacher
app.get('/api/analytics/summary', async (c) => {
  const authorized = await verifyTeacherPassword(c);
  if (!authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const db = c.env.DB;
    if (!db) return c.json({ summary: {} });

    await ensureTables(db);

    // Active students (synced in last 7 days)
    const activeStudents = await db.prepare(`
      SELECT COUNT(DISTINCT student_id) as count FROM sync_log 
      WHERE timestamp > datetime('now', '-7 days')
    `).first();

    // Total students
    const totalStudents = await db.prepare('SELECT COUNT(*) as count FROM students').first();

    // Total sync events today
    const todaySyncs = await db.prepare(`
      SELECT COUNT(*) as count FROM sync_log 
      WHERE timestamp > datetime('now', 'start of day')
    `).first();

    // Most active units (by progress entries)
    const popularUnits = await db.prepare(`
      SELECT unit_id, COUNT(*) as student_count, 
        SUM(completed) as completed_count
      FROM progress 
      GROUP BY unit_id 
      ORDER BY student_count DESC 
      LIMIT 16
    `).all();

    // Average completion
    const avgCompletion = await db.prepare(`
      SELECT AVG(completed) * 100 as avg_pct FROM progress
    `).first();

    // Recent events
    const recentEvents = await db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM analytics
      WHERE timestamp > datetime('now', '-7 days')
      GROUP BY event_type
      ORDER BY count DESC
    `).all();

    return c.json({
      summary: {
        totalStudents: totalStudents?.count || 0,
        activeStudents7d: activeStudents?.count || 0,
        todaySyncs: todaySyncs?.count || 0,
        averageCompletionPct: Math.round(Number(avgCompletion?.avg_pct || 0)),
        unitStats: popularUnits.results,
        recentEvents: recentEvents.results,
      },
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    return c.json({ summary: {}, error: e.message }, 500);
  }
});

// === STUDENT CRUD API ===

// DELETE /api/student/:id - Delete student and all data
app.delete('/api/student/:id', async (c) => {
  const authorized = await verifyTeacherPassword(c);
  if (!authorized) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const db = c.env.DB;
    if (!db) return c.json({ ok: false, error: 'No DB' });

    const studentId = c.req.param('id');

    await db.batch([
      db.prepare('DELETE FROM analytics WHERE student_id = ?').bind(studentId),
      db.prepare('DELETE FROM highlights WHERE student_id = ?').bind(studentId),
      db.prepare('DELETE FROM notes WHERE student_id = ?').bind(studentId),
      db.prepare('DELETE FROM progress WHERE student_id = ?').bind(studentId),
      db.prepare('DELETE FROM sync_log WHERE student_id = ?').bind(studentId),
      db.prepare('DELETE FROM students WHERE id = ?').bind(studentId),
    ]);

    return c.json({ ok: true, deleted: studentId });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// GET /api/student/:id/export - Export full student data
app.get('/api/student/:id/export', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json({ error: 'No DB' });

    const studentId = c.req.param('id');

    const student = await db.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first();
    if (!student) return c.json({ error: 'Student not found' }, 404);

    const progressRows = await db.prepare('SELECT * FROM progress WHERE student_id = ?').bind(studentId).all();
    const noteRows = await db.prepare('SELECT * FROM notes WHERE student_id = ?').bind(studentId).all();
    const hlRows = await db.prepare('SELECT * FROM highlights WHERE student_id = ?').bind(studentId).all();

    const progress: Record<string, any> = {};
    for (const row of progressRows.results) {
      progress[String(row.unit_id)] = {
        checklist: JSON.parse(String(row.checklist || '[]')),
        answers: JSON.parse(String(row.answers || '{}')),
        mood: row.mood || '',
        completed: !!row.completed
      };
    }

    const notes: Record<string, string> = {};
    for (const row of noteRows.results) {
      notes[String(row.note_key)] = String(row.content || '');
    }

    const highlights: Record<string, any> = {};
    for (const row of hlRows.results) {
      highlights[String(row.highlight_id)] = JSON.parse(String(row.data || '[]'));
    }

    return c.json({
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        className: student.class_name,
        createdAt: student.created_at,
      },
      progress,
      notes,
      highlights,
      exportedAt: new Date().toISOString()
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default app
