# backend/app/api/routers/tags.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.api.deps import get_db
from pydantic import BaseModel
from app.crud import tags as crud_tags

router = APIRouter()

# 프론트엔드에서 보내는 데이터 형식에 맞춘 입력용 스키마 정의
class HelloTagCreateInput(schemas.HelloTagBase):
    clothing_item_id: str

class GoodbyeTagCreateInput(schemas.GoodbyeTagBase):
    clothing_item_id: str

@router.post("/hello", response_model=schemas.HelloTagBase)
def create_hello_tag(tag_in: HelloTagCreateInput, db: Session = Depends(get_db)):
    # 1. clothing_item_id 분리
    clothing_id = tag_in.clothing_item_id
    
    # 2. 나머지 태그 데이터만 추출
    tag_data = tag_in.model_dump(exclude={"clothing_item_id"})
    
    # 3. CRUD 호출
    return crud_tags.create_hello_tag(
        db=db, 
        tag=schemas.HelloTagBase(**tag_data), 
        clothing_item_id=clothing_id
    )

@router.post("/goodbye", response_model=schemas.GoodbyeTagBase)
def create_goodbye_tag(tag_in: GoodbyeTagCreateInput, db: Session = Depends(get_db)):
    # 1. clothing_item_id 분리
    clothing_id = tag_in.clothing_item_id
    
    # 2. 나머지 태그 데이터만 추출
    tag_data = tag_in.model_dump(exclude={"clothing_item_id"})
    
    # 3. CRUD 호출
    return crud_tags.create_goodbye_tag(
        db=db, 
        tag=schemas.GoodbyeTagBase(**tag_data), 
        clothing_item_id=clothing_id
    )