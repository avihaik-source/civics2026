import { Hono } from 'hono'
import { cors } from 'hono/cors'

// הגדרת הטיפוסים לחיבורי הענן
export type Env = {
  DB: D1Database
  AI: any
  STUDENT_AGENT: DurableObjectNamespace
  ASSETS: { fetch: typeof fetch }
}

const app = new Hono<{ Bindings: Env }>()

// אבטחה וגישה
app.use('/api/*', cors())

// --- נתיבי API (הממשק מול מסד הנתונים) ---

// שליפת מושגי "שאגת הארי" מהמסד
app.get('/api/concepts', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM concepts").all();
    return c.json({ success: true, data: results });
  } catch (e) {
    return c.json({ success: false, error: "שגיאה בשליפת מושגים" }, 500);
  }
});

// שליפת דוחות התקדמות
app.get('/api/reports', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM reports ORDER BY created_at DESC").all();
    return c.json({ success: true, data: results });
  } catch (e) {
    return c.json({ success: false, error: "שגיאה בשליפת דוחות" }, 500);
  }
});

// ==========================================
// 🤖 נתיב התרגול עם סוכן ה-AI ("ארי")
// ==========================================
app.get('/api/practice/:term', async (c) => {
  const term = decodeURIComponent(c.req.param('term'));

  try {
    // 1. שליפת המידע המדויק מתוך ה-D1
    const dbResult = await c.env.DB.prepare(
      "SELECT definition_official, memory_concrete_asd FROM concepts WHERE term LIKE ?"
    ).bind(`%${term}%`).first();

    if (!dbResult) {
      return c.json({ success: false, error: "המושג לא נמצא במאגר המיקוד שלנו." }, 404);
    }

    // 2. בניית הפרומפט המונגש לסוכן
    const systemPrompt = `
    אתה "ארי", סוכן בינה מלאכותית ומורה פרטי לאזרחות. המומחיות שלך היא ללמד תלמידים על הרצף האוטיסטי (ASD) לקראת בגרות 2026.
    
    המידע שעומד לרשותך (חובה להתבסס רק עליו):
    - מושג: ${term}
    - הגדרה רשמית: ${dbResult.definition_official}
    - משפט זיכרון מונגש: ${dbResult.memory_concrete_asd}
    
    כללי התנהגות:
    1. דבר בשפה קונקרטית, ברורה וישירה. ללא מטאפורות או סלנג.
    2. שאל את התלמיד שאלה אחת קצרה ופשוטה כדי לבדוק אם הוא זוכר או מבין את המושג.
    3. אל תציף במידע ואל תוסיף עובדות שלא מופיעות בהגדרה לעיל.
    `;

    // 3. הפעלת מודל ה-AI של Cloudflare
    const aiResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "היי ארי, אני רוצה לתרגל את המושג הזה. שאל אותי עליו שאלה קצרה." }
      ]
    });

    return c.json({ 
      success: true, 
      concept: term,
      ai_message: aiResponse.response 
    });

  } catch (error) {
    console.error("AI Error:", error);
    return c.json({ success: false, error: "שגיאה פנימית בהפעלת הסוכן" }, 500);
  }
});

// --- ניתוב לסוכן האישי (המוח של המערכת) ---
// כל פנייה ל-chat עוברת לסוכן הייעודי של אותו תלמיד
app.all('/api/chat/:studentId/*', async (c) => {
  const studentId = c.req.param('studentId');
  const id = c.env.STUDENT_AGENT.idFromName(studentId);
  const agentStub = c.env.STUDENT_AGENT.get(id);
  
  return agentStub.fetch(c.req.raw);
});

// --- הגשת ה-Frontend (React) ---
app.get('/*', async (c) => {
  if (c.env.ASSETS) {
    return await c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text("Production assets not found", 404);
});

export default app;

// ייצוא הסוכן - חובה כדי ש-Cloudflare יזהה אותו
export { StudentAgent } from './StudentAgent';
export type AppType = typeof app;