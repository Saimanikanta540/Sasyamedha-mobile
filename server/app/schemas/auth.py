from uuid import UUID

from pydantic import BaseModel, Field


class DeviceAuthRequest(BaseModel):
    device_id: str = Field(min_length=1, max_length=255)


class DeviceAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID


class LinkPhoneRequest(BaseModel):
    phone_number: str = Field(min_length=6, max_length=20)
