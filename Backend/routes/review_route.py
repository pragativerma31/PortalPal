# routes/review_route.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from Backend.core.db import SessionLocal
from Backend.models.student_info import StudentReview
from Backend.core.session_storage import session_cache

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_session_data(session_id: str):
    """Get session data from cache"""
    try:
        # Extract the raw session ID (before the signature)
        raw_session_id = session_id.split(".")[0]
        return session_cache.get(raw_session_id)
    except Exception:
        return None

class ReviewRequest(BaseModel):
    rating: float
    review: str

class ReviewCheckResponse(BaseModel):
    has_reviewed: bool

@router.get("/check-review/{session_id}", response_model=ReviewCheckResponse)
async def check_if_reviewed(session_id: str, db: Session = Depends(get_db)):
    """Check if the user has already submitted a review"""
    try:
        # Get session data to find roll number
        session_data = get_session_data(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        roll_no = session_data.get("roll_no")
        if not roll_no:
            raise HTTPException(status_code=400, detail="Roll number not found in session")
        
        # Check if review exists for this roll number
        existing_review = db.query(StudentReview).filter(StudentReview.rollno == roll_no).first()
        
        return ReviewCheckResponse(has_reviewed=existing_review is not None)
        
    except Exception as e:
        print(f"Error checking review status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/submit-review/{session_id}")
async def submit_review(session_id: str, review_data: ReviewRequest, db: Session = Depends(get_db)):
    """Submit a new review"""
    try:
        # Get session data to find user info
        session_data = get_session_data(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        roll_no = session_data.get("roll_no")
        if not roll_no:
            raise HTTPException(status_code=400, detail="Roll number not found in session")
        
        # Check if user has already reviewed
        existing_review = db.query(StudentReview).filter(StudentReview.rollno == roll_no).first()
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already submitted a review")
        
        # Get student info from session or database
        student_info = session_data.get("student_info", {})
        name = student_info.get("student_name", "Unknown")
        branch = student_info.get("branch_name", "Unknown")
        specialization = student_info.get("specialization", "")
        
        # Create new review
        new_review = StudentReview(
            rollno=roll_no,
            name=name,
            branch=branch,
            specialization=specialization,
            ratings=review_data.rating,
            review=review_data.review
        )
        
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        
        return {"message": "Review submitted successfully", "review_id": new_review.id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting review: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit review")
