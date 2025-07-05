# login_flow.py
import time
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from Backend.controllers.captcha_handler import handle_captcha
from Backend.core.config import FRAME_BANNER,FRAME_TOP
from Backend.utils.frame_switch import switch_frame
from Backend.utils.save_and_get_info import save_student_info



def login_the_student(driver: WebDriver, roll, password):
    try:
        # Step 1: Go to NSUT home page
        driver.get("https://www.imsnsit.org/imsnsit/")
        print("[✓] Opened NSUT homepage")

        # Step 2: Click on "Student Login"
        WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.LINK_TEXT, "Student Login"))
        ).click()
        print("[✓] Clicked on 'Student Login'")

        # Step 3: Switch to banner frame
        switch_frame(driver, FRAME_BANNER,False)


        # Step 4: Fill in Roll No and Password
        WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "uid")))
        driver.find_element(By.ID, "uid").send_keys(roll)
        driver.find_element(By.ID, "pwd").send_keys(password)
        print("[✓] Entered credentials")

        # Step 5: CAPTCHA
        captcha_text = handle_captcha(driver)
        if not captcha_text:
            raise Exception("CAPTCHA not entered properly")

        driver.find_element(By.ID, "cap").send_keys(captcha_text)
        driver.find_element(By.ID, "login").click()
        print("[✓] Submitted login")

        # Step 6: Check if login successful
        time.sleep(1)
        if "Profile" in driver.page_source or "My Activities" in driver.page_source:
            print("✅ Login Successful!")
            # Step 7: Switch to correct frame again (if needed)
            switch_frame(driver, FRAME_BANNER,False)

        else:
            # print("❌ Login Failed — Check credentials or captcha")
            driver.quit()
            return {
                "success": False,
                "error": "LOGIN_FAILED"
            }
        

        # Step 7.1: Click on "My Profile"
        profile_link = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.LINK_TEXT, "My Profile"))
        )
        profile_link.click()
        print("[✓] Clicked on 'My Profile'")

        # Step 7.2: Switch to profile frame (outer + inner)
        switch_frame(driver, FRAME_TOP,False)

        print("[✓] Switched to profile frames")

        # Step 7.3: Extract full student info
        info_rows = driver.find_elements(By.XPATH, "//tr[th and td]")

        student_info = {}
        for row in info_rows:
            try:
                key = row.find_element(By.TAG_NAME, "th").text.strip().lower().replace(" ", "_")
                value = row.find_element(By.TAG_NAME, "td").text.strip()
                student_info[key] = value
            except:
                continue

        print("[✓] Extracted Full Student Info:", student_info)
        save_student_info(student_info)


        switch_frame(driver,FRAME_BANNER,False)

        
        # Step 8: Click on "My Activities"
        
        # Primary: Link text
        my_activities_link = WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.LINK_TEXT, "My Activities"))
        )

        my_activities_link.click()
        print("[✓] Clicked on 'My Activities'")
        
        # Return success with student info
        return {
            "success": True,
            "student_info": student_info
        }
    

    except Exception as e:
        print(f"❌ Some Error occurred: {e}")
        return {
            "success": False,
            "error": str(e)
        }






