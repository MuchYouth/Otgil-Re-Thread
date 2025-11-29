import uuid
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from sqlalchemy import desc

from app.models import Story, Tag, User, PerformanceReport
from app.schemas import StoryCreate, StoryUpdate, PerformanceReportCreate

# --- Helper Functions ---
def get_or_create_tag(db: Session, name: str) -> Tag:
    db_tag = db.query(Tag).filter(Tag.name == name).first()
    if db_tag:
        return db_tag
    db_tag = Tag(name=name)
    db.add(db_tag)
    db.flush()
    return db_tag

# --- Story CRUD ---
def get_stories(db: Session, skip: int = 0, limit: int = 20) -> List[Story]:
    return db.query(Story)\
        .options(joinedload(Story.tags), joinedload(Story.likers))\
        .order_by(Story.id.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_story(db: Session, story_id: str) -> Story | None:
    return db.query(Story).options(
        joinedload(Story.comments),
        joinedload(Story.tags),
        joinedload(Story.likers)
    ).filter(Story.id == story_id).first()

def create_story(db: Session, story: StoryCreate, user_id: str, author_nickname: str) -> Story:
    story_data = story.model_dump(exclude={"tags"})
    
    db_story = Story(
        **story_data,
        id=str(uuid.uuid4()),
        user_id=user_id,
        author=author_nickname
    )
    
    if story.tags:
        for tag_name in story.tags:
            db_tag = get_or_create_tag(db, tag_name)
            db_story.tags.append(db_tag)
        
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story

def update_story(db: Session, db_story: Story, story_in: StoryUpdate) -> Story:
    update_data = story_in.model_dump(exclude_unset=True, exclude={"tags"})
    
    for key, value in update_data.items():
        setattr(db_story, key, value)
        
    # 태그 업데이트 로직 (기존 태그 교체)
    if story_in.tags is not None:
        db_story.tags = [] # 기존 태그 연결 해제
        for tag_name in story_in.tags:
            db_tag = get_or_create_tag(db, tag_name)
            db_story.tags.append(db_tag)

    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story

def delete_story(db: Session, story_id: str) -> bool:
    db_story = db.query(Story).filter(Story.id == story_id).first()
    if db_story:
        db.delete(db_story)
        db.commit()
        return True
    return False

def toggle_like(db: Session, story_id: str, user_id: str) -> Story | None:
    story = get_story(db, story_id)
    if not story:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    if user in story.likers:
        story.likers.remove(user)
    else:
        story.likers.append(user)
    
    db.commit()
    db.refresh(story)
    return story

# --- Report (Newsletter) CRUD ---
def get_reports(db: Session, skip: int = 0, limit: int = 20) -> List[PerformanceReport]:
    # PerformanceReport 모델이 있다고 가정합니다.
    return db.query(PerformanceReport)\
        .order_by(PerformanceReport.date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def create_report(db: Session, report: PerformanceReportCreate) -> PerformanceReport:
    db_report = PerformanceReport(
        id=str(uuid.uuid4()),
        title=report.title,
        date=report.date,
        excerpt=report.excerpt
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report