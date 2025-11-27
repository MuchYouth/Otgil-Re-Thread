from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_admin_user
from app.schemas import (
    MakerResponse, MakerCreate, MakerUpdate,
    MakerProductResponse, MakerProductCreate, MakerProductUpdate
)
from app.models import User
from app.crud import maker as crud_maker

router = APIRouter()

# --- 조회 (Public) ---

@router.get("/", response_model=List[MakerResponse], summary="메이커 목록 조회")
def read_makers(db: Session = Depends(get_db)):
    return crud_maker.get_makers(db)

@router.get("/{maker_id}", response_model=MakerResponse, summary="메이커 상세 조회")
def read_maker(maker_id: str, db: Session = Depends(get_db)):
    maker = crud_maker.get_maker(db, maker_id)
    if not maker:
        raise HTTPException(status_code=404, detail="Maker not found")
    return maker

# --- 메이커 관리 (Admin Only) ---

@router.post("/", response_model=MakerResponse, status_code=status.HTTP_201_CREATED, summary="메이커 등록 (관리자)")
def create_maker(
    maker_in: MakerCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    return crud_maker.create_maker(db, maker_in)

@router.patch("/{maker_id}", response_model=MakerResponse, summary="메이커 정보 수정 (관리자)")
def update_maker(
    maker_id: str,
    maker_in: MakerUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    maker = crud_maker.update_maker(db, maker_id, maker_in)
    if not maker:
        raise HTTPException(status_code=404, detail="Maker not found")
    return maker

@router.delete("/{maker_id}", status_code=status.HTTP_204_NO_CONTENT, summary="메이커 삭제 (관리자)")
def delete_maker(
    maker_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    success = crud_maker.delete_maker(db, maker_id)
    if not success:
        raise HTTPException(status_code=404, detail="Maker not found")
    return

# --- 굿즈 관리 (Admin Only) ---

@router.post("/{maker_id}/products", response_model=MakerProductResponse, status_code=status.HTTP_201_CREATED, summary="굿즈 등록 (관리자)")
def create_product(
    maker_id: str,
    product_in: MakerProductCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    # 메이커 존재 여부 확인
    maker = crud_maker.get_maker(db, maker_id)
    if not maker:
        raise HTTPException(status_code=404, detail="Maker not found")
        
    return crud_maker.create_maker_product(db, maker_id, product_in)

@router.patch("/products/{product_id}", response_model=MakerProductResponse, summary="굿즈 수정 (관리자)")
def update_product(
    product_id: str,
    product_in: MakerProductUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    product = crud_maker.update_maker_product(db, product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, summary="굿즈 삭제 (관리자)")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    success = crud_maker.delete_maker_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return