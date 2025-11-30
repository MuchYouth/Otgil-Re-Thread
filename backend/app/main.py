import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# 가정: app/api/routers/ 디렉토리 내에 7개의 파일을 생성
from app.api.routers import user, item, party, community, maker, credit, admin,reward, story, clothing, post

# 가정: app/database.py에 Base와 engine이 정의되어 있음
from app.database import Base, engine
from app import models

# 애플리케이션 시작 시 데이터베이스 테이블 생성 (개발용)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ot-gil",
    description="지속가능한 의류 교환을 위한 플랫폼",
    version="1.0.0",
)
origins = [
    "http://localhost:3000", # 리액트/뷰 프론트엔드 개발 서버 주소
    "http://127.0.0.1:3000",
    # "https://your-frontend-domain.com" # 나중에 배포하면 실제 도메인 추가
]
# --- 미들웨어 설정 ---
# CORS (Cross-Origin Resource Sharing) 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# /static URL로 static 디렉토리 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- 라우터 포함 ---
# 7개의 도메인 라우터를 prefix와 tag와 함께 포함시킵니다.
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(item.router, prefix="/items", tags=["items"])
app.include_router(party.router, prefix="/parties", tags=["parties"])
app.include_router(community.router, prefix="/community", tags=["community"])
app.include_router(maker.router, prefix="/makers", tags=["makers"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(credit.router, prefix="/credits", tags=["credits"])
app.include_router(reward.router, prefix="/rewards", tags=["rewards"])
app.include_router(story.router, prefix="/stories", tags=["stories"])
app.include_router(clothing.router, prefix="/clothing", tags=["clothing"])
app.include_router(post.router)

@app.get("/", tags=["Root"])
async def read_root():
    """
    API 서버의 상태를 확인하는 기본 엔드포인트입니다.
    """
    return {"message": "Welcome to Otgil API Server!"}