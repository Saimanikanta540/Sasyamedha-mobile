from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.config import get_settings

settings = get_settings()

_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, echo=False, connect_args=_connect_args)


def create_db_and_tables() -> None:
    """Dev/test convenience only — real deployments migrate with Alembic
    (see alembic/), never hand-edit the schema once seeded data exists."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
