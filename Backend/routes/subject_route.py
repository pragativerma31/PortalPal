from fastapi import APIRouter, HTTPException, Query
from Backend.utils.session_manager import verify_signed_session_id
from Backend.core.session_storage import session_cache

router = APIRouter()

@router.get("/attendance/subject")
async def get_subject_attendance(
    session_id: str = Query(...),
    subject_code: str = Query(...)
):
    is_valid, raw_id = verify_signed_session_id(session_id)
    if not is_valid or raw_id not in session_cache:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    attendance_summary = session_cache[raw_id].get("attendance_summary")
    if not attendance_summary:
        raise HTTPException(status_code=404, detail="Attendance data not found")

    # Find matching subject
    for subject in attendance_summary:
        if subject["subject_code"] == subject_code:
            return {"status": "success", "data": subject}

    raise HTTPException(status_code=404, detail="Subject not found")
