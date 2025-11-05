# FastAPI의 의존성 주입(Dependency Injection) 시스템에서 사용될 함수
'''
1. 데이터베이스 세션 관리 (get_db)
2. 인증 및 권한 관리 (get_current_user, get_current_admin_user)
'''
# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User
# from app.crud import user as crud_user
# from app.core import security # (보안/토큰 로직 구현 필요)

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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login") 

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    OAuth2 스킴에서 토큰을 가져와 디코딩하고,
    DB에서 해당 사용자를 찾아 반환합니다.
    
    (주의: 실제 토큰 검증 로직 구현이 필요합니다)
    """
    
    # (실제 토큰 검증 로직 구현 위치)
    
    # (임시) 인증 로직 구현 전, 임시로 첫 번째 사용자를 반환
    print(f"임시: 토큰 '{token}'을(를) 검증하는 중입니다.")
    temp_user = db.query(User).first()
    if not temp_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="테스트 사용자를 찾을 수 없음 (인증 실패)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return temp_user


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