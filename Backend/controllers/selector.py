from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from Backend.utils.frame_switch import switch_frame
from Backend.core.config import FRAME_TOP
from Backend.controllers.attendance_handler import view_attendance


def select_functions(driver: WebDriver):

    # Step 1: Switch to 'top' frame
    switch_frame(driver,FRAME_TOP,False )

    # Step 2: Click "Expand All"
    try:
        expand_all_link = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.LINK_TEXT, "Expand All"))
        )
        expand_all_link.click()
        print("[✓] Clicked on 'Expand All'")
    except Exception as e:
        print("⚠️ Could not click 'Expand All':", e)


