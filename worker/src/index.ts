import {
  ID_REGEX,
  PRESETS,
  patternInputSchema,
  type Pattern,
  type PatternInput,
} from "@beat-lab/shared";

export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

interface PatternRow {
  id: string;
  name: string;
  bpm: number;
  swing: number;
  tracks: string;
  parent_id: string | null;
  created_at: number;
}

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const writeBuckets = new Map<string, { startedAt: number; count: number }>();

function newId(length = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function headers(env: Env, request: Request): Headers {
  const result = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  const requestOrigin = request.headers.get("Origin");
  const allowedOrigin = env.ALLOWED_ORIGIN === "*" ? "*" : env.ALLOWED_ORIGIN;
  if (!requestOrigin || allowedOrigin === "*" || requestOrigin === allowedOrigin) {
    result.set("Access-Control-Allow-Origin", allowedOrigin);
  }
  result.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  result.set("Access-Control-Allow-Headers", "Content-Type");
  result.set("Vary", "Origin");
  return result;
}

function json(env: Env, request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: headers(env, request) });
}

function errorBody(message: string, extra: object = {}) {
  return { error: { message, ...extra } };
}

function toPattern(row: PatternRow): Pattern {
  return {
    id: row.id,
    name: row.name,
    bpm: row.bpm,
    swing: row.swing,
    tracks: JSON.parse(row.tracks),
    ...(row.parent_id ? { parentId: row.parent_id } : {}),
    createdAt: row.created_at,
  };
}

function insertStatement(db: D1Database, input: PatternInput, id: string, createdAt: number) {
  return db
    .prepare(
      "INSERT INTO patterns (id, name, bpm, swing, tracks, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      input.name,
      input.bpm,
      input.swing,
      JSON.stringify(input.tracks),
      input.parentId ?? null,
      createdAt,
    );
}

async function seedIfEmpty(db: D1Database): Promise<void> {
  const row = await db.prepare("SELECT COUNT(*) AS count FROM patterns").first<{ count: number }>();
  if ((row?.count ?? 0) > 0) return;
  const now = Date.now();
  const statements = PRESETS.map((preset, index) =>
    insertStatement(db, preset.pattern, newId(), now + index),
  );
  if (statements.length > 0) await db.batch(statements);
}

function allowedWrite(request: Request): boolean {
  const now = Date.now();
  const key = request.headers.get("CF-Connecting-IP") ?? "anonymous";
  const bucket = writeBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    writeBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (bucket.count >= 20) return false;
  bucket.count += 1;
  return true;
}

async function handle(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: headers(env, request) });
  }

  const url = new URL(request.url);
  if (url.pathname === "/api/health" && request.method === "GET") {
    return json(env, request, { ok: true });
  }

  if (url.pathname === "/api/patterns" && request.method === "GET") {
    await seedIfEmpty(env.DB);
    const requestedLimit = Number(url.searchParams.get("limit")) || 12;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);
    const result = await env.DB
      .prepare("SELECT * FROM patterns ORDER BY created_at DESC LIMIT ?")
      .bind(limit)
      .all();
    return json(env, request, (result.results as unknown as PatternRow[]).map(toPattern));
  }

  const patternMatch = url.pathname.match(/^\/api\/patterns\/([0-9A-Za-z]+)$/);
  if (patternMatch && request.method === "GET") {
    const id = patternMatch[1];
    if (!ID_REGEX.test(id)) return json(env, request, errorBody("Invalid pattern id"), 400);
    const row = await env.DB.prepare("SELECT * FROM patterns WHERE id = ?").bind(id).first();
    if (!row) return json(env, request, errorBody("Pattern not found"), 404);
    return json(env, request, toPattern(row as unknown as PatternRow));
  }

  if (url.pathname === "/api/patterns" && request.method === "POST") {
    if (!allowedWrite(request)) return json(env, request, errorBody("Too many requests, slow down a bit"), 429);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json(env, request, errorBody("Bad request"), 400);
    }
    const parsed = patternInputSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        env,
        request,
        errorBody("Invalid pattern", {
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        }),
        400,
      );
    }

    const input = parsed.data;
    const parentId = input.parentId;
    const parent = parentId
      ? await env.DB.prepare("SELECT id FROM patterns WHERE id = ?").bind(parentId).first()
      : null;
    const normalizedInput = parentId && parent ? input : { ...input, parentId: undefined };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const id = newId();
      try {
        const createdAt = Date.now();
        await insertStatement(env.DB, normalizedInput, id, createdAt).run();
        return json(env, request, { ...normalizedInput, id, createdAt }, 201);
      } catch (error) {
        if (!(String(error).includes("UNIQUE") || String(error).includes("constraint"))) throw error;
      }
    }
    return json(env, request, errorBody("Could not generate a unique id"), 500);
  }

  return json(env, request, errorBody("Not found"), 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error(error);
      return json(env, request, errorBody("Internal server error"), 500);
    }
  },
};
