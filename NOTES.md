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
- Real-time Mandi ingestion (`backend/scripts/ingest_prices.py`) uses the data.gov.in OGD
  API key provided in the prompt (resource `9ef84268-d588-465a-a308-a864a43d0070`,
  "Current Daily Price of Various Commodities from Various Markets (Mandi)"), matches
  records by state+district onto the seeded `Market` rows, and upserts them as
  `source="ogd"`. It is **not** in the demo's request path — `/api/prices` always serves
  the seeded table. Verified this matters: a live test run from this machine timed out
  against api.data.gov.in (network reachability, not a code bug) — the script caught it
  and exited cleanly without touching the seeded rows, exactly the fallback behaviour the
  build prompt asks for. Run it manually with a healthier network connection to refresh
  prices with `source="ogd"`.
- No Postgres/Alembic, no Redux/Zustand/i18n libs, no chart library (inline SVG sparkline),
  no `next-pwa` (hand-written `sw.js`).

## Sell Smart §5.1 assertion
- `backend/scripts/assert_sell_smart.py` reproduces the exact ranking: FPO (₹16,500) >
  Guntur mandi (₹15,700) > Khammam mandi (₹15,271, spec table says ₹15,274). The 3-rupee
  gap on Khammam only is real haversine distance (124.3 km, computed from the exact
  Guntur/Khammam market coordinates given in §5) vs. the spec table's implied 124.2 km —
  a rounding artifact of whatever distance formula produced the original table. The
  ranking order and the core "inversion" (highest ₹/kg → worst net, lowest ₹/kg → best
  net because the FPO collects at the farm gate) match exactly, which is what §5.1 calls
  "the entire product."
- Buyer seed coordinates/prices (Sri Venkateswara, AgriFresh, Hotel Supply) were chosen
  so their net_return all fall below Khammam's, keeping the top-3 exactly as specified —
  the spec's own buyer figures are prefixed "e.g." (illustrative), so this is within the
  given latitude, not a relitigation of the ranking rule itself.

## Cuts (see build prompt §11 cut order)
- Nothing on the "never cut" list was cut: Sell Smart, confidence bands, disclaimers,
  Telugu (+ English + Hindi, all three fully translated), and offline data-age labels are
  all in.
- `/assistant` was built anyway (cheap: a keyword → route text box) rather than cut, since
  the home tile already links to it and a working stub cost little.
- Leaflet map on `/storage`: not built — shipped list-only per the spec's own explicit
  permission ("If minute 90 arrives, ship list-only"), which is enough for the demo script.
- Sell-request persistence (`POST /sell-requests`) and the transport request form are both
  implemented, not cut.
- No browser automation tool was available in this session (Claude in Chrome was declined),
  so the UI was verified via `tsc --noEmit`, a full production build, and an API-level
  walkthrough of the exact demo script (login → disease/predict on a real green/brown test
  image → treatment lookup → sell-smart ranking), rather than an actual clicked-through
  browser run. Recommend a manual click-through before presenting.

## Known gaps worth knowing about
- `GET /buyers` and `GET /fpos` default to `radius_km=50` per the API contract in §8; the
  `/buyers` screen itself requests `radius_km=200` so all three seeded buyers are visible
  there (two of them sit ~70–95 km out by design, see "Sell Smart §5.1 assertion" above).
  Calling the API with its bare default will only return the closest buyer.
- Buyer/FPO business names are not translated (only mandi names have `name_te`/`name_hi`)
  — proper nouns are shown as given, consistent with how a real business name would appear
  regardless of the app's language.
- `PATCH /me` language sync to the backend on language-switch is best-effort/fire-and-forget
  (UI switches instantly either way).
