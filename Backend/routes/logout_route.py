from fastapi import APIRouter, HTTPException, Query
from Backend.utils.session_manager import verify_signed_session_id
from Backend.core.session_storage import session_cache
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/logout")
async def logout(session_id: str = Query(...)):
    """
    Endpoint to handle user logout by removing their session from the cache
    """
    try:
        # Verify the session ID
        is_valid, raw_id = verify_signed_session_id(session_id)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        # Remove session from cache if it exists
        if raw_id in session_cache:
            logger.info(f"User initiated logout for session: {raw_id}")
            
            # The driver will be automatically closed by our custom cache implementation
            # Just delete the entry from the cache
            del session_cache[raw_id]
            
            return {"status": "success", "message": "Logged out successfully"}
        
        return {"status": "success", "message": "Session already expired"}
    
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise HTTPException(status_code=500, detail=str(e))
