from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, timedelta
from app import models, schemas


def normalize_participant_emails(emails: Optional[List[str]]) -> List[str]:
    if not emails:
        return []

    normalized: List[str] = []
    seen = set()

    for raw in emails:
        value = (raw or '').strip()
        if not value:
            continue
        if '@' not in value or value.count('@') != 1:
            raise ValueError(f"Invalid participant email: {raw}")
        local_part, domain = value.split('@', 1)
        if not local_part or not domain or '.' not in domain:
            raise ValueError(f"Invalid participant email: {raw}")

        lower_value = value.lower()
        if lower_value in seen:
            continue
        seen.add(lower_value)
        normalized.append(value)

    return normalized


def serialize_meeting(db: Session, meeting: models.Meeting) -> schemas.Meeting:
    participants = get_meeting_participants(db, meeting.id)
    return schemas.Meeting(
        id=meeting.id,
        title=meeting.title,
        summary=meeting.summary,
        date=meeting.date,
        duration=meeting.duration,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        participants=[participant.name for participant in participants],
    )

# Meeting CRUD
def get_meeting(db: Session, meeting_id: int):
    return db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()

def get_meetings(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    participant: Optional[str] = None,
    date: Optional[str] = None,
    sort: str = "newest"
):
    query = db.query(models.Meeting)
    
    if search:
        query = query.filter(
            or_(
                models.Meeting.title.ilike(f"%{search}%"),
                models.Meeting.summary.ilike(f"%{search}%")
            )
        )
    
    if participant:
        query = query.join(models.MeetingParticipant).join(models.Participant).filter(
            models.Participant.name.ilike(f"%{participant}%")
        )

    if date:
        try:
            selected_date = datetime.strptime(date, "%Y-%m-%d")
            next_day = selected_date + timedelta(days=1)
            query = query.filter(models.Meeting.date >= selected_date, models.Meeting.date < next_day)
        except ValueError:
            pass
    
    if sort == "newest":
        query = query.order_by(models.Meeting.date.desc())
    elif sort == "oldest":
        query = query.order_by(models.Meeting.date.asc())
    
    return query.offset(skip).limit(limit).all()

def create_meeting(db: Session, meeting: schemas.MeetingCreate):
    normalized_emails = normalize_participant_emails(meeting.participant_emails)

    db_meeting = models.Meeting(
        title=meeting.title,
        summary=meeting.summary,
        date=meeting.date,
        duration=meeting.duration
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    # Add participants
    for email in normalized_emails:
        participant = db.query(models.Participant).filter(
            models.Participant.email == email.lower()
        ).first()
        if not participant:
            participant = models.Participant(
                name=email.split("@")[0].replace('.', ' ').title(),
                email=email.lower()
            )
            db.add(participant)
            db.commit()
            db.refresh(participant)
        
        existing_link = db.query(models.MeetingParticipant).filter(
            models.MeetingParticipant.meeting_id == db_meeting.id,
            models.MeetingParticipant.participant_id == participant.id,
        ).first()
        if not existing_link:
            meeting_participant = models.MeetingParticipant(
                meeting_id=db_meeting.id,
                participant_id=participant.id
            )
            db.add(meeting_participant)
    
    # Parse and add transcript if provided
    if meeting.transcript:
        parse_and_add_transcript(db, db_meeting.id, meeting.transcript)
    
    db.commit()
    db.refresh(db_meeting)
    return serialize_meeting(db, db_meeting)

def update_meeting(db: Session, meeting_id: int, meeting: schemas.MeetingUpdate):
    db_meeting = get_meeting(db, meeting_id)
    if not db_meeting:
        return None
    
    update_data = meeting.model_dump(exclude_unset=True)
    
    if "participant_emails" in update_data:
        participant_values = []
        seen_values = set()
        for raw in update_data["participant_emails"] or []:
            value = (raw or '').strip()
            if not value:
                continue
            key = value.lower()
            if key not in seen_values:
                seen_values.add(key)
                participant_values.append(value)

        db.query(models.MeetingParticipant).filter(
            models.MeetingParticipant.meeting_id == meeting_id
        ).delete()
        
        for value in participant_values:
            if '@' in value:
                email = normalize_participant_emails([value])[0]
                participant = db.query(models.Participant).filter(
                    models.Participant.email == email.lower()
                ).first()
                if not participant:
                    participant = models.Participant(
                        name=email.split("@")[0].replace('.', ' ').title(),
                        email=email.lower()
                    )
                    db.add(participant)
                    db.commit()
                    db.refresh(participant)
            else:
                participant = db.query(models.Participant).filter(
                    models.Participant.name.ilike(value)
                ).first()
                if not participant:
                    raise ValueError(f"Unknown participant: {value}")
            
            meeting_participant = models.MeetingParticipant(
                meeting_id=meeting_id,
                participant_id=participant.id
            )
            db.add(meeting_participant)
        
        del update_data["participant_emails"]
    
    for field, value in update_data.items():
        setattr(db_meeting, field, value)
    
    db.commit()
    db.refresh(db_meeting)
    return serialize_meeting(db, db_meeting)

def delete_meeting(db: Session, meeting_id: int):
    db_meeting = get_meeting(db, meeting_id)
    if not db_meeting:
        return False
    
    db.delete(db_meeting)
    db.commit()
    return True

# Transcript CRUD
def get_transcript_segments(db: Session, meeting_id: int):
    return db.query(models.TranscriptSegment).filter(
        models.TranscriptSegment.meeting_id == meeting_id
    ).order_by(models.TranscriptSegment.start_time).all()

def create_transcript_segment(db: Session, segment: schemas.TranscriptSegmentCreate, meeting_id: int):
    db_segment = models.TranscriptSegment(
        meeting_id=meeting_id,
        **segment.model_dump()
    )
    db.add(db_segment)
    db.commit()
    db.refresh(db_segment)
    return db_segment

def parse_and_add_transcript(db: Session, meeting_id: int, transcript_text: str):
    """Parse a simple transcript format and add segments"""
    lines = transcript_text.strip().split('\n')
    current_speaker = None
    current_text = []
    start_time = 0.0
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if line is a timestamp/speaker line (e.g., "00:12 Sarah")
        if ':' in line and any(c.isdigit() for c in line):
            # Save previous segment if exists
            if current_speaker and current_text:
                create_transcript_segment(db, schemas.TranscriptSegmentCreate(
                    speaker=current_speaker,
                    text=' '.join(current_text),
                    start_time=start_time,
                    end_time=start_time + 30  # Estimate 30 seconds per segment
                ), meeting_id)
                current_text = []
            
            # Parse new speaker
            parts = line.split(maxsplit=1)
            if len(parts) == 2:
                time_str, speaker = parts
                try:
                    # Parse timestamp (MM:SS or HH:MM:SS)
                    time_parts = time_str.split(':')
                    if len(time_parts) == 2:
                        start_time = int(time_parts[0]) * 60 + int(time_parts[1])
                    elif len(time_parts) == 3:
                        start_time = int(time_parts[0]) * 3600 + int(time_parts[1]) * 60 + int(time_parts[2])
                    current_speaker = speaker
                except ValueError:
                    current_text.append(line)
        else:
            if current_speaker:
                current_text.append(line)
            else:
                current_text.append(line)
    
    # Save last segment
    if current_speaker and current_text:
        create_transcript_segment(db, schemas.TranscriptSegmentCreate(
            speaker=current_speaker,
            text=' '.join(current_text),
            start_time=start_time,
            end_time=start_time + 30
        ), meeting_id)
    
    db.commit()

# Action Item CRUD
def get_action_items(db: Session, meeting_id: int):
    return db.query(models.ActionItem).filter(
        models.ActionItem.meeting_id == meeting_id
    ).all()

def get_action_item(db: Session, action_item_id: int):
    return db.query(models.ActionItem).filter(
        models.ActionItem.id == action_item_id
    ).first()

def create_action_item(db: Session, action_item: schemas.ActionItemCreate, meeting_id: int):
    db_action_item = models.ActionItem(
        meeting_id=meeting_id,
        **action_item.model_dump()
    )
    db.add(db_action_item)
    db.commit()
    db.refresh(db_action_item)
    return db_action_item

def update_action_item(db: Session, action_item_id: int, action_item: schemas.ActionItemUpdate):
    db_action_item = get_action_item(db, action_item_id)
    if not db_action_item:
        return None
    
    update_data = action_item.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_action_item, field, value)
    
    db.commit()
    db.refresh(db_action_item)
    return db_action_item

def delete_action_item(db: Session, action_item_id: int):
    db_action_item = get_action_item(db, action_item_id)
    if not db_action_item:
        return False
    
    db.delete(db_action_item)
    db.commit()
    return True

# Topic CRUD
def get_topics(db: Session, meeting_id: int):
    return db.query(models.Topic).filter(
        models.Topic.meeting_id == meeting_id
    ).order_by(models.Topic.timestamp).all()

def create_topic(db: Session, topic: schemas.TopicCreate, meeting_id: int):
    db_topic = models.Topic(
        meeting_id=meeting_id,
        **topic.model_dump()
    )
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def get_meeting_participants(db: Session, meeting_id: int):
    return db.query(models.Participant).join(models.MeetingParticipant).filter(
        models.MeetingParticipant.meeting_id == meeting_id
    ).all()
