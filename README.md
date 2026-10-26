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

## Deployment

The repository is prepared for the simplest split deployment:

- **Netlify** serves the frontend. The included `netlify.toml` uses `bun run build` and publishes `web/dist`.
- **Render** runs the Express API with the included `render.yaml` and `server/Dockerfile`.

### Deploy the API first

1. Push the repository to GitHub.
2. In Render, choose **New Blueprint** and select the repository. Render reads `render.yaml`.
3. Set `ALLOWED_ORIGIN` temporarily to the future Netlify URL, or update it after deploying the frontend.
4. Keep the persistent disk mounted at `/data`. The database path is `/data/beatlab.db`.
5. Confirm `https://YOUR-API.onrender.com/api/health` returns `{ "ok": true }`.

### Deploy the frontend

1. In Netlify, import the same GitHub repository.
2. Use the repository root as the base directory. `netlify.toml` supplies the build and publish settings.
3. Add `VITE_API_URL=https://YOUR-API.onrender.com` as a Netlify environment variable.
4. Deploy and copy the resulting URL.
5. Update Render's `ALLOWED_ORIGIN` to that exact URL, without a trailing slash, then redeploy the API.

The `web/public/_redirects` file and `netlify.toml` rewrite `/p/:id` routes to `index.html`, so shared pattern links work after a refresh.

## Architecture

The shared Zod package defines the pattern contract for both client and server. The browser keeps editing state separate from transport state. A lookahead scheduler reads the audio clock and schedules voices ahead of time, while React only follows the audible cursor. Express validates immutable pattern snapshots before storing them with prepared SQLite statements.
