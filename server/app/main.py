import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_db_and_tables
from app.logging_config import configure_logging
from app.routers import auth, treatment, diagnosis, market_prices, cold_storage, logistics, sell_smart

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title="Smart Crop Care API",
    description=(
        "Single shared backend for the Smart Crop Care and Direct Market Access "
        "Next.js PWA and Expo app. This OpenAPI contract (see /docs) is the "
        "source of truth both clients generate their types from."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    if settings.database_url.startswith("sqlite"):
        create_db_and_tables()
    logger.info("startup", extra={"event": "startup", "env": settings.env})

@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}
app.include_router(auth.router)
app.include_router(treatment.router)
app.include_router(diagnosis.router)
app.include_router(market_prices.router)
app.include_router(cold_storage.router)
app.include_router(logistics.router)
app.include_router(sell_smart.router)
