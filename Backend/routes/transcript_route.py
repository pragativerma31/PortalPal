from fastapi import APIRouter, HTTPException, Query
from Backend.utils.session_manager import verify_signed_session_id
from Backend.core.session_storage import session_cache
from Backend.services.transcript_service import view_transcript
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/transcript")
async def get_transcript(session_id: str = Query(...)):
    """
    Endpoint to get the user's transcript data
    Requires a valid session ID
    """
    logger.info(f"Transcript request received with session ID: {session_id[:8]}...")
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
    rollno = session_data.get('roll_no', 'unknown')
    
    # Check if transcript data is already cached
    if "transcript_data" in session_data:
        logger.info(f"Returning cached transcript data for user: {rollno}")
        return {"status": "success", "data": session_data["transcript_data"]}
    
    logger.info(f"No cached data found. Extracting transcript for user: {rollno}")
    logger.debug(f"Session access time updated for: {raw_id[:8]}...")

    try:
        data = view_transcript(driver)
        session_cache[raw_id]["transcript_data"] = data
        logger.info(f"Transcript data extracted and cached for user: {rollno}")
        return {"status": "success", "data": data}
    except Exception as e:
        logger.error(f"Error getting transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
