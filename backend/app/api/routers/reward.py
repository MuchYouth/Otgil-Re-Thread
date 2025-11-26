from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import RewardResponse
<<<<<<< HEAD
from app.models import User
from app.crud import reward as crud_reward, credit as crud_credit
# from app.crud import credit as crud_credit # 추후 교환 로직에서 필요할 수 있음
=======
# [수정] Credit 모델과 Enum 타입을 import 해야 합니다.
from app.models import User, Credit, CreditTypeEnum 
from app.crud import reward as crud_reward
>>>>>>> main

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

<<<<<<< HEAD
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
=======
@router.post("/exchange/{reward_id}", summary="리워드 교환 신청")
def exchange_reward(
>>>>>>> main
    reward_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
<<<<<<< HEAD
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
=======
    """
    사용자의 크레딧을 차감하여 리워드 상품으로 교환합니다.
    User.credits가 관계(Relationship)이므로, 내역을 합산하여 잔액을 확인하고
    새로운 차감 내역(Credit)을 생성합니다.
    """
    # 1. 리워드 정보 조회
    reward = crud_reward.get_reward(db, reward_id=reward_id)
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 리워드 상품입니다."
        )

    # 2. 사용자 크레딧 잔액 계산
    # current_user.credits는 Credit 객체들의 리스트입니다.
    # 모든 내역의 amount를 합산하여 현재 잔액을 구합니다.
    current_balance = sum(credit.amount for credit in current_user.credits)

    if current_balance < reward.cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"크레딧이 부족합니다. (현재 잔액: {current_balance}, 필요: {reward.cost})"
        )

    # 3. 크레딧 차감 내역 생성 (새로운 Credit 레코드 추가)
    # User 테이블의 값을 직접 수정하는 것이 아니라, 마이너스 금액의 내역을 쌓습니다.
    new_credit = Credit(
        user_id=current_user.id,
        amount=-reward.cost,                   # 차감이므로 음수 처리
        type=CreditTypeEnum.SPENT_REWARD,      # 타입 지정
        description=f"리워드 교환: {reward.name}" # (선택) 상세 설명
    )
    
    db.add(new_credit)
    db.commit()
    # db.refresh(new_credit) # 필요하다면 refresh

    # 4. 응답
    return {
        "msg": "리워드 교환이 성공적으로 완료되었습니다.",
        "reward_name": reward.name,
        "used_credits": reward.cost,
        "remaining_credits": current_balance - reward.cost
    }
>>>>>>> main
