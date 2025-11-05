from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import StoryCreate, StoryResponse, StoryResponseWithComments, CommentCreate, CommentResponse
from app.models import User
from app.crud import story as crud_story, comment as crud_comment

router = APIRouter()

@router.get(
    "/stories", 
    response_model=List[StoryResponse],
    summary="스토리 목록 조회"
)
def read_stories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """
    커뮤니티의 모든 스토리 목록을 조회합니다.
    """
    stories = crud_story.get_stories(db, skip=skip, limit=limit)
    return stories


@router.post(
    "/stories", 
    response_model=StoryResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="스토리 작성"
)
def create_story(
    story_in: StoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    새로운 스토리를 작성합니다.
    """
    return crud_story.create_story(
        db=db, 
        story=story_in, 
        user_id=current_user.id,
        author_name=current_user.nickname
    )


@router.get(
    "/stories/{story_id}", 
    response_model=StoryResponseWithComments, # (댓글 포함 스키마)
    summary="스토리 상세 조회"
)
def read_story(
    story_id: str, 
    db: Session = Depends(get_db)
):
    """
    특정 스토리의 상세 내용과 모든 댓글을 함께 조회합니다.
    """
    db_story = crud_story.get_story(db, story_id=story_id)
    if db_story is None:
        raise HTTPException(status_code=404, detail="스토리를 찾을 수 없습니다.")
    return db_story


@router.post(
    "/stories/{story_id}/comments", 
    response_model=CommentResponse,
    summary="댓글 작성"
)
def create_comment_for_story(
    story_id: str,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    특정 스토리에 새로운 댓글을 작성합니다.
    """
    # (스토리가 존재하는지 확인하는 로직 추가)
    return crud_comment.create_comment(
        db=db, 
        comment=comment_in, 
        story_id=story_id, 
        user_id=current_user.id,
        author_nickname=current_user.nickname
    )

# ... (스토리 수정/삭제, 댓글 삭제, 좋아요 기능, 뉴스레터 조회 등 라우터) ...