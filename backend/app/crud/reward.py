from sqlalchemy.orm import Session
from typing import List

from app.models import Reward

def get_rewards(db: Session) -> List[Reward]:
    """교환 가능한 모든 리워드 상품 목록을 조회합니다."""
    return db.query(Reward).all()