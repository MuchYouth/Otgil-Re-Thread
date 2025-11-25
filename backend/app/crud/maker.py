from sqlalchemy.orm import Session
from typing import List

from app.models import Maker, MakerProduct

def get_makers(db: Session, skip: int = 0, limit: int = 100) -> List[Maker]:
    """등록된 메이커(수선 장인 등) 목록을 조회합니다."""
    return db.query(Maker).offset(skip).limit(limit).all()

def get_maker_products(db: Session, maker_id: str) -> List[MakerProduct]:
    """특정 메이커가 판매하는 상품/서비스 목록을 조회합니다."""
    return db.query(MakerProduct).filter(MakerProduct.maker_id == maker_id).all()