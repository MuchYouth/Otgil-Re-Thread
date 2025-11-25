from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.schemas import ClothingItemCreate, ClothingItemResponse, ClothingItemUpdate, PartySubmissionStatusEnum, GoodbyeTagCreate, HelloTagCreate
from app.models import User, ClothingItem
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

@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="아이템 삭제 (소유자 전용)"
)
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ID에 해당하는 의류 아이템을 삭제합니다.
    **아이템의 소유자**만 삭제할 수 있습니다.
    """
    db_item = crud_item.get_item(db, item_id=item_id)
    
    #아이템이 없을 경우
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    #해당 아이템의 사용자와 현재 사용자가 일치하지 않을 때   
    if db_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to delete this item"
        )

    #remove_item은 이번에 crud에 추가했음
    crud_item.remove_item(db=db, db_item=db_item)
    
    # HTTP 204 No Content 상태 코드는 성공적으로 처리되었으나 클라이언트에게 보낼 데이터가 없을 때 사용됩니다.
    return

@router.put(
    "/{item_id}/submission_status",
    response_model=ClothingItemResponse,
    summary="아이템의 파티 출품 상태 변경 (관리자 전용)"
)
def update_item_submission_status_admin(
    item_id: str,
    status_in: PartySubmissionStatusEnum, # Enum 타입으로 입력받아 유효성 검사 자동화
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) 
):
    """
    아이템의 파티 출품 상태를 PENDING, APPROVED, REJECTED로 변경합니다.
    **관리자 권한**이 필요합니다.
    """
    db_item = crud_item.get_item(db, item_id=item_id)
    
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
    # item.py의 update_item_submission_status 함수에 Enum의 값(str) 전달
    updated_item = crud_item.update_item_submission_status(
        db=db, 
        db_item=db_item, 
        status=status_in.value 
    )
    return updated_item


@router.post(
    "/{item_id}/goodbye",
    response_model=ClothingItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="아이템의 Goodbye Tag 작성 (원래 소유자 전용)"
)
def create_goodbye_tag_for_item(
    item_id: str,
    tag_in: GoodbyeTagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    아이템을 떠나보내는 **원래 소유자**가 Goodbye Tag를 작성합니다.
    (아이템의 현재 소유자만 작성 가능)
    """
    db_item = crud_item.get_item(db, item_id=item_id)
    
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
    # 권한 검사: 아이템의 현재 소유자만 작성 가능
    if db_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to write Goodbye Tag for this item. Only the current owner can write it."
        )
        
    # 이미 태그가 작성되었는지 확인 (중복 작성 방지)
    if db_item.goodbye_tag: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Goodbye Tag already exists for this item"
        )

    updated_item = crud_item.create_goodbye_tag(db=db, db_item=db_item, tag_in=tag_in)
    return updated_item

@router.post(
    "/{item_id}/hello",
    response_model=ClothingItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="아이템의 Hello Tag 작성 (새 소유자 전용)"
)
def create_hello_tag_for_item(
    item_id: str,
    tag_in: HelloTagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    아이템을 **새로 받은 소유자**가 Hello Tag를 작성합니다.
    (교환이 완료되어 아이템의 user_id가 업데이트된 후, 새 소유자만 작성 가능)
    """
    db_item = crud_item.get_item(db, item_id=item_id)
    
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
    # 권한 검사: 아이템의 현재 소유자 (즉, 새로 받은 소유자)만 작성 가능
    # 교환 플로우상, 아이템을 받은 후 이 라우터를 호출하면 user_id가 이미 새 소유자의 ID여야 합니다.
    if db_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to write Hello Tag for this item. Only the current owner (new owner) can write it."
        )
    
    # Hello Tag가 이미 작성되었는지 확인
    if db_item.hello_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Hello Tag already exists for this item"
        )
        
    # (논리적 선행 조건) Goodbye Tag가 먼저 작성되었는지 확인
    if not db_item.goodbye_tag: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot write Hello Tag until the Goodbye Tag has been created by the previous owner."
        )

    updated_item = crud_item.create_hello_tag(db=db, db_item=db_item, tag_in=tag_in)
    return updated_item