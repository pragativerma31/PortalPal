from fastapi import APIRouter
from Backend.core.session_storage import session_cache
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/debug/sessions")
async def debug_sessions():
    """Debug endpoint to check session status"""
    try:
        cache_keys = list(session_cache.keys())
        access_times = dict(session_cache.access_times)
        
        sessions_info = []
        for key in cache_keys:
            rollno = session_cache[key].get("roll_no", "unknown")  # Changed from "rollno" to "roll_no"
            access_time = access_times.get(key, 0)
            sessions_info.append({
                "session_id": key[:8] + "...",
                "rollno": rollno,  # This is just the display name, keeping it as "rollno"
                "access_time": access_time
            })
        
        return {
            "status": "success",
            "total_sessions": len(cache_keys),
            "sessions": sessions_info,
            "ttl": session_cache.ttl,
            "cleanup_interval": session_cache.cleanup_interval
        }
    except Exception as e:
        logger.error(f"Error in debug endpoint: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/debug/cleanup")
async def force_cleanup():
    """Debug endpoint to manually trigger cleanup"""
    try:
        logger.info("Manual cleanup triggered")
        session_cache._cleanup_expired()
        return {"status": "success", "message": "Cleanup completed"}
    except Exception as e:
        logger.error(f"Error in manual cleanup: {e}")
        return {"status": "error", "message": str(e)}
