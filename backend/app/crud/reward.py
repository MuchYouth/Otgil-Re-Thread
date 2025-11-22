from sqlalchemy.orm import Session
from typing import List

from app.models import Reward, Credit

def get_rewards(db: Session) -> List[Reward]:
    """교환 가능한 모든 리워드 상품 목록을 조회합니다."""
    return db.query(Reward).all()

def get_reward_by_id(db: Session, reward_id: int) -> Reward:
    """특정 ID의 리워드 상품을 조회합니다."""
    return db.query(Reward).filter(Reward.id == reward_id).first()

