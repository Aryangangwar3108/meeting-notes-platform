from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud, models

router = APIRouter()

@router.get("/meetings/{meeting_id}/transcript", response_model=List[schemas.TranscriptSegment])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    # Verify meeting exists
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return crud.get_transcript_segments(db, meeting_id)

@router.post("/meetings/{meeting_id}/transcript", response_model=List[schemas.TranscriptSegment])
def create_transcript(meeting_id: int, transcript_text: str, db: Session = Depends(get_db)):
    # Verify meeting exists
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Clear existing transcript
    db.query(models.TranscriptSegment).filter(
        models.TranscriptSegment.meeting_id == meeting_id
    ).delete()
    
    # Parse and add new transcript
    crud.parse_and_add_transcript(db, meeting_id, transcript_text)
    
    return crud.get_transcript_segments(db, meeting_id)
