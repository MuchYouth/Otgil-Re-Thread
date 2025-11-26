from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import datetime
from typing import Optional
import uuid
from fastapi import HTTPException, status


from app.models import Credit, User, Credit as CreditModel, CreditTypeEnum as ModelCreditTypeEnum
from app.schemas import EarnRequest

def get_user_credit_balance(db: Session, user_id: str) -> int:
    """특정 사용자의 크레딧 총 잔액을 계산합니다."""
    # 크래딧 소유 user id가 현재 유저 id와 일치하는 것만 필터링
    # .scalar()를 사용하여 단일 값(총합) 반환
    # .scalar() 가 없으면 query 객체로 반환 됨
    # .first()는 튜플형태로 반환됨
    # .all()는 튜플이 들어간 리스트 형태로 반환됨
    total_balance = db.query(func.sum(Credit.amount))\
        .filter(Credit.user_id == user_id)\
        .scalar()
    
    # 필터링에 부합하는 크레딧이 없으면 sum 함수는 None을 반환할 수 있음
    # 함수 리턴 타입이 int이므로 None 방지
    # 잔액이 None인 경우 0 반환
    return total_balance or 0

def get_credits_by_user(db: Session, user_id: str) -> List[Credit]:
    """특정 사용자의 모든 크레딧 변동 내역을 조회합니다 (최신순)."""
    # 크래딧 소유 user id가 현재 유저 id와 일치하는 것만 필터링 후 내림차순 정렬
    return db.query(Credit)\
        .filter(Credit.user_id == user_id)\
        .order_by(Credit.date.desc())\
        .all()

def select_old_credits(db: Session, user_id: str) -> List[Credit]:
    """
    FIFO 방식으로 차감할 크레딧을 선택합니다.
    가장 오래된 'EARN' 타입의 크레딧부터 필요한 금액만큼 조회합니다.
    """
    return db.query(Credit)\
                .filter(Credit.user_id == user_id, Credit.amount > 0)\
                .order_by(Credit.date.asc())\
                .all()

# 필요한 모델 임포트 가정
# from .models import Credit 

def delete_credit_record(db: Session, credit_id: str, user_id: str ) -> bool:
    """
    특정 ID와 사용자 ID가 일치하는 크레딧 기록을 데이터베이스에서 삭제합니다.

    Args:
        db: SQLAlchemy 데이터베이스 세션
        credit_id: 삭제할 크레딧 기록의 고유 ID
        user_id: 해당 크레딧을 소유한 사용자의 ID

    Returns:
        삭제 성공 여부 (True/False)
    """
    
    # 1. 삭제할 크레딧 객체 조회 (보안: user_id가 일치하는지 확인)
    credit: Optional[Credit] = db.query(Credit)\
                                 .filter(Credit.id == credit_id, Credit.user_id == user_id)\
                                 .first()
    
    if not credit:
        # 기록이 없거나, 다른 사용자의 기록인 경우
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"ID '{credit_id}'에 해당하는 크레딧 기록을 찾을 수 없거나 접근 권한이 없습니다."
        )

    # 2. 객체 삭제
    try:
        db.delete(credit)
        
        # NOTE: 이 함수를 호출한 외부 트랜잭션에서 db.commit()이 실행되어야 최종 반영됩니다.
        db.flush() 
        
    except Exception as e:
        # 외부에서 롤백을 처리할 수 있도록 예외를 다시 발생시킵니다.
        raise RuntimeError(f"크레딧 삭제 중 DB 오류 발생: {e}")

    return True

# 오래된 크레딧부터 요구 금액만큼 차감하는 함수
def get_fifo_consumption_plan(db: Session, user_id: str, required_amount: int) -> List[Credit]:
    """
    FIFO 방식으로 차감할 크레딧을 선택하고, 각 크레딧에서 사용될 금액을 포함한
    소모 계획 리스트를 반환합니다.

    Args:
        db: SQLAlchemy 데이터베이스 세션
        user_id: 현재 사용자의 ID
        required_amount: 굿즈 교환 등에 필요한 총 크레딧 금액

    Returns:
        [(Credit 객체, 사용될 금액), ...] 형태의 리스트 (ConsumptionPlan)
    """
    
    if required_amount <= 0:
        return []

    # 1. 획득 크레딧을 FIFO 순서(오래된 순서)로 조회
    earn_credits = select_old_credits(db, user_id)

    # 2. 잔액 확인 (선행 검증)
    current_total_earn = sum(c.amount for c in earn_credits)
    
    # ⚠️ 이 로직은 사용(USE) 기록을 고려하지 않은 순수 획득액만 합산합니다.
    #    실제 서비스에서는 전체 순 잔액을 계산하여 비교해야 합니다.
    if current_total_earn < required_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"크레딧 잔액 부족. {required_amount}이 필요하지만, 가용 획득액은 {current_total_earn}입니다."
        )

    # 3. FIFO 소모 계획 수립
    remaining_cost = required_amount
    
    for credit in earn_credits:
        if remaining_cost <= 0:
            break

        # 1. 현재 크래딧을 써도 필요량을 다 채우지 못하는 경우
        #   크레딧 전액 사용
        # 2. 필요량을 다 채우는 경우
        #   필요한 만큼만 사용

        # 남은 비용 업데이트
        
        if(remaining_cost <= credit.amount):
            amount_to_use = remaining_cost
            # 크래딧 객체가 보유한 amount 필드가 실제 사용될 금액을 반영하도록 수정
            credit.amount -= amount_to_use
            
        else:
            # 이때 크래딧을 다 사용하면 amount 0으로 설정
            amount_to_use = credit.amount
            credit.amount = 0

        remaining_cost -= amount_to_use
        
        db.add(credit)
    db.commit()
    return earn_credits

def earn_credit_to_user(db: Session, req: EarnRequest) -> CreditModel:

    target = db.query(User).filter(User.id == req.user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")

    # 크레딧 타입 처리: schemas에서 오는 Enum을 모델 Enum으로 변환
    try:
        if req.type is None:
            credit_type = ModelCreditTypeEnum.EARNED_EVENT
        else:
            # req.type is a schema enum (CreditTypeEnum) -> use its value
            credit_type = ModelCreditTypeEnum(req.type.value)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credit type")
    
    # id는 128비트의 무작위 고유값
    credit_obj = CreditModel(
        id=str(uuid.uuid4()),
        date=datetime.datetime.utcnow(),
        activity_name=req.activity_name,
        type=credit_type,
        amount=req.amount,
        user_id=req.user_id,
    )

    return credit_obj