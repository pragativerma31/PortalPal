from selenium.webdriver.chrome.webdriver import WebDriver

def switch_frame(driver: WebDriver, frame_name: str, silent=False):
    try:
        driver.switch_to.default_content()
        driver.switch_to.frame(frame_name)
        if not silent:
            print(f"[✓] Switched to frame '{frame_name}'")
    except Exception as e:
        print(f"[x] Could not switch to frame '{frame_name}':", e)
