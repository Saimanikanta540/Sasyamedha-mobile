# Sasyamedha — Smart Crop Care & Direct Market Access (2-hour demo slice)

A separate, throwaway vertical-slice demo of the Sasyamedha product living in `backend/`
and `web/` at the repo root — it does not touch `my-app/` or `server/` (the real Expo app
and production backend). See `NOTES.md` for every decision made under time pressure.

## Run it

```bash
# backend (FastAPI + SQLite, auto-seeded on first startup)
cd backend
source .venv/bin/activate          # venv created with `uv venv --python 3.12 .venv`
uvicorn main:app --reload --port 8000

# frontend (Next.js PWA), in a second terminal
cd web
npm run dev                        # http://localhost:3000
```

API docs: http://localhost:8000/docs · Health check: http://localhost:8000/api/health

## Demo script (see build prompt §12)

1. Open http://localhost:3000 on a phone-width window → language screen → tap **తెలుగు**.
2. Onboarding screen → tap **Skip** → logs in as the seeded demo farmer (Lakshmi, tomato,
   500 kg, Guntur). Home renders in Telugu with the batch card.
3. Tile **Check Crop** → take/choose a leaf photo → banded result (Telugu label, demo-model
   chip, speaker button).
4. **View treatment** → four sections + persistent disclaimer.
5. Home → **Sell Crop** → three ranked destinations. The FPO at ₹33/kg nets ₹16,500 by
   collecting at the farm gate; the Guntur mandi at ₹35/kg nets ₹15,700 after transport;
   Khammam at ₹38/kg — the *highest* price — nets the *least* of the three once transport
   is subtracted. Tap a card to expand the arithmetic.
6. Tap **Call** on the FPO card → dialler opens (`tel:` link).
7. Airplane mode → Home → Prices still render from cache with a "Updated N ago" label and
   an offline banner.
8. Switch language mid-screen via the header selector — same screen, same state, now English.

## Verify the core assertion

```bash
cd backend && source .venv/bin/activate && python3 scripts/assert_sell_smart.py
```
