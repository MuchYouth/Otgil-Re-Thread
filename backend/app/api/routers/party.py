from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional


from app.schemas import (
    PartyCreate,
    PartyResponse,
    PartyParticipantResponse,
    PartyUpdate,
    PartyStatusEnum,
    ImpactStatsBase, # 스키마에 정의되어 있다고 가정
    KitDetailsBase   # 스키마에 정의되어 있다고 가정
)
from app.models import User
from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.crud import party as crud_party

router = APIRouter()


# 1. 파티 목록 조회 (검색 기능 포함)
@router.get(
    "/",
    response_model=List[PartyResponse],
    summary="파티 목록 조회 (검색 기능 포함)"
)
def read_parties(
    db: Session = Depends(get_db),
    status_filter: Optional[PartyStatusEnum] = PartyStatusEnum.UPCOMING,
    search_query: Optional[str] = None
):
    """
    파티 목록을 조회합니다.

    - `status_filter`: 'UPCOMING', 'COMPLETED' 등 Enum 상태로 필터링합니다.
    - `search_query`: 파티의 제목 또는 설명을 기준으로 검색합니다.
    """
    # Enum 값을 문자열로 변환하여 전달하거나 None 처리
    status_value = status_filter.value if status_filter else None
    
    parties = crud_party.get_parties(
        db,
        status=status_value,
        search=search_query
    )
    return parties


# 2. 파티 호스팅 신청
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
    새로운 파티 호스팅을 신청합니다. (생성 시 'PENDING_APPROVAL' 상태)
    """
    return crud_party.create_party(db=db, party=party_in, host_id=str(current_user.id))

# 3. 파티 참가 신청
@router.post(
    "/{party_id}/join",
    response_model=PartyParticipantResponse,
    summary="파티 참가 신청"
)
def join_party(
    party_id: str,
    invitation_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_party = crud_party.get_party_by_invitation_code(db, code=invitation_code)
    
    # [수정됨] Pylance 오류 해결: str()로 감싸서 단순 문자열 비교임을 명시
    if not db_party or str(db_party.id) != str(party_id):
        raise HTTPException(status_code=404, detail="파티 정보가 올바르지 않거나 초대 코드가 잘못되었습니다.")

    return crud_party.add_participant(
        db=db,
        party_id=party_id,
        user_id=str(current_user.id), 
        nickname=str(current_user.nickname)
    )


# 4. 파티 상세 정보 조회
@router.get(
    "/{party_id}",
    response_model=PartyResponse,
    summary="파티 상세 정보 조회"
)
def read_party(
    party_id: str,
    db: Session = Depends(get_db)
):
    """
    특정 파티 ID의 상세 정보를 조회합니다.
    """
    db_party = crud_party.get_party(db, party_id=party_id)
    if db_party is None:
        raise HTTPException(status_code=404, detail="파티를 찾을 수 없습니다.")
    return db_party


# 5. 호스트 대시보드 - 참가자 목록 조회
@router.get(
    "/{party_id}/dashboard/participants",
    response_model=List[PartyParticipantResponse],
    summary="호스트 대시보드 - 참가자 목록 조회"
)
def read_party_participants(
    party_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    파티 호스트가 해당 파티의 참가자 전체 목록을 조회합니다.
    """
    db_party = crud_party.get_party(db, party_id=party_id)
    if db_party is None:
        raise HTTPException(status_code=404, detail="파티를 찾을 수 없습니다.")

    if str(db_party.host_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="파티 호스트만 참가자 목록을 조회할 수 있습니다."
        )

    participants = crud_party.get_participants(db, party_id=party_id)
    return participants


# 6. 참가자 관리 - 파티에서 내보내기
@router.delete(
    "/{party_id}/participants/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="참가자 관리 - 파티에서 내보내기"
)
def remove_participant(
    party_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    파티 호스트가 특정 참가자를 파티에서 내보냅니다.
    """
    db_party = crud_party.get_party(db, party_id=party_id)
    if db_party is None:
        raise HTTPException(status_code=404, detail="파티를 찾을 수 없습니다.")

    if str(db_party.host_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="파티 호스트만 참가자를 관리할 수 있습니다."
        )

    # host_id(str)와 user_id(str)를 비교
    if str(db_party.host_id) == str(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="호스트는 자기 자신을 내보낼 수 없습니다."
        )

    removed_participant = crud_party.remove_participant(db, party_id=party_id, user_id=user_id)

    if removed_participant is None:
        raise HTTPException(status_code=404, detail="내보낼 참가자를 찾을 수 없습니다.")
    return


# 7. 파티 정보/상태 수정 (호스트용)
@router.patch(
    "/{party_id}",
    response_model=PartyResponse,
    summary="파티 정보/상태 수정 (호스트용)"
)
def update_party(
    party_id: str,
    party_in: PartyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    파티 호스트가 파티 정보(제목, 설명, 상태 등)를 수정합니다.
    """
    db_party = crud_party.get_party(db, party_id=party_id)
    if db_party is None:
        raise HTTPException(status_code=404, detail="파티를 찾을 수 없습니다.")

    if str(db_party.host_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="파티 호스트만 수정할 수 있습니다."
        )

    # 이 함수가 제목, 설명, 상태(status) 변경을 모두 처리합니다.
    return crud_party.update_party(db=db, db_party=db_party, party_in=party_in)


# 9. 파티 나가기
@router.delete(
    "/{party_id}/leave",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="파티 나가기"
)
def leave_party(
    party_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    참가자가 스스로 파티에서 나갑니다.
    """
    db_party = crud_party.get_party(db, party_id=party_id)
    if db_party is None:
        raise HTTPException(status_code=404, detail="파티를 찾을 수 없습니다.")

    if str(db_party.host_id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="호스트는 파티를 나갈 수 없습니다. (파티 삭제 기능을 이용하세요)"
        )

    removed = crud_party.remove_participant(
        db=db,
        party_id=party_id,
        user_id=str(current_user.id)
    )

    if not removed:
        raise HTTPException(status_code=404, detail="파티 참가자가 아닙니다.")
    return


# 10. 내 파티 목록 조회 (참가/호스팅)
@router.get(
    "/me/my-parties",
    response_model=List[PartyResponse],
    summary="내 파티 목록 조회 (참가/호스팅)"
)
def read_my_parties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    내가 호스팅하거나 참가한 모든 파티 목록을 조회합니다.
    """
    parties = crud_party.get_parties_for_user(db, user_id=str(current_user.id))
    return parties


# 11. [관리자] 파티 생성 승인
@router.post(
    "/admin/{party_id}/approve",
    response_model=PartyResponse,
    summary="[관리자] 파티 생성 승인"
)
def admin_approve_party(
    party_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    관리자가 'PENDING_APPROVAL' 상태의 파티를 'UPCOMING'으로 승인합니다.
    """
    db_party = crud_party.get_party(db, party_id=party_id)
    if db_party is None:
        raise HTTPException(status_code=404, detail="파티를 찾을 수 없습니다.")

    if db_party.status.value != PartyStatusEnum.PENDING_APPROVAL.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="승인 대기 중인 파티가 아닙니다."
        )
    
    # update_party_status 함수 재사용
    return crud_party.update_party_status(db=db, db_party=db_party, status=PartyStatusEnum.UPCOMING)