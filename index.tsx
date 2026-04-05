import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'

type Env = {
  DB: D1Database
  TEACHER_PASSWORD: string
}

const app = new Hono<{ Bindings: Env }>()

// ── Middleware ────────────────────────────────────────────────
app.use('*', cors({
  origin: ['https://civics2026.avihai-k.workers.dev', 'http://localhost:5173', 'https://civics2026.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', logger())

// ── API: Health ──────────────────────────────────────────────
app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))

// ── API: Sync & Analytics ─────────────────────────────────────
// (קיצרתי כאן את הלוגיקה של ה-Sync כדי שהקוד יהיה קריא, וודא שזה קיים אצלך)
app.get('/api/sync/:studentId', async (c) => {
  const { studentId } = c.req.param()
  const db = c.env.DB
  try {
    const [progress, notes, highlights] = await Promise.all([
      db.prepare('SELECT * FROM progress WHERE student_id = ?').bind(studentId).all(),
      db.prepare('SELECT * FROM notes WHERE student_id = ?').bind(studentId).all(),
      db.prepare('SELECT * FROM highlights WHERE student_id = ?').bind(studentId).all(),
    ])
    return c.json({ studentId, progress: progress.results, notes: notes.results, highlights: highlights.results })
  } catch (err) { return c.json({ error: 'DB Error' }, 500) }
})

// ... שאר נתיבי ה-API שלך (POST /api/sync, /api/analytics וכו') ...

// ── API: Teacher Auth ─────────────────────────────────────────
app.post('/api/teacher/auth', async (c) => {
  const body = await c.req.json()
  const password = body.password
  const TEACHER_PASSWORD = c.env.TEACHER_PASSWORD || '0512'
  if (password === TEACHER_PASSWORD) {
    return c.json({ valid: true, token: `teacher-${Date.now()}` })
  }
  return c.json({ valid: false }, 401)
})

// ── הגשת האתר (Frontend) ──────────────────────────────────────
// פקודה זו אומרת: אם זה לא API, חפש קובץ בתיקיית dist (שם נמצא ה-React)
app.get('/*', serveStatic({ root: './' }))

export default app