import uuid
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import ClothingItem, GoodbyeTag, HelloTag, ClothingCategoryEnum
from app.schemas import ClothingItemCreate

def get_clothing_item(db: Session, item_id: str) -> ClothingItem | None:
    return db.query(ClothingItem).filter(ClothingItem.id == item_id).first()

def create_clothing_item(db: Session, item: ClothingItemCreate, user_id: str, user_nickname: str) -> ClothingItem:
    """
    의류 아이템을 등록합니다. Goodbye Tag 정보가 있다면 함께 저장합니다.
    """
    # 1. 아이템 생성
    db_item = ClothingItem(
        id=str(uuid.uuid4()),
        user_id=user_id,
        user_nickname=user_nickname,
        name=item.name,
        description=item.description,
        category=item.category,
        size=item.size,
        image_url=item.image_url,
        is_listed_for_exchange=False # 기본값
    )
    db.add(db_item)
    db.flush() # ID 생성을 위해 flush

    # 2. Goodbye Tag 생성 (만약 입력되었다면) - 여기서는 스키마 구조에 따라 로직이 달라질 수 있음.
    # 현재 ClothingItemCreate 스키마에는 tag 정보가 없으므로 별도 처리하거나 스키마 확장이 필요함.
    # 일단 기본 Item 저장 로직만 구현합니다.
    
    db.commit()
    db.refresh(db_item)
    return db_item

# Goodbye Tag 별도 생성 함수
def create_goodbye_tag(db: Session, item_id: str, tag_data: dict) -> GoodbyeTag:
    db_tag = GoodbyeTag(
        clothing_item_id=item_id,
        **tag_data
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag