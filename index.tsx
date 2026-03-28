import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

type Env = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

// ── Middleware ────────────────────────────────────────────────
app.use('*', cors({
  origin: ['https://civics2026.pages.dev', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', logger())

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    service: 'civics2026-api',
  })
})

// ── Sync: GET student data ────────────────────────────────────
app.get('/api/sync/:studentId', async (c) => {
  const { studentId } = c.req.param()
  if (!studentId) return c.json({ error: 'studentId required' }, 400)

  const db = c.env.DB

  try {
    const [progress, notes, highlights] = await Promise.all([
      db.prepare('SELECT * FROM progress WHERE student_id = ?').bind(studentId).all(),
      db.prepare('SELECT * FROM notes WHERE student_id = ?').bind(studentId).all(),
      db.prepare('SELECT * FROM highlights WHERE student_id = ?').bind(studentId).all(),
    ])

    return c.json({
      studentId,
      progress: progress.results,
      notes: notes.results,
      highlights: highlights.results,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('GET /api/sync error:', err)
    return c.json({ error: 'Database error', details: String(err) }, 500)
  }
})

// ── Sync: POST (save student data) ───────────────────────────
app.post('/api/sync', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { studentId, progress, notes, highlights } = body
  if (!studentId) return c.json({ error: 'studentId required' }, 400)

  const db = c.env.DB
  const now = new Date().toISOString()

  try {
    // Upsert student record
    await db.prepare(
      'INSERT OR IGNORE INTO students (id, created_at) VALUES (?, ?)'
    ).bind(studentId, now).run()

    // Save progress items
    if (Array.isArray(progress)) {
      for (const item of progress) {
        await db.prepare(`
          INSERT INTO progress (student_id, unit_id, questions_done, score, feedback_easy, feedback_medium, feedback_hard, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(student_id, unit_id) DO UPDATE SET
            questions_done  = excluded.questions_done,
            score           = excluded.score,
            feedback_easy   = excluded.feedback_easy,
            feedback_medium = excluded.feedback_medium,
            feedback_hard   = excluded.feedback_hard,
            updated_at      = excluded.updated_at
        `).bind(
          studentId,
          item.unitId,
          item.questionsDone ?? 0,
          item.score ?? 0,
          item.feedbackEasy ?? 0,
          item.feedbackMedium ?? 0,
          item.feedbackHard ?? 0,
          now
        ).run()
      }
    }

    // Save notes
    if (Array.isArray(notes)) {
      for (const note of notes) {
        await db.prepare(`
          INSERT INTO notes (student_id, question_id, content, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(student_id, question_id) DO UPDATE SET
            content    = excluded.content,
            updated_at = excluded.updated_at
        `).bind(studentId, note.questionId, note.content ?? '', now).run()
      }
    }

    // Save highlights
    if (Array.isArray(highlights)) {
      for (const h of highlights) {
        await db.prepare(`
          INSERT INTO highlights (student_id, question_id, selection, color, created_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(student_id, question_id) DO UPDATE SET
            selection  = excluded.selection,
            color      = excluded.color
        `).bind(studentId, h.questionId, h.selection ?? '', h.color ?? '#FFE066', now).run()
      }
    }

    // Write sync log
    await db.prepare(
      'INSERT INTO sync_log (student_id, action, created_at) VALUES (?, ?, ?)'
    ).bind(studentId, 'sync', now).run()

    return c.json({ success: true, synced: now })
  } catch (err) {
    console.error('POST /api/sync error:', err)
    return c.json({ error: String(err) }, 500)
  }
})

// ── Analytics ─────────────────────────────────────────────────
app.post('/api/analytics', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ ok: false }, 400)
  }

  const { studentId, event, data } = body
  const db = c.env.DB

  try {
    await db.prepare(
      'INSERT INTO analytics (student_id, event, data, created_at) VALUES (?, ?, ?, ?)'
    ).bind(
      studentId ?? 'anonymous',
      event ?? 'unknown',
      JSON.stringify(data ?? {}),
      new Date().toISOString()
    ).run()
    return c.json({ ok: true })
  } catch {
    // Analytics must never break the app
    return c.json({ ok: false }, 500)
  }
})

// ── Teacher: Auth ─────────────────────────────────────────────
app.post('/api/teacher/auth', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ valid: false, error: 'Invalid body' }, 400)
  }

  const { password } = body
  // TODO: Store hashed password in Cloudflare environment variable (TEACHER_PASS_HASH)
  // For now using hardcoded value – replace before production
  const TEACHER_PASSWORD = '1234'

  if (password === TEACHER_PASSWORD) {
    return c.json({
      valid: true,
      token: `teacher-${Date.now()}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
    })
  }
  return c.json({ valid: false }, 401)
})

// ── Teacher: Student list ─────────────────────────────────────
app.get('/api/teacher/students', async (c) => {
  const db = c.env.DB
  try {
    const result = await db.prepare(`
      SELECT
        s.id,
        s.created_at,
        COUNT(DISTINCT p.unit_id)                          AS units_done,
        ROUND(AVG(p.score), 1)                             AS avg_score,
        SUM(p.questions_done)                              AS total_questions,
        SUM(p.feedback_easy)                               AS total_easy,
        SUM(p.feedback_medium)                             AS total_medium,
        SUM(p.feedback_hard)                               AS total_hard,
        MAX(p.updated_at)                                  AS last_activity
      FROM students s
      LEFT JOIN progress p ON p.student_id = s.id
      GROUP BY s.id
      ORDER BY last_activity DESC
    `).all()

    return c.json({ students: result.results, total: result.results.length })
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

// ── Teacher: Single student detail ───────────────────────────
app.get('/api/teacher/students/:studentId', async (c) => {
  const { studentId } = c.req.param()
  const db = c.env.DB

  try {
    const [progressResult, notesResult] = await Promise.all([
      db.prepare('SELECT * FROM progress WHERE student_id = ? ORDER BY unit_id').bind(studentId).all(),
      db.prepare('SELECT * FROM notes WHERE student_id = ?').bind(studentId).all(),
    ])

    return c.json({
      studentId,
      progress: progressResult.results,
      notes: notesResult.results,
    })
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

// ── Catch-all 404 ─────────────────────────────────────────────
app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404)
})

export default app
