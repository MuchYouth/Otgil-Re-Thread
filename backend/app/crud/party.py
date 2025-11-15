import uuid
from sqlalchemy.orm import Session
from typing import List

from app.models import Party, PartyParticipation, PartyStatusEnum, PartyParticipantStatusEnum
from app.schemas import PartyCreate

def get_party(db: Session, party_id: str) -> Party | None:
    """ID로 단일 파티를 조회합니다."""
    return db.query(Party).filter(Party.id == party_id).first()

def get_parties_by_status(db: Session, status: str) -> List[Party]:
    """특정 상태(UPCOMING, COMPLETED 등)의 파티 목록을 조회합니다."""
    try:
        status_enum = PartyStatusEnum(status.upper())
    except ValueError:
        return []
        
    return db.query(Party)\
        .filter(Party.status == status_enum)\
        .order_by(Party.date.asc())\
        .all()

def get_party_by_invitation_code(db: Session, code: str) -> Party | None:
    """초대 코드로 파티를 조회합니다."""
    return db.query(Party).filter(Party.invitation_code == code).first()

def create_party(db: Session, party: PartyCreate, host_id: str) -> Party:
    """
    새로운 파티 호스팅을 신청합니다 (PENDING_APPROVAL 상태).
    PartyCreate 스키마의 필드들을 사용합니다.
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

def update_party_status(db: Session, db_party: Party, status: str) -> Party:
    """파티의 상태를 변경합니다 (관리자용)."""
    try:
        status_enum = PartyStatusEnum(status.upper())
    except ValueError:
        return db_party
        
    db_party.status = status_enum
    
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

def add_participant(db: Session, party_id: str, user_id: str, nickname: str) -> PartyParticipation:
    """
    파티에 참가자를 추가(신청)합니다.
    
    [참고] 'parties.py' API가 'PartyParticipantResponse' 스키마를
    response_model로 사용합니다. 이 스키마는 'nickname' 필드를 요구하지만,
    'PartyParticipation' 모델에는 'nickname' 필드가 없습니다.
    Pydantic이 'db_participation.user.nickname'을 자동으로 찾지 못할 수 있으므로,
    Pydantic이 직렬화하기 전에 객체에 'nickname' 속성을 동적으로 추가합니다.
    """
    db_participation = db.query(PartyParticipation).filter(
        PartyParticipation.party_id == party_id,
        PartyParticipation.user_id == user_id
    ).first()
    
    if db_participation:
        # Pydantic이 응답을 직렬화할 수 있도록 닉네임 추가
        setattr(db_participation, 'nickname', nickname)
        return db_participation

    db_participation = PartyParticipation(
        party_id=party_id,
        user_id=user_id,
        status=PartyParticipantStatusEnum.PENDING
    )
    
    db.add(db_participation)
    db.commit()
    db.refresh(db_participation)
    
    # Pydantic이 응답을 직렬화할 수 있도록 닉네임 추가
    setattr(db_participation, 'nickname', nickname)
    
    return db_participation