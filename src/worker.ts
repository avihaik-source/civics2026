const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: any) {
    // 1. טיפול באבטחת דפדפן (CORS) - השומר בכניסה
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 2. נתיב לדיווח למורה
    if (url.pathname === "/api/report" && request.method === "POST") {
      try {
        // קריאת הנתונים שהתלמיד שלח מהאתר
        const data = await request.json();
        console.log("🎉 התקבל דיווח חדש מתלמיד!", data);
        
        // ==========================================
        // קסם מסד הנתונים: שמירת הדיווח בטבלת reports
        // ==========================================
        await env.DB.prepare(
          "INSERT INTO reports (data) VALUES (?)"
        ).bind(JSON.stringify(data)).run();
        
        console.log("✅ הדיווח נשמר בהצלחה במסד הנתונים!");

        return new Response(JSON.stringify({ success: true, message: "הדיווח נשמר במסד הנתונים!" }), {
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
        
      } catch (error) {
        console.error("❌ שגיאה בשמירה למסד הנתונים:", error);
        return new Response(JSON.stringify({ success: false, message: "שגיאה פנימית בשמירת הדיווח." }), {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
    }

    // 3. אם זו לא פנייה ל-API, תגיש את האתר (אם קיים) או תחזיר שגיאה
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404, headers: corsHeaders });
  },
};