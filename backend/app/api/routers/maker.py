from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.schemas import MakerResponse
from app.crud import maker as crud_maker

router = APIRouter()

@router.get("/", response_model=List[MakerResponse], summary="메이커스 허브 목록 조회")
def read_makers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    의류 수선 및 리폼을 제공하는 메이커들의 목록을 조회합니다.
    (response_model의 products 필드를 통해 상품 정보도 함께 반환됨 - ORM 관계)
    """
    return crud_maker.get_makers(db, skip=skip, limit=limit)