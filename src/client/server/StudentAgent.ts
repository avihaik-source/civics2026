import { DurableObject } from "cloudflare:workers";

export class StudentAgent extends DurableObject {
  state: DurableObjectState;
  env: any;

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // ניהול זיכרון בתוך ה-Durable Object
    let history: any[] = (await this.state.storage.get("chat_history")) || [];

    // נתיב לשיחה עם ה-AI
    if (url.pathname.includes("/chat") && request.method === "POST") {
      const { message, context } = await request.json();

      // System Prompt מבוסס מחקר אזרחות 2026
      if (history.length === 0) {
        history.push({
          role: "system",
          content: `אתה סוכן למידה חכם לאזרחות. 
          תפקידך: לעזור לתלמיד להתכונן לבגרות 34281 (שאגת הארי 2026).
          דגשים קריטיים:
          1. אכוף את מבנה צ-ה-צ-ה (ציין, הצג, צטט, הסבר).
          2. אם תלמיד נשמע לחוץ, עבור למצב הרגעה (Panic Mode Support).
          3. השתמש בשפה ברורה, מונגשת (מתאים ל-ASD) וללא משפטים ארוכים מדי.
          4. נושא השיחה כרגע: ${context?.topic || "כללי"}.`
        });
      }

      history.push({ role: "user", content: message });

      // הפעלת מודל ה-AI של Cloudflare
      const aiResponse = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages: history.slice(-10), // שומר על הקשר של 10 הודעות אחרונות
      });

      const answer = aiResponse.response;
      history.push({ role: "assistant", content: answer });

      // שמירת ההיסטוריה לביקור הבא של התלמיד
      await this.state.storage.put("chat_history", history);

      return Response.json({ response: answer });
    }

    // נתיב ל-Panic Mode (איפוס מהיר והרגעה)
    if (url.pathname.includes("/panic")) {
      await this.state.storage.delete("chat_history");
      return Response.json({ 
        response: "הכל בסדר. נשמנו עמוק, איפסנו את השיחה ואנחנו מתחילים מחדש בנחת." 
      });
    }

    return new Response("Not Found", { status: 404 });
  }
}