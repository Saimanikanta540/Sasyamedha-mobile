from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlmodel import Session

from app.config import get_settings
from app.database import get_session
from app.models import User

settings = get_settings()

# HTTPBearer (not OAuth2PasswordBearer) — there is no password flow here, only
# a bearer token issued by POST /auth/device. This also renders as a plain
# "Authorize" token field in the /docs Swagger UI instead of a login form.
_bearer_scheme = HTTPBearer(auto_error=True)


def create_access_token(user_id: UUID) -> str:
    """Long-lived (30 days by default) and silently re-issuable — the client
    just calls POST /auth/device again with the same device_id; there is no
    separate refresh endpoint, by design, to keep the flow invisible to the
    farmer (see build brief §3)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> UUID:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            raise JWTError("Missing subject claim")
        return UUID(subject)
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    session: Session = Depends(get_session),
) -> User:
    user_id = decode_access_token(credentials.credentials)
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
