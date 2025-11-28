import uuid, datetime
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import Reward
from app.schemas import RewardCreate, RewardUpdate

# --- 조회 (Read) ---

def get_rewards(db: Session) -> List[Reward]:
    """교환 가능한 모든 리워드 상품 목록을 조회합니다."""
    return db.query(Reward).all()

def get_reward(db: Session, reward_id: str) -> Reward | None:
    return db.query(Reward).filter(Reward.id == reward_id).first()

# --- 관리자용 (Create, Update, Delete) ---

def create_reward(db: Session, reward: RewardCreate) -> Reward:
    db_reward = Reward(
        id=str(uuid.uuid4()),
        **reward.model_dump()
    )
    db.add(db_reward)
    db.commit()
    db.refresh(db_reward)
    return db_reward

def update_reward(db: Session, reward_id: str, reward_in: RewardUpdate) -> Reward | None:
    db_reward = get_reward(db, reward_id)
    if not db_reward:
        return None
    
    update_data = reward_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_reward, field, value)

    db.add(db_reward)
    db.commit()
    db.refresh(db_reward)
    return db_reward

def delete_reward(db: Session, reward_id: str) -> bool:
    db_reward = get_reward(db, reward_id)
    if not db_reward:
        return False
    
    db.delete(db_reward)
    db.commit()
    return True