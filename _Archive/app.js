/**
 * Civics 2026 Core Engine
 * Focus: Performance, Accessibility, and Predictability
 */

const AppState = {
    allConcepts:,
    filteredConcepts:,
    currentUnit: 'all',
    searchTerm: ''
};

// אתחול המערכת
async function initApp() {
    try {
        const response = await fetch('memory-sentences-112-concepts.json');
        const data = await response.json();
        AppState.allConcepts = data.concepts;
        AppState.filteredConcepts =;
        
        setupEventListeners();
        renderConcepts();
    } catch (error) {
        console.error("Failed to load concepts:", error);
        document.getElementById('concepts-list').innerHTML = 
            `<div class="error">שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.</div>`;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('concept-search');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // חיפוש עם Throttling דרך rAF
    let searchTicking = false;
    searchInput.addEventListener('input', (e) => {
        AppState.searchTerm = e.target.value.toLowerCase();
        if (!searchTicking) {
            window.requestAnimationFrame(() => {
                filterAndRender();
                searchTicking = false;
            });
            searchTicking = true;
        }
    });

    // סינון יחידות
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentUnit = btn.dataset.unit;
            filterAndRender();
        });
    });
}

function filterAndRender() {
    AppState.filteredConcepts = AppState.allConcepts.filter(concept => {
        const matchesUnit = AppState.currentUnit === 'all' |

| 
                           concept.unitId.toString() === AppState.currentUnit;
        const matchesSearch = concept.conceptName.toLowerCase().includes(AppState.searchTerm) ||
                             concept.definition.toLowerCase().includes(AppState.searchTerm);
        return matchesUnit && matchesSearch;
    });
    
    renderConcepts();
}

function renderConcepts() {
    const listContainer = document.getElementById('concepts-list');
    
    // שימוש ב-DocumentFragment לביצועים אופטימליים
    const fragment = document.createDocumentFragment();
    
    if (AppState.filteredConcepts.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'לא נמצאו מושגים תואמים.';
        fragment.appendChild(noResults);
    } else {
        AppState.filteredConcepts.forEach(concept => {
            const card = document.createElement('article');
            card.className = 'concept-card';
            card.innerHTML = `
                <h3>${concept.conceptName}</h3>
                <p><strong>הגדרה:</strong> ${concept.definition}</p>
                <p><strong>הסבר:</strong> ${concept.explanation}</p>
                <p><strong>דוגמה:</strong> ${concept.example}</p>
                <span class="concept-source">מקור: ${concept.source}</span>
            `;
            fragment.appendChild(card);
        });
    }

    // עדכון ה-DOM בפריים הבא
    window.requestAnimationFrame(() => {
        listContainer.innerHTML = '';
        listContainer.appendChild(fragment);
    });
}

document.addEventListener('DOMContentLoaded', initApp);