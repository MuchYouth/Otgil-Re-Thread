import uuid
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.models import Story, Tag
from app.schemas import StoryCreate

def get_or_create_tag(db: Session, name: str) -> Tag:
    """태그 이름으로 조회하고, 없으면 새로 생성합니다."""
    db_tag = db.query(Tag).filter(Tag.name == name).first()
    if db_tag:
        return db_tag
    
    db_tag = Tag(name=name)
    db.add(db_tag)
    # story 커밋 시 함께 커밋되도록 flush
    db.flush() 
    return db_tag

def get_stories(db: Session, skip: int = 0, limit: int = 10) -> List[Story]:
    """스토리 목록을 조회합니다 (최신순)."""
    return db.query(Story)\
        .order_by(Story.id.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_story(db: Session, story_id: str) -> Story | None:
    """
    특정 스토리의 상세 내용과 댓글, 태그, 좋아요 누른 사람(likers)을 함께 조회합니다.
    [경고] StoryResponse 스키마가 'likes'/'liked_by' 필드를
    'likers' 관계에서 계산하도록 수정되어야 합니다. (위 설명 참고)
    """
    return db.query(Story).options(
        joinedload(Story.comments),
        joinedload(Story.tags),
        joinedload(Story.likers) # 'likes', 'liked_by' 계산을 위해 Eager loading
    ).filter(Story.id == story_id).first()

def create_story(db: Session, story: StoryCreate, user_id: str, author_name: str) -> Story:
    """
    새로운 스토리를 생성합니다.
    StoryCreate 스키마의 'tags' 리스트를 처리합니다.
    """
    # 'tags' 필드를 제외한 나머지 데이터를 model_dump
    story_data = story.model_dump(exclude={"tags"})
    
    db_story = Story(
        **story_data,
        id=str(uuid.uuid4()),
        user_id=user_id,
        author=author_name
    )
    
    # 태그 처리
    if story.tags:
        tags_to_add = []
        for tag_name in story.tags:
            db_tag = get_or_create_tag(db, tag_name)
            tags_to_add.append(db_tag)
        db_story.tags = tags_to_add
        
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story