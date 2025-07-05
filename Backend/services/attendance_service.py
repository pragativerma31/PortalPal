
from Backend.controllers.attendance_handler import view_attendance

def get_attendance(driver, rollno):
    return view_attendance(driver, rollno)
