from sqlalchemy.orm import Session, joinedload
from typing import List

from app.models import Maker

def get_makers(db: Session) -> List[Maker]:
    """모든 메이커 목록을 조회합니다."""
    return db.query(Maker).all()

def get_maker(db: Session, maker_id: str) -> Maker | None:
    """
    특정 메이커의 상세 정보와 관련 상품을 함께 조회합니다.
    'MakerResponse' 스키마가 'products'를 포함하므로 Eager loading 사용
    """
    return db.query(Maker).options(
        joinedload(Maker.products)
    ).filter(Maker.id == maker_id).first()