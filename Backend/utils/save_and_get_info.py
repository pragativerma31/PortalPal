# utils/save_student.py
from Backend.core.db import SessionLocal
from Backend.models.student_info import StudentUser

from Backend.models.student_info import StudentUser

def get_student_name(roll_number: str):
    db = SessionLocal()
    try:
        student = db.query(StudentUser).filter(StudentUser.rollno == roll_number).first()
        if student:
            return student.student_name
    finally:
        db.close()
    return None


def save_student_info(info: dict):
    db = SessionLocal()
    try:
        existing = db.query(StudentUser).filter_by(rollno=info.get("student_id")).first()

        if existing:
            existing.visits += 1
        else:
            # Insert new student
            student = StudentUser(
                rollno=info.get("student_id"),
                student_name=info.get("student_name"),
                branch_name=info.get("branch_name"),
                degree=info.get("degree"),
                ft_pt=info.get("ft/pt"),
                specialization=info.get("specialization"),
                section=info.get("section"),
                visits=1
            )
            db.add(student)

        db.commit()
        print("✅ Student info saved with visit count.")
    except Exception as e:
        print(f"❌ Error saving student: {e}")
        db.rollback()
    finally:
        db.close()