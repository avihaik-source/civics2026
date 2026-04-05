// 1. ניהול המדינה (State) - תיקון: הוספתי ערכי ברירת מחדל []
const State = {
    allConcepts: [],
    filteredConcepts: [],
    searchTerm: '',
    isTicking: false
};

// 2. פונקציית אתחול - טעינת הנתונים מה-JSON
async function init() {
    try {
        // וודא שהקובץ הזה קיים בתיקיית static שלך!
        const response = await fetch('/static/memory-sentences-112-concepts.json');
        const data = await response.json();
        
        // הפיכת המבנה ההיררכי למערך שטוח ונוח לחיפוש
        State.allConcepts = data.units.flatMap(unit => 
            unit.concepts.map(c => ({...c, unitName: unit.unitName}))
        );
        State.filteredConcepts = State.allConcepts;
        
        render(); // רינדור ראשוני
    } catch (err) {
        console.error("שגיאה בטעינת המושגים:", err);
    }
}

// 3. מאזין לחיפוש - אופטימיזציה עם requestAnimationFrame
const searchInput = document.getElementById('concept-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        State.searchTerm = e.target.value.toLowerCase();
        
        // סינון המושגים לפי שם המושג או ההגדרה
        State.filteredConcepts = State.allConcepts.filter(c => 
            c.conceptName.toLowerCase().includes(State.searchTerm) ||
            c.definition.toLowerCase().includes(State.searchTerm)
        );
        
        // מנגנון ה-Zero-Jank: מרנדר רק כשמסך מתרענן
        if (!State.isTicking) {
            State.isTicking = true;
            requestAnimationFrame(() => {
                render();
                State.isTicking = false;
            });
        }
    });
}

// 4. פונקציית הרינדור - שימוש ב-DocumentFragment לביצועים מקסימליים
function render() {
    const listContainer = document.getElementById('concepts-list');
    if (!listContainer) return;

    const fragment = document.createDocumentFragment();
    
    State.filteredConcepts.forEach(concept => {
        const card = document.createElement('article');
        card.className = 'card concept-card'; // משתמש ב-CSS של ה-Design System שלנו
        card.style.marginBottom = '16px';
        
        card.innerHTML = `
            <h2 style="color: var(--brushed-gold); margin-top:0;">${concept.conceptName}</h2>
            <p><strong>הגדרה:</strong> ${concept.definition}</p>
            <p><strong>הסבר:</strong> ${concept.explanation}</p>
            <p><em>דוגמה:</em> ${concept.example}</p>
            <footer style="margin-top:12px; opacity:0.6; font-size:0.8em;">
                מקור: ${concept.source} | יחידה: ${concept.unitName}
            </footer>
        `;
        fragment.appendChild(card);
    });
    
    listContainer.innerHTML = '';
    listContainer.appendChild(fragment);
}

// הפעלת המערכת
init();