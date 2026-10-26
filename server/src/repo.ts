import type { Database } from "bun:sqlite";
import {
  PRESETS,
  type Pattern,
  type PatternInput,
  type Track,
} from "@beat-lab/shared";
import { newId } from "./id";

interface Row {
  id: string;
  name: string;
  bpm: number;
  swing: number;
  tracks: string;
  parent_id: string | null;
  created_at: number;
}

function toPattern(row: Row): Pattern {
  return {
    id: row.id,
    name: row.name,
    bpm: row.bpm,
    swing: row.swing,
    tracks: JSON.parse(row.tracks) as Track[],
    ...(row.parent_id ? { parentId: row.parent_id } : {}),
    createdAt: row.created_at,
  };
}

export function createRepo(db: Database) {
  const insert = db.query(
    `INSERT INTO patterns (id, name, bpm, swing, tracks, parent_id, created_at) VALUES ($id, $name, $bpm, $swing, $tracks, $parentId, $createdAt)`,
  );
  const selectById = db.query<Row, [string]>(
    "SELECT * FROM patterns WHERE id = ?",
  );
  const selectRecent = db.query<Row, [number]>(
    "SELECT * FROM patterns ORDER BY created_at DESC LIMIT ?",
  );
  const countAll = db.query<{ n: number }, []>(
    "SELECT COUNT(*) AS n FROM patterns",
  );

  return {
    create(input: PatternInput): Pattern {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const id = newId();
        const createdAt = Date.now();
        try {
          insert.run({
            $id: id,
            $name: input.name,
            $bpm: input.bpm,
            $swing: input.swing,
            $tracks: JSON.stringify(input.tracks),
            $parentId: input.parentId ?? null,
            $createdAt: createdAt,
          });
          return { ...input, id, createdAt };
        } catch (error) {
          if (!(error instanceof Error && error.message.includes("UNIQUE")))
            throw error;
        }
      }
      throw new Error("Could not generate a unique id");
    },
    byId(id: string): Pattern | null {
      const row = selectById.get(id);
      return row ? toPattern(row) : null;
    },
    recent(limit: number): Pattern[] {
      return selectRecent.all(limit).map(toPattern);
    },
    count(): number {
      return countAll.get()?.n ?? 0;
    },
  };
}

export type PatternRepo = ReturnType<typeof createRepo>;

export function seedIfEmpty(repo: PatternRepo): void {
  if (repo.count() > 0) return;
  for (const preset of PRESETS) repo.create(preset.pattern);
}
