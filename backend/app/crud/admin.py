from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime

from app.models import User, ClothingItem, Party, PartyStatusEnum, PartyParticipation, Credit, CreditTypeEnum, PartySubmissionStatusEnum, PartyParticipantStatusEnum

def get_overall_stats(db: Session) -> dict:
    """
    서비스 전체 통계 데이터를 집계합니다.
    AdminOverallStats 스키마에 맞게 반환합니다.
    """
    
    total_users = db.query(func.count(User.id)).scalar()
    total_items = db.query(func.count(ClothingItem.id)).scalar()
    
    # 'total_events'를 전체 파티 수로 가정
    total_events = db.query(func.count(Party.id)).scalar()
    
    # 'total_exchanges'를 완료된 파티 수로 가정 (또는 실제 교환된 아이템 수 등으로 정의 가능)
    # 여기서는 완료된 파티 수로 계산합니다.
    total_exchanges = db.query(func.count(Party.id))\
        .filter(Party.status == PartyStatusEnum.COMPLETED)\
        .scalar()
        
    # AdminOverallStats 스키마 형태에 맞춰 딕셔너리 반환
    stats = {
        "total_users": total_users or 0,
        "total_items": total_items or 0,
        "total_exchanges": total_exchanges or 0,
        "total_events": total_events or 0,
    }
    return stats

def get_group_performance(db: Session) -> list:
    """
    (예시) 그룹별 성과 통계
    """
    # 예시: 파티 개최 지역별 통계
    # location별로 파티 수, 참가자 수 등을 집계
    results = db.query(
        Party.location,
        func.count(Party.id).label('party_count'),
        func.count(PartyParticipation.user_id).label('participant_count')
    ).outerjoin(PartyParticipation, Party.id == PartyParticipation.party_id)\
     .group_by(Party.location).all()
    
    performance_data = []
    for loc, party_cnt, part_cnt in results:
        if loc:
            performance_data.append({
                "group_name": loc, # 지역명을 그룹명으로 사용
                "users": part_cnt, # 해당 지역 파티 참가자 수 합계
                "items_listed": party_cnt * 10, # (예시) 파티당 평균 10벌 가정
                "exchanges": party_cnt * 5 # (예시) 파티당 평균 5벌 교환 가정
            })
            
    return performance_data

def get_daily_activity(db: Session) -> list:
    """
    최근 7일간의 일일 활동(예: 크레딧 적립 횟수 등) 통계
    """
    today = datetime.date.today()
    week_ago = today - datetime.timedelta(days=7)
    
    # 간단하게 최근 7일치 Credit 데이터를 가져와서 Python에서 집계
    credits = db.query(Credit).filter(Credit.date >= week_ago).all()
    
    daily_counts = {}
    for i in range(7):
        day = week_ago + datetime.timedelta(days=i+1)
        daily_counts[day.strftime("%Y-%m-%d")] = 0
        
    for credit in credits:
        date_str = credit.date.strftime("%Y-%m-%d")
        if date_str in daily_counts:
            daily_counts[date_str] += 1
            
    return [{"date": date, "count": count} for date, count in daily_counts.items()]

def get_category_distribution(db: Session) -> list:
    """
    의류 카테고리별 분포 통계
    """
    results = db.query(
        ClothingItem.category,
        func.count(ClothingItem.id)
    ).group_by(ClothingItem.category).all()
    
    return [{"category": cat, "count": cnt} for cat, cnt in results]

# --- 추가된 관리자 기능 ---

def get_pending_party_items(db: Session) -> list[ClothingItem]:
    """파티 출품 승인 대기 중인 아이템 목록 조회"""
    return db.query(ClothingItem)\
        .filter(ClothingItem.party_submission_status == PartySubmissionStatusEnum.PENDING)\
        .all()

def update_item_submission_status(db: Session, item_id: str, status: str) -> ClothingItem | None:
    """아이템 파티 출품 상태 변경 (APPROVED / REJECTED)"""
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if not item:
        return None
    
    try:
        status_enum = PartySubmissionStatusEnum(status)
        item.party_submission_status = status_enum
        db.commit()
        db.refresh(item)
        return item
    except ValueError:
        return None

def update_party_status(db: Session, party_id: str, status: str) -> Party | None:
    """파티 상태 변경 (UPCOMING / REJECTED 등)"""
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        return None
    
    try:
        status_enum = PartyStatusEnum(status)
        party.status = status_enum
        db.commit()
        db.refresh(party)
        return party
    except ValueError:
        return None

def delete_party(db: Session, party_id: str) -> bool:
    """파티 삭제"""
    party = db.query(Party).filter(Party.id == party_id).first()
    if party:
        db.delete(party)
        db.commit()
        return True
    return False

def update_participant_status(db: Session, party_id: str, user_id: str, status: str) -> PartyParticipation | None:
    """참가자 상태 변경 (ACCEPTED / REJECTED 등)"""
    participant = db.query(PartyParticipation).filter(
        PartyParticipation.party_id == party_id,
        PartyParticipation.user_id == user_id
    ).first()
    
    if not participant:
        return None
        
    try:
        status_enum = PartyParticipantStatusEnum(status)
        participant.status = status_enum
        db.commit()
        db.refresh(participant)
        return participant
    except ValueError:
        return None