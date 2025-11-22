from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import RewardResponse
from app.models import User
from app.crud import reward as crud_reward, credit as crud_credit
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
@router.post(
    "/exchange/{reward_id}",
    status_code=status.HTTP_200_OK,
    summary="크레딧을 사용하여 굿즈 교환 (FIFO 차감 및 재고 감소)"
)
def exchange_reward_with_credits(
    reward_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    
    # ---------------------------------------------------
    # 1. 굿즈(Reward) 및 재고 확인
    # ---------------------------------------------------
    reward = crud_reward.get_reward_by_id(db, reward_id=reward_id)
    
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="굿즈를 찾을 수 없습니다.")
    
    cost = reward.cost
    
    # 굿즈를 id로 조회하는 방식으로하려면
    # id가 유니크하기 때문에 항상 1개만 조회됨
    # 현재 reward 모델에는 재고 수량 필드가 없음
    # reward 모델에 참조해서 재고를 파악할 만한 필드가 존재하지 않아서
    # 재고 수량 필드가 있다고 가정하고 진행

    reward.stock -= 1
    if reward.stock < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="재고가 부족합니다.")
    
    # ---------------------------------------------------
    # 2. 잔액 확인 (선행 검증)
    # ---------------------------------------------------
    current_balance = crud_credit.get_user_credit_balance(db, user_id=user_id)
    
    if current_balance < cost:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"잔액 부족: {cost} 크레딧이 필요합니다. 현재 잔액: {current_balance}")
    

    # 3. 획득한지 오래된 크레딧부터 cost만큼 차감

    crud_credit.get_fifo_consumption_plan(db, user_id, cost)