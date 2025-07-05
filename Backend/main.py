import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Backend.core.config import settings
from Backend.routes.login_route import router as login_router
from Backend.routes.attendance_route import router as attendance_router
from Backend.routes.subject_route import router as subject_router
from Backend.routes.transcript_route import router as transcript_router
from Backend.routes.logout_route import router as logout_router
from Backend.routes.debug_route import router as debug_router
from Backend.routes.review_route import router as review_router
from Backend.core.session_storage import session_cache

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(login_router)

app.include_router(attendance_router)

app.include_router(subject_router)

app.include_router(transcript_router)

app.include_router(logout_router)

app.include_router(debug_router)  # Debug routes for session management

app.include_router(review_router)  # Review routes for user feedback

@app.on_event("startup")
async def startup_event():
    """
    Runs when the FastAPI application starts.
    Initializes the session management system.
    """
    logger.info("Starting NSUT Attendance Scraper API")
    logger.info(f"Session timeout set to {session_cache.ttl} seconds")
    logger.info(f"Session cleanup interval set to {session_cache.cleanup_interval} seconds")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Runs when the FastAPI application shuts down.
    Cleans up any remaining sessions.
    """
    logger.info("Shutting down NSUT Attendance Scraper API")
    # Clean up any remaining sessions
    session_keys = list(session_cache.keys())
    for key in session_keys:
        try:
            logger.info(f"Cleaning up session {key} during shutdown")
            del session_cache[key]
        except Exception as e:
            logger.error(f"Error cleaning up session {key}: {e}")

