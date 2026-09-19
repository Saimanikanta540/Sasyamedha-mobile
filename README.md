# Sasyamedha — Smart Crop Care & Direct Market Access (2-hour demo slice)

A separate, throwaway vertical-slice demo of the Sasyamedha product living in `backend/`
and `web/` at the repo root — it does not touch `my-app/` or `server/` (the real Expo app
and production backend). See `NOTES.md` for every decision made under time pressure.

## Run it

```bash
# backend (FastAPI + SQLite, auto-seeded on first startup)
cd backend
source .venv/bin/activate          # venv created with `uv venv --python 3.12 .venv`
uv pip install -r requirements.txt # or: pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# frontend (Next.js PWA), in a second terminal
cd web
npm run dev                        # http://localhost:3000
```

API docs: http://localhost:8000/docs · Health check: http://localhost:8000/api/health

### Real disease classification (optional)

Put `GEMINI_API_KEY=...` in `backend/.env` (gitignored) to route `/api/disease/predict`
through Gemini Vision (`gemini-3.6-flash`) for a genuine per-photo diagnosis instead of the
HSV heuristic — `is_mock` and the result screen's "Demo model" chip follow automatically.
No key → falls back to the deterministic heuristic with no code changes needed.

### Speech input

Onboarding's name field and the Assistant screen both show a 🎤 mic button when the
browser supports the Web Speech API (`SpeechRecognition`) — speaks in the current
language (te-IN/en-IN/hi-IN) and fills the field (Assistant auto-routes on the transcript).
Renders nothing on browsers without support, same as the existing speaker button.

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
