from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import StoryCreate, StoryResponse, StoryResponseWithComments
from app.models import User
from app.crud import story as crud_story

router = APIRouter()

@router.get("/", response_model=List[StoryResponse], summary="커뮤니티 스토리 목록 조회")
def read_stories(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """최신 스토리 목록을 조회합니다."""
    return crud_story.get_stories(db, skip=skip, limit=limit)

@router.post("/", response_model=StoryResponse, status_code=status.HTTP_201_CREATED, summary="스토리 작성")
def create_story(
    story_in: StoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """파티 후기 등 스토리를 작성합니다."""
    return crud_story.create_story(db=db, story=story_in, user_id=current_user.id, author_nickname=current_user.nickname)

@router.get("/{story_id}", response_model=StoryResponseWithComments, summary="스토리 상세 조회")
def read_story(story_id: str, db: Session = Depends(get_db)):
    """스토리 상세 내용과 댓글을 조회합니다."""
    story = crud_story.get_story(db, story_id=story_id)
    if not story:
        raise HTTPException(status_code=404, detail="스토리를 찾을 수 없습니다.")
    return story

@router.post("/{story_id}/like", response_model=StoryResponse, summary="스토리 좋아요 토글")
def like_story(
    story_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """스토리에 좋아요를 누르거나 취소합니다."""
    story = crud_story.toggle_like(db, story_id=story_id, user_id=current_user.id)
    if not story:
        raise HTTPException(status_code=404, detail="스토리를 찾을 수 없습니다.")
    return story

@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT, summary="스토리 삭제")
def delete_story(
    story_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    story = crud_story.get_story(db, story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Not found")
    if story.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")
    
    crud_story.delete_story(db, story_id)
    return