# create_tables.py
from Backend.core.db import engine
from Backend.models.student_info import Base


Base.metadata.create_all(bind=engine)
print("✅ Tables created.")
