# models/student.py
from sqlalchemy import Column, String, Integer, Text, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class StudentUser(Base):
    __tablename__ = "student_users"

    rollno = Column(String, primary_key=True)
    student_name = Column(String)
    branch_name = Column(String)
    degree = Column(String)
    ft_pt = Column(String)
    specialization = Column(String)
    section = Column(String)
    visits = Column(Integer, default=1)


class StudentReview(Base):
    __tablename__ = "students_review"

    id = Column(Integer, primary_key=True, autoincrement=True)  # Auto-increment primary key
    rollno = Column(String, nullable=False)
    name = Column(String, nullable=False)
    branch = Column(String, nullable=False)
    specialization = Column(String)
    ratings = Column(Float, nullable=False)  # Using Float for decimal ratings (e.g., 4.5)
    review = Column(Text)  # Using Text for longer review content
