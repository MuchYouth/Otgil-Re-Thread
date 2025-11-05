from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import CreditResponse, RewardResponse
from app.models import User
from app.crud import credit as crud_credit, reward as crud_reward

router = APIRouter()

# (참고: 크레딧 잔액을 위한 간단한 스키마가 schemas.py에 필요할 수 있습니다)
# class UserCreditBalanceResponse(BaseModel):
#     user_id: str
#     balance: int

@router.get(
    "/my-balance", 
    # response_model=UserCreditBalanceResponse,
    summary="내 크레딧 잔액 조회"
)
def read_my_credit_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자의 크레딧 잔액을 조회합니다.
    (크레딧 내역을 합산하는 로직 필요)
    """
    balance = crud_credit.get_user_credit_balance(db, user_id=current_user.id)
    return {"user_id": current_user.id, "balance": balance}


@router.get(
    "/my-history", 
    response_model=List[CreditResponse],
    summary="내 크레딧 변동 내역 조회"
)
def read_my_credit_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자의 모든 크레딧 적립/사용 내역을 조회합니다.
    """
    credits = crud_credit.get_credits_by_user(db, user_id=current_user.id)
    return credits


@router.get(
    "/rewards", 
    response_model=List[RewardResponse],
    summary="리워드 스토어 상품 목록 조회"
)
def read_rewards(
    db: Session = Depends(get_db)
):
    """
    크레딧으로 교환 가능한 모든 리워드 상품 목록을 조회합니다.
    """
    rewards = crud_reward.get_rewards(db)
    return rewards

# ... (리워드 교환 신청, 크레딧 소각 등 라우터) ...