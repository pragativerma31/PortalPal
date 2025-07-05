# attendance/attendance_flow.py

from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import html  # Import html module for unescaping HTML entities


from Backend.utils.frame_switch import switch_frame
from Backend.core.config import FRAME_DATA,FRAME_TOP,FRAME_BANNER
from Backend.templates.attendance_template import get_attendance_block
from Backend.utils.sem_year_calculator import calculate_semester_and_year
from Backend.controllers.subject_wise_attendance import extract_daily_attendance

def view_attendance(driver: WebDriver,rollno):
    # Step 0: Ensure we start from the correct context
    try:
        driver.switch_to.default_content()  # Reset to top-level frame
        print("[✓] Reset to default content")
    except Exception as e:
        print("⚠️ Could not reset to default content:", e)
    
    # Step 13: Click on "My Attendance"
    try:
        switch_frame(driver, FRAME_BANNER,False)
        switch_frame(driver, FRAME_TOP,False)
        # "My Attendance" link contains a span, so we look for the span
        attendance_link = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.XPATH, "//span[text()='My Attendance']/.."))
        )
        attendance_link.click()
        print("[✓] Clicked on 'My Attendance'")
    except Exception as e:
        print("⚠️ Could not click 'My Attendance':", e)
        # If we can't find My Attendance, try to navigate back to the main portal area
        try:
            driver.switch_to.default_content()
            switch_frame(driver, FRAME_BANNER, False)
            # Try to find and click "My Activities" first to get back to the right context
            activities_link = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "My Activities"))
            )
            activities_link.click()
            print("[✓] Clicked on 'My Activities' to reset context")
            
            # Now try again for My Attendance
            switch_frame(driver, FRAME_TOP, False)
            attendance_link = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.XPATH, "//span[text()='My Attendance']/.."))
            )
            attendance_link.click()
            print("[✓] Clicked on 'My Attendance' after context reset")
        except Exception as retry_error:
            print("⚠️ Could not recover and click 'My Attendance':", retry_error)
            return

    # Step 1: Switch to "data" frame
    switch_frame(driver, FRAME_DATA,False)

    # Step 2: Select Year and Semester
    try:
        semester, academic_year = calculate_semester_and_year(rollno)
        print(semester,academic_year)
        year_select = Select(WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.ID, "year"))
        ))
        year_select.select_by_visible_text(str(academic_year))  # change as needed
        print("[✓] Selected year")

        sem_select = Select(WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.ID, "sem"))
        ))
        sem_select.select_by_visible_text(str(semester))  # change as needed
        print("[✓] Selected semester")

        submit_button = driver.find_element(By.NAME, "submit")
        submit_button.click()
        print("[✓] Submitted form")

    except Exception as e:
        print("⚠️ Could not select year/semester or submit:", e)
        return

    # Step 3: Extract subject codess
    try:
        subject_row = WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.XPATH, "//tr[@class='plum_head'][2]"))
        )
        subject_tds = subject_row.find_elements(By.TAG_NAME, "td")[1:]
        subject_codes = [td.text.strip() for td in subject_tds if td.text.strip()]
    except Exception as e:
        print("⚠️ Could not extract subject codes:", e)
        return
    
    try:
        first_code = subject_codes[0]
        subject_b = WebDriverWait(driver, 3).until(
            EC.presence_of_element_located(
                (By.XPATH, f"//td[@colspan='7']//b[contains(text(), '{first_code}')]")
            )
        )
        subject_lines = subject_b.get_attribute("innerHTML").split("<br>")

        subject_names = []
        mapped_codes = []

        for line in subject_lines:
            cleaned = line.strip().strip('"')
            if not cleaned:
                continue
            parts = cleaned.split("-", 1)
            if len(parts) == 2:
                code, name = parts
                if code.strip() in subject_codes:
                    mapped_codes.append(code.strip())
                    # Decode HTML entities in the subject name (convert &amp; to & etc.)
                    decoded_name = html.unescape(name.strip())
                    subject_names.append(decoded_name)

        # Ensure alignment (for debugging)
        print("[✓] Extracted subject names:", subject_names)

    except Exception as e:
        print("⚠️ Could not extract subject names using codes:", e)
        return

    # Step 4: Extract attendance rows
    def extract_row_values(label_contains):
        xpath = f"//tr[@class='plum_head'][td[1][contains(normalize-space(.), '{label_contains}')]]/td[position()>1]"
        tds = driver.find_elements(By.XPATH, xpath)
        return [int(td.text.strip()) for td in tds if td.text.strip().isdigit()]

    try:
        total_classes = extract_row_values("Overall Class")
        absents = extract_row_values("Overall Absent")
        presents = extract_row_values("Overall Present")

        daily_attendance_log = extract_daily_attendance(driver, subject_codes)
        summary = get_attendance_block(subject_codes,subject_names, total_classes, absents, presents,daily_attendance_log)
        return summary

    except Exception as e:
        print("⚠️ Error extracting attendance data:", e)
