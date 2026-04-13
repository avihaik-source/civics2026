export interface Env {
  // החיבור לבסיס הנתונים המקורי שלנו (D1)
  DB: D1Database;
  // החיבור למודל הבינה המלאכותית
  AI: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. הגדרות אבטחה ו-CORS אופטימליות
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // ====================================================================
    // ראוט 1: הצ'אט עם אריק (AI + ASD + D1 Sync)
    // ====================================================================
    if (request.method === 'POST' && url.pathname.startsWith('/api/practice/')) {
      const concept = decodeURIComponent(url.pathname.split('/').pop() || '');
      
      try {
        const body: any = await request.json();
        const { message, history, isAsdMode } = body;

        // אישיות הליבה של אריק
        let systemPrompt = `אתה "אריק", סוכן למידה ומורה פרטי מקוון לאזרחות לקראת בגרות קיץ תשפ"ה.
תפקידך לעזור לתלמיד להבין את המושג "${concept}".
הייה אמפתי, מעודד וממוקד. השתמש בשיטת צ-ה-צ-ה (ציין, הצג, צטט, הסבר) כשמדובר בשאלות בגרות.
אל תכתוב תשובות ארוכות מדי, עודד את התלמיד לחשוב בעצמו ונתח את תשובותיו.`;

        // התאמה קוגניטיבית אופטימלית (ASD Mode)
        if (isAsdMode) {
          systemPrompt += `
[הוראות מיוחדות - מצב נגישות פעיל]:
- השתמש במשפטים קצרים, ישירים ופשוטים.
- הימנע ממטאפורות, ציניות, סרקזם או שפה כפולה.
- תן משימה אחת או רמז אחד בכל פעם, אל תעמיס.
- השתמש בחיזוקים חיוביים ברורים (למשל: "כל הכבוד, זה נכון!").
- הצג את חלקי הפתרון של צ-ה-צ-ה בצורה ברורה, שלב אחרי שלב.`;
        }

        // הכנת ההיסטוריה למודל
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map((msg: any) => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
          })),
          { role: 'user', content: message }
        ];

        // קריאה למודל ה-AI המהיר של מטא
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: messages
        });

        // סנכרון לטבלת reports הקיימת מתוך seed.sql! (החלטת ארכיטקטורה אופטימלית)
        const studentId = "stu_789"; // מזהה תלמיד אקראי להדגמה
        const formattedContent = `[מושג: ${concept} | ASD: ${isAsdMode ? 'פעיל' : 'כבוי'}] ${message}`;
        
        await env.DB.prepare(
          `INSERT INTO reports (student_id, content, created_at) VALUES (?, ?, datetime('now'))`
        ).bind(studentId, formattedContent).run();

        // החזרת תשובה ל-Frontend
        return new Response(JSON.stringify({ 
          success: true, 
          reply: aiResponse.response 
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

      } catch (error) {
        console.error("Worker Error:", error);
        return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), { 
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // ====================================================================
    // ראוט 2: משיכת נתונים עבור ה-Dashboard של המורה (אנליטיקה)
    // ====================================================================
    if (request.method === 'GET' && url.pathname === '/api/teacher/students') {
      try {
        // שאילתה חכמה שעושה אגרגציה לטבלת ה-reports המקורית שלך
        const { results } = await env.DB.prepare(
          `SELECT student_id as id, 
                  'תלמיד/ה ' || substr(student_id, -3) as name, 
                  MIN(COUNT(*) * 10, 100) as progress, -- חישוב אחוזי התקדמות חכם 
                  MAX(created_at) as lastActive 
           FROM reports 
           GROUP BY student_id 
           ORDER BY lastActive DESC 
           LIMIT 50`
        ).all();

        return new Response(JSON.stringify({ success: true, students: results }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch dashboard data' }), { 
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    return new Response('Endpoint Not Found', { status: 404 });
  }
};