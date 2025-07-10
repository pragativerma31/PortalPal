# driver_setup.py

import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def create_driver(headless=None):
    """Initializes and returns a Chrome WebDriver instance."""
    
    # Auto-detect if we should run headless based on environment
    if headless is None:
        # Run headless in production environments
        headless = os.getenv("ENVIRONMENT", "development") == "production"

    options = Options()
    options.headless = headless
    
    # Basic Chrome options
    options.add_argument("--disable-logging")
    options.add_argument("--log-level=3")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-infobars")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    
    # Production-specific options for containerized environments
    if os.getenv("ENVIRONMENT") == "production":
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--remote-debugging-port=9222")

    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1200, 800)

    return driver
