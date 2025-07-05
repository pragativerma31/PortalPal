# backend/core/session_storage.py
from cachetools import TTLCache
from typing import Any, Dict, Callable
import threading
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("SESSION_CACHE module loaded from:", __file__)

class DriverTTLCache(TTLCache):
    """
    Extended TTLCache that properly cleans up Selenium WebDriver instances
    when they are evicted from the cache due to timeout or manual removal.
    """
    
    def __init__(self, maxsize: int, ttl: float, cleanup_interval: int = 30):
        """
        Initialize the cache with a cleanup thread.
        
        Args:
            maxsize: Maximum cache size
            ttl: Time to live in seconds
            cleanup_interval: How often to check for expired items (seconds)
        """
        # Call parent constructor
        super().__init__(maxsize, ttl)
        
        # Start background cleanup thread
        self.cleanup_interval = cleanup_interval
        self.cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self.cleanup_thread.start()
        
        # Track when items were added to detect expired items manually
        self.access_times = {}
        
    def _cleanup_loop(self):
        """Background thread that periodically checks for and cleans up expired sessions."""
        while True:
            try:
                time.sleep(self.cleanup_interval)
                self._cleanup_expired()
            except Exception as e:
                logger.error(f"Error in cleanup thread: {e}")
                
    def _cleanup_expired(self):
        """Check for expired items and close their drivers."""
        current_time = time.time()
        expired_keys = []
        
        # Find expired keys by checking our access times
        for key, timestamp in list(self.access_times.items()):
            if current_time - timestamp > self.ttl:
                expired_keys.append(key)
                
        # Clean up expired keys
        for key in expired_keys:
            if key in self:
                logger.info(f"Auto-cleaning up expired session: {key[:8]}...")
                self._close_driver(self[key])
                # Remove from both caches
                super().__delitem__(key)
                self.access_times.pop(key, None)
                
        # Also check for any items that TTLCache might have expired internally
        current_keys = set(super().keys())
        tracked_keys = set(self.access_times.keys())
        
        # Find keys that are tracked but no longer in the cache
        orphaned_keys = tracked_keys - current_keys
        for key in orphaned_keys:
            logger.warning(f"Found orphaned tracking for key: {key[:8]}...")
            self.access_times.pop(key, None)
    
    def __setitem__(self, key: Any, value: Dict[str, Any]):
        """Override to track when items are added."""
        self.access_times[key] = time.time()
        super().__setitem__(key, value)
        logger.info(f"Session stored in cache: {key[:8]}...")
    
    def __delitem__(self, key: Any):
        """Override to clean up driver when item is explicitly deleted."""
        if key in self:
            logger.info(f"Explicitly deleting session: {key[:8]}...")
            self._close_driver(self[key])
        super().__delitem__(key)
        self.access_times.pop(key, None)
    
    def __getitem__(self, key: Any):
        """Override to update access time when items are accessed."""
        # Update access time
        if key in self.access_times:
            self.access_times[key] = time.time()
        return super().__getitem__(key)
    
    def _close_driver(self, session_data: Dict[str, Any]):
        """Safely close the Selenium WebDriver if it exists."""
        try:
            driver = session_data.get("driver")
            if driver:
                logger.info("Closing Chrome browser session...")
                driver.quit()
                logger.info("Chrome browser closed successfully")
        except Exception as e:
            logger.error(f"Error closing WebDriver: {e}")
    
    def pop(self, key: Any, default=None):
        """Override to clean up driver when popped."""
        if key in self:
            value = self[key]
            logger.info(f"Popping session from cache: {key[:8]}...")
            self._close_driver(value)
            super().__delitem__(key)
            self.access_times.pop(key, None)
            return value
        return default
    
    def clear(self):
        """Override to clean up all drivers when cache is cleared."""
        logger.info("Clearing all sessions from cache...")
        for key, value in list(self.items()):
            self._close_driver(value)
        super().clear()
        self.access_times.clear()

# Create our custom session cache (valid for 10 minutes)
session_cache = DriverTTLCache(maxsize=100, ttl=600, cleanup_interval=30)
