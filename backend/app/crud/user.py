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

#----------------------------------------------11월22일 수정
def create_user(db: Session, user: UserCreate) -> User:
    """
    새로운 사용자를 생성합니다.
    """
    print(f"--> [CRUD] 회원가입 시작: {user.email}")  # [디버깅용 출력]

    hashed_password = get_password_hash(user.password)

    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        nickname=user.nickname,
        hashed_password=hashed_password,
        phone_number=user.phone_number
    )

    try:
        db.add(db_user)
        db.commit()  # [핵심] 이 줄이 없으면 DB에 저장이 안 됩니다!
        db.refresh(db_user)
        print(f"--> [CRUD] DB 저장 성공! ID: {db_user.id}")  # [디버깅용 출력]
    except Exception as e:
        print(f"--> [CRUD] DB 저장 실패 (에러): {e}")
        db.rollback()  # 에러나면 되돌리기
        raise e

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

#(11월 20일 추가)-------------------------------------------------------------------------------------
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
    # 팔로우할 대상 조회
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

# ------------------------------------------- 검증위한 코드 11월 22일
def authenticate_user(db: Session, email: str, password: str):
    # [범인 찾기 2] 검증 과정 낱낱이 출력하기
    print(f"--> [CRUD] 인증 시작: {email}")

    user = get_user_by_email(db, email)

    if not user:
        print(f"--> [CRUD] 실패: DB에서 유저를 찾을 수 없음 (이메일 불일치)")
        return None

    print(f"--> [CRUD] 유저 찾음! ID: {user.id}, DB에 저장된 해시: {user.hashed_password}")

    # 비밀번호 검증
    is_correct = verify_password(password, user.hashed_password)

    if not is_correct:
        print(f"--> [CRUD] 실패: 비밀번호가 틀림 (입력값: {password})")
        return None

    print(f"--> [CRUD] 성공: 비밀번호 일치!")
    return user