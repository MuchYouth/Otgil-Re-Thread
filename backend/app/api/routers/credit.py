from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import CreditResponse
from app.models import User
from app.crud import credit as crud_credit

router = APIRouter()

@router.get(
    "/my-balance", 
    summary="내 크레딧 잔액 조회"
)
def read_my_credit_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자의 크레딧 잔액을 조회합니다.
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