# backend/core/config.py

import os
from dotenv import load_dotenv
from pathlib import Path
import subprocess


# URLs
BASE_URL = "https://www.imsnsit.org/imsnsit/"
LOGIN_PAGE_TITLE = "Student Login"

# Frame names
FRAME_BANNER = "banner"
FRAME_TOP = "top"
FRAME_DATA = "data"

# CAPTCHA file
CAPTCHA_IMG_PATH = "assets/captcha.png"

# Timeouts
SHORT_WAIT = 3
LONG_WAIT = 10

# Platform Commands
PLATFORM_OPEN_COMMANDS = {
    "Windows": lambda path: os.startfile(path),
    "Darwin": lambda path: subprocess.call(["open", path]),
    "Linux": lambda path: subprocess.call(["xdg-open", path])
}

# Load environment variables from `.env` file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL")

    # Add more config values as needed, for example:
    # DB_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

settings = Settings()

