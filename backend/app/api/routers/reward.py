from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import RewardResponse
from app.models import User
from app.crud import reward as crud_reward
# from app.crud import credit as crud_credit # 추후 교환 로직에서 필요할 수 있음

router = APIRouter()

@router.get(
    "/", 
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

# --- 추후 구현 예정인 리워드 교환 로직 예시 ---
# @router.post("/exchange/{reward_id}", summary="리워드 교환 신청")
# def exchange_reward(
#     reward_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # 1. 리워드 정보 조회
#     # 2. 사용자 크레딧 잔액 확인 (crud_credit.get_user_credit_balance)
#     # 3. 잔액 부족 시 예외 처리
#     # 4. 크레딧 차감 및 리워드 지급 기록 생성
#     pass