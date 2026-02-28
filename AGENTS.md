# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 16 (Pages Router)** music download helper app. It is a single-service application with no databases, Docker, or external dependencies — only the Next.js dev server needs to run.

### Running the app

- **HTTP dev mode** (recommended for Cloud): `npm run dev:http` — starts on `http://localhost:3000`
- **HTTPS dev mode**: `npm run dev` — requires `cert.key` and `cert.crt` files in project root (needed for QR login feature). Not available in Cloud.
- The app requires **internet access** to function — all data is proxied in real-time from NetEase Cloud Music servers.

### Type checking

- No ESLint is configured. Use `npx tsc --noEmit` for TypeScript type checking.
- No test framework (jest/vitest) is configured. There are no automated tests.

### Build

- `npm run build` — runs Next.js build + post-build dependency check script.

### Key caveats

- The `npm run dev` script tries to load `.nvmrc` (Node 22.21.0) via nvm. If the exact version isn't installed, it falls back to `node server.js` (HTTPS). Use `npm run dev:http` to skip certificate requirements.
- Some songs may fail to play with "Cannot play" errors — this is expected behavior from the NetEase API when songs are region-restricted or require VIP access.
