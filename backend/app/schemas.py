from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# Meeting Schemas
class MeetingBase(BaseModel):
    title: str
    summary: Optional[str] = None
    date: datetime
    duration: int

class MeetingCreate(MeetingBase):
    participant_emails: List[str] = []
    transcript: Optional[str] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[int] = None
    participant_emails: Optional[List[str]] = None

class Meeting(MeetingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    participants: List[str] = []  # Will be populated with participant names

    class Config:
        from_attributes = True

# Participant Schemas
class ParticipantBase(BaseModel):
    name: str
    email: str

class ParticipantCreate(ParticipantBase):
    pass

class Participant(ParticipantBase):
    id: int

    class Config:
        from_attributes = True

# Transcript Segment Schemas
class TranscriptSegmentBase(BaseModel):
    speaker: str
    text: str
    start_time: float
    end_time: float

class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass

class TranscriptSegment(TranscriptSegmentBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True

# Action Item Schemas
class ActionItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool = False

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None

class ActionItem(ActionItemBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Topic Schemas
class TopicBase(BaseModel):
    title: str
    timestamp: float

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True

# Meeting Detail Response
class MeetingDetail(Meeting):
    transcript_segments: List[TranscriptSegment] = []
    action_items: List[ActionItem] = []
    topics: List[Topic] = []
