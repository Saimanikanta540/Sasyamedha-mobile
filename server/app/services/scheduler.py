"""In-process background loop that periodically calls the same ingestion
logic POST /internal/ingest-prices uses. Mandi prices are typically published
once a day, so this defaults to a slow 3-hour interval, not constant polling.

Deliberately simple (an asyncio task, not a job queue) — this is fine for a
single-process dev/demo deployment, which is what this app runs as today.
A real multi-worker production deployment should NOT rely on this: each
worker process would run its own copy of the loop and duplicate the work
(harmless here since ingestion is idempotent, but wasteful). At that point,
trigger POST /internal/ingest-prices from an external scheduler (cron,
Celery beat, a hosting platform's scheduled job) instead, and set
PRICE_INGESTION_INTERVAL_MINUTES=0 to disable this loop.
"""

import asyncio
import logging

from sqlmodel import Session

from app.config import get_settings
from app.database import engine
from app.services.price_ingestion import ingest_ogd_prices

logger = logging.getLogger(__name__)

_task: asyncio.Task | None = None


def _run_ingestion_sync() -> dict:
    with Session(engine) as session:
        return ingest_ogd_prices(session).as_dict()


async def _loop(interval_seconds: int) -> None:
    while True:
        try:
            # ingest_ogd_prices does blocking network + DB calls — run it off
            # the event loop so it can't stall requests being served concurrently.
            report = await asyncio.to_thread(_run_ingestion_sync)
            logger.info("scheduled price ingestion", extra={"event": "scheduled_ingest_prices", **report})
        except Exception:
            logger.exception("scheduled price ingestion crashed")
        await asyncio.sleep(interval_seconds)


def start_price_ingestion_scheduler() -> None:
    global _task
    settings = get_settings()
    if settings.price_ingestion_interval_minutes <= 0:
        logger.info("price ingestion scheduler disabled (PRICE_INGESTION_INTERVAL_MINUTES <= 0)")
        return
    interval_seconds = settings.price_ingestion_interval_minutes * 60
    _task = asyncio.create_task(_loop(interval_seconds))
    logger.info(
        "price ingestion scheduler started",
        extra={"event": "scheduler_started", "interval_minutes": settings.price_ingestion_interval_minutes},
    )


def stop_price_ingestion_scheduler() -> None:
    global _task
    if _task is not None:
        _task.cancel()
        _task = None
