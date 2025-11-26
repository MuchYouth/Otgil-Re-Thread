import uuid
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import Reward
from app.schemas import RewardCreate

# --------------------------------------------------------------------------
# 조회 (Read)
# --------------------------------------------------------------------------

def get_rewards(db: Session, skip: int = 0, limit: int = 100) -> List[Reward]:
    """
    모든 리워드 목록을 조회합니다.
    """
    return db.query(Reward).offset(skip).limit(limit).all()

def get_reward(db: Session, reward_id: str) -> Reward | None:
    """
    ID로 특정 리워드 정보를 조회합니다.
    """
    return db.query(Reward).filter(Reward.id == reward_id).first()


# --------------------------------------------------------------------------
# 생성 (Create) - (관리자 기능 등을 위해 필요할 수 있음)
# --------------------------------------------------------------------------

def create_reward(db: Session, reward: RewardCreate) -> Reward:
    """
    새로운 리워드를 생성합니다.
    """
    db_reward = Reward(
        id=str(uuid.uuid4()), # String 타입 ID 생성
        name=reward.name,
        description=reward.description,
        cost=reward.cost,
        image_url=reward.image_url,
        type=reward.type
    )
    db.add(db_reward)
    db.commit()
    db.refresh(db_reward)
    return db_reward