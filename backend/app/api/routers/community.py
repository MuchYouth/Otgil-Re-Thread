from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.schemas import (
    StoryCreate, StoryResponse, StoryResponseWithComments, StoryUpdate,
    CommentCreate, CommentResponse,
    PerformanceReportCreate, PerformanceReportResponse
)
from app.models import User
from app.crud import story as crud_story, comment as crud_comment

router = APIRouter()

# --- Stories ---

@router.get("/stories", response_model=List[StoryResponse], summary="스토리 목록 조회")
def read_stories(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return crud_story.get_stories(db, skip=skip, limit=limit)

@router.post("/stories", response_model=StoryResponse, status_code=status.HTTP_201_CREATED, summary="스토리 작성")
def create_story(
    story_in: StoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_story.create_story(
        db=db, 
        story=story_in, 
        user_id=current_user.id,
        author_nickname=current_user.nickname 
    )

@router.get("/stories/{story_id}", response_model=StoryResponseWithComments, summary="스토리 상세 조회")
def read_story(
    story_id: str, 
    db: Session = Depends(get_db)
):
    db_story = crud_story.get_story(db, story_id=story_id)
    if db_story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    return db_story

@router.patch("/stories/{story_id}", response_model=StoryResponse, summary="스토리 수정")
def update_story(
    story_id: str,
    story_in: StoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_story = crud_story.get_story(db, story_id=story_id)
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")
    if db_story.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    return crud_story.update_story(db=db, db_story=db_story, story_in=story_in)

@router.delete("/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT, summary="스토리 삭제")
def delete_story(
    story_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_story = crud_story.get_story(db, story_id=story_id)
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    if db_story.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    crud_story.delete_story(db, story_id)
    return

@router.post("/stories/{story_id}/like", response_model=StoryResponse, summary="스토리 좋아요 토글")
def like_story(
    story_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_story = crud_story.toggle_like(db, story_id=story_id, user_id=current_user.id)
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")
    return db_story

# --- Comments ---

@router.post("/stories/{story_id}/comments", response_model=CommentResponse, summary="댓글 작성")
def create_comment(
    story_id: str,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_comment.create_comment(
        db=db, 
        comment=comment_in, 
        story_id=story_id, 
        user_id=current_user.id,
        author_nickname=current_user.nickname
    )

# --- Reports (Newsletters) ---

@router.get("/reports", response_model=List[PerformanceReportResponse], summary="뉴스레터 목록 조회")
def read_reports(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return crud_story.get_reports(db, skip=skip, limit=limit)

@router.post("/reports", response_model=PerformanceReportResponse, status_code=status.HTTP_201_CREATED, summary="뉴스레터 작성 (관리자용)")
def create_report(
    report_in: PerformanceReportCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    return crud_story.create_report(db, report_in)