import { createApp } from "./app";
import { openDb } from "./db";
import { createRepo, seedIfEmpty } from "./repo";

const repo = createRepo(openDb());
seedIfEmpty(repo);
const port = Number(Bun.env.PORT ?? 3001);
createApp(repo).listen(port, "0.0.0.0", () =>
  console.log(`Beat Lab API -> http://0.0.0.0:${port}`),
);
