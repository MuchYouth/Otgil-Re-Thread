from typing import Optional, List
import uuid

from sqlalchemy.orm import Session

from app import models, schemas


def create_post(db: Session, post_create: schemas.PostCreate, user_id: str) -> models.Post:
    """새 게시글을 생성하고 DB에 저장합니다."""
    db_post = models.Post(
        post_id=str(uuid.uuid4()),          # 고유 ID 생성
        user_id=user_id,
        title=post_create.title,
        content=post_create.content,
        image_url=post_create.image_url,    # ← 여기! PostCreate에서 가져옴
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def get_post(db: Session, post_id: str) -> Optional[models.Post]:
    """특정 ID의 게시글을 조회합니다."""
    return db.query(models.Post).filter(models.Post.post_id == post_id).first()


def get_post_list(db: Session, skip: int = 0, limit: int = 10) -> List[models.Post]:
    """게시글 목록을 최신순으로 조회합니다. (페이징 적용)"""
    return (
        db.query(models.Post)
        .order_by(models.Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_post(db: Session, db_post: models.Post, post_update: schemas.PostUpdate) -> models.Post:
    """기존 게시글을 업데이트합니다."""
    # 요청에서 실제로 넘어온 필드만 가져오기
    update_data = post_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_post, key, value)

    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def delete_post(db: Session, db_post: models.Post) -> None:
    """특정 게시글을 삭제합니다."""
    db.delete(db_post)
    db.commit()
