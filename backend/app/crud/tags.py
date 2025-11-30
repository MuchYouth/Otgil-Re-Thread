# backend/app/crud/tag.py

from sqlalchemy.orm import Session
from app import models, schemas
import uuid

def create_hello_tag(db: Session, tag: schemas.HelloTagBase, clothing_item_id: str):
    db_tag = models.HelloTag(
        id=str(uuid.uuid4()), # <--- ★ 여기! ★
        clothing_item_id=clothing_item_id,
        **tag.model_dump() # Pydantic v2 기준 (v1이면 .dict())
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def create_goodbye_tag(db: Session, tag: schemas.GoodbyeTagBase, clothing_item_id: str):
    db_tag = models.GoodbyeTag(
        id=str(uuid.uuid4()),
        clothing_item_id=clothing_item_id,
        **tag.model_dump()
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag