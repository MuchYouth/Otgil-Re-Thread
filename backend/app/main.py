from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 가정: app/api/routers/ 디렉토리 내에 7개의 파일을 생성
from app.api.routers import user, item, party, community, maker, credit, admin

# 가정: app/database.py에 Base와 engine이 정의되어 있음
from app.database import Base, engine

# 애플리케이션 시작 시 데이터베이스 테이블 생성 (개발용)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="21% Party API",
    description="지속가능한 의류 교환을 위한 API 서버",
    version="1.0.0",
)

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