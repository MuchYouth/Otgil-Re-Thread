import uuid
from sqlalchemy.orm import Session
from typing import List

from app.models import ClothingItem, PartySubmissionStatusEnum, GoodbyeTag, HelloTag
from app.schemas import ClothingItemCreate, ClothingItemUpdate, GoodbyeTagCreate, HelloTagCreate
from app import models

def get_item(db: Session, item_id: str) -> ClothingItem | None:
    """ID로 단일 아이템을 조회합니다."""
    return db.query(ClothingItem).filter(ClothingItem.id == item_id).first()

def get_items_for_exchange(db: Session, skip: int = 0, limit: int = 20) -> List[ClothingItem]:
    """교환을 위해 등록된 아이템 목록을 조회합니다."""
    return db.query(ClothingItem)\
        .filter(ClothingItem.is_listed_for_exchange == True)\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_items_by_user(db: Session, user_id: str) -> List[ClothingItem]:
    """특정 사용자가 등록한 모든 아이템 목록을 조회합니다."""
    return db.query(ClothingItem)\
        .filter(ClothingItem.user_id == user_id)\
        .order_by(ClothingItem.id.desc())\
        .all()

def create_user_item(db: Session, item: ClothingItemCreate, user_id: str, user_nickname: str) -> ClothingItem:
    """
    사용자의 새 아이템을 생성합니다.
    ClothingItemCreate 스키마의 모든 필드를 받습니다.
    """
    item_data = item.model_dump()
    
    db_item = ClothingItem(
        **item_data,
        id=str(uuid.uuid4()),
        user_id=user_id,
        user_nickname=user_nickname
    )
     # 3. 환경 부하 지표 계산
    try:
        impact_results = calculate_environmental_impact(db_item)
    except Exception as e:
        # 계산 실패 시 로깅 또는 예외 처리 필요
        print(f"Error calculating environmental impact: {e}")
        # 기본값으로 설정하고 진행하거나, 등록을 거부할 수 있음 (여기서는 기본값 0으로 설정)
        impact_results = {
            "co2Reduced": 0.0,
            "waterSaved": 0.0,
            "environmental_burden_score": 0.0,
            "credit_amount": 0
        }
    # 4. 계산된 값을 DB 모델에 업데이트
    db_item.carbon_saved = impact_results["co2Reduced"]
    db_item.water_saved = impact_results["waterSaved"]
    db_item.environmental_burden_score = impact_results["environmental_burden_score"]
    db_item.credit_amount = impact_results["creditAmount"]
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, db_item: ClothingItem, item_in: ClothingItemUpdate) -> ClothingItem:
    """
    아이템 정보를 수정합니다.
    ClothingItemUpdate 스키마에 정의된 필드들을 업데이트합니다.
    """
    update_data = item_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item_submission_status(db: Session, db_item: ClothingItem, status: str) -> ClothingItem:
    """아이템의 파티 출품 상태를 변경합니다 (관리자용)."""
    try:
        status_enum = PartySubmissionStatusEnum(status)
    except ValueError:
        return db_item 

    db_item.party_submission_status = status_enum
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def remove_item(db: Session, db_item: ClothingItem):
    """
    특정 아이템 객체를 데이터베이스에서 삭제합니다.
    """
    db.delete(db_item)
    db.commit()
    # 반환할 것이 없으므로 None을 반환하거나, 성공 메시지 처리를 위해 True를 반환할 수도 있습니다.


def create_goodbye_tag(db: Session, db_item: ClothingItem, tag_in: GoodbyeTagCreate) -> ClothingItem:
    """
    아이템에 GoodbyeTag를 생성하고 연결합니다.
    """
    # GoodbyeTag 모델 생성. item_id를 PK/FK로 사용
    db_tag = GoodbyeTag(
        clothing_item_id=db_item.id,
        **tag_in.model_dump()
    )
    
    # ClothingItem 객체에 관계를 통해 GoodbyeTag 연결
    db_item.goodbye_tag = db_tag
    
    db.add(db_item) # item을 커밋하면 cascade 설정에 따라 tag도 저장됨
    db.commit()
    db.refresh(db_item)
    return db_item

def create_hello_tag(db: Session, db_item: ClothingItem, tag_in: HelloTagCreate) -> ClothingItem:
    """
    아이템에 HelloTag를 생성하고 연결합니다.
    """
    # HelloTag 모델 생성. item_id를 PK/FK로 사용
    db_tag = HelloTag(
        clothing_item_id=db_item.id,
        **tag_in.model_dump()
    )
    
    # ClothingItem 객체에 관계를 통해 HelloTag 연결
    db_item.hello_tag = db_tag
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# backend/app/crud/item.py (또는 crud 관련 파일)

def get_items_by_party(db: Session, party_id: str):
    return db.query(models.ClothingItem).filter(
        models.ClothingItem.submitted_party_id == party_id,
        models.ClothingItem.party_submission_status == "APPROVED"  # 승인된 것만 조회
    ).all()


# 1. 소재별 데이터 (1kg당)
MATERIAL_DATA = {
    "Cotton": {"co2": 4.5, "water": 10000},
    "Polyester": {"co2": 12.5, "water": 60},
    "Nylon": {"co2": 28.0, "water": 150},
    "Wool": {"co2": 30.0, "water": 200},
    "Viscose": {"co2": 7.5, "water": 400},
    "Linen": {"co2": 3.5, "water": 2500},
    "Silk": {"co2": 7.0, "water": 4500},
    "Acrylic": {"co2": 15.0, "water": 100},
    "Lyocell": {"co2": 3.0, "water": 500},
    "Modal": {"co2": 5.0, "water": 600},
    "Default": {"co2": 10.0, "water": 2000}, # 정보 없음
}

# 크레딧 변환 계수 (K)
K_FACTOR = 100 

def calculate_environmental_impact(item: ClothingItem) -> dict:
    """
    카테고리, 소재, 무게를 입력받아 탄소, 물, 폐기물 절감량 및 크레딧(OL)을 계산
    """
    category = item.category
    material_type = item.material_type
    weight_kg = item.weight_kg
    
    # 1. 악세서리 여부 확인 (소재 무관, 무게 중심)
    is_accessory = category in ["악세서리", "가방", "신발", "모자", "잡화"]
    
    if is_accessory:
        # 악세서리는 소재 불분명 시 Default 사용 또는 별도 로직 적용
        # 여기서는 악세서리도 무게 비례로 계산하되, 복합 소재(Default)로 가정
        stats = MATERIAL_DATA["Default"]
    else:
        # 의류는 선택된 소재 데이터 사용
        stats = MATERIAL_DATA.get(material_type, MATERIAL_DATA["Default"])

    # 2. 절감량 계산 (단위: kg, L)
    # co2_reduced (kg)
    co2_val = stats["co2"] * weight_kg
    
    # water_saved (L)
    water_val = stats["water"] * weight_kg
    
    # waste_saved (kg) - 리사이클링되므로 무게만큼 폐기물 절감
    waste_val = weight_kg

    # 3. 크레딧(OL) 계산 공식 적용
    # OL = k * (0.5*CO2 + 0.3*Water*0.001 + 0.2*Waste)
    # Water는 L단위이므로 0.001을 곱해 톤 단위(또는 계수 보정)로 맞춤
    score = (0.5 * co2_val) + (0.3 * water_val * 0.001) + (0.2 * waste_val)
    credit_amount = int(K_FACTOR * score)

    return {
        "co2Reduced": round(co2_val, 2),
        "waterSaved": int(water_val),
        "environmental_burden_score": round(score, 2),
        "creditAmount": credit_amount
    }