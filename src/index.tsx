import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/api/*', cors())

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
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&family=David+Libre:wght@400;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/styles.css" rel="stylesheet">
</head>
<body>
<div id="app"></div>
<script src="/static/data.js"></script>
<script src="/static/scaffolding.js"></script>
<script src="/static/questions-data.js"></script>
<script src="/static/app.js"></script>
</body>
</html>`)
})

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ===== SYNC API (localStorage bridge - Phase 4 will add D1 database) =====
// In-memory store for the current worker instance
// Note: Cloudflare Workers are stateless; data persists only within a single request.
// For Phase 1, this prevents 404 errors. Full D1 persistence comes in Phase 4.

app.post('/api/sync', async (c) => {
  try {
    const body = await c.req.json()
    const { studentId, studentName, progress, notes } = body
    if (!studentId) {
      return c.json({ ok: false, error: 'Missing studentId' }, 400)
    }
    // Acknowledge sync - data is saved client-side in localStorage
    // Phase 4 will persist to Cloudflare D1
    return c.json({ 
      ok: true, 
      message: 'Sync acknowledged (localStorage mode)',
      studentId,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    return c.json({ ok: false, error: 'Invalid request body' }, 400)
  }
})

app.get('/api/sync/:studentId', (c) => {
  const studentId = c.req.param('studentId')
  // Phase 4 will fetch from D1. For now, report no server data.
  return c.json({ 
    found: false, 
    data: null,
    message: 'Server storage not yet available (Phase 4). Using localStorage.'
  })
})

// ===== TEACHER API =====
app.get('/api/teacher/students', (c) => {
  const password = c.req.query('password')
  // Phase 4 will validate against stored hash and return real student data
  if (password !== '1234') {
    return c.json({ error: 'Unauthorized', students: [] }, 401)
  }
  return c.json({ 
    students: [],
    message: 'Teacher dashboard active. Student sync requires Phase 4 (D1 database).',
    timestamp: new Date().toISOString()
  })
})

export default app
