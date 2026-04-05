// ניהול נתוני המושגים והמדינה - תיקון סינטקס
const State = {
    allConcepts: [],
    filteredConcepts: [],
    searchTerm: '',
    isTicking: false
};

// פונקציית אתחול - טעינת הנתונים
async function init() {
    try {
        // וודא שהקובץ הזה קיים בנתיב הנכון
        const response = await fetch('/static/memory-sentences-112-concepts.json');
        const data = await response.json();
        
        // שיטוח הנתונים ליחידה אחת נוחה לעבודה
        State.allConcepts = data.units.flatMap(unit => 
            unit.concepts.map(c => ({...c, unitName: unit.unitName}))
        );
        State.filteredConcepts = State.allConcepts;
        render();
    } catch (err) {
        console.error("שגיאה בטעינת המושגים:", err);
    }
}

// מאזין לחיפוש עם אופטימיזציה (Throttle)
const searchInput = document.getElementById('concept-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        State.searchTerm = e.target.value.toLowerCase();
        
        // סינון הלוגיקה
        State.filteredConcepts = State.allConcepts.filter(c => 
            c.conceptName.toLowerCase().includes(State.searchTerm) ||
            c.definition.toLowerCase().includes(State.searchTerm)
        );
        
        // Zero-Jank Render
        if (!State.isTicking) {
            State.isTicking = true;
            requestAnimationFrame(() => {
                render();
                State.isTicking = false;
            });
        }
    });
}

// פונקציית הרינדור - מותאמת ל-Design System
function render() {
    const listContainer = document.getElementById('concepts-list');
    if (!listContainer) return;

    const fragment = document.createDocumentFragment();
    
    State.filteredConcepts.forEach(concept => {
        const card = document.createElement('article');
        // שימוש ב-Classes של המערכת שלנו
        card.className = 'card concept-card'; 
        card.style.marginBottom = '20px';
        card.style.padding = '24px';

        card.innerHTML = `
            <h2 style="color: var(--brushed-gold); margin-top:0; font-size: 1.5rem;">${concept.conceptName}</h2>
            <div style="border-right: 2px solid var(--brushed-gold); padding-right: 15px; margin: 15px 0;">
                <p><strong style="color: var(--brushed-gold);">הגדרה:</strong> ${concept.definition}</p>
                <p><strong>הסבר:</strong> ${concept.explanation}</p>
            </div>
            <p style="font-style: italic; opacity: 0.8;"><strong>דוגמה:</strong> ${concept.example}</p>
            <footer style="margin-top: 20px; border-top: 1px solid rgba(224,224,224,0.1); padding-top: 10px;">
                <small style="color: var(--brushed-gold); opacity: 0.7;">
                    מקור: ${concept.source} | יחידה: ${concept.unitName}
                </small>
            </footer>
        `;
        fragment.appendChild(card);
    });
    
    listContainer.innerHTML = '';
    if (State.filteredConcepts.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.5;">לא נמצאו מושגים תואמים...</div>';
    } else {
        listContainer.appendChild(fragment);
    }
}

// הפעלה
init();