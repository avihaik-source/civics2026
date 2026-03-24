// 1. סגירה תקינה של מחרוזת ה-Service Worker. שימוש ב-const swCode כדי לאחסן את הטקסט.
const swCode = `
  self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request).catch(()=>new Response(JSON.stringify({ok:false,offline:true,message:'אתם במצב לא מקוון'}),{headers:{'Content-Type':'application/json'}})));return}e.respondWith(caches.match(e.request).then(c=>{if(c){fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(ca=>ca.put(e.request,r))}).catch(()=>{});return c}return fetch(e.request).then(r=>{if(r.ok&&u.origin===self.location.origin){const cl=r.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,cl))}return r})}))});
`;

// 2. פונקציית הקומפוננטה (וודא שזה בתוך פונקציית ה-App או ה-Component שלך)
return (
  <header className="header-area">
    <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40">
        <rect x="80" y="20" width="15" height="15" rx="3" fill="#1E3A8A" />
        <rect x="60" y="10" width="15" height="25" rx="3" fill="#1E3A8A" />
        <path d="M40 5 h10 a3 3 0 0 1 3 3 v20 a3 3 0 0 1 -3 3 h-2 l-4 4 v-4 h-4 a3 3 0 0 1 -3 -3 v-20 a3 3 0 0 1 3 -3 z" fill="#D97706" />
        <text x="30" y="26" fontFamily="Rubik, sans-serif" fontWeight="500" fontSize="16" fill="#334155" textAnchor="end">אזרחות 2026</text>
      </svg>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <a href="/static/חוברת_מותאמת_לבגרות.html" role="button" className="outline" style={{ border: '2px solid #1E3A8A', color: '#1E3A8A', fontWeight: 'bold', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#eff6ff', textDecoration: 'none', padding: '6px 16px' }} title="מעבר למרחב תומכי הזיכרון">
        <span style={{ fontSize: '1.2em' }}>⚓</span> תומכי זיכרון
      </a>
      <div id="user-controls"></div>
    </div>
  </header>
);
