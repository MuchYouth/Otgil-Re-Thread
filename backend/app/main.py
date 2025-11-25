from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 가정: app/api/routers/ 디렉토리 내에 7개의 파일을 생성
from .api.routers import user, item, party, community, maker, credit, admin
# (필수 수정) User 모델이 정의된 파일을 명시적으로 임포트해야 Base.metadata에 등록됩니다.
# User 모델이 app/models.py에 있다고 가정하고 작성합니다.
# 가정: app/database.py에 Base와 engine이 정의되어 있음
from .database import Base, engine
from app import models # [2] 모델 파일 전체를 import 해야 인식이 됨! (11월 21일 추가)

# 애플리케이션 시작 시 데이터베이스 테이블 생성 (개발용)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ot-gil",
    description="지속가능한 의류 교환을 위한 플랫폼",
    version="1.0.0",
)

# [2] CORS 설정 (프론트엔드 연동 필수!) (11월 22일 추가)
origins = [
    "http://localhost:3000",  # 리액트/뷰 등 프론트엔드 개발 서버 주소
    "http://127.0.0.1:3000",
    # "https://your-frontend-domain.com", # 나중에 배포하면 실제 도메인도 추가
]

# --- 미들웨어 설정 ---
# CORS (Cross-Origin Resource Sharing) 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시에는 프론트엔드 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 라우터 포함 ---
# 7개의 도메인 라우터를 prefix와 tag와 함께 포함시킵니다.
app.include_router(user.router, prefix="/users", tags=["1. Users"])
app.include_router(item.router, prefix="/items", tags=["2. Items"])
app.include_router(party.router, prefix="/parties", tags=["3. Parties"])
app.include_router(community.router, prefix="/community", tags=["4. Community"])
app.include_router(maker.router, prefix="/makers", tags=["5. Makers"])
app.include_router(credit.router, prefix="/credits", tags=["6. Credits & Rewards"])
app.include_router(admin.router, prefix="/admin", tags=["7. Admin"])


@app.get("/", tags=["Root"])
async def read_root():
    """
    API 서버의 상태를 확인하는 기본 엔드포인트입니다.
    """
    return {"message": "Welcome to Otgil API Server!"}