import uuid
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.models import Maker, MakerProduct
from app.schemas import MakerCreate, MakerUpdate, MakerProductCreate, MakerProductUpdate

# --- Maker 조회 ---

def get_makers(db: Session) -> List[Maker]:
    """모든 메이커 목록을 조회합니다."""
    return db.query(Maker).all()

def get_maker(db: Session, maker_id: str) -> Maker | None:
    """
    특정 메이커의 상세 정보와 관련 상품을 함께 조회합니다.
    """
    return db.query(Maker).options(
        joinedload(Maker.products)
    ).filter(Maker.id == maker_id).first()

# --- Maker 관리 (관리자용) ---

def create_maker(db: Session, maker: MakerCreate) -> Maker:
    db_maker = Maker(
        id=str(uuid.uuid4()),
        **maker.model_dump()
    )
    db.add(db_maker)
    db.commit()
    db.refresh(db_maker)
    return db_maker

def update_maker(db: Session, maker_id: str, maker_in: MakerUpdate) -> Maker | None:
    db_maker = db.query(Maker).filter(Maker.id == maker_id).first()
    if not db_maker:
        return None

    update_data = maker_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_maker, field, value)

    db.add(db_maker)
    db.commit()
    db.refresh(db_maker)
    return db_maker

def delete_maker(db: Session, maker_id: str) -> bool:
    db_maker = db.query(Maker).filter(Maker.id == maker_id).first()
    if not db_maker:
        return False
    
    db.delete(db_maker)
    db.commit()
    return True

# --- Maker Product (굿즈) 관리 ---

def get_product(db: Session, product_id: str) -> MakerProduct | None:
    return db.query(MakerProduct).filter(MakerProduct.id == product_id).first()

def create_maker_product(db: Session, maker_id: str, product: MakerProductCreate) -> MakerProduct:
    db_product = MakerProduct(
        id=str(uuid.uuid4()),
        maker_id=maker_id,
        **product.model_dump()
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_maker_product(db: Session, product_id: str, product_in: MakerProductUpdate) -> MakerProduct | None:
    db_product = get_product(db, product_id)
    if not db_product:
        return None

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_maker_product(db: Session, product_id: str) -> bool:
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    
    db.delete(db_product)
    db.commit()
    return True