import uuid
from sqlalchemy.orm import Session

from app.models import Comment, Story
from app.schemas import CommentCreate

def create_comment(db: Session, comment: CommentCreate, story_id: str, user_id: str, author_nickname: str) -> Comment | None:
    """
    특정 스토리에 새로운 댓글을 작성합니다.
    CommentCreate 스키마는 'text'와 'story_id'를 포함하지만,
    'story_id'는 URL 경로에서 받는 값을 우선 사용합니다.
    """
    
    # 스토리가 존재하는지 먼저 확인
    db_story = db.query(Story).filter(Story.id == story_id).first()
    if not db_story:
        return None # API 레벨에서 404 처리

    db_comment = Comment(
        id=str(uuid.uuid4()),
        text=comment.text, # 스키마에서 'text'를 가져옴
        story_id=story_id, # URL 경로의 story_id
        user_id=user_id,
        author_nickname=author_nickname
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment