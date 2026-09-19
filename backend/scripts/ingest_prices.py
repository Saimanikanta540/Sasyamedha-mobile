"""
Pulls today's mandi prices from data.gov.in's Open Government Data (OGD) API
("Current Daily Price of Various Commodities from Various Markets (Mandi)")
and upserts them into MarketPrice with source="ogd".

Run manually: `python scripts/ingest_prices.py`.

This is intentionally NOT called from the FastAPI app's startup or request
path (see NOTES.md / build prompt §1) — the demo must not depend on a
government API being fast or up. /api/prices always serves the seeded rows.
"""
import os
import sys
from datetime import date
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlmodel import Session, select

from db import engine, init_db
from models import Market, MarketPrice

API_KEY = os.environ.get(
    "OGD_API_KEY", "579b464db66ec23bdd000001be39649791374255750c658f851402bc"
)
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

# Only pull data for markets/commodities we actually seed, so it maps cleanly
# onto the demo's Market rows instead of importing the whole country.
TARGET_STATES = {"Andhra Pradesh", "Telangana"}
TARGET_COMMODITIES = {"Tomato", "Onion", "Chilli", "Brinjal"}


def fetch_records(limit: int = 500) -> list[dict]:
    params = {"api-key": API_KEY, "format": "json", "limit": limit}
    with httpx.Client(timeout=15) as client:
        resp = client.get(BASE_URL, params=params)
        resp.raise_for_status()
        return resp.json().get("records", [])


def match_market(records_market_name: str, records_district: str, markets: list[Market]) -> Market | None:
    for m in markets:
        if m.district.lower() == (records_district or "").lower():
            return m
    return None


def run() -> None:
    init_db()
    with Session(engine) as session:
        markets = session.exec(select(Market)).all()
        if not markets:
            print("No markets seeded yet — run the app once first so seed.py populates them.")
            return

        try:
            records = fetch_records()
        except Exception as exc:  # network/API failure must never break the demo
            print(f"OGD fetch failed ({exc}); seeded prices remain untouched.")
            return

        upserted = 0
        for rec in records:
            state = rec.get("state")
            commodity = rec.get("commodity")
            if state not in TARGET_STATES or commodity not in TARGET_COMMODITIES:
                continue
            market = match_market(rec.get("market", ""), rec.get("district", ""), markets)
            if market is None:
                continue
            try:
                modal = float(rec["modal_price"])
                min_p = float(rec["min_price"])
                max_p = float(rec["max_price"])
            except (KeyError, ValueError):
                continue

            row = MarketPrice(
                market_id=market.id,
                commodity=commodity.lower(),
                variety=rec.get("variety"),
                min_price_qtl=min_p,
                max_price_qtl=max_p,
                modal_price_qtl=modal,
                price_date=date.today(),
                source="ogd",
            )
            session.add(row)
            upserted += 1

        session.commit()
        print(f"Ingested {upserted} OGD price rows (source='ogd').")


if __name__ == "__main__":
    run()
