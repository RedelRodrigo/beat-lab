import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { ID_REGEX, patternInputSchema } from "@beat-lab/shared";
import type { PatternRepo } from "./repo";

const errorBody = (message: string, extra: object = {}) => ({
  error: { message, ...extra },
});

export function createApp(repo: PatternRepo) {
  const app = express();
  app.disable("x-powered-by");
  if (Bun.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  const allowedOrigins = Bun.env.ALLOWED_ORIGIN?.split(",").map((origin) =>
    origin.trim(),
  );
  app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
  app.use(express.json({ limit: "20kb" }));

  const writeLimiter = rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: errorBody("Too many requests, slow down a bit"),
  });

  app.get("/api/health", (_request, response) => response.json({ ok: true }));
  app.get("/api/patterns", (request, response) => {
    const limit = Math.min(Math.max(Number(request.query.limit) || 12, 1), 50);
    response.json(repo.recent(limit));
  });
  app.get("/api/patterns/:id", (request, response) => {
    const { id } = request.params;
    if (!ID_REGEX.test(id))
      return response.status(400).json(errorBody("Invalid pattern id"));
    const pattern = repo.byId(id);
    if (!pattern)
      return response.status(404).json(errorBody("Pattern not found"));
    return response.json(pattern);
  });
  app.post("/api/patterns", writeLimiter, (request, response) => {
    const parsed = patternInputSchema.safeParse(request.body);
    if (!parsed.success)
      return response
        .status(400)
        .json(
          errorBody("Invalid pattern", {
            issues: parsed.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          }),
        );
    const input = parsed.data;
    if (input.parentId && !repo.byId(input.parentId)) delete input.parentId;
    return response.status(201).json(repo.create(input));
  });
  app.use((_request, response) =>
    response.status(404).json(errorBody("Not found")),
  );
  const onError: ErrorRequestHandler = (error, _request, response, _next) => {
    const status = typeof error?.status === "number" ? error.status : 500;
    if (status >= 500) console.error(error);
    return response
      .status(status)
      .json(errorBody(status >= 500 ? "Internal server error" : "Bad request"));
  };
  app.use(onError);
  return app;
}
