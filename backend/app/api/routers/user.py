from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

# security 관련 함수 및 설정 임포트
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
# 의존성 임포트
from app.api.deps import get_db, get_current_user
# 스키마 및 모델 임포트
from app.schemas import UserCreate, UserResponse, UserUpdate, Token
from app.models import User
from app.crud import user as crud_user

router = APIRouter()

@router.get(
    "/",
    response_model=List[UserResponse],
    summary="사용자 목록 조회"
)
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """모든 사용자 목록을 조회합니다."""
    return crud_user.get_users(db, skip=skip, limit=limit)

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

    # (crud_user.create_user 내부에서 비밀번호 해싱 처리됨)
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
    (JWT 토큰 헤더를 통해 식별)
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


# ---------------------------------------------------------
# [수정됨] 로그인 (토큰 발급) - 더미 코드 제거 및 로직 수정
# ---------------------------------------------------------
@router.post("/login", response_model=Token, summary="로그인 (토큰 발급)")
def login_access_token(
        db: Session = Depends(get_db),
        form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 호환 토큰 로그인, access token을 발급합니다.
    - **username**: 이메일 주소를 입력하세요.
    - **password**: 비밀번호
    """
    # 1. 이메일과 비밀번호로 유저 검증
    user = crud_user.authenticate_user(db, email=form_data.username, password=form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 정확하지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. 실제 JWT 토큰 생성 (들여쓰기 주의: if문 밖으로 나와야 합니다)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 여기서 만들어진 진짜 토큰을 반환해야 합니다.
    access_token = create_access_token(
        subject=user.id,  # 토큰에 유저의 ID를 담습니다
        expires_delta=access_token_expires
    )

    # [삭제됨] access_token = "eYe..."  <-- 이 부분이 에러의 원인이었습니다.

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ---------------------------------------------------------
# [추가] 로그아웃
# ---------------------------------------------------------
@router.post("/logout", summary="로그아웃")
def logout():
    """
    JWT 로그아웃은 프론트엔드에서 토큰을 삭제하는 것이 기본입니다.
    """
    return {"msg": "로그아웃 성공 (클라이언트에서 토큰을 삭제해주세요)"}


# ---------------------------------------------------------
# [추가] 이웃 추가 (Follow)
# ---------------------------------------------------------
@router.post("/{user_id}/neighbors", response_model=UserResponse, summary="이웃 추가")
def add_neighbor(
    user_id: str, # 팔로우할 대상의 ID
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    특정 사용자(user_id)를 내 이웃으로 추가합니다.
    """
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="자기 자신을 이웃으로 추가할 수 없습니다.")
        
    updated_user = crud_user.add_neighbor(db, db_user=current_user, neighbor_id=user_id)
    
    if not updated_user:
         raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
         
    return updated_user


# ---------------------------------------------------------
# [추가] 이웃 삭제 (Unfollow)
# ---------------------------------------------------------
@router.delete("/{user_id}/neighbors", response_model=UserResponse, summary="이웃 삭제")
def delete_neighbor(
    user_id: str, # 언팔로우할 대상의 ID
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    특정 사용자(user_id)를 내 이웃 목록에서 삭제합니다.
    """
    updated_user = crud_user.remove_neighbor(db, db_user=current_user, neighbor_id=user_id)
    
    if not updated_user:
         raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
         
    return updated_user