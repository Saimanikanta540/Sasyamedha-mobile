# NOTES — decisions made under time pressure

## Environment fix (not part of the app)
- macOS 26.2 + Python 3.12.14 (Homebrew) has a broken `platform.mac_ver()` (returns `''`),
  which crashes pip 26.x's truststore SSL backend on *any* network install. Fixed by using
  `uv` (already installed on this machine) instead of stock `pip` inside `backend/.venv`.
  A leftover `.pth` shim (`backend/.venv/lib/python3.12/site-packages/_00_fix_macver.pth`)
  patches `platform.mac_ver()` as a belt-and-suspenders fix; harmless, venv-local only.
- Run backend with: `cd backend && source .venv/bin/activate && uvicorn main:app --reload`.

## Repo placement
- This repo already contains the real product (`my-app/` Expo app, `server/` FastAPI+Postgres
  backend). This build is a **separate, throwaway 2-hour demo vertical slice** per the build
  prompt's own §1 scope table, so it lives in new top-level `backend/` and `web/` directories
  and does not touch `my-app/` or `server/`. No `git init` — reused the existing repo/branch.

## Scope / mocking (per build prompt, not relitigated)
- SQLite (not Postgres/Supabase), auto-created + auto-seeded on startup.
- Inference is a deterministic heuristic (HSV histogram of the leaf photo), not a trained
  model. `is_mock: true` is always returned and shown in the UI — never hidden.
- Real-time Mandi ingestion (`scripts/ingest_prices.py`) uses the data.gov.in OGD API key
  provided in the prompt, but the API is **not** in the demo's request path — `/api/prices`
  always serves the seeded table so the demo can't fail on a slow government API.
- No Postgres/Alembic, no Redux/Zustand/i18n libs, no chart library (inline SVG sparkline),
  no `next-pwa` (hand-written `sw.js`).

## Cuts (see build prompt §11 cut order) — filled in as the build proceeds below.
