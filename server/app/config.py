from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Every field has a safe local-dev default so the app runs against SQLite
    with zero configuration; only JWT_SECRET_KEY needs to change for anything
    beyond a laptop (NFR-08 — no plaintext secrets committed, no shipped default
    secret in a real deployment)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "development"

    # Database
    database_url: str = "sqlite:///./dev.db"

    # Auth
    jwt_secret_key: str = "dev-only-insecure-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 30  # 30 days — silent, no re-login prompt

    # Supabase Storage
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "scan-images"

    # Mandi price ingestion (data.gov.in Open Government Data API)
    ogd_api_key: str = ""
    ogd_resource_id: str = ""
    internal_api_token: str = "dev-only-internal-token"

    # ML inference
    tflite_model_path: str = ""

    # Gemini (voice transcription — see services/voice.py)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"

    # CORS
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
