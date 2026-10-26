CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bpm INTEGER NOT NULL,
  swing REAL NOT NULL,
  tracks TEXT NOT NULL,
  parent_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patterns_created
  ON patterns (created_at DESC);
