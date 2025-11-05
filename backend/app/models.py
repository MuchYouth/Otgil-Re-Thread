# SQL Alchemy 데이터 베이스 모델 
import enum
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, Table, Enum as DBEnum, JSON
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import datetime

# SQLAlchemy Base 클래스 생성
Base = declarative_base()

# --- Enum 정의 ---
# TypeScript: export type ClothingCategory = 'T-SHIRT' | 'JEANS' | 'DRESS' | 'JACKET' | 'ACCESSORY';
class ClothingCategoryEnum(enum.Enum):
    T_SHIRT = 'T-SHIRT'
    JEANS = 'JEANS'
    DRESS = 'DRESS'
    JACKET = 'JACKET'
    ACCESSORY = 'ACCESSORY'

# TypeScript: partySubmissionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
class PartySubmissionStatusEnum(enum.Enum):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'

# TypeScript: export type CreditType = 'EARNED_CLOTHING' | 'EARNED_EVENT' | 'SPENT_REWARD' | 'SPENT_OFFSET' | 'SPENT_MAKER_PURCHASE';
class CreditTypeEnum(enum.Enum):
    EARNED_CLOTHING = 'EARNED_CLOTHING'
    EARNED_EVENT = 'EARNED_EVENT'
    SPENT_REWARD = 'SPENT_REWARD'
    SPENT_OFFSET = 'SPENT_OFFSET'
    SPENT_MAKER_PURCHASE = 'SPENT_MAKER_PURCHASE'

# TypeScript: type: 'GOODS' | 'SERVICE'; (in Reward)
class RewardTypeEnum(enum.Enum):
    GOODS = 'GOODS'
    SERVICE = 'SERVICE'

# TypeScript: export type PartyParticipantStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ATTENDED';
class PartyParticipantStatusEnum(enum.Enum):
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'
    ATTENDED = 'ATTENDED'

# TypeScript: status: 'PENDING_APPROVAL' | 'UPCOMING' | 'COMPLETED' | 'REJECTED'; (in Party)
class PartyStatusEnum(enum.Enum):
    PENDING_APPROVAL = 'PENDING_APPROVAL'
    UPCOMING = 'UPCOMING'
    COMPLETED = 'COMPLETED'
    REJECTED = 'REJECTED'

# User.neighbors (self-referential many-to-many)
user_neighbors = Table(
    'user_neighbors',
    Base.metadata,
    Column('user_id', String, ForeignKey('users.id'), primary_key=True),
    Column('neighbor_id', String, ForeignKey('users.id'), primary_key=True)
)

# Story.likedBy (Story <-> User)
story_likes = Table(
    'story_likes',
    Base.metadata,
    Column('story_id', String, ForeignKey('stories.id'), primary_key=True),
    Column('user_id', String, ForeignKey('users.id'), primary_key=True)
)

# Story.tags (Story <-> Tag)
# 'tags: string[]'를 위해 별도의 Tag 모델과 연관 테이블을 생성합니다.
story_tags = Table(
    'story_tags',
    Base.metadata,
    Column('story_id', String, ForeignKey('stories.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)
# --- 모델 정의 ---

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True)
    nickname = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    # `neighbors` (self-referential many-to-many)
    neighbors = relationship(
        'User',
        secondary=user_neighbors,
        primaryjoin=(id == user_neighbors.c.user_id),
        secondaryjoin=(id == user_neighbors.c.neighbor_id),
        backref='followed_by'
    )
    
    # User -> ClothingItem (One-to-Many)
    items = relationship('ClothingItem', back_populates='user')
    # User -> Credit (One-to-Many)
    credits = relationship('Credit', back_populates='user')
    # User -> Story (One-to-Many)
    stories = relationship('Story', back_populates='user')
    # User -> Comment (One-to-Many)
    comments = relationship('Comment', back_populates='user')
    # User -> Party (One-to-Many as Host)
    hosted_parties = relationship('Party', back_populates='host')
    # User -> Story (Many-to-Many Likes)
    liked_stories = relationship('Story', secondary=story_likes, back_populates='likers')
    # User -> PartyParticipation (One-to-Many)
    party_participations = relationship('PartyParticipation', back_populates='user')


class ClothingItem(Base):
    __tablename__ = 'clothing_items'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(DBEnum(ClothingCategoryEnum), nullable=False)
    size = Column(String, nullable=True)
    image_url = Column(String, nullable=False)
    user_nickname = Column(String, nullable=False) # TS 모델에 포함되어 있어 추가
    is_listed_for_exchange = Column(Boolean, default=False, nullable=False)
    party_submission_status = Column(DBEnum(PartySubmissionStatusEnum), nullable=True)
    
    # Foreign Keys
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    submitted_party_id = Column(String, ForeignKey('parties.id'), nullable=True)
    
    # Relationships
    # ClothingItem -> User (Many-to-One)
    user = relationship('User', back_populates='items')
    # ClothingItem -> Party (Many-to-One)
    submitted_party = relationship('Party', back_populates='submitted_items')
    
    # ClothingItem -> GoodbyeTag (One-to-One)
    goodbye_tag = relationship('GoodbyeTag', back_populates='item', uselist=False, cascade="all, delete-orphan")
    # ClothingItem -> HelloTag (One-to-One)
    hello_tag = relationship('HelloTag', back_populates='item', uselist=False, cascade="all, delete-orphan")


class GoodbyeTag(Base):
    __tablename__ = 'goodbye_tags'
    
    # 1:1 관계를 위해 ClothingItem의 ID를 PK/FK로 사용
    clothing_item_id = Column(String, ForeignKey('clothing_items.id'), primary_key=True)
    
    met_when = Column(String)
    met_where = Column(String)
    why_got = Column(Text)
    worn_count = Column(Integer)
    why_let_go = Column(Text)
    final_message = Column(Text)
    
    # Relationship
    item = relationship('ClothingItem', back_populates='goodbye_tag')

    
class HelloTag(Base):
    __tablename__ = 'hello_tags'
    
    # 1:1 관계를 위해 ClothingItem의 ID를 PK/FK로 사용
    clothing_item_id = Column(String, ForeignKey('clothing_items.id'), primary_key=True)

    received_from = Column(String)
    received_at = Column(String)
    first_impression = Column(Text)
    hello_message = Column(Text)
    
    # Relationship
    item = relationship('ClothingItem', back_populates='hello_tag')


class Credit(Base):
    __tablename__ = 'credits'
    
    id = Column(String, primary_key=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    activity_name = Column(String, nullable=False)
    type = Column(DBEnum(CreditTypeEnum), nullable=False)
    amount = Column(Integer, nullable=False)
    
    # Foreign Key
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationship
    user = relationship('User', back_populates='credits')


class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    
    # Relationship
    stories = relationship('Story', secondary=story_tags, back_populates='tags')


class Story(Base):
    __tablename__ = 'stories'
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    image_url = Column(String)
    # `likes: number`는 `likedBy` 배열의 길이로 계산되므로, DB에는 저장하지 않는 것이 정규화에 맞습니다.
    
    # Foreign Keys
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    party_id = Column(String, ForeignKey('parties.id'), nullable=False)
    
    # Relationships
    user = relationship('User', back_populates='stories')
    party = relationship('Party', back_populates='stories')
    comments = relationship('Comment', back_populates='story', cascade="all, delete-orphan")
    
    # Story -> User (Many-to-Many Likes)
    likers = relationship('User', secondary=story_likes, back_populates='liked_stories')
    # Story -> Tag (Many-to-Many)
    tags = relationship('Tag', secondary=story_tags, back_populates='stories')


class Reward(Base):
    __tablename__ = 'rewards'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    cost = Column(Integer, nullable=False)
    image_url = Column(String)
    type = Column(DBEnum(RewardTypeEnum), nullable=False)


class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(String, primary_key=True)
    author_nickname = Column(String, nullable=False) # TS 인터페이스에 명시됨
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Foreign Keys
    story_id = Column(String, ForeignKey('stories.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    story = relationship('Story', back_populates='comments')
    user = relationship('User', back_populates='comments')


class Maker(Base):
    __tablename__ = 'makers'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    specialty = Column(String)
    location = Column(String)
    bio = Column(Text)
    image_url = Column(String)
    
    # Relationship
    products = relationship('MakerProduct', back_populates='maker', cascade="all, delete-orphan")


class MakerProduct(Base):
    __tablename__ = 'maker_products'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Integer, nullable=False) # in OL credits
    image_url = Column(String)
    
    # Foreign Key
    maker_id = Column(String, ForeignKey('makers.id'), nullable=False)
    
    # Relationship
    maker = relationship('Maker', back_populates='products')


# PartyParticipant는 M2M 관계에 추가 데이터(status)가 있는 'Association Object'입니다.
class PartyParticipation(Base):
    __tablename__ = 'party_participations'
    
    party_id = Column(String, ForeignKey('parties.id'), primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    status = Column(DBEnum(PartyParticipantStatusEnum), nullable=False, default=PartyParticipantStatusEnum.PENDING)
    
    # Relationships
    party = relationship('Party', back_populates='participations')
    user = relationship('User', back_populates='party_participations')


class Party(Base):
    __tablename__ = 'parties'
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=False)
    location = Column(String)
    image_url = Column(String)
    # `details: string[]`는 JSON 타입을 사용하는 것이 유연합니다. (PostgreSQL의 ARRAY(String)도 가능)
    details = Column(JSON, nullable=True) 
    status = Column(DBEnum(PartyStatusEnum), nullable=False, default=PartyStatusEnum.PENDING_APPROVAL)
    invitation_code = Column(String, unique=True, nullable=False)
    
    # Foreign Key
    host_id = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Embedded Fields from TS (ImpactStats, kitDetails)
    # nullable=True로 설정하여 선택적(optional) 속성을 반영합니다.
    impact_items_exchanged = Column(Integer, nullable=True)
    impact_water_saved = Column(Integer, nullable=True)
    impact_co2_reduced = Column(Integer, nullable=True)
    
    kit_participants = Column(Integer, nullable=True)
    kit_items_per_person = Column(Integer, nullable=True)
    kit_cost = Column(Integer, nullable=True)
    
    # Relationships
    host = relationship('User', back_populates='hosted_parties')
    submitted_items = relationship('ClothingItem', back_populates='submitted_party')
    stories = relationship('Story', back_populates='party')
    participations = relationship('PartyParticipation', back_populates='party', cascade="all, delete-orphan")


# --- Admin 관련 인터페이스 (AdminOverallStats, AdminGroupPerformance 등) ---
# 이들은 데이터베이스 테이블이 아니라,
# 위 모델들(User, ClothingItem, Party 등)에서 데이터를 집계(query)하여
# 생성하는 데이터 구조(DTO 또는 View Model)입니다.
# 따라서 별도의 SQLAlchemy 모델로 정의하지 않습니다.