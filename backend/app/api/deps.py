# FastAPI의 의존성 주입(Dependency Injection) 시스템에서 사용될 함수
'''
1. 데이터베이스 세션 관리 (get_db)
2. 인증 및 권한 관리 (get_current_user, get_current_admin_user)
'''
# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError # (11월 20일 추가)
from sqlalchemy.orm import Session
from app.core.security import ALGORITHM, SECRET_KEY # 위에서 만든 파일 import
from app.database import SessionLocal
from app.models import User
from app.crud import user as crud_user #(11월 20일 주석 해제)
#from app.core import security # (보안/토큰 로직 구현 필요) #위에서 구현 완료(11월 20일)

#(11월 20일 추가)----------------------------------------------------
# OAuth2PasswordBearer는 프론트엔드가 토큰을 보낼 때
# Authorization: Bearer {token} 헤더를 파싱해줍니다.
# tokenUrl은 로그인 엔드포인트의 주소입니다.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
#-------------------------------------------------------------------
# --- 1. Database Dependency ---

def get_db():
    """
    요청마다 새로운 DB 세션을 생성하고,
    요청이 완료되면 세션을 닫습니다.
    """
    db = SessionLocal()
    try:
        yield db  # API 엔드포인트 함수로 db 세션을 '주입'
    finally:
        db.close() # 요청 처리가 끝나면 db 세션을 닫음


# --- 2. Authentication Dependencies ---

# (주의: tokenUrl은 실제 로그인 엔드포인트의 경로여야 합니다)
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# app/api/deps.py

# from app.core import security # 실제 토큰 처리 모듈 (가정)

def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme)
) -> User:
    """
    헤더의 토큰을 검증하고, 해당하는 사용자 객체를 반환합니다.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="자격 증명을 검증할 수 없습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 1. 토큰 디코딩
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")  # create_access_token에서 넣은 'sub'

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception
        # 2. DB에서 유저 조회
    user = crud_user.get_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception

    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    현재 사용자가 관리자인지 확인합니다.
    관리자가 아니면 403 Forbidden 오류를 발생시킵니다.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 작업을 수행할 권한이 없습니다.",
        )
    return current_user


# --- 3. (Optional) Common Query Parameters ---

class PaginationParams:
    """
    페이지네이션을 위한 공통 쿼리 매개변수 의존성.
    """
    def __init__(
        self,
        skip: int = 0,
        limit: int = 20,
    ):
        if skip < 0:
            raise HTTPException(status_code=400, detail="skip은 0 이상이어야 합니다.")
        if limit < 1 or limit > 100:
             raise HTTPException(status_code=400, detail="limit은 1과 100 사이여야 합니다.")
        self.skip = skip
        self.limit = limit