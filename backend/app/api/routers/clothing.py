from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import ClothingItemResponse, ClothingItemCreate, GoodbyeTagCreate
from app.models import User
from app.crud import clothing as crud_clothing

router = APIRouter()

@router.get("/{item_id}", response_model=ClothingItemResponse, summary="의류 상세 정보 및 태그 조회")
def read_clothing_item(
    item_id: str,
    db: Session = Depends(get_db)
):
    """
    의류 아이템의 상세 정보를 조회합니다. 
    Goodbye Tag와 Hello Tag 정보가 포함되어 반환됩니다 (QR 스캔 시 사용).
    """
    item = crud_clothing.get_clothing_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/", response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED, summary="의류 등록")
def create_item(
    item_in: ClothingItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """새로운 의류를 등록합니다."""
    return crud_clothing.create_clothing_item(db, item_in, current_user.id, current_user.nickname)

@router.post("/{item_id}/goodbye-tag", summary="Goodbye Tag 등록")
def create_goodbye_tag(
    item_id: str,
    tag_in: GoodbyeTagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    등록된 의류에 Goodbye Tag(사연)를 추가합니다.
    """
    item = crud_clothing.get_clothing_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    return crud_clothing.create_goodbye_tag(db, item_id, tag_in.model_dump())