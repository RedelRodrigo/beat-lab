# Beat Lab

Beat Lab is a browser drum machine built with React, TypeScript, Bun, Web Audio API, Zustand, TanStack Query, Express 5, SQLite and Zod.

## Features

- 16-step sequencer with up to 8 synthesized drum voices
- Precise lookahead scheduling with BPM and swing
- Per-track volume and mute controls
- Pointer painting and keyboard controls
- Audio spectrum visualizer
- Presets, immutable sharing links and remix relationships
- Recent public pattern gallery

## Getting started

Requirements: Bun and a modern browser with Web Audio support.

```bash
bun install
Copy-Item server/.env.example server/.env
bun run dev
```

The web app runs at `http://localhost:5173` and the API at `http://localhost:3001`.

## Commands

```bash
bun run dev:web
bun run dev:server
bun run test
bun run build
```

The server stores patterns in SQLite. Set `DB_PATH`, `PORT`, `ALLOWED_ORIGIN` and `TRUST_PROXY` in `server/.env`. The frontend accepts `VITE_API_URL` when the API is deployed separately.

## Free deployment

The production deployment uses only Cloudflare's free services:

- **Cloudflare Pages** serves the React frontend.
- **Cloudflare Workers** runs the API from `worker/src/index.ts`.
- **Cloudflare D1** stores patterns without requiring a paid persistent server disk.

The original Express/Bun server remains available for local development and tests. Production uses the Worker implementation, which keeps the same `/api/*` contract.

### Deploy the API

1. Install Wrangler or use `bunx wrangler login`.
2. From the repository root, create a D1 database:

   ```bash
   bun run --cwd worker db:create
   ```

3. Copy the returned `database_id` into `worker/wrangler.toml`.
4. Apply the schema:

   ```bash
   bun run --cwd worker db:migrate
   ```

5. Deploy the Worker:

   ```bash
   bun run deploy:worker
   ```

6. Confirm `https://beat-lab-api.YOUR-SUBDOMAIN.workers.dev/api/health` returns `{ "ok": true }`.

### Deploy the frontend

1. In Cloudflare Pages, import the GitHub repository.
2. Use `bun run build` as the build command and `web/dist` as the output directory.
3. Add `BUN_VERSION=1.4.3` and `VITE_API_URL=https://beat-lab-api.YOUR-SUBDOMAIN.workers.dev` as Pages environment variables.
4. Deploy the site and copy its public URL.
5. Set `ALLOWED_ORIGIN` in `worker/wrangler.toml` to that exact URL and run `bun run deploy:worker` again.

The `web/public/_redirects` file and `netlify.toml` also preserve `/p/:id` routes for static hosts that support Netlify-style redirects.

## Architecture

The shared Zod package defines the pattern contract for both client and server. The browser keeps editing state separate from transport state. A lookahead scheduler reads the audio clock and schedules voices ahead of time, while React only follows the audible cursor. Express validates immutable pattern snapshots before storing them with prepared SQLite statements.
