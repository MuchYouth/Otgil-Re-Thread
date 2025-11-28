import os
import uuid
import io
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session
from PIL import Image  # 이미지 압축/리사이즈용

from app.api.deps import get_db, get_current_user
from app import schemas
from app.crud import post as post_crud
from app.models import User


# ====== 이미지 압축 + 저장 헬퍼 ======
async def save_compressed_image(
    upload_file: UploadFile,
    upload_dir: str = "static/posts",
    max_size: tuple[int, int] = (1080, 1080),
    quality: int = 75,
) -> str:
    """
    업로드된 이미지를 압축/리사이즈 해서 JPEG로 저장하고, /static 기준 URL을 반환.

    - max_size: (가로, 세로) 최대 크기
    - quality: JPEG 품질 (1~95 정도, 75면 충분히 깔끔하면서 용량 절감)
    """
    os.makedirs(upload_dir, exist_ok=True)

    # 업로드된 파일 내용을 메모리로 읽기
    raw_bytes = await upload_file.read()

    # Pillow로 이미지 열기
    image = Image.open(io.BytesIO(raw_bytes))

    # 1) 크기 제한 (1080x1080 안쪽으로 축소)
    image.thumbnail(max_size)

    # 2) RGB 변환 (PNG, etc → JPEG 저장 위해)
    image = image.convert("RGB")

    # 3) 파일명 생성 (확장자는 jpg 고정)
    filename = f"{uuid.uuid4().hex}.jpg"
    fs_path = os.path.join(upload_dir, filename)

    # 4) 압축해서 JPEG로 저장
    with open(fs_path, "wb") as f:
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=quality, optimize=True)
        f.write(buffer.getvalue())

    # 5) 클라이언트에 노출할 경로 (/static 기준)
    return f"/static/posts/{filename}"



# 이 라우터에 정의된 모든 경로 앞에 자동으로 /posts 추가
router = APIRouter(
    prefix="/posts",
    tags=["Posts"],
)


# ----------------- 1. 게시글 생성 (Create) -----------------
@router.post("/", response_model=schemas.Post, status_code=status.HTTP_201_CREATED)
async def create_post_route(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),  # 실제 파일 업로드 (선택)
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    새 게시글을 생성합니다.

    - title, content: form-data 텍스트 필드
    - image: form-data 파일 필드 (선택)
    """

    image_path: Optional[str] = None

    # 이미지가 있으면 압축 + 저장
    if image is not None:
        image_path = await save_compressed_image(image)

    # Pydantic 스키마로 묶기 (image_url 로 통일)
    post_create = schemas.PostCreate(
        title=title,
        content=content,
        image_url=image_path,  # models.Post.image_url 에 들어갈 문자열
    )

    # CRUD 호출
    return post_crud.create_post(
        db=db,
        post_create=post_create,
        user_id=current_user.id,
    )


# ----------------- 2. 게시글 목록 조회 (Read List) -----------------
@router.get("/", response_model=List[schemas.Post])
def get_post_list_route(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """게시글 목록을 최신순으로 조회합니다. (페이징 적용)"""
    posts = post_crud.get_post_list(db, skip=skip, limit=limit)
    return posts


# ----------------- 3. 특정 게시글 상세 조회 (Read Detail) -----------------
@router.get("/{post_id}", response_model=schemas.Post)
def get_post_detail_route(
    post_id: str,
    db: Session = Depends(get_db),
):
    """특정 ID의 게시글 상세 정보를 조회합니다."""
    db_post = post_crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다.",
        )
    return db_post


# ----------------- 4. 게시글 수정 (Update) -----------------
@router.put("/{post_id}", response_model=schemas.Post)
async def update_post_route(
    post_id: str,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    image: UploadFile | None = File(None),   # 새 이미지 파일 (선택)
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """게시글 수정 (텍스트 + 이미지 수정 가능)"""
    db_post = post_crud.get_post(db, post_id=post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    # 권한 체크
    if db_post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")

    # --- 1. 텍스트 필드 수정 준비 ---
    update_data: dict = {}
    if title is not None:
        update_data["title"] = title
    if content is not None:
        update_data["content"] = content

    # --- 2. 이미지 교체 처리 ---
    if image is not None:
        # (원하면 여기서 기존 파일 삭제 로직 넣어도 됨)
        # 새 이미지 압축 + 저장
        new_image_path = await save_compressed_image(image)
        update_data["image_url"] = new_image_path

    # 변경 사항이 전혀 없으면 기존 객체 반환
    if not update_data:
        return db_post

    # schemas.PostUpdate로 변환해서 기존 CRUD와 호환
    post_update = schemas.PostUpdate(**update_data)

    return post_crud.update_post(
        db=db,
        db_post=db_post,
        post_update=post_update,
    )


# ----------------- 5. 게시글 삭제 (Delete) -----------------
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_route(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """특정 게시글을 삭제합니다. (작성자만 삭제 가능)"""
    db_post = post_crud.get_post(db, post_id=post_id)
    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다.",
        )

    # 권한 확인
    if db_post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="삭제 권한이 없습니다.",
        )

    post_crud.delete_post(db, db_post=db_post)
    # 204 No Content라 바디는 실제로 사용되지 않음
