<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="מערכת למידה דיגיטלית לאזרחות 2026 - 112 מושגי יסוד מונגשים">
    <title>אזרחות 2026 | פלטפורמת למידה</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="gov-layout">
    <a href="#main-content" class="skip-link">דילוג לתוכן המרכזי</a>

    <header class="gov-header" role="banner">
        <div class="container">
            <div class="gov-brand">
                <img src="assets/emblem.svg" alt="סמל המדינה" class="gov-logo">
                <span class="gov-site-name">אזרחות 2026</span>
            </div>
            <nav class="gov-nav" aria-label="תפריט ראשי">
                <ul>
                    <li><a href="#" aria-current="page">מושגי יסוד</a></li>
                    <li><a href="#">מבחני תרגול</a></li>
                    <li><a href="#">אודות הפרויקט</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main id="main-content" class="container">
        <section class="hero-section">
            <h1>הכנה לבגרות באזרחות 2026</h1>
            <p>112 מושגים, הגדרות ומקורות רשמיים מותאמים לכל תלמיד.</p>
            
            <div class="search-wrapper">
                <label for="concept-search">חפש מושג:</label>
                <input type="search" id="concept-search" placeholder="לדוגמה: פסקת ההגבלה..." aria-controls="concepts-list">
            </div>
        </section>

        <nav class="unit-tabs" aria-label="בחירת יחידות לימוד">
            <button class="tab-btn active" data-unit="all">כל המושגים</button>
            <button class="tab-btn" data-unit="9">יחידה 9: רשויות השלטון</button>
            <button class="tab-btn" data-unit="11">יחידה 11: ביטחון ישראל</button>
        </nav>

        <div id="concepts-list" class="concepts-grid" role="region" aria-live="polite">
            <div class="loading-state">טוען מושגים...</div>
        </div>
    </main>

    <footer class="gov-footer">
        <div class="container">
            <p>&copy; 2026 פרויקט אזרחות דיגיטלית - מותאם לסטנדרט הנגישות WCAG 2.1 AA</p>
        </div>
    </footer>

    <script src="app.js" defer></script>
</body>
</html>