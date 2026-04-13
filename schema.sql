-- Civics 2026 Core - Unified Database Schema

-- 1. טבלת מושגי "שאגת הארי" (הבסיס לכל המערכת)
CREATE TABLE IF NOT EXISTS concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL UNIQUE,
    definition_official TEXT NOT NULL,
    memory_standard TEXT,
    memory_concrete_asd TEXT,      -- הגדרה מוחשית מותאמת ל-ASD
    unit_id INTEGER,               -- שיוך לפרק (לאומיות, דמוקרטיה וכו')
    importance_level INTEGER DEFAULT 1, -- תיעדוף לפי "שאגת הארי"
    status TEXT DEFAULT 'ACTIVE'
);

-- 2. טבלת שאלות תרגול (במבנה צ-ה-צ-ה)
CREATE TABLE IF NOT EXISTS practice_questions (
    id TEXT PRIMARY KEY,
    topic TEXT,
    question_text TEXT NOT NULL,
    source_text TEXT,              -- הטקסט שעליו נשאלת השאלה
    expected_term TEXT,            -- המושג הנכון (Identify)
    scaffold_hints TEXT,           -- רמזים מובנים (JSON)
    unit_mapping TEXT
);

-- 3. טבלת תלמידים וניהול מצב (Persistence)
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT,
    current_unit INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. טבלת מעקב התקדמות (לדשבורד מורה)
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    unit_id INTEGER NOT NULL,
    score INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- אינדקסים לביצועים מהירים ב-Edge
CREATE INDEX IF NOT EXISTS idx_concepts_term ON concepts(term);
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);