import os
import uuid
import io
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from PIL import Image

from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.schemas import RewardResponse, RewardCreate, RewardUpdate
from app.models import User, Credit, CreditTypeEnum 
from app.crud import reward as crud_reward

router = APIRouter()

# 이미지 저장 헬퍼 함수 (필요한 경우 utils.py로 분리 권장)
async def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    os.makedirs(destination, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.jpg"
    file_path = os.path.join(destination, filename)
    
    # 이미지 압축 및 저장
    image = Image.open(io.BytesIO(await upload_file.read()))
    image = image.convert("RGB")
    image.save(file_path, format="JPEG", quality=70)
    
    return f"/{destination}/{filename}"

@router.get("/", response_model=List[RewardResponse], summary="리워드 목록 조회")
def read_rewards(db: Session = Depends(get_db)):
    """교환 가능한 모든 리워드 상품 목록을 조회합니다."""
    return crud_reward.get_rewards(db)

# --- 관리자 전용 API ---

@router.post("/", response_model=RewardResponse, status_code=status.HTTP_201_CREATED, summary="리워드 생성 (관리자)")
async def create_reward(
    name: str = Form(...),
    description: str = Form(...),
    cost: int = Form(...),
    type: str = Form(...),  # GOODS or SERVICE
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    # 1. 이미지 저장
    image_url = await save_upload_file(image, "static/rewards")
    
    # 2. 스키마 생성
    reward_in = RewardCreate(
        name=name,
        description=description,
        cost=cost,
        type=type,
        image_url=image_url
    )
    
    return crud_reward.create_reward(db, reward_in)

@router.patch("/{reward_id}", response_model=RewardResponse, summary="리워드 수정 (관리자)")
def update_reward(
    reward_id: str,
    reward_in: RewardUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    reward = crud_reward.update_reward(db, reward_id, reward_in)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    return reward

@router.delete("/{reward_id}", status_code=status.HTTP_204_NO_CONTENT, summary="리워드 삭제 (관리자)")
def delete_reward(
    reward_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    success = crud_reward.delete_reward(db, reward_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reward not found")
    return

# --- 사용자 기능 ---

@router.post("/exchange/{reward_id}", summary="리워드 교환 신청")
def exchange_reward(
    reward_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ... (기존 교환 로직 유지) ...
    reward = crud_reward.get_reward(db, reward_id=reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    current_balance = sum(credit.amount for credit in current_user.credits)
    if current_balance < reward.cost:
        raise HTTPException(status_code=400, detail="Insufficient credits")

    new_credit = Credit(
        id=str(uuid.uuid4()), # ID 생성 필요
        user_id=current_user.id,
        amount=-reward.cost,
        type=CreditTypeEnum.SPENT_REWARD,
        activity_name=f"리워드 교환: {reward.name}",
        date=datetime.datetime.utcnow()
    )
    
    db.add(new_credit)
    db.commit()

    return {
        "msg": "Exchange successful",
        "remaining_credits": current_balance - reward.cost
    }