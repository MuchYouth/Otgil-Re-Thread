from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import PartyCreate, PartyResponse, PartyParticipantResponse
from app.models import User
from app.crud import party as crud_party

router = APIRouter()

@router.get(
    "/", 
    response_model=List[PartyResponse],
    summary="파티 목록 조회"
)
def read_parties(
    db: Session = Depends(get_db),
    status_filter: str = "UPCOMING" # (예: UPCOMING, COMPLETED)
):
    """
    승인된(UPCOMING) 파티 또는 완료된(COMPLETED) 파티 목록을 조회합니다.
    """
    parties = crud_party.get_parties_by_status(db, status=status_filter)
    return parties


@router.post(
    "/", 
    response_model=PartyResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="파티 호스팅 신청"
)
def create_party(
    party_in: PartyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    새로운 파티 호스팅을 신청합니다.
    - 생성 시 'PENDING_APPROVAL' 상태가 됩니다.
    """
    return crud_party.create_party(db=db, party=party_in, host_id=current_user.id)


@router.post(
    "/{party_id}/join", 
    response_model=PartyParticipantResponse,
    summary="파티 참가 신청"
)
def join_party(
    party_id: str,
    invitation_code: str, # (초대 코드 검증 로직 추가)
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    초대 코드를 사용하여 파티 참가를 신청합니다.
    """
    db_party = crud_party.get_party_by_invitation_code(db, code=invitation_code)
    if not db_party or db_party.id != party_id:
        raise HTTPException(status_code=404, detail="파티 정보가 올바르지 않거나 초대 코드가 잘못되었습니다.")

    return crud_party.add_participant(
        db=db, 
        party_id=party_id, 
        user_id=current_user.id, 
        nickname=current_user.nickname
    )

# ... (파티 상세 조회, 호스트 대시보드, 참가자 관리 등 라우터) ...