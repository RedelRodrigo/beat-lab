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

## Architecture

The shared Zod package defines the pattern contract for both client and server. The browser keeps editing state separate from transport state. A lookahead scheduler reads the audio clock and schedules voices ahead of time, while React only follows the audible cursor. Express validates immutable pattern snapshots before storing them with prepared SQLite statements.
