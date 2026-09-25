from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud

router = APIRouter()

@router.get("/meetings/{meeting_id}/action-items", response_model=List[schemas.ActionItem])
def get_action_items(meeting_id: int, db: Session = Depends(get_db)):
    # Verify meeting exists
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return crud.get_action_items(db, meeting_id)

@router.post("/meetings/{meeting_id}/action-items", response_model=schemas.ActionItem, status_code=201)
def create_action_item(meeting_id: int, action_item: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    # Verify meeting exists
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return crud.create_action_item(db, action_item, meeting_id)

@router.put("/action-items/{action_item_id}", response_model=schemas.ActionItem)
def update_action_item(action_item_id: int, action_item: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    updated_item = crud.update_action_item(db, action_item_id, action_item)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Action item not found")
    return updated_item

@router.delete("/action-items/{action_item_id}")
def delete_action_item(action_item_id: int, db: Session = Depends(get_db)):
    success = crud.delete_action_item(db, action_item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Action item not found")
    return {"message": "Action item deleted successfully"}
