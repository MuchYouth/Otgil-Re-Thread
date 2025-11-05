from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# (관리자 인증을 위한 별도 의존성 필요)
from app.api.deps import get_db, get_current_admin_user
from app.schemas import AdminOverallStats, PartyResponse, ClothingItemResponse
from app.models import User
from app.crud import admin as crud_admin, party as crud_party, item as crud_item

router = APIRouter()

@router.get(
    "/stats", 
    response_model=AdminOverallStats,
    summary="관리자 대시보드 전체 통계"
)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    관리자 페이지의 전체 서비스 통계 데이터를 조회합니다.
    - (관리자 권한 확인)
    """
    stats = crud_admin.get_overall_stats(db)
    return stats


@router.post(
    "/parties/{party_id}/approve", 
    response_model=PartyResponse,
    summary="파티 호스팅 승인"
)
def approve_party(
    party_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    대기 중인(PENDING_APPROVAL) 파티를 'UPCOMING' 상태로 승인합니다.
    """
    db_party = crud_party.get_party(db, party_id=party_id)
    if not db_party:
        raise HTTPException(status_code=404, detail="파티를 찾을 수 없습니다.")
    
    return crud_party.update_party_status(db=db, db_party=db_party, status="UPCOMING")


@router.post(
    "/items/{item_id}/approve",
    response_model=ClothingItemResponse,
    summary="파티 출품 아이템 승인"
)
def approve_party_item(
    item_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    파티에 출품 신청된(PENDING) 아이템을 'APPROVED' 상태로 변경합니다.
    """
    db_item = crud_item.get_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="아이템을 찾을 수 없습니다.")

    return crud_item.update_item_submission_status(db=db, db_item=db_item, status="APPROVED")

# ... (사용자 관리, 아이템 강제 삭제, 파티 거절 등 라우터) ...