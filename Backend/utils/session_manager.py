# backend/utils/session_manager.py

import uuid
import hmac
import hashlib
from typing import Tuple

from Backend.core.config import settings  # assumes SECRET_KEY is defined in config.py

# Create a signed session_id
def generate_signed_session_id() -> str:
    raw_id = str(uuid.uuid4())
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        raw_id.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{raw_id}.{signature}"

# Verify session_id and extract the raw_id
def verify_signed_session_id(signed_id: str) -> Tuple[bool, str | None]:
    try:
        raw_id, provided_signature = signed_id.split(".")
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode(),
            raw_id.encode(),
            hashlib.sha256
        ).hexdigest()
        is_valid = hmac.compare_digest(provided_signature, expected_signature)
        return is_valid, raw_id if is_valid else None
    except Exception:
        return False, None
