import { Hono } from 'hono'

const app = new Hono()

// אנחנו משנים מ-'*' ל-'/' כדי לא לבלוע בקשות של קבצי קוד ותמונות
app.get('/', (c) => {
  return c.html(
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>אזרחות 2026 - הנגשה קוגניטיבית</title>
        
        {/* השורה הזו מזעיקה את Vite כדי שיקמפל את הקוד שלנו בזמן אמת */}
        <script type="module" src="/@vite/client"></script>
        
        {/* קריאה לקובץ הלקוח שלנו */}
        <script type="module" src="/src/client.tsx"></script>
      </head>
      <body>
        <div id="app"></div>
      </body>
    </html>
  )
})

export default app