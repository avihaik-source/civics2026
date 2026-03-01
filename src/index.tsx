import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/api/*', cors())

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>הכנה לבגרות באזרחות 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            'hebrew': ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    * { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
    body { background: #f0f4f8; }
    .glass { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); }
    .question-text { white-space: pre-wrap; line-height: 1.9; }
    .highlight { background: linear-gradient(120deg, #ffeaa7 0%, #fdcb6e 100%); padding: 2px 6px; border-radius: 4px; }
    .exam-tab.active { background: #3b82f6; color: white; }
    .exam-tab:not(.active) { background: #e2e8f0; color: #475569; }
    .unit-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .unit-card { transition: all 0.2s ease; }
    .progress-ring { transition: stroke-dashoffset 0.5s ease; }
    .fade-in { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .scaffolding-level { border-right: 4px solid; padding-right: 16px; margin-bottom: 12px; }
    .level-1 { border-color: #22c55e; background: #f0fdf4; }
    .level-2 { border-color: #f59e0b; background: #fffbeb; }
    .level-3 { border-color: #ef4444; background: #fef2f2; }
    .nav-item.active { background: #3b82f6; color: white; }
    .nav-item:not(.active) { color: #64748b; }
    .nav-item:not(.active):hover { background: #e2e8f0; }
    .sticky-header { position: sticky; top: 0; z-index: 40; }
    .question-card { border-right: 4px solid #3b82f6; }
    .question-card:hover { border-right-color: #1d4ed8; }
    .search-highlight { background: #fde047; padding: 1px 3px; border-radius: 2px; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #64748b; }
    .tooltip { position: relative; }
    .tooltip:hover::after { content: attr(data-tip); position: absolute; bottom: 100%; right: 50%; transform: translateX(50%); background: #1e293b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; z-index: 50; }
    @media print {
      .no-print { display: none !important; }
      .question-text { font-size: 14px; line-height: 2; }
    }
  </style>
</head>
<body class="min-h-screen">
  <div id="app"></div>
  <script src="/static/questions-data.js"></script>
  <script src="/static/data.js"></script>
  <script src="/static/app.js"></script>
</body>
</html>`)
})

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
