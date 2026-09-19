import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import User
from app.schemas.auth import DeviceAuthRequest, DeviceAuthResponse, LinkPhoneRequest
from app.security import create_access_token, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/device", response_model=DeviceAuthResponse)
def auth_device(body: DeviceAuthRequest, session: Session = Depends(get_session)) -> DeviceAuthResponse:
    """Silent, no farmer-facing UI required: send a device UUID, get a token
    back. Idempotent — calling this again for the same device_id just returns
    a fresh token for the same account, which is also how token renewal works
    (no separate refresh endpoint)."""
    user = session.exec(select(User).where(User.device_id == body.device_id)).first()
    is_new_user = user is None
    if user is None:
        user = User(device_id=body.device_id)
        session.add(user)
        session.commit()
        session.refresh(user)

    logger.info(
        "device_auth",
        extra={"event": "device_auth", "user_id": str(user.id), "is_new_user": is_new_user},
    )
    token = create_access_token(user.id)
    return DeviceAuthResponse(access_token=token, user_id=user.id)


@router.patch("/device/{device_id}/link-phone", status_code=status.HTTP_204_NO_CONTENT)
def link_phone(
    device_id: str,
    body: LinkPhoneRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """Recovery path only — attaches a phone number to an already-authenticated
    device's own account, for device-loss recovery. Not a self-serve OTP flow
    (see build brief §3.4); the client mediates this via an assisted flow."""
    if current_user.device_id != device_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot link a phone number to a different device's account",
        )
    current_user.phone_number = body.phone_number
    session.add(current_user)
    session.commit()
