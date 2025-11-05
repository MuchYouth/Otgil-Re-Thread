# Pydantic 데이터 검증 스키마
'''
💡 주요 참고 사항
orm_mode = True (Pydantic v1) / from_attributes = True (Pydantic v2): Config 클래스에 이 설정을 추가하면, response_model로 지정된 Pydantic 스키마가 SQLAlchemy 객체(User, ClothingItem 등)를 받아서 자동으로 dict처럼 속성을 읽어 직렬화(Serialization)할 수 있게 해줍니다.

순환 참조 (Forward References): UserResponseWithItems가 CreditResponse를 참조하고, MakerResponse가 MakerProductResponse를 참조하는 등, 서로를 참조하는 스키마가 있습니다. Pydantic은 아직 정의되지 않은 클래스 이름을 문자열('CreditResponse')로 처리하고, 파일 마지막에 MySchema.update_forward_refs()를 호출하여 이 참조를 해결하도록 합니다.

Enum 사용: SQLAlchemy 모델에서 정의한 Enum을 Pydantic 스키마에서도 동일하게 사용하여 API 레벨에서부터 데이터 유효성(validation)을 보장합니다.

password 처리: UserCreate 스키마에는 password가 있지만, UserResponse 스키마에는 없습니다. 이는 사용자를 생성할 때는 비밀번호를 받지만, API가 사용자 정보를 응답으로 보낼 때는 절대 비밀번호를 포함하지 않기 위함입니다.

Admin 스키마: Admin용 통계 스키마(AdminOverallStats 등)는 데이터를 생성(Create)하거나 수정(Update)할 필요 없이 오직 조회(Read)만 하므로, 기본 응답 스키마만 정의했습니다.

이 스키마들은 FastAPI와 같은 프레임워크에서 dependencies, request_body, response_model 등으로 활용되어 강력한 타입 검증과 자동 문서화(Swagger/OpenAPI)를 제공합니다.
'''
# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import datetime
import enum

# --- Enums (SQLAlchemy 모델과 동일한 Enum 임포트 또는 재정의) ---
# (이전과 동일)
class ClothingCategoryEnum(str, enum.Enum):
    T_SHIRT = 'T-SHIRT'
    JEANS = 'JEANS'
    DRESS = 'DRESS'
    JACKET = 'JACKET'
    ACCESSORY = 'ACCESSORY'

class PartySubmissionStatusEnum(str, enum.Enum):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'

class CreditTypeEnum(str, enum.Enum):
    EARNED_CLOTHING = 'EARNED_CLOTHING'
    EARNED_EVENT = 'EARNED_EVENT'
    SPENT_REWARD = 'SPENT_REWARD'
    SPENT_OFFSET = 'SPENT_OFFSET'
    SPENT_MAKER_PURCHASE = 'SPENT_MAKER_PURCHASE'

class RewardTypeEnum(str, enum.Enum):
    GOODS = 'GOODS'
    SERVICE = 'SERVICE'

class PartyParticipantStatusEnum(str, enum.Enum):
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'
    ATTENDED = 'ATTENDED'

class PartyStatusEnum(str, enum.Enum):
    PENDING_APPROVAL = 'PENDING_APPROVAL'
    UPCOMING = 'UPCOMING'
    COMPLETED = 'COMPLETED'
    REJECTED = 'REJECTED'


# --- Helper Schemas (Embedded Objects) ---

class GoodbyeTagBase(BaseModel):
    met_when: str
    met_where: str
    why_got: str
    worn_count: int
    why_let_go: str
    final_message: str

class GoodbyeTagCreate(GoodbyeTagBase):
    pass

class GoodbyeTagResponse(GoodbyeTagBase):
    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

class HelloTagBase(BaseModel):
    received_from: str
    received_at: str
    first_impression: str
    hello_message: str

class HelloTagCreate(HelloTagBase):
    pass

class HelloTagResponse(HelloTagBase):
    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- ClothingItem Schemas ---

class ClothingItemBase(BaseModel):
    name: str
    description: str
    category: ClothingCategoryEnum
    size: str
    image_url: str

class ClothingItemCreate(ClothingItemBase):
    pass

class ClothingItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ClothingCategoryEnum] = None
    size: Optional[str] = None
    image_url: Optional[str] = None
    is_listed_for_exchange: Optional[bool] = None

class ClothingItemResponse(ClothingItemBase):
    id: str
    user_id: str
    user_nickname: str
    is_listed_for_exchange: bool
    party_submission_status: Optional[PartySubmissionStatusEnum] = None
    submitted_party_id: Optional[str] = None
    
    goodbye_tag: Optional[GoodbyeTagResponse] = None
    hello_tag: Optional[HelloTagResponse] = None

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- User Schemas ---

class UserBase(BaseModel):
    nickname: str
    email: EmailStr
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str 

class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_admin: Optional[bool] = False
    neighbors: Optional[List[str]] = []

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

class UserResponseWithItems(UserResponse):
    items: List[ClothingItemResponse] = []
    credits: List['CreditResponse'] = []
    stories: List['StoryResponse'] = []
    
    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

# --- Credit Schemas ---

class CreditBase(BaseModel):
    activity_name: str
    type: CreditTypeEnum
    amount: int

class CreditCreate(CreditBase):
    user_id: str

class CreditResponse(CreditBase):
    id: str
    user_id: str
    date: datetime.datetime

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- Tag Schemas (for Story) ---

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    
    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- Story Schemas ---

class StoryBase(BaseModel):
    title: str
    excerpt: str
    content: str
    image_url: str

class StoryCreate(StoryBase):
    party_id: str
    tags: List[str]

class StoryUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

class StoryResponse(StoryBase):
    id: str
    user_id: str
    party_id: str
    author: str
    likes: int
    liked_by: List[str]
    
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- Comment Schemas ---

class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    story_id: str

class CommentResponse(CommentBase):
    id: str
    story_id: str
    user_id: str
    author_nickname: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

class StoryResponseWithComments(StoryResponse):
    comments: List[CommentResponse] = []


# --- Reward Schemas ---

class RewardBase(BaseModel):
    name: str
    description: str
    cost: int
    image_url: str
    type: RewardTypeEnum

class RewardCreate(RewardBase):
    pass

class RewardResponse(RewardBase):
    id: str
    
    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- Maker Schemas ---

class MakerBase(BaseModel):
    name: str
    specialty: str
    location: str
    bio: str
    image_url: str

class MakerCreate(MakerBase):
    pass

class MakerResponse(MakerBase):
    id: str
    products: List['MakerProductResponse'] = []

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- MakerProduct Schemas ---

class MakerProductBase(BaseModel):
    name: str
    description: str
    price: int
    image_url: str

class MakerProductCreate(MakerProductBase):
    maker_id: str

class MakerProductResponse(MakerProductBase):
    id: str
    maker_id: str
    
    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- Party Schemas ---

class ImpactStatsBase(BaseModel):
    items_exchanged: int
    water_saved: int
    co2_reduced: int

class KitDetailsBase(BaseModel):
    participants: int
    items_per_person: int
    cost: int

class PartyParticipantResponse(BaseModel):
    user_id: str
    nickname: str
    status: PartyParticipantStatusEnum
    
    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

class PartyBase(BaseModel):
    title: str
    description: str
    date: datetime.date
    location: str
    image_url: str
    details: List[str]

class PartyCreate(PartyBase):
    pass

class PartyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime.date] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    details: Optional[List[str]] = None
    status: Optional[PartyStatusEnum] = None
    impact: Optional[ImpactStatsBase] = None
    kit_details: Optional[KitDetailsBase] = None

class PartyResponse(PartyBase):
    id: str
    host_id: str
    status: PartyStatusEnum
    invitation_code: str
    
    participants: List[PartyParticipantResponse] = []
    impact: Optional[ImpactStatsBase] = None
    kit_details: Optional[KitDetailsBase] = None

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- Admin Schemas (Read-only) ---

class AdminOverallStats(BaseModel):
    total_users: int
    total_items: int
    total_exchanges: int
    total_events: int

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

class AdminGroupPerformance(BaseModel):
    group_name: str
    users: int
    items_listed: int
    exchanges: int

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

class DailyActivity(BaseModel):
    date: datetime.date
    count: int

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes

class CategoryDistribution(BaseModel):
    category: ClothingCategoryEnum
    count: int

    class Config:
        from_attributes = True # v2 변경: orm_mode -> from_attributes


# --- 순환 참조(ForwardRef)가 사용된 스키마 업데이트 ---
# v2 변경: update_forward_refs() -> model_rebuild()
MakerResponse.model_rebuild()
UserResponseWithItems.model_rebuild()