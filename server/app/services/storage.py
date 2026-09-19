import logging
from supabase import create_client, Client
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class StorageService:
    def __init__(self):
        self.bucket = settings.supabase_storage_bucket
        if settings.supabase_url and settings.supabase_service_role_key:
            self.client: Client = create_client(
                settings.supabase_url, 
                settings.supabase_service_role_key
            )
            self.enabled = True
        else:
            self.enabled = False
            logger.warning("Supabase credentials missing. Storage will be stubbed.")

    def upload_file(self, file_bytes: bytes, file_name: str, content_type: str) -> str:
        if not self.enabled:
            return f"https://stub-supabase.com/storage/v1/object/public/{self.bucket}/{file_name}"
            
        try:
            self.client.storage.from_(self.bucket).upload(
                file_name,
                file_bytes,
                file_options={"content-type": content_type}
            )
            return self.client.storage.from_(self.bucket).get_public_url(file_name)
        except Exception as e:
            logger.error(f"Failed to upload to Supabase: {e}")
            raise

_storage_service = None

def get_storage_service() -> StorageService:
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service
