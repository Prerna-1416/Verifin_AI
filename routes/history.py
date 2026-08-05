from fastapi import APIRouter
import os

router = APIRouter(
    prefix="/history",
    tags=["History"]
)

@router.get("/")
def get_history():

    os.makedirs("history", exist_ok=True)

    files = sorted(os.listdir("history"), reverse=True)

    return {
        "total_scans": len(files),
        "files": files
    }