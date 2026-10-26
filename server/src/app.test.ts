import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Server } from "http";
import type { AddressInfo } from "net";
import { PRESETS } from "@beat-lab/shared";
import { createApp } from "./app";
import { openDb } from "./db";
import { createRepo } from "./repo";

let server: Server;
let base = "";

beforeAll(async () => {
  const app = createApp(createRepo(openDb(":memory:")));
  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, (error?: Error) =>
      error ? reject(error) : resolve(),
    );
  });
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => server.close());

const post = (body: unknown) =>
  fetch(`${base}/api/patterns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("pattern API", () => {
  test("reports health", async () => {
    const response = await fetch(`${base}/api/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("saves and retrieves a pattern", async () => {
    const response = await post(PRESETS[0].pattern);
    expect(response.status).toBe(201);
    const saved = (await response.json()) as { id: string };
    expect(saved.id).toMatch(/^[0-9A-Za-z]{8}$/);
    const retrieved = await fetch(`${base}/api/patterns/${saved.id}`);
    expect(retrieved.status).toBe(200);
    expect(await retrieved.json()).toEqual(saved);
  });

  test("rejects an invalid BPM with field details", async () => {
    const response = await post({ ...PRESETS[0].pattern, bpm: 999 });
    expect(response.status).toBe(400);
    const body = (await response.json()) as {
      error: { issues: Array<{ path: string }> };
    };
    expect(body.error.issues[0].path).toBe("bpm");
  });

  test("distinguishes malformed and missing ids", async () => {
    expect((await fetch(`${base}/api/patterns/zzz`)).status).toBe(400);
    expect((await fetch(`${base}/api/patterns/AAAAAAAA`)).status).toBe(404);
  });
});
