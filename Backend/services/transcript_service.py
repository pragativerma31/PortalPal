from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from Backend.utils.frame_switch import switch_frame
from Backend.core.config import FRAME_TOP,FRAME_BANNER


def view_transcript(driver: WebDriver) -> list:
    # Save original window handle before any frame operations
    driver.switch_to.default_content()  # Ensure we're at the top level
    original_window = driver.current_window_handle  # Store original window handle
    
    try:
        switch_frame(driver , FRAME_BANNER)
        switch_frame(driver,FRAME_TOP)
        # 1. Open tab and switch
        transcript_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Student Transcript"))
        )
        transcript_link.click()
        WebDriverWait(driver, 5).until(lambda d: len(d.window_handles) > 1)
        driver.switch_to.window(driver.window_handles[-1])
        print("[✓] Switched to new transcript tab")


        # 3. Extract subject table
        tables = driver.find_elements(By.XPATH, "//table[@class='y' and @border='1']")
        if len(tables) < 2:
            raise Exception("Expected at least two tables for subjects and SGPA summary")

        subject_table = tables[0]
        summary_table = tables[1]

        semesters = []
        current_sem = None
        rows = subject_table.find_elements(By.TAG_NAME, "tr")

        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) < 9:
                continue

            sem = cells[4].text.strip()
            if not sem or sem.lower() == "sem":
                continue

            if not current_sem or current_sem["semester"] != sem:
                if current_sem:
                    semesters.append(current_sem)
                current_sem = {
                    "semester": sem,
                    "SGPA": None,  # We'll fill this next
                    "subjects": []
                }

            current_sem["subjects"].append({
                "paper_name": cells[2].text.strip(),
                "credit": cells[5].text.strip(),
                "grade_letter": cells[6].text.strip(),
                "grade_point": cells[7].text.strip(),
                "credit_points": cells[8].text.strip()
            })

        if current_sem:
            semesters.append(current_sem)

        # 4. Match SGPA from the second table
        sgpa_rows = summary_table.find_elements(By.TAG_NAME, "tr")
        for row in sgpa_rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) >= 4:
                sem_label = cells[0].text.strip()
                sgpa = cells[3].text.strip()

                for sem_data in semesters:
                    if sem_data["semester"] == sem_label:
                        sem_data["SGPA"] = sgpa
                        break

        # Switch back to the main window (keep transcript tab open)
        driver.switch_to.window(original_window)
        print("[✓] Returned to main window (transcript tab remains open)")
        
        return semesters

    except Exception as e:
        # Make sure to switch back to main window even if there's an error
        try:
            driver.switch_to.window(original_window)
            print("[✓] Returned to main window after error")
        except Exception as cleanup_error:
            print(f"[DEBUG] Cleanup error: {cleanup_error}")
            pass  # Ignore any errors during cleanup
        raise Exception(f"Transcript scraping failed: {str(e)}")
