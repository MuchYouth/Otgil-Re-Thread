from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_admin_user
from app.schemas import (
    AdminOverallStats, 
    PartyResponse, 
    ClothingItemResponse,
    AdminGroupPerformance,
    DailyActivity,
    CategoryDistribution,
    PartyParticipantResponse
)
from app.models import User
from app.crud import admin as crud_admin, party as crud_party, item as crud_item

router = APIRouter()

# --- 대시보드 통계 ---

@router.get("/stats", response_model=AdminOverallStats, summary="관리자 대시보드 전체 통계")
def get_admin_stats(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    return crud_admin.get_overall_stats(db)

@router.get("/stats/group-performance", response_model=List[AdminGroupPerformance], summary="그룹(지역)별 성과 통계")
def get_group_performance_stats(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    return crud_admin.get_group_performance(db)

@router.get("/stats/daily-activity", response_model=List[DailyActivity], summary="일일 활동 추이")
def get_daily_activity_stats(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    return crud_admin.get_daily_activity(db)

@router.get("/stats/category-distribution", response_model=List[CategoryDistribution], summary="카테고리별 분포")
def get_category_distribution_stats(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    return crud_admin.get_category_distribution(db)


# --- 파티 관리 ---

@router.post("/parties/{party_id}/status", response_model=PartyResponse, summary="파티 상태 변경 (승인/거절)")
def update_party_approval_status(
    party_id: str,
    status_data: dict, # Body: {"status": "UPCOMING" or "REJECTED"}
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """대기 중인 파티를 승인하거나 거절합니다."""
    new_status = status_data.get("status")
    if new_status not in ["UPCOMING", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    updated_party = crud_admin.update_party_status(db, party_id, new_status)
    if not updated_party:
        raise HTTPException(status_code=404, detail="Party not found")
    return updated_party

@router.delete("/parties/{party_id}", status_code=status.HTTP_204_NO_CONTENT, summary="파티 삭제")
def delete_party(
    party_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    success = crud_admin.delete_party(db, party_id)
    if not success:
        raise HTTPException(status_code=404, detail="Party not found")
    return


@router.patch("/parties/{party_id}/participants/{user_id}/status", response_model=PartyParticipantResponse,
              summary="참가자 상태 변경")
def update_participant_status(
        party_id: str,
        user_id: str,
        status_data: dict,  # Body: {"status": "ACCEPTED" or "REJECTED"}
        db: Session = Depends(get_db),
        admin_user: User = Depends(get_current_admin_user)
):
    new_status = status_data.get("status")
    updated_participant = crud_admin.update_participant_status(db, party_id, user_id, new_status)

    if not updated_participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    # [수정됨] crud_admin.db -> db (함수 인자로 받은 세션 사용)
    participant_user = db.query(User).filter(User.id == user_id).first()
    nickname = participant_user.nickname if participant_user else "Unknown"

    # 반환 객체 구성 (ORM 객체 + nickname)
    response_data = {
        "user_id": updated_participant.user_id,
        "nickname": nickname,
        "status": updated_participant.status
    }
    return response_data

# --- 아이템 검수 ---

@router.get("/items/pending", response_model=List[ClothingItemResponse], summary="승인 대기 아이템 목록")
def get_pending_items(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    return crud_admin.get_pending_party_items(db)

@router.post("/items/{item_id}/status", response_model=ClothingItemResponse, summary="아이템 출품 상태 변경")
def update_item_status(
    item_id: str,
    status_data: dict, # Body: {"status": "APPROVED" or "REJECTED"}
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    new_status = status_data.get("status")
    if new_status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    updated_item = crud_admin.update_item_submission_status(db, item_id, new_status)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item