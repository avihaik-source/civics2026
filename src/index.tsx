import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('/api/*', cors())

// === MAIN ROUTE ===
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>) (עדכון)אזרחות 2026 | המרכז ללמידה מונגשת</title>
    <link href="https://fonts.googleapis.com/css2?family=Alef:wght@400;700&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --deep-coal: #1A1C1E;
            --surface-dark: #232528;
            --brushed-gold: #C5A059;
            --off-white: #E0E0E0;
            --radius-main: 12px;
            --motion-smooth: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            --border-red: rgba(239, 68, 68, 0.5);
            --hint-green: rgba(16, 185, 129, 0.15);
            --border-green: rgba(16, 185, 129, 0.5);
        }

        body { 
            background-color: var(--deep-coal); 
            color: var(--off-white); 
            font-family: 'Alef', sans-serif; 
            margin: 0; padding: 0; 
            overflow-x: hidden; scroll-behavior: smooth;
        }

        /* --- Layout & Spine --- */
        .header-area { 
            padding: 20px 40px; background: rgba(26, 28, 30, 0.9); 
            backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100;
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }

        .layout-wrapper {
            display: grid; grid-template-columns: 80px 1fr;
            max-width: 1100px; margin: 40px auto; gap: 40px; padding: 0 20px;
        }

        .golden-spine { position: relative; }
        .spine-track { position: absolute; right: 39px; top: 0; bottom: 0; width: 2px; background: rgba(224, 224, 224, 0.1); }
        .spine-progress { position: absolute; right: 39px; top: 0; width: 2px; background: var(--brushed-gold); transition: height 300ms ease-out; }
        .spine-nodes { 
            list-style: none; padding: 0; margin: 0; position: sticky; top: 120px; 
            display: flex; flex-direction: column; gap: 60px; z-index: 3;
        }
        .spine-node {
            width: 32px; height: 32px; border-radius: 50%; background: var(--deep-coal);
            border: 2px solid rgba(224, 224, 224, 0.2); display: flex; align-items: center;
            justify-content: center; transition: var(--motion-smooth); cursor: pointer;
            position: relative; font-weight: bold; color: rgba(224,224,224,0.4);
        }
        .spine-node.active { border-color: var(--brushed-gold); color: var(--brushed-gold); box-shadow: 0 0 15px rgba(197, 160, 89, 0.3); }

        /* --- Cards & UI Elements --- */
        .card {
            background: var(--surface-dark); border-radius: var(--radius-main);
            padding: 30px; margin-bottom: 30px; border: 1px solid rgba(197, 160, 89, 0.05);
            transition: var(--motion-smooth);
        }
        .card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }

        .search-input {
            width: 100%; padding: 15px; background: var(--deep-coal);
            border: 1px solid rgba(197, 160, 89, 0.3); border-radius: var(--radius-main);
            color: white; font-size: 1.1rem; outline: none; transition: var(--motion-smooth);
        }
        .search-input:focus { border-color: var(--brushed-gold); box-shadow: 0 0 10px rgba(197,160,89,0.2); }

        .action-btn {
            background: transparent; color: var(--brushed-gold); border: 1px solid var(--brushed-gold);
            padding: 12px 24px; border-radius: var(--radius-main); cursor: pointer;
            font-family: 'Rubik', sans-serif; transition: var(--motion-smooth);
        }
        .action-btn:hover { background: rgba(197, 160, 89, 0.1); }

        /* --- Scaffolding & Quiz --- */
        .scaffold-box {
            max-height: 0; opacity: 0; overflow: hidden;
            transition: max-height 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease;
            background: rgba(197, 160, 89, 0.05); border-right: 3px solid var(--brushed-gold);
        }
        .scaffold-box.open { max-height: 200px; opacity: 1; padding: 15px; margin-top: 10px; }

        @media (max-width: 768px) { .layout-wrapper { grid-template-columns: 1fr; } .golden-spine { display: none; } }
    </style>
</head>
<body>

<header class="header-area">
    <div style="font-family: 'Rubik'; font-weight: bold; color: var(--brushed-gold); font-size: 1.5rem;">אזרחות 2026</div>
    <div id="status-badge" style="font-size: 0.8rem; opacity: 0.6;">מצב ארכיטקט פעיל</div>
</header>

<div class="layout-wrapper">
    <aside class="golden-spine">
        <div class="spine-track"></div>
        <div class="spine-progress" id="spine-progress"></div>
        <ul class="spine-nodes">
            <li class="spine-node active" data-target="sec-search">1</li>
            <li class="spine-node" data-target="sec-nano">2</li>
            <li class="spine-node" data-target="sec-quiz">3</li>
        </ul>
    </aside>

    <main>
        <section id="sec-search" class="card">
            <h2 style="color: var(--brushed-gold);">חיפוש מושגים חכם</h2>
            <input type="text" id="concept-search" class="search-input" placeholder="הקלד מושג (למשל: אפליה, שוויון)...">
            <div id="concepts-list" style="margin-top: 20px;"></div>
        </section>

        <section id="sec-nano" class="card">
            <h2 style="color: var(--brushed-gold);">זירת הניתוח: ננו-בננה</h2>
            <p>כאן תוכל להשוות בין מושגים דומים כדי למנוע בלבול.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="card" style="background: rgba(224,224,224,0.02);">הבחנה מותרת</div>
                <div class="card" style="background: rgba(224,224,224,0.02);">אפליה פסולה</div>
            </div>
        </section>

        <section id="sec-quiz" class="card">
            <h2 style="color: var(--brushed-gold);">תרגול אינטראקטיבי</h2>
            <div id="quiz-app"></div>
        </section>
    </main>
</div>

<script>
    // === DATA ===
    const memorySentences = {
        "dist_01": "זוכר? אפליה פסולה היא יחס שונה מסיבה לא עניינית (דעה קדומה).",
        "dist_02": "עוגן: הבחנה מותרת מתקיימת רק כשיש שוני רלוונטי לנושא.",
        "dist_03": "טיפ: העדפה מתקנת היא זמנית ונועדה לצמצם פערים חברתיים."
    };

    const conceptsData = [
        { name: "אפליה פסולה", def: "יחס שונה לבני אדם ללא סיבה מוצדקת.", unit: "ערכי יסוד" },
        { name: "הבחנה מותרת", def: "יחס שונה כאשר השוני רלוונטי לעניין.", unit: "ערכי יסוד" },
        { name: "העדפה מתקנת", def: "הטבה זמנית לקבוצה שקופחה בעבר.", unit: "ערכי יסוד" }
    ];

    const quizQuestions = [
        {
            q: "חברה מסרבת לקבל לעבודה נשים כי 'זה לא מתאים לאופי המשרד'. מה זה?",
            options: [
                { text: "הבחנה מותרת", isCorrect: false, hintId: "dist_02" },
                { text: "אפליה פסולה", isCorrect: true, feedback: "נכון! זו סיבה לא עניינית." },
                { text: "העדפה מתקנת", isCorrect: false, hintId: "dist_03" }
            ]
        }
    ];

    // === SEARCH LOGIC (Zero-Jank) ===
    const state = { searchTerm: '', ticking: false };
    const searchInput = document.getElementById('concept-search');
    const listContainer = document.getElementById('concepts-list');

    function renderSearch() {
        const fragment = document.createDocumentFragment();
        const filtered = conceptsData.filter(c => c.name.includes(state.searchTerm));
        
        filtered.forEach(c => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.padding = '15px';
            div.innerHTML = '<strong>' + c.name + ':</strong> ' + c.def;
            fragment.appendChild(div);
        });
        listContainer.innerHTML = '';
        listContainer.appendChild(fragment);
    }

    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        if (!state.ticking) {
            requestAnimationFrame(() => {
                renderSearch();
                state.ticking = false;
            });
            state.ticking = true;
        }
    });
async function loadConcepts() {
    try {
        // משיכת הקובץ מהשרת
        const response = await fetch('/memory-sentences-112-concepts.json')
        const data = await response.json();
        
        // שיטוח המבנה (Flattening) לעבודה מהירה בחיפוש
        const allConcepts = data.units.flatMap(unit => 
            unit.concepts.map(c => ({...c, unitName: unit.unitName}))
        );
        
        // עדכון ה-UI
        window.fullConceptsList = allConcepts; // שמירה גלובלית לצורכי חיפוש
        renderSearch(allConcepts); 
    } catch (err) {
        console.error("שגיאה בטעינת מאגר המושגים:", err);
    }
}

// קריאה לפונקציה מיד עם טעינת הדף
document.addEventListener('DOMContentLoaded', loadConcepts);
    // === QUIZ LOGIC (Scaffolding) ===
    function renderQuiz() {
        const quizContainer = document.getElementById('quiz-app');
        const q = quizQuestions[0];
        
        quizContainer.innerHTML = \`
            <p style="font-size: 1.2rem; margin-bottom: 20px;">\${q.q}</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                \${q.options.map((opt, i) => \`
                    <div>
                        <button class="action-btn" style="width:100%; text-align:right;" 
                                onclick="handleAnswer(this, \${opt.isCorrect}, '\${opt.hintId || ''}', '\${opt.feedback || ''}')">
                            \${opt.text}
                        </button>
                        <div class="scaffold-box"></div>
                    </div>
                \`).join('')}
            </div>
        \`;
    }

    window.handleAnswer = (btn, isCorrect, hintId, feedback) => {
        const box = btn.nextElementSibling;
        if (isCorrect) {
            btn.style.borderColor = 'var(--border-green)';
            box.innerHTML = feedback;
            box.classList.add('open');
        } else {
            btn.style.borderColor = 'var(--border-red)';
            box.innerHTML = memorySentences[hintId];
            box.classList.add('open');
        }
    };

    // === SPINE LOGIC ===
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const nodes = document.querySelectorAll('.spine-node');
        const progress = document.getElementById('spine-progress');
        
        let activeIdx = 0;
        sections.forEach((sec, idx) => {
            const rect = sec.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) activeIdx = idx;
        });

        nodes.forEach((n, i) => {
            n.classList.toggle('active', i === activeIdx);
        });
        progress.style.height = (activeIdx * 90) + 'px';
    });

    // Start
    renderSearch();
    renderQuiz();
</script>

</body>
</html>`)
})

export default app