from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.schemas import MakerResponse
from app.crud import maker as crud_maker

router = APIRouter()

@router.get(
    "/", 
    response_model=List[MakerResponse],
    summary="메이커 목록 조회"
)
def read_makers(
    db: Session = Depends(get_db)
):
    """
    등록된 모든 메이커 목록을 조회합니다.
    """
    makers = crud_maker.get_makers(db)
    return makers


@router.get(
    "/{maker_id}", 
    response_model=MakerResponse,
    summary="메이커 상세 정보 조회"
)
def read_maker(
    maker_id: str, 
    db: Session = Depends(get_db)
):
    """
    특정 메이커의 상세 정보와 해당 메이커의 상품 목록을 조회합니다.
    (MakerResponse 스키마에 products가 포함되어 있어야 함)
    """
    db_maker = crud_maker.get_maker(db, maker_id=maker_id)
    if db_maker is None:
        raise HTTPException(status_code=404, detail="메이커를 찾을 수 없습니다.")
    return db_maker

# ... (관리자용: 메이커 등록/수정/삭제, 상품 등록/수정/삭제 등 라우터) ...