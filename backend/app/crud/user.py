import uuid
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models import User
from app.schemas import UserCreate, UserUpdate

# 비밀번호 해싱을 위한 설정
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """비밀번호를 해시합니다."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """일반 비밀번호와 해시된 비밀번호를 비교합니다."""
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, user_id: str) -> User | None:
    """ID로 사용자를 조회합니다."""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> User | None:
    """이메일로 사용자를 조회합니다."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_nickname(db: Session, nickname: str) -> User | None:
    """닉네임으로 사용자를 조회합니다."""
    return db.query(User).filter(User.nickname == nickname).first()

def create_user(db: Session, user: UserCreate) -> User:
    """
    새로운 사용자를 생성합니다.
    
    주의: models.py의 User 모델에 'hashed_password' 필드가 있어야 합니다.
    """
    hashed_password = get_password_hash(user.password)
    
    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        nickname=user.nickname,
        hashed_password=hashed_password, # 모델에 이 필드가 있어야 함
        phone_number=user.phone_number,
        is_admin=user.is_admin # [수정] 관리자 여부 저장
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    """
    사용자 정보를 업데이트합니다.
    UserUpdate 스키마에 따라 닉네임, 이메일, 전화번호만 업데이트합니다.
    """
    # Pydantic 모델에서 업데이트할 데이터만 가져옵니다 (None 값 제외)
    update_data = user_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """사용자 목록을 조회합니다."""
    return db.query(User).offset(skip).limit(limit).all()

# [추가] 로그인 검증 (이메일과 비밀번호 확인)
def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# [추가] 이웃 추가 (팔로우)
def add_neighbor(db: Session, db_user: User, neighbor_id: str) -> User:
    # 팔로우할 대상 조회s
    neighbor = get_user(db, neighbor_id)
    if not neighbor:
        return None
    
    # 이미 이웃인지 확인 (SQLAlchemy 관계 객체에서 확인 가능)
    if neighbor not in db_user.neighbors:
        db_user.neighbors.append(neighbor)
        db.commit()
        db.refresh(db_user)
    
    return db_user

# [추가] 이웃 삭제 (언팔로우)
def remove_neighbor(db: Session, db_user: User, neighbor_id: str) -> User:
    neighbor = get_user(db, neighbor_id)
    if not neighbor:
        return None

    if neighbor in db_user.neighbors:
        db_user.neighbors.remove(neighbor)
        db.commit()
        db.refresh(db_user)
        
    return db_user