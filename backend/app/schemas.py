from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, computed_field
import datetime
import enum

# --- Enums ---
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


# --- Helper Schemas ---

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
        from_attributes = True

class HelloTagBase(BaseModel):
    received_from: str
    received_at: str
    first_impression: str
    hello_message: str

class HelloTagCreate(HelloTagBase):
    pass

class HelloTagResponse(HelloTagBase):
    class Config:
        from_attributes = True


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
        from_attributes = True


# --- User Schemas ---

class UserBase(BaseModel):
    nickname: str
    email: EmailStr
    phone_number: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class Msg(BaseModel):
    msg: str

class UserCreate(UserBase):
    password: str 
    is_admin: bool = False 

class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_admin: Optional[bool] = False
    neighbors: Optional[List[str]] = []

    # [중요] 이웃 객체를 ID 문자열 리스트로 변환하는 Validator 추가
    @field_validator('neighbors', mode='before')
    @classmethod
    def transform_neighbors(cls, v):
        if not v:
            return []
        # v가 리스트이고 첫 번째 요소가 객체(User 모델)라면 id만 추출
        if isinstance(v, list) and len(v) > 0 and hasattr(v[0], 'id'):
            return [user.id for user in v]
        return v

    class Config:
        from_attributes = True

# --- Credit Schemas ---

class CreditBase(BaseModel):
    activity_name: str
    type: CreditTypeEnum
    amount: int

class EarnRequest(BaseModel):
    user_id: str
    amount: int
    activity_name: Optional[str] = "Earned credit"
    type: Optional[CreditTypeEnum] = CreditTypeEnum.EARNED_EVENT

class CreditCreate(CreditBase):
    user_id: str

class CreditResponse(CreditBase):
    id: str
    user_id: str
    date: datetime.datetime

    class Config:
        from_attributes = True

class UserCreditBalanceResponse(BaseModel):
    user_id: str
    balance: int

    class Config:
        from_attributes = True

# 순환 참조 해결을 위해 UserResponseWithItems는 아래에 정의
class UserResponseWithItems(UserResponse):
    items: List[ClothingItemResponse] = []
    credits: List[CreditResponse] = []
    stories: List['StoryResponse'] = []
    
    class Config:
        from_attributes = True


# --- Tag Schemas ---

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    
    class Config:
        from_attributes = True


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
    tags: List[TagResponse] = []
    
    @computed_field
    @property
    def likes(self) -> int:
        if hasattr(self, 'likers'):
            return len(self.likers)
        return 0

    @computed_field
    @property
    def liked_by(self) -> List[str]:
        if hasattr(self, 'likers'):
            return [user.id for user in self.likers]
        return []

    class Config:
        from_attributes = True


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
        from_attributes = True

class StoryResponseWithComments(StoryResponse):
    comments: List[CommentResponse] = []


# --- Report (Newsletter) Schemas [추가됨] ---

class PerformanceReportBase(BaseModel):
    title: str
    date: datetime.date
    excerpt: str

class PerformanceReportCreate(PerformanceReportBase):
    pass

class PerformanceReportResponse(PerformanceReportBase):
    id: str
    
    class Config:
        from_attributes = True


# --- Reward Schemas (수정 및 추가) ---

class RewardBase(BaseModel):
    name: str
    description: str
    cost: int
    image_url: str
    type: RewardTypeEnum

class RewardCreate(RewardBase):
    pass

class RewardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[int] = None
    image_url: Optional[str] = None
    type: Optional[RewardTypeEnum] = None

class RewardResponse(RewardBase):
    id: str
    
    class Config:
        from_attributes = True 


# --- Maker Schemas (수정 및 추가) ---

class MakerBase(BaseModel):
    name: str
    specialty: str
    location: str
    bio: str
    image_url: str

class MakerCreate(MakerBase):
    pass

class MakerUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None

class MakerResponse(MakerBase):
    id: str
    products: List['MakerProductResponse'] = []

    class Config:
        from_attributes = True 


# --- MakerProduct Schemas (수정 및 추가) ---

class MakerProductBase(BaseModel):
    name: str
    description: str
    price: int
    image_url: str

class MakerProductCreate(MakerProductBase):
    pass # maker_id는 URL 파라미터로 받을 예정

class MakerProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    image_url: Optional[str] = None

class MakerProductResponse(MakerProductBase):
    id: str
    maker_id: str
    
    class Config:
        from_attributes = True 

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
        from_attributes = True

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
        from_attributes = True


# --- Admin Schemas (Read-only) ---

class AdminOverallStats(BaseModel):
    total_users: int
    total_items: int
    total_exchanges: int
    total_events: int

    class Config:
        from_attributes = True

class AdminGroupPerformance(BaseModel):
    group_name: str
    users: int
    items_listed: int
    exchanges: int

    class Config:
        from_attributes = True

class DailyActivity(BaseModel):
    date: datetime.date
    count: int

    class Config:
        from_attributes = True

class CategoryDistribution(BaseModel):
    category: ClothingCategoryEnum
    count: int

    class Config:
        from_attributes = True


# --- 순환 참조(ForwardRef) 업데이트 ---
MakerResponse.model_rebuild()
UserResponseWithItems.model_rebuild()