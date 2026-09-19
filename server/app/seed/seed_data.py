"""Idempotent seed script — safe to run repeatedly (skips rows that already
exist). Run with:

    python -m app.seed.seed_data
"""

from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import TreatmentRecord
from app.seed.treatment_seed import TREATMENT_SEED


def seed_treatment(session: Session) -> int:
    inserted = 0
    for entry in TREATMENT_SEED:
        exists = session.exec(
            select(TreatmentRecord).where(
                TreatmentRecord.disease_class == entry["disease_class"],
                TreatmentRecord.language == entry["language"],
                TreatmentRecord.version == 1,
            )
        ).first()
        if exists:
            continue
        session.add(TreatmentRecord(version=1, **entry))
        inserted += 1
    session.commit()
    return inserted


def main() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        n = seed_treatment(session)
        print(f"treatment: inserted {n} new record(s), skipped {len(TREATMENT_SEED) - n} already present.")


if __name__ == "__main__":
    main()
