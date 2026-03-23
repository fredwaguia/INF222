import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_file(file: UploadFile = File(...)) -> Dict[str, str]:
    try:
        # Generate unique filename to prevent collisions and security issues
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "filename": file.filename,
            "url": f"/uploads/{unique_filename}",
            "type": file.content_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
