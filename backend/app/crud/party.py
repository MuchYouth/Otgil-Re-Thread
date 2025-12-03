import uuid
import random
import string
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional

# [핵심 수정 1] models를 통째로 import 하여 스키마와 이름 충돌 방지
from app import models 
from app.schemas import PartyCreate, PartyUpdate

# --------------------------------------------------------------------------
# 조회 (Read)
# --------------------------------------------------------------------------

def get_party(db: Session, party_id: str) -> models.Party | None:
    """ID로 단일 파티를 조회합니다."""
    return db.query(models.Party).filter(models.Party.id == party_id).first()

def get_parties(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None, 
    search: Optional[str] = None
) -> List[models.Party]:
    """
    파티 목록을 조회합니다. 
    상태(status) 필터링과 검색(search) 기능을 포함합니다.
    """
    query = db.query(models.Party)

    # 1. 상태 필터링
    if status:
        # Enum 값이 들어올 수도 있고 문자열이 들어올 수도 있으므로 처리
        if isinstance(status, models.PartyStatusEnum):
            query = query.filter(models.Party.status == status)
        else:
            query = query.filter(models.Party.status == status)

    # 2. 검색 (제목 또는 설명)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                models.Party.title.like(search_pattern),
                models.Party.description.like(search_pattern)
            )
        )

    # 날짜순 정렬 (가까운 날짜 먼저)
    return query.order_by(models.Party.date.asc()).offset(skip).limit(limit).all()

def get_party_by_invitation_code(db: Session, code: str) -> models.Party | None:
    """초대 코드로 파티를 조회합니다."""
    return db.query(models.Party).filter(models.Party.invitation_code == code).first()

def get_parties_for_user(db: Session, user_id: str) -> List[models.Party]:
    """
    사용자가 호스팅 중이거나 참가 중인 모든 파티를 조회합니다.
    """
    return db.query(models.Party).outerjoin(models.PartyParticipation, models.Party.id == models.PartyParticipation.party_id)\
        .filter(
            or_(
                models.Party.host_id == user_id,
                models.PartyParticipation.user_id == user_id
            )
        ).distinct().order_by(models.Party.date.asc()).all()

def get_participants(db: Session, party_id: str) -> List[models.PartyParticipation]:
    """
    특정 파티의 참가자 목록을 조회합니다.
    """
    participations = db.query(models.PartyParticipation)\
        .join(models.User, models.PartyParticipation.user_id == models.User.id)\
        .filter(models.PartyParticipation.party_id == party_id)\
        .all()
    
    for p in participations:
        nickname = p.user.nickname if p.user else "Unknown"
        setattr(p, 'nickname', nickname)
        
    return participations

# [핵심 수정 2] 파티 아이템(라인업) 조회 함수 추가
def get_party_items(db: Session, party_id: str) -> List[models.ClothingItem]:
    """
    특정 파티에 출품되고 승인된 아이템 목록을 조회합니다.
    """
    # 반드시 models.ClothingItem 을 사용해야 합니다.
    return db.query(models.ClothingItem).filter(
        models.ClothingItem.submitted_party_id == party_id,
        models.ClothingItem.party_submission_status == "APPROVED"
    ).all()


# --------------------------------------------------------------------------
# 생성 (Create)
# --------------------------------------------------------------------------

def generate_invitation_code() -> str:
    """6자리의 랜덤한 대문자/숫자 초대 코드를 생성합니다."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(6))

def create_party(db: Session, party: PartyCreate, host_id: str) -> models.Party:
    """
    새로운 파티를 생성합니다.
    status 파라미터를 통해 초기 상태를 설정할 수 있습니다.
    """
    party_data = party.model_dump()
    invitation_code = generate_invitation_code()

    db_party = models.Party(
        **party_data,
        id=str(uuid.uuid4()),
        host_id=host_id,
        status=models.PartyStatusEnum.PENDING_APPROVAL,
        invitation_code=invitation_code
    )
    
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

def add_participant(db: Session, party_id: str, user_id: str, nickname: str) -> models.PartyParticipation:
    """
    파티에 참가자를 추가(신청)합니다.
    """
    db_participation = db.query(models.PartyParticipation).filter(
        models.PartyParticipation.party_id == party_id,
        models.PartyParticipation.user_id == user_id
    ).first()
    
    if db_participation:
        setattr(db_participation, 'nickname', nickname)
        return db_participation

    db_participation = models.PartyParticipation(
        party_id=party_id,
        user_id=user_id,
        status=models.PartyParticipantStatusEnum.PENDING
    )
    
    db.add(db_participation)
    db.commit()
    db.refresh(db_participation)
    
    setattr(db_participation, 'nickname', nickname)
    
    return db_participation


# --------------------------------------------------------------------------
# 수정 (Update)
# --------------------------------------------------------------------------

def update_party(db: Session, db_party: models.Party, party_in: PartyUpdate) -> models.Party:
    """
    파티 정보를 수정합니다.
    """
    update_data = party_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_party, field, value)

    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

def update_party_status(db: Session, db_party: models.Party, status: models.PartyStatusEnum) -> models.Party:
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

def remove_participant(db: Session, party_id: str, user_id: str) -> Optional[models.PartyParticipation]:
    """
    참가자를 파티에서 제거합니다 (나가기 또는 내보내기).
    """
    db_participation = db.query(models.PartyParticipation).filter(
        models.PartyParticipation.party_id == party_id,
        models.PartyParticipation.user_id == user_id
    ).first()

    if db_participation:
        db.delete(db_participation)
        db.commit()
        return db_participation
        
    return None


def check_in_participant(db: Session, party_id: str, user_id: str) -> Optional[models.PartyParticipation]:
    """
    QR 코드를 통해 파티 참가자의 상태를 'ATTENDED'로 변경합니다 (체크인).
    """
    participation = db.query(models.PartyParticipation).filter(
        models.PartyParticipation.party_id == party_id,
        models.PartyParticipation.user_id == user_id
    ).first()

    if participation:
        participation.status = models.PartyParticipantStatusEnum.ATTENDED
        db.commit()
        db.refresh(participation)
        return participation
    return None