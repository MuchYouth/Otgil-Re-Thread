export type ClothingCategory = 'T-SHIRT' | 'JEANS' | 'DRESS' | 'JACKET' | 'ACCESSORY';

export interface GoodbyeTag {
  metWhen: string;
  metWhere: string;
  whyGot: string;
  wornCount: number;
  whyLetGo: string;
  finalMessage: string;
}

export interface HelloTag {
  receivedFrom: string; // userNickname
  receivedAt: string; // Party title or 'General Exchange'
  firstImpression: string;
  helloMessage: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  description: string;
  category: ClothingCategory;
  size: string;
  imageUrl: string;
  userNickname: string;
  userId: string;
  isListedForExchange: boolean;
  partySubmissionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedPartyId?: string;
  goodbyeTag?: GoodbyeTag;
  helloTag?: HelloTag;
}

export enum Page {
  HOME = 'HOME',
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  BROWSE = 'BROWSE',
  NEIGHBORS_CLOSET = 'NEIGHBORS_CLOSET',
  NEIGHBOR_PROFILE = 'NEIGHBOR_PROFILE',
  MY_PAGE = 'MY_PAGE',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  STORY_DETAIL = 'STORY_DETAIL',
  COMMUNITY = 'COMMUNITY',
  REWARDS = 'REWARDS',
  ADMIN = 'ADMIN',
  TWENTY_ONE_PERCENT_PARTY = 'TWENTY_ONE_PERCENT_PARTY',
  PARTY_HOSTING = 'PARTY_HOSTING',
  PARTY_HOST_DASHBOARD = 'PARTY_HOST_DASHBOARD',
  MAKERS_HUB = 'MAKERS_HUB',
}

export interface User {
  id: string;
  nickname: string;
  email: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  neighbors?: string[]; // Array of user IDs
}

export interface ImpactStats {
  itemsExchanged: number;
  waterSaved: number;
  co2Reduced: number;
}

export type CreditType = 'EARNED_CLOTHING' | 'EARNED_EVENT' | 'SPENT_REWARD' | 'SPENT_OFFSET' | 'SPENT_MAKER_PURCHASE';

export interface Credit {
    id: string;
    userId: string;
    date: string;
    activityName: string;
    type: CreditType;
    amount: number;
}

export interface Story {
  id: string;
  userId: string;
  partyId: string;
  title: string;
  author: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  tags: string[];
  likes: number;
  likedBy: string[]; // Array of user IDs
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  imageUrl: string;
  type: 'GOODS' | 'SERVICE';
}

export interface PerformanceReport {
    id: string;
    title: string;
    date: string;
    excerpt: string;
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  authorNickname: string;
  text: string;
  timestamp: string;
}

export interface Maker {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string;
  imageUrl: string;
}

export interface MakerProduct {
  id: string;
  makerId: string;
  name: string;
  description: string;
  price: number; // in OL credits
  imageUrl: string;
}

export type PartyParticipantStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ATTENDED';

export interface PartyParticipant {
    userId: string;
    nickname: string;
    status: PartyParticipantStatus;
}

export interface Party {
    id: string;
    hostId: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    location: string;
    imageUrl: string;
    details: string[];
    status: 'PENDING_APPROVAL' | 'UPCOMING' | 'COMPLETED' | 'REJECTED';
    invitationCode: string;
    participants: PartyParticipant[];
    impact?: ImpactStats;
    kitDetails?: {
        participants: number;
        itemsPerPerson: number;
        cost: number;
    }
}


// For Admin page
export interface AdminOverallStats {
  totalUsers: number;
  totalItems: number;
  totalExchanges: number;
  totalEvents: number;
}

export interface AdminGroupPerformance {
  groupName: string;
  users: number;
  itemsListed: number;
  exchanges: number;
}

export interface DailyActivity {
    date: string;
    count: number;
}

export interface CategoryDistribution {
    category: ClothingCategory;
    count: number;
}