# 데이터베이스 연결설정
# 일단 로컬이나 소규모에서는 sqlite 이후 postgresql/mysql로 변경
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. SQLite 데이터베이스 파일 경로를 지정합니다.
#    이 코드는 백엔드 프로젝트의 루트 폴더에 'ot-gil.db'라는 파일을 생성하여 데이터베이스로 사용합니다.
SQLALCHEMY_DATABASE_URL = "sqlite:///./ot-gil.db"

# 2. 데이터베이스 엔진을 생성합니다.
#    'connect_args={"check_same_thread": False}'는 SQLite를 사용할 때만 필요한 옵션입니다.
#    FastAPI가 여러 스레드에서 데이터베이스에 안전하게 접근할 수 있도록 허용해줍니다.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. 데이터베이스 세션 생성을 위한 클래스를 만듭니다.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. SQLAlchemy 모델들이 상속받을 Base 클래스를 만듭니다.
Base = declarative_base()