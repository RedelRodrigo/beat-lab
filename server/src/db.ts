import { Database } from "bun:sqlite";

export function openDb(
  path: string = Bun.env.DB_PATH ?? "beatlab.db",
): Database {
  const db = new Database(path, { create: true });
  db.run("PRAGMA journal_mode = WAL;");
  db.run(`
    CREATE TABLE IF NOT EXISTS patterns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bpm INTEGER NOT NULL,
      swing REAL NOT NULL,
      tracks TEXT NOT NULL,
      parent_id TEXT,
      created_at INTEGER NOT NULL
    )
  `);
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_patterns_created ON patterns (created_at DESC)",
  );
  return db;
}
