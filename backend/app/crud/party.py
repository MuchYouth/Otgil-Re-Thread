import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional

from app.models import Party, PartyParticipation, User, PartyStatusEnum, PartyParticipantStatusEnum
from app.schemas import PartyCreate, PartyUpdate

# --------------------------------------------------------------------------
# 조회 (Read)
# --------------------------------------------------------------------------

def get_party(db: Session, party_id: str) -> Party | None:
    """ID로 단일 파티를 조회합니다."""
    return db.query(Party).filter(Party.id == party_id).first()

def get_parties(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None, 
    search: Optional[str] = None
) -> List[Party]:
    """
    파티 목록을 조회합니다. 
    상태(status) 필터링과 검색(search) 기능을 포함합니다.
    """
    query = db.query(Party)

    # 1. 상태 필터링
    if status:
        # Enum 값이 들어올 수도 있고 문자열이 들어올 수도 있으므로 처리
        if isinstance(status, PartyStatusEnum):
            query = query.filter(Party.status == status)
        else:
            query = query.filter(Party.status == status)

    # 2. 검색 (제목 또는 설명)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Party.title.like(search_pattern),
                Party.description.like(search_pattern)
            )
        )

    # 날짜순 정렬 (가까운 날짜 먼저)
    return query.order_by(Party.date.asc()).offset(skip).limit(limit).all()

def get_party_by_invitation_code(db: Session, code: str) -> Party | None:
    """초대 코드로 파티를 조회합니다."""
    return db.query(Party).filter(Party.invitation_code == code).first()

def get_parties_for_user(db: Session, user_id: str) -> List[Party]:
    """
    사용자가 호스팅 중이거나 참가 중인 모든 파티를 조회합니다.
    """
    # 1. 내가 호스트인 파티
    # 2. 내가 참가자(PartyParticipation)로 등록된 파티
    # 이 두 가지 조건을 OR로 묶어서 조회
    return db.query(Party).outerjoin(PartyParticipation, Party.id == PartyParticipation.party_id)\
        .filter(
            or_(
                Party.host_id == user_id,
                PartyParticipation.user_id == user_id
            )
        ).distinct().order_by(Party.date.asc()).all()

def get_participants(db: Session, party_id: str) -> List[PartyParticipation]:
    """
    특정 파티의 참가자 목록을 조회합니다.
    응답 스키마 구성을 위해 User 테이블과 조인하여 닉네임을 가져옵니다.
    """
    # User 테이블과 조인하여 참가자 정보와 유저 정보를 함께 로드
    participations = db.query(PartyParticipation)\
        .join(User, PartyParticipation.user_id == User.id)\
        .filter(PartyParticipation.party_id == party_id)\
        .all()
    
    # Pydantic 스키마(PartyParticipantResponse)가 nickname을 요구하므로 동적 할당
    for p in participations:
        # p.user가 존재하면 그 닉네임을, 아니면 알 수 없음 처리
        nickname = p.user.nickname if p.user else "Unknown"
        setattr(p, 'nickname', nickname)
        
    return participations


# --------------------------------------------------------------------------
# 생성 (Create)
# --------------------------------------------------------------------------

def create_party(db: Session, party: PartyCreate, host_id: str) -> Party:
    """
    새로운 파티 호스팅을 신청합니다 (기본 상태: PENDING_APPROVAL).
    """
    party_data = party.model_dump()
    
    db_party = Party(
        **party_data,
        id=str(uuid.uuid4()),
        host_id=host_id,
        status=PartyStatusEnum.PENDING_APPROVAL 
    )
    
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

def add_participant(db: Session, party_id: str, user_id: str, nickname: str) -> PartyParticipation:
    """
    파티에 참가자를 추가(신청)합니다.
    """
    # 이미 참가했는지 확인
    db_participation = db.query(PartyParticipation).filter(
        PartyParticipation.party_id == party_id,
        PartyParticipation.user_id == user_id
    ).first()
    
    if db_participation:
        # 이미 존재하면 닉네임만 세팅해서 반환 (API 응답 호환성 위해)
        setattr(db_participation, 'nickname', nickname)
        return db_participation

    # 새 참가 정보 생성
    db_participation = PartyParticipation(
        party_id=party_id,
        user_id=user_id,
        status=PartyParticipantStatusEnum.PENDING
    )
    
    db.add(db_participation)
    db.commit()
    db.refresh(db_participation)
    
    # Pydantic 응답용 닉네임 주입
    setattr(db_participation, 'nickname', nickname)
    
    return db_participation


# --------------------------------------------------------------------------
# 수정 (Update)
# --------------------------------------------------------------------------

def update_party(db: Session, db_party: Party, party_in: PartyUpdate) -> Party:
    """
    파티 정보를 수정합니다.
    """
    # exclude_unset=True를 사용하여 사용자가 보낸 필드만 업데이트
    update_data = party_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_party, field, value)

    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

def update_party_status(db: Session, db_party: Party, status: PartyStatusEnum) -> Party:
    """
    파티의 상태를 변경합니다 (승인/취소/완료 등).
    """
    db_party.status = status
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party


# --------------------------------------------------------------------------
# 삭제 (Delete)
# --------------------------------------------------------------------------

def remove_participant(db: Session, party_id: str, user_id: str) -> Optional[PartyParticipation]:
    """
    참가자를 파티에서 제거합니다 (나가기 또는 내보내기).
    """
    db_participation = db.query(PartyParticipation).filter(
        PartyParticipation.party_id == party_id,
        PartyParticipation.user_id == user_id
    ).first()

    if db_participation:
        db.delete(db_participation)
        db.commit()
        return db_participation
        
    return None