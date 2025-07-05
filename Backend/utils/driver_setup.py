# driver_setup.py

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def create_driver(headless=False):
    """Initializes and returns a Chrome WebDriver instance."""

    options = Options()
    options.headless = headless
    options.add_argument("--disable-logging")
    options.add_argument("--log-level=3")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-infobars")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1200, 800)

    return driver
