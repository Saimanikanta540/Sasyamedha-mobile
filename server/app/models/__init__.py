"""Import every table model here so SQLModel.metadata (create_all, and Alembic
autogenerate's target_metadata) actually sees all of them — a model defined
but never imported is a table that silently never gets created."""

from app.models.cold_storage import ColdStorage
from app.models.destination import Destination
from app.models.mandi_price import MandiPrice
from app.models.scan import Scan
from app.models.transport import TransportProvider, TransportRequest
from app.models.treatment import TreatmentRecord
from app.models.user import User

__all__ = [
    "User",
    "Scan",
    "TreatmentRecord",
    "MandiPrice",
    "Destination",
    "ColdStorage",
    "TransportProvider",
    "TransportRequest",
]
