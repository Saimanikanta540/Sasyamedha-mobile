import io
import logging
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session
from PIL import Image

from app.config import get_settings
from app.database import get_session
from app.models import Scan, User
from app.security import get_current_user
from app.schemas.diagnosis import DiagnoseResponse
from app.services.ml_inference import get_inference_service
from app.services.storage import get_storage_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["diagnosis"])
settings = get_settings()

@router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> DiagnoseResponse:
    # 1. Validate image format
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG and PNG images are supported",
        )
    
    file_bytes = await file.read()
    
    # Process image for inference (and potentially compress for storage)
    try:
        image = Image.open(io.BytesIO(file_bytes))
        # NFR-01: compress/resize server-side before inference if the upload is large
        image.thumbnail((800, 800)) # Compress for storage as well
        compressed_io = io.BytesIO()
        image.save(compressed_io, format="JPEG", quality=85)
        compressed_bytes = compressed_io.getvalue()
    except Exception as e:
        logger.error(f"Failed to process image: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file",
        )
        
    inference_service = get_inference_service(settings.tflite_model_path)
    disease_class, confidence, is_mock = inference_service.predict(image)
    
    # Store to Supabase
    storage = get_storage_service()
    file_extension = "jpg" # since we converted to JPEG
    file_name = f"{current_user.id}/{uuid4()}.{file_extension}"
    
    try:
        image_url = storage.upload_file(
            file_bytes=compressed_bytes,
            file_name=file_name,
            content_type="image/jpeg"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image",
        )
    
    scan = Scan(
        user_id=current_user.id,
        image_url=image_url,
        disease_class=disease_class,
        confidence=confidence,
        is_mock=is_mock,
    )
    session.add(scan)
    session.commit()
    session.refresh(scan)

    return DiagnoseResponse(
        scan_id=scan.id,
        disease_class=scan.disease_class,
        confidence=scan.confidence,
        is_mock=scan.is_mock,
    )
