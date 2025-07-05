from fastapi import APIRouter, HTTPException, Query
from Backend.utils.session_manager import verify_signed_session_id
from Backend.services.attendance_service import get_attendance
from Backend.core.session_storage import session_cache  # ✅ now shared
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/attendance")
async def attendance(session_id: str = Query(...)):
    """
    Endpoint to get the user's attendance data
    Requires a valid session ID
    """
    logger.info(f"Attendance request received with session ID: {session_id[:8]}...")
    logger.debug(f"Current cache keys: {list(session_cache.keys())}")

    is_valid, raw_id = verify_signed_session_id(session_id)
    if not is_valid:
        logger.warning(f"Invalid session ID format: {session_id[:8]}...")
        raise HTTPException(status_code=401, detail="Invalid session")
        
    if raw_id not in session_cache:
        logger.warning(f"Session expired or not found: {raw_id[:8]}...")
        raise HTTPException(status_code=401, detail="Session expired, please login again")

    # Access the session data (this automatically updates the access time)
    session_data = session_cache[raw_id]
    driver = session_data["driver"]
    rollno = session_data["roll_no"]  # Changed from "rollno" to "roll_no"
    
    # Check if attendance data is already cached
    if "attendance_summary" in session_data:
        logger.info(f"Returning cached attendance data for user: {rollno}")
        return {"status": "success", "data": session_data["attendance_summary"]}
    
    logger.info(f"No cached data found. Extracting attendance for user: {rollno}")
    logger.debug(f"Session access time updated for: {raw_id[:8]}...")

    try:
        summary = get_attendance(driver, rollno)
        session_cache[raw_id]["attendance_summary"] = summary
        logger.info(f"Attendance data extracted and cached for user: {rollno}")
        return {"status": "success", "data": summary}
    except Exception as e:
        logger.error(f"Error getting attendance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
