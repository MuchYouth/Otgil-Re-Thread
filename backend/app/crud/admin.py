from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import User, ClothingItem, Party, PartyStatusEnum

def get_overall_stats(db: Session) -> dict:
    """
    서비스 전체 통계 데이터를 집계합니다.
    AdminOverallStats 스키마에 맞게 반환합니다.
    """
    
    total_users = db.query(func.count(User.id)).scalar()
    total_items = db.query(func.count(ClothingItem.id)).scalar()
    
    # 'total_events'를 전체 파티 수로 가정
    total_events = db.query(func.count(Party.id)).scalar()
    
    # 'total_exchanges'를 완료된 파티 수로 가정
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