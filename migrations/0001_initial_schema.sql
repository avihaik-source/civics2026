-- Civics 2026 - Initial Database Schema
-- Phase 4: Cloudflare D1 persistence layer

-- Students table - core user data
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,  -- student ID (stu_xxxxx format from client)
  name TEXT NOT NULL DEFAULT '',
  grade TEXT DEFAULT '',
  class_name TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Progress table - per-unit learning progress
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  unit_id INTEGER NOT NULL,
  checklist TEXT DEFAULT '[]',      -- JSON array of booleans
  answers TEXT DEFAULT '{}',        -- JSON object of answers
  mood TEXT DEFAULT '',
  completed INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, unit_id)
);

-- Notes table - personal notes per question
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  note_key TEXT NOT NULL,
  content TEXT DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, note_key)
);

-- Highlights table - text highlighting data
CREATE TABLE IF NOT EXISTS highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  highlight_id TEXT NOT NULL,
  data TEXT DEFAULT '[]',         -- JSON array of highlight ranges
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, highlight_id)
);

-- Sync log - track sync events for debugging
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teacher sessions table
CREATE TABLE IF NOT EXISTS teacher_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

-- Analytics table - aggregate learning data
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  event_type TEXT NOT NULL,        -- 'page_view', 'question_answer', 'exam_sim', etc.
  event_data TEXT DEFAULT '{}',    -- JSON with event details
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_unit ON progress(unit_id);
CREATE INDEX IF NOT EXISTS idx_notes_student ON notes(student_id);
CREATE INDEX IF NOT EXISTS idx_highlights_student ON highlights(student_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_student ON sync_log(student_id);
CREATE INDEX IF NOT EXISTS idx_analytics_student ON analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
