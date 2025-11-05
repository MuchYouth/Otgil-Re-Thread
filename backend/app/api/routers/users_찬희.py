from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user # (get_current_user는 인증 로직 구현 필요)
from app.schemas import UserCreate, UserResponse, UserUpdate
from app.models import User
from app.crud import user as crud_user

router = APIRouter()

@router.post(
    "/signup", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="회원 가입"
)
def create_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db)
):
    """
    새로운 사용자를 생성합니다 (회원가입).
    - **email** 또는 **nickname**이 중복되면 400 오류를 반환합니다.
    """
    db_user = crud_user.get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 이메일입니다.",
        )
    
    db_user_by_nickname = crud_user.get_user_by_nickname(db, nickname=user_in.nickname)
    if db_user_by_nickname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 닉네임입니다.",
        )

    # (crud_user.create_user 내부에서 비밀번호 해싱 필요)
    return crud_user.create_user(db=db, user=user_in)


@router.get(
    "/me", 
    response_model=UserResponse,
    summary="내 정보 조회"
)
def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자의 프로필 정보를 반환합니다.
    (JWT 토큰 등에서 사용자를 식별)
    """
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="내 정보 수정"
)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 사용자의 프로필 정보를 수정합니다.
    """
    return crud_user.update_user(db=db, db_user=current_user, user_in=user_in)


@router.get(
    "/{user_id}", 
    response_model=UserResponse,
    summary="특정 사용자 프로필 조회"
)
def read_user(
    user_id: str, 
    db: Session = Depends(get_db)
):
    """
    ID로 특정 사용자의 공개 프로필 정보를 조회합니다.
    """
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return db_user

# ... (로그인, 로그아웃, 이웃 추가/삭제 등 라우터) ...