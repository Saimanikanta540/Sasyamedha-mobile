from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from db import engine, get_session, init_db
from models import Market
from seed.seed import seed_if_empty

app = FastAPI(title="Smart Crop Care & Direct Market Access")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    with Session(engine) as session:
        seed_if_empty(session)


@app.get("/api/health")
def health() -> dict:
    with Session(engine) as session:
        seeded = session.exec(select(Market)).first() is not None
    return {
        "status": "ok",
        "db": "sqlite",
        "seeded": seeded,
        "is_mock_inference": True,
    }

