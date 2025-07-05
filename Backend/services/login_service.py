
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from Backend.utils.driver_setup import create_driver
from Backend.controllers.selector import select_functions
from Backend.auth.login_flow import login_the_student

def login_and_get_driver(rollno: str, password: str):
    driver = create_driver()
    try:
        # Call login function with credentials
        result = login_the_student(driver, rollno, password)
        
        if not result or not result.get("success"):
            error_details = result.get("error", "Unknown error") if result else "No result returned"
            raise Exception(f"Login function failed: {error_details}")
        
        # Extract student info from result
        student_info = result.get("student_info", {})
        
        # Clear password from memory immediately after use
        password_value = password
        password = None
        del password_value
        
        select_functions(driver)
        return {"driver": driver, "student_info": student_info}
    except Exception as e:
        # Ensure driver is closed if login fails
        try:
            driver.quit()
        except:
            pass  # Ignore errors when closing driver
            
        error_msg = str(e)
        print(f"[DEBUG] Login error: {error_msg}")
        
        # Check for CAPTCHA-specific failures
        if "CAPTCHA_FAILED" in error_msg:
            raise Exception("Our CAPTCHA prediction failed. We're refining our models - please try again!")
        elif "LOGIN_FAILED" in error_msg:
            raise Exception("Login failed. Please check your credentials and try again.")
        else:
            # For any other error, provide a generic message
            raise Exception(f"Login failed: {error_msg}")
    finally:
        # Ensure password is cleared even if an exception occurs
        if 'password' in locals() and password is not None:
            password = None

