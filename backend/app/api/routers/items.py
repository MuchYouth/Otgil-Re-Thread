from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas import ClothingItemCreate, ClothingItemResponse, ClothingItemUpdate
from app.models import User
from app.crud import item as crud_item

router = APIRouter()

@router.get(
    "/", 
    response_model=List[ClothingItemResponse],
    summary="교환 아이템 목록 조회 (탐색)"
)
def read_items(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """
    교환을 위해 등록된 (is_listed_for_exchange=True) 모든 아이템 목록을 조회합니다.
    - 필터링, 정렬, 검색 기능 추가 필요
    """
    items = crud_item.get_items_for_exchange(db, skip=skip, limit=limit)
    return items


@router.post(
    "/", 
    response_model=ClothingItemResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="내 옷장에 아이템 등록"
)
def create_item(
    item_in: ClothingItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자의 옷장에 새 아이템을 등록합니다.
    """
    return crud_item.create_user_item(
        db=db, 
        item=item_in, 
        user_id=current_user.id, 
        user_nickname=current_user.nickname
    )


@router.get(
    "/my-items", 
    response_model=List[ClothingItemResponse],
    summary="내 옷장 아이템 목록 조회"
)
def read_my_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자가 등록한 모든 아이템 목록을 조회합니다.
    """
    items = crud_item.get_items_by_user(db, user_id=current_user.id)
    return items


@router.patch(
    "/{item_id}",
    response_model=ClothingItemResponse,
    summary="내 아이템 정보 수정"
)
def update_item(
    item_id: str,
    item_in: ClothingItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    내 아이템의 정보를 수정합니다.
    - (아이템 소유권 검증 로직 필요)
    """
    db_item = crud_item.get_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="아이템을 찾을 수 없습니다.")
    if db_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")
        
    return crud_item.update_item(db=db, db_item=db_item, item_in=item_in)

# ... (아이템 삭제, Goodbye/Hello 태그 생성, 파티 출품 신청 등 라우터) ...