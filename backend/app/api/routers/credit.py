from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import CreditResponse, RewardResponse, UserCreditBalanceResponse
from app.models import User
from app.crud import credit as crud_credit, reward as crud_reward

router = APIRouter()

# (참고: 크레딧 잔액을 위한 간단한 스키마가 schemas.py에 필요할 수 있습니다)
# class UserCreditBalanceResponse(BaseModel):
#     user_id: str
#     balance: int

@router.get(
    "/my-balance", 
    response_model=UserCreditBalanceResponse,
    summary="내 크레딧 잔액 조회"
)
# 필요한 리소스 명시
def read_my_credit_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자의 크레딧 잔액을 조회합니다.
    (크레딧 내역을 합산하는 로직 필요)
    """
    # 크래딧 갯수 확인하는 함수에서 user_id에 해당하는 매개변수에 현재 인증된 사용자의 id 전달
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

@router.delete(
    "/{credit_id}",
    status_code=status.HTTP_204_NO_CONTENT, # 성공적으로 삭제 시 일반적으로 204 반환
    summary="특정 ID의 크레딧 기록 삭제"
)
def delete_credit(
    credit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # 사용자 인증 필수
):
    """
    인증된 사용자가 소유한 특정 크레딧 기록을 영구적으로 삭제합니다.
    """
    user_id = current_user.id
    
    try:
        crud_credit.delete_credit_record(db, credit_id, user_id)
        db.commit() # 최종적으로 삭제를 데이터베이스에 반영
        
    except HTTPException:
        # 404와 같은 의도된 예외는 그대로 다시 발생
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"크레딧 삭제 트랜잭션 실패: {e}"
        )
        
    # HTTP 204 No Content는 응답 본문이 없어야 함
    return

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
