from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app import schemas, crud, models

router = APIRouter()

@router.get("", response_model=List[schemas.Meeting])
@router.get("/", response_model=List[schemas.Meeting])
def get_meetings(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    participant: Optional[str] = None,
    date: Optional[str] = Query(None),
    sort: str = "newest",
    db: Session = Depends(get_db)
):
    meetings = crud.get_meetings(db, skip=skip, limit=limit, search=search, participant=participant, date=date, sort=sort)
    
    # Enrich with participant names
    result = []
    for meeting in meetings:
        participants = crud.get_meeting_participants(db, meeting.id)
        participant_names = [p.name for p in participants]
        meeting_dict = {
            "id": meeting.id,
            "title": meeting.title,
            "summary": meeting.summary,
            "date": meeting.date,
            "duration": meeting.duration,
            "created_at": meeting.created_at,
            "updated_at": meeting.updated_at,
            "participants": participant_names
        }
        result.append(schemas.Meeting(**meeting_dict))
    
    return result

@router.get("/{meeting_id}", response_model=schemas.MeetingDetail)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    participants = crud.get_meeting_participants(db, meeting_id)
    participant_names = [p.name for p in participants]
    transcript_segments = crud.get_transcript_segments(db, meeting_id)
    action_items = crud.get_action_items(db, meeting_id)
    topics = crud.get_topics(db, meeting_id)
    
    return schemas.MeetingDetail(
        id=meeting.id,
        title=meeting.title,
        summary=meeting.summary,
        date=meeting.date,
        duration=meeting.duration,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        participants=participant_names,
        transcript_segments=[schemas.TranscriptSegment.model_validate(s) for s in transcript_segments],
        action_items=[schemas.ActionItem.model_validate(a) for a in action_items],
        topics=[schemas.Topic.model_validate(t) for t in topics]
    )

@router.post("", response_model=schemas.Meeting, status_code=201)
@router.post("/", response_model=schemas.Meeting, status_code=201)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    return crud.create_meeting(db, meeting)

@router.put("/{meeting_id}", response_model=schemas.Meeting)
def update_meeting(meeting_id: int, meeting: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    updated_meeting = crud.update_meeting(db, meeting_id, meeting)
    if not updated_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return updated_meeting

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    success = crud.delete_meeting(db, meeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Meeting deleted successfully"}
