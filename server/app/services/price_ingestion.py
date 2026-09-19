"""Real mandi price ingestion from data.gov.in's Open Government Data (OGD) API
("Current Daily Price of Various Commodities from Various Markets (Mandi)").

Replaces the previous /internal/ingest-prices stub, which only logged a
message and never called the API at all. Never called from app startup or any
user-facing request path — this is meant to be triggered on a schedule (a
cron hitting the internal endpoint), so a slow/unreachable government API can
never block a farmer's request. On any failure, returns a report describing
the failure — never raises past this module and never leaves the seeded data
in an inconsistent state.
"""

import logging
from dataclasses import dataclass, field
from datetime import date

import httpx
from sqlmodel import Session, select

from app.config import get_settings
from app.models import MandiPrice

logger = logging.getLogger(__name__)

RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

# Matches this app's actual seeded coverage (see app/seed/market_seed.py) and
# the commodities the Expo app's Prices/Sell Smart screens filter on — not
# importing the whole country's mandi data just because the API can serve it.
TARGET_STATES = {"Andhra Pradesh", "Telangana"}

# OGD commodity names vary ("Paddy(Dhan)Common", "Tomato Hybrid", ...) — match
# by prefix against this app's own lowercase commodity keys rather than
# requiring an exact string match.
TARGET_COMMODITIES = ["tomato", "chilli", "paddy", "cotton"]


@dataclass
class IngestionReport:
    fetched: int = 0
    matched: int = 0
    inserted: int = 0
    replaced: int = 0
    skipped_bad_row: int = 0
    error: str | None = None
    matched_commodities: dict = field(default_factory=dict)

    def as_dict(self) -> dict:
        return {
            "source": "data.gov.in OGD",
            "fetched": self.fetched,
            "matched": self.matched,
            "inserted": self.inserted,
            "replaced": self.replaced,
            "skipped_bad_row": self.skipped_bad_row,
            "matched_commodities": self.matched_commodities,
            "error": self.error,
        }


def _match_commodity(raw: str) -> str | None:
    normalized = raw.strip().lower()
    for target in TARGET_COMMODITIES:
        if normalized.startswith(target):
            return target
    return None


def ingest_ogd_prices(session: Session, *, limit: int = 1000) -> IngestionReport:
    settings = get_settings()
    report = IngestionReport()

    if not settings.ogd_api_key:
        report.error = "OGD_API_KEY not configured"
        return report

    params = {
        "api-key": settings.ogd_api_key,
        "format": "json",
        "limit": limit,
    }
    # data.gov.in's gateway silently stalls (no response, not even a rejection)
    # on httpx's default User-Agent — reproduced directly: identical requests
    # succeed in <1s with any explicit UA and reliably time out without one.
    # Not spoofing curl specifically, just identifying this client honestly;
    # the fetch already carries a real API key, this is a client-fingerprint
    # quirk in their gateway, not an access-control boundary being bypassed.
    headers = {"User-Agent": "Sasyamedha-MandiPriceIngestion/1.0"}

    records = None
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            with httpx.Client(timeout=15, headers=headers) as client:
                resp = client.get(BASE_URL, params=params)
                resp.raise_for_status()
                records = resp.json().get("records", [])
            break
        except Exception as exc:
            last_error = exc
            logger.warning("OGD fetch attempt %d failed: %s", attempt + 1, exc)

    if records is None:
        report.error = f"fetch failed: {last_error}"
        return report

    report.fetched = len(records)
    today = date.today()

    for rec in records:
        state = rec.get("state", "")
        if state not in TARGET_STATES:
            continue
        commodity = _match_commodity(rec.get("commodity", ""))
        if commodity is None:
            continue

        try:
            min_price = float(rec["min_price"])
            max_price = float(rec["max_price"])
            modal_price = float(rec["modal_price"])
        except (KeyError, ValueError, TypeError):
            report.skipped_bad_row += 1
            continue

        market = rec.get("market", "").strip()
        district = rec.get("district", "").strip()
        variety = rec.get("variety", "").strip() or "Local"
        if not market:
            report.skipped_bad_row += 1
            continue

        report.matched += 1
        report.matched_commodities[commodity] = report.matched_commodities.get(commodity, 0) + 1

        # Idempotent per (market, commodity, price_date): a re-run today
        # replaces today's OGD row rather than duplicating it. Never touches
        # seeded rows for other dates/markets.
        existing = session.exec(
            select(MandiPrice).where(
                MandiPrice.market == market,
                MandiPrice.commodity == commodity,
                MandiPrice.price_date == today,
                MandiPrice.source == "ogd",
            )
        ).first()

        if existing:
            existing.min_price = min_price
            existing.max_price = max_price
            existing.modal_price = modal_price
            existing.variety = variety
            existing.district = district
            session.add(existing)
            report.replaced += 1
        else:
            session.add(
                MandiPrice(
                    commodity=commodity,
                    variety=variety,
                    state=state,
                    district=district,
                    market=market,
                    min_price=min_price,
                    max_price=max_price,
                    modal_price=modal_price,
                    price_date=today,
                    source="ogd",
                    # OGD doesn't provide market coordinates — distance
                    # sorting just skips these rows (see market_prices
                    # router), which is honest rather than guessing a location.
                    latitude=None,
                    longitude=None,
                )
            )
            report.inserted += 1

    session.commit()
    return report
