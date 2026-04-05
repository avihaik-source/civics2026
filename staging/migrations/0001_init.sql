-- ================================================================
-- Migration: 0001_init.sql
-- Project:   civics2026 – אזרחות 2026
-- Created:   מרץ 2026
-- ================================================================

-- ── תלמידים ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id          TEXT PRIMARY KEY,
  name        TEXT,
  class       TEXT,
  created_at  TEXT NOT NULL
);

-- ── התקדמות (לפי יחידת לימוד) ───────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  student_id       TEXT    NOT NULL,
  unit_id          INTEGER NOT NULL,
  questions_done   INTEGER NOT NULL DEFAULT 0,
  score            REAL    NOT NULL DEFAULT 0,
  feedback_easy    INTEGER NOT NULL DEFAULT 0,
  feedback_medium  INTEGER NOT NULL DEFAULT 0,
  feedback_hard    INTEGER NOT NULL DEFAULT 0,
  updated_at       TEXT    NOT NULL,
  PRIMARY KEY (student_id, unit_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_unit    ON progress(unit_id);

-- ── הערות אישיות ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  student_id   TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  content      TEXT NOT NULL DEFAULT '',
  updated_at   TEXT NOT NULL,
  PRIMARY KEY (student_id, question_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ── הדגשות טקסט ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS highlights (
  student_id   TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  selection    TEXT NOT NULL DEFAULT '',
  color        TEXT NOT NULL DEFAULT '#FFE066',
  created_at   TEXT NOT NULL,
  PRIMARY KEY (student_id, question_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ── יומן סנכרון ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  TEXT NOT NULL,
  action      TEXT NOT NULL DEFAULT 'sync',
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_log_student ON sync_log(student_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_date    ON sync_log(created_at);

-- ── אנליטיקה ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  TEXT    NOT NULL DEFAULT 'anonymous',
  event       TEXT    NOT NULL,
  data        TEXT    NOT NULL DEFAULT '{}',
  created_at  TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_event  ON analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_date   ON analytics(created_at);
