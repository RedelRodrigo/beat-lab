import { createApp } from "./app";
import { openDb } from "./db";
import { createRepo, seedIfEmpty } from "./repo";

const repo = createRepo(openDb());
seedIfEmpty(repo);
const port = Number(Bun.env.PORT ?? 3001);
createApp(repo).listen(port, () =>
  console.log(`Beat Lab API -> http://localhost:${port}`),
);
