from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from Backend.services.login_service import login_and_get_driver
from Backend.utils.session_manager import generate_signed_session_id
from Backend.core.session_storage import session_cache  # ✅ now shared
from Backend.utils.save_and_get_info import get_student_name
from Backend.utils.sem_year_calculator import calculate_semester_and_year , ordinal_suffix

router = APIRouter()


class LoginRequest(BaseModel):
    rollno: str
    password: str

@router.post("/login")
async def login(login_data: LoginRequest, request: Request):
    try:
        # Extract credentials
        rollno = login_data.rollno
        password = login_data.password
        
        # Call scraper and get driver and result
        login_result = login_and_get_driver(
            rollno=rollno,
            password=password
        )
        
        driver = login_result["driver"]
        student_info = login_result["student_info"]
        
        # Clear password from memory after use
        password_value = password
        login_data.password = None  # Clear from the model
        password = None  # Clear the local variable
        del password_value
        
        # Create and sign session ID
        signed_session_id = generate_signed_session_id()
        raw_id = signed_session_id.split(".")[0]

        # Store driver in session cache
        session_cache[raw_id] = {
            "driver": driver,
            "roll_no": login_data.rollno,  # Changed rollno to roll_no for consistency
            "student_info": student_info,
            "ip": request.client.host,
            "user_agent": request.headers.get("user-agent")
        }

        semester,year  = calculate_semester_and_year(login_data.rollno)
        formatted_semester = ordinal_suffix(semester)
        student_name = get_student_name(login_data.rollno) or "Student"

        return {
            "status": "success",
            "session_id": signed_session_id,
            "name": student_name,
            "sem": formatted_semester,
            "message": f"Welcome {student_name}! You are logged in successfully.",
        }

    except Exception as e:
        # Ensure no password information is included in error messages
        error_message = str(e)
        # In case the password somehow ended up in the error message
        if hasattr(login_data, 'password') and login_data.password:
            error_message = error_message.replace(login_data.password, '********')
        
        # Clear any password that might still be in memory
        if 'password' in locals() and password is not None:
            password = None
        if hasattr(login_data, 'password') and login_data.password is not None:
            login_data.password = None
            
        raise HTTPException(status_code=500, detail=error_message)
