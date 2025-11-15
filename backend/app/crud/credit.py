from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.models import Credit

def get_user_credit_balance(db: Session, user_id: str) -> int:
    """특정 사용자의 크레딧 총 잔액을 계산합니다."""
    
    total_balance = db.query(func.sum(Credit.amount))\
        .filter(Credit.user_id == user_id)\
        .scalar()
        
    return total_balance or 0

def get_credits_by_user(db: Session, user_id: str) -> List[Credit]:
    """특정 사용자의 모든 크레딧 변동 내역을 조회합니다 (최신순)."""
    return db.query(Credit)\
        .filter(Credit.user_id == user_id)\
        .order_by(Credit.date.desc())\
        .all()