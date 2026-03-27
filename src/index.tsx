import { Hono } from 'hono'
import { renderToString } from 'hono/jsx'

// הגדרת סוגי הנתונים עבור Cloudflare Bindings
type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Bindings }>()

// --- 1. נתיב API לשמירת התקדמות (לדאשבורד) ---
app.post('/api/progress', async (c) => {
  const { studentId, unitId, score } = await c.req.json()
  
  try {
    await c.env.DB.prepare(
      'INSERT INTO student_progress (student_id, unit_id, score, timestamp) VALUES (?, ?, ?, ?)'
    ).bind(studentId, unitId, score, Date.now()).run()
    
    return c.json({ success: true })
  } catch (e) {
    return c.json({ success: false, error: 'Database Error' }, 500)
  }
})

// --- 2. נתיב API למשיכת נתונים עבור דאשבורד המורה ---
app.get('/api/dashboard', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM student_progress ORDER BY timestamp DESC LIMIT 100'
    ).all()
    return c.json(results)
  } catch (e) {
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
})

// --- 3. הגשת דף הבית (React Shell) ---
app.get('*', (c) => {
  return c.html(
    renderToString(
      <html lang="he" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>אזרחות 2026 | מערכת למידה</title>
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          <div id="app"></div>
          {/* טעינת הלקוח - Vite יטפל בזה */}
          <script type="module" src="/src/client.tsx"></script>
        </body>
      </html>
    )
  )
})

export default app