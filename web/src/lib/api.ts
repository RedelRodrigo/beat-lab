import { patternSchema, type PatternInput } from "@beat-lab/shared";

const API = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // The response did not contain JSON.
    }
    throw new ApiError(message, response.status);
  }
  return response.json();
}

export async function getPattern(id: string, signal?: AbortSignal) {
  return patternSchema.parse(await request(`/api/patterns/${id}`, { signal }));
}

export async function listPatterns(limit = 12, signal?: AbortSignal) {
  return patternSchema
    .array()
    .parse(await request(`/api/patterns?limit=${limit}`, { signal }));
}

export async function savePattern(input: PatternInput) {
  return patternSchema.parse(
    await request("/api/patterns", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}
