from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud

router = APIRouter()

@router.get("/meetings/{meeting_id}/topics", response_model=List[schemas.Topic])
def get_topics(meeting_id: int, db: Session = Depends(get_db)):
    # Verify meeting exists
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return crud.get_topics(db, meeting_id)

@router.post("/meetings/{meeting_id}/topics", response_model=schemas.Topic, status_code=201)
def create_topic(meeting_id: int, topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    # Verify meeting exists
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return crud.create_topic(db, topic, meeting_id)
