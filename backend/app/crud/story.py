import uuid
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.models import Story, User, Tag
from app.schemas import StoryCreate, StoryUpdate

def get_stories(db: Session, skip: int = 0, limit: int = 20) -> List[Story]:
    """최신순으로 스토리 목록을 조회합니다."""
    return db.query(Story).order_by(desc(Story.id)).offset(skip).limit(limit).all()

def get_story(db: Session, story_id: str) -> Story | None:
    """ID로 스토리 상세 정보를 조회합니다."""
    return db.query(Story).filter(Story.id == story_id).first()

def create_story(db: Session, story: StoryCreate, user_id: str, author_nickname: str) -> Story:
    """새로운 스토리를 작성합니다. 태그 처리 로직을 포함합니다."""
    
    # 1. 스토리 객체 생성
    db_story = Story(
        id=str(uuid.uuid4()),
        user_id=user_id,
        author=author_nickname,
        party_id=story.party_id,
        title=story.title,
        excerpt=story.excerpt,
        content=story.content,
        image_url=story.image_url
    )

    # 2. 태그 처리 (Tags는 M2M 관계)
    if story.tags:
        for tag_name in story.tags:
            # 태그가 이미 존재하면 가져오고, 없으면 생성
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag) # 새 태그 등록
            db_story.tags.append(tag)

    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story

def toggle_like(db: Session, story_id: str, user_id: str) -> Optional[Story]:
    """스토리에 좋아요를 누르거나 취소합니다."""
    story = get_story(db, story_id)
    if not story:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # 이미 좋아요를 눌렀는지 확인 (relationship 활용)
    if user in story.likers:
        story.likers.remove(user) # 취소
    else:
        story.likers.append(user) # 좋아요
    
    db.commit()
    db.refresh(story)
    return story

def delete_story(db: Session, story_id: str) -> bool:
    story = get_story(db, story_id)
    if story:
        db.delete(story)
        db.commit()
        return True
    return False