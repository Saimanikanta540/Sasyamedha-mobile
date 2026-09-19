from pathlib import Path
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine

DB_PATH = Path(__file__).parent / "app.db"
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


def init_db() -> None:
    import models  # noqa: F401  (registers all SQLModel tables)

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
