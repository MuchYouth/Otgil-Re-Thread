import uuid
from sqlalchemy.orm import Session
from typing import List

from app.models import ClothingItem, PartySubmissionStatusEnum, GoodbyeTag, HelloTag
from app.schemas import ClothingItemCreate, ClothingItemUpdate, GoodbyeTagCreate, HelloTagCreate

def get_item(db: Session, item_id: str) -> ClothingItem | None:
    """ID로 단일 아이템을 조회합니다."""
    return db.query(ClothingItem).filter(ClothingItem.id == item_id).first()

def get_items_for_exchange(db: Session, skip: int = 0, limit: int = 20) -> List[ClothingItem]:
    """교환을 위해 등록된 아이템 목록을 조회합니다."""
    return db.query(ClothingItem)\
        .filter(ClothingItem.is_listed_for_exchange == True)\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_items_by_user(db: Session, user_id: str) -> List[ClothingItem]:
    """특정 사용자가 등록한 모든 아이템 목록을 조회합니다."""
    return db.query(ClothingItem)\
        .filter(ClothingItem.user_id == user_id)\
        .order_by(ClothingItem.id.desc())\
        .all()

def create_user_item(db: Session, item: ClothingItemCreate, user_id: str, user_nickname: str) -> ClothingItem:
    """
    사용자의 새 아이템을 생성합니다.
    ClothingItemCreate 스키마의 모든 필드를 받습니다.
    """
    item_data = item.model_dump()
    
    db_item = ClothingItem(
        **item_data,
        id=str(uuid.uuid4()),
        user_id=user_id,
        user_nickname=user_nickname
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, db_item: ClothingItem, item_in: ClothingItemUpdate) -> ClothingItem:
    """
    아이템 정보를 수정합니다.
    ClothingItemUpdate 스키마에 정의된 필드들을 업데이트합니다.
    """
    update_data = item_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item_submission_status(db: Session, db_item: ClothingItem, status: str) -> ClothingItem:
    """아이템의 파티 출품 상태를 변경합니다 (관리자용)."""
    try:
        status_enum = PartySubmissionStatusEnum(status)
    except ValueError:
        return db_item 

    db_item.party_submission_status = status_enum
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def remove_item(db: Session, db_item: ClothingItem):
    """
    특정 아이템 객체를 데이터베이스에서 삭제합니다.
    """
    db.delete(db_item)
    db.commit()
    # 반환할 것이 없으므로 None을 반환하거나, 성공 메시지 처리를 위해 True를 반환할 수도 있습니다.


def create_goodbye_tag(db: Session, db_item: ClothingItem, tag_in: GoodbyeTagCreate) -> ClothingItem:
    """
    아이템에 GoodbyeTag를 생성하고 연결합니다.
    """
    # GoodbyeTag 모델 생성. item_id를 PK/FK로 사용
    db_tag = GoodbyeTag(
        clothing_item_id=db_item.id,
        **tag_in.model_dump()
    )
    
    # ClothingItem 객체에 관계를 통해 GoodbyeTag 연결
    db_item.goodbye_tag = db_tag
    
    db.add(db_item) # item을 커밋하면 cascade 설정에 따라 tag도 저장됨
    db.commit()
    db.refresh(db_item)
    return db_item

def create_hello_tag(db: Session, db_item: ClothingItem, tag_in: HelloTagCreate) -> ClothingItem:
    """
    아이템에 HelloTag를 생성하고 연결합니다.
    """
    # HelloTag 모델 생성. item_id를 PK/FK로 사용
    db_tag = HelloTag(
        clothing_item_id=db_item.id,
        **tag_in.model_dump()
    )
    
    # ClothingItem 객체에 관계를 통해 HelloTag 연결
    db_item.hello_tag = db_tag
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item