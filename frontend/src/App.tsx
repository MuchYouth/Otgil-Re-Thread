import React, { useState, useMemo } from 'react';
import { Page, User, ClothingItem, ImpactStats, Story, Credit, Reward, PerformanceReport, Comment, Party, Maker, MakerProduct, PartyParticipantStatus, GoodbyeTag, HelloTag } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MyPage from './pages/MyPage';
import StoryDetailPage from './pages/StoryDetailPage';
import CommunityPage from './pages/CommunityPage';
import RewardsPage from './pages/RewardsPage';
import AdminPage from './pages/AdminPage';
import TwentyOnePercentPartyPage from './pages/TwentyOnePercentPartyPage';
import PartyHostingPage from './pages/PartyHostingPage';
import PartyHostDashboardPage from './pages/PartyHostDashboardPage';
import MakersHubPage from './pages/MakersHubPage';
import BrowsePage from './pages/BrowsePage';
import NeighborsClosetPage from './pages/NeighborsClosetPage';
import NeighborProfilePage from './pages/NeighborProfilePage';
import { IMPACT_FACTORS } from './constants';
import { ClothingInfo } from './services/geminiService';

// Mock Data
const MOCK_USERS_DATA: User[] = [
    { id: 'user1', nickname: 'EcoFashionista', email: 'eco@fashion.com', phoneNumber: '010-1111-2222', isAdmin: true, neighbors: ['user2', 'user4', 'user5', 'user6', 'user7', 'user8'] },
    { id: 'user2', nickname: '해삐영', email: 'namu@lazy.com', phoneNumber: '010-3333-4444', neighbors: ['user1'] },
    { id: 'user3', nickname: 'StyleSeeker', email: 'style@seeker.com', phoneNumber: '010-5555-6666', neighbors: [] },
    { id: 'user4', nickname: 'GreenThumb', email: 'green@thumb.com', phoneNumber: '010-4444-1111', neighbors: ['user1'] },
    { id: 'user5', nickname: 'UpcycleArt', email: 'art@upcycle.com', phoneNumber: '010-5555-2222', neighbors: ['user1'] },
    { id: 'user6', nickname: 'VintageVibes', email: 'vintage@vibes.com', phoneNumber: '010-6666-3333', neighbors: ['user1'] },
    { id: 'user7', nickname: '미니멀衣스트', email: 'minimal@wardrobe.com', phoneNumber: '010-7777-4444', neighbors: ['user1'] },
    { id: 'user8', nickname: '지속가능맨', email: 'sustain@man.com', phoneNumber: '010-8888-5555', neighbors: ['user1'] },
];

const MOCK_CLOTHING_ITEMS: ClothingItem[] = [
    { id: 'item1', name: 'Vintage Denim Jacket', description: 'A great condition Levis denim jacket.', category: 'JACKET', size: 'L', imageUrl: 'https://images.unsplash.com/photo-1542281286-9e0e16bb7366?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: false, goodbyeTag: { metWhen: '2020', metWhere: 'Flea Market', whyGot: 'Classic style', wornCount: 50, whyLetGo: 'Too small', finalMessage: 'Hope you like it!' } },
    { id: 'item2', name: 'Patchwork Jogger Pants', description: 'Comfortable cotton pants with unique patchwork details.', category: 'JEANS', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: false, goodbyeTag: { metWhen: '2021', metWhere: 'Online', whyGot: 'Unique design', wornCount: 20, whyLetGo: 'Changed style', finalMessage: 'Enjoy!' } },
    { id: 'item3', name: 'Reconstructed Floral Dress', description: 'A light, chiffon long dress, recreated from vintage fabrics.', category: 'DRESS', size: 'S', imageUrl: 'https://images.unsplash.com/photo-1567683502283-a4e1b73e57f0?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: false, goodbyeTag: { metWhen: '2022', metWhere: 'Gift', whyGot: 'A present', wornCount: 5, whyLetGo: 'Not my color', finalMessage: 'Be happy!' } },
    { id: 'item4', name: 'Embroidered T-Shirt', description: 'A basic white tee with a hand-embroidered flower.', category: 'T-SHIRT', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: true, helloTag: { receivedFrom: 'EcoFashionista', receivedAt: 'Birthday Party', firstImpression: 'So cute!', helloMessage: 'My new favorite tee!' } },
    { id: 'item5', name: 'Handmade Chain Necklace', description: 'A silver necklace made from upcycled materials to make a statement.', category: 'ACCESSORY', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1616843438318-9a334a179357?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: true, helloTag: { receivedFrom: 'UpcycleArt', receivedAt: 'Workshop', firstImpression: 'Stunning!', helloMessage: 'Wear it everyday.' } },
    { id: 'item6', name: 'Oversized Linen Shirt', description: 'A cool, oversized linen shirt, naturally dyed.', category: 'T-SHIRT', size: 'L', imageUrl: 'https://images.unsplash.com/photo-1622470953794-34505b2db67b?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: false, goodbyeTag: { metWhen: '2022 Summer', metWhere: 'Local designer', whyGot: 'Beautiful color', wornCount: 10, whyLetGo: 'Too big now', finalMessage: 'Enjoy the comfy fit.' } },
    { id: 'item7', name: 'Cool Graphic Tee', description: 'A barely worn graphic t-shirt, printed on a repurposed shirt.', category: 'T-SHIRT', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: false, partySubmissionStatus: 'PENDING', submittedPartyId: 'party1',
      goodbyeTag: { metWhen: '2022년 여름', metWhere: '온라인 쇼핑몰', whyGot: '좋아하는 아티스트의 한정판이라서', wornCount: 5, whyLetGo: '이제는 스타일이 바뀌어서', finalMessage: '새로운 주인 만나서 더 멋지게 입혀주길!' }
    },
    { id: 'item8', name: 'Woven Handbag', description: 'A stylish woven handbag for any occasion, made from recycled materials.', category: 'ACCESSORY', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1591561934208-283011031380?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: false, partySubmissionStatus: 'APPROVED', submittedPartyId: 'party1',
      goodbyeTag: { metWhen: '작년 가을', metWhere: '제주도 소품샵', whyGot: '독특한 디자인에 반해서', wornCount: 20, whyLetGo: '더 큰 가방이 필요해져서', finalMessage: '좋은 추억이 많은 가방이야, 잘 부탁해.' }
    },
    { id: 'item9', name: '클래식 화이트 블라우스', description: '친구에게서 받은 활용도 높은 흰색 블라우스입니다.', category: 'T-SHIRT', size: 'S', imageUrl: 'https://images.unsplash.com/photo-1589379918793-01c9ab2283a3?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: true, 
      helloTag: { receivedFrom: 'EcoFashionista', receivedAt: 'EcoFashionista의 연말 옷장 정리 파티', firstImpression: '깔끔하고 어디에나 잘 어울릴 것 같았어요!', helloMessage: '앞으로 잘 부탁해, 나의 새로운 최애템!' }
    },
    { id: 'item10', name: '가죽 크로스백', description: '매일 사용하기 좋은 튼튼하고 스타일리시한 가방입니다.', category: 'ACCESSORY', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eada6b5a5a?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: true,
      helloTag: { receivedFrom: '해삐영', receivedAt: '성수동 플리마켓 애프터파티', firstImpression: '빈티지한 느낌이 마음에 쏙 들었어요.', helloMessage: '오래오래 함께하자!' }
    },
    { id: 'item11', name: '자연염색 린넨 셔츠', description: '쪽빛으로 물들인 시원한 린넨 셔츠입니다.', category: 'T-SHIRT', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1622470953794-34505b2db67b?q=80&w=800&auto=format&fit=crop', userNickname: 'GreenThumb', userId: 'user4', isListedForExchange: false, 
      goodbyeTag: { metWhen: '2023년 봄', metWhere: '인사동 공방', whyGot: '자연스러운 색감에 반해서', wornCount: 10, whyLetGo: '비슷한 셔츠가 많아져서', finalMessage: '편안하게 잘 입어주세요.' }
    },
    { id: 'item12', name: '실크스크린 에코백', description: '직접 디자인한 패턴을 실크스크린으로 찍어낸 에코백.', category: 'ACCESSORY', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1579065365314-e651b143a4e9?q=80&w=800&auto=format&fit=crop', userNickname: 'UpcycleArt', userId: 'user5', isListedForExchange: false,
      goodbyeTag: { metWhen: '2023년 여름', metWhere: '작업실', whyGot: '작품 활동의 일환으로 제작', wornCount: 3, whyLetGo: '새로운 디자인을 구상 중이라', finalMessage: '당신의 일상에 예술이 함께하길!' }
    },
    { id: 'item13', name: '80년대 레트로 원피스', description: '화려한 패턴이 돋보이는 80년대 풍의 빈티지 원피스.', category: 'DRESS', size: 'S', imageUrl: 'https://images.unsplash.com/photo-1552865228-1b7b7a1a3a49?q=80&w=800&auto=format&fit=crop', userNickname: 'VintageVibes', userId: 'user6', isListedForExchange: false,
      goodbyeTag: { metWhen: '2022년 가을', metWhere: '광장시장 구제상가', whyGot: '독특한 패턴이 마음에 들어서', wornCount: 7, whyLetGo: '특별한 날에만 입게 되어서', finalMessage: '이 옷을 입고 멋진 추억을 만드세요.' }
    },
    { id: 'item14', name: '모던 베이지 슬랙스', description: '어디에나 잘 어울리는 기본 중의 기본, 베이지 슬랙스.', category: 'JEANS', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1541089404513-ea03b783d735?q=80&w=800&auto=format&fit=crop', userNickname: '미니멀衣스트', userId: 'user7', isListedForExchange: false,
      goodbyeTag: { metWhen: '2023년 초', metWhere: '백화점', whyGot: '기본 아이템으로 구매', wornCount: 30, whyLetGo: '살이 빠져 사이즈가 맞지 않음', finalMessage: '오래오래 아껴 입어주실 분을 찾아요.' }
    },
    { id: 'item15', name: '튼튼한 코튼 자켓', description: '가을에 입기 좋은 튼튼한 코튼 소재의 워크 자켓입니다.', category: 'JACKET', size: 'L', imageUrl: 'https://images.unsplash.com/photo-1608234808389-9a74b0df19c0?q=80&w=800&auto=format&fit=crop', userNickname: '지속가능맨', userId: 'user8', isListedForExchange: false,
      goodbyeTag: { metWhen: '2021년', metWhere: '편집샵', whyGot: '오래 입을 수 있을 것 같아서', wornCount: 50, whyLetGo: '새로운 워크 자켓을 선물받아서', finalMessage: '앞으로 10년은 더 입을 수 있을 거예요.' }
    },
    { id: 'item16', name: '핸드메이드 뜨개 가방', description: '직접 뜬 여름용 뜨개 가방입니다.', category: 'ACCESSORY', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1587856436214-99730870341b?q=80&w=800&auto=format&fit=crop', userNickname: 'GreenThumb', userId: 'user4', isListedForExchange: false,
      goodbyeTag: { metWhen: '2023년 6월', metWhere: '집', whyGot: '취미로 만들었어요', wornCount: 15, whyLetGo: '새로운 가방을 만들어서', finalMessage: '정성이 담긴 가방입니다.' }
    },
    { id: 'item17', name: '페인팅 커스텀 청바지', description: '세상에 하나뿐인 페인팅 커스텀 청바지.', category: 'JEANS', size: '28', imageUrl: 'https://images.unsplash.com/photo-1604176354204-926873782855?q=80&w=800&auto=format&fit=crop', userNickname: 'UpcycleArt', userId: 'user5', isListedForExchange: false,
      goodbyeTag: { metWhen: '2022년', metWhere: '작업실', whyGot: '실험적인 작품', wornCount: 2, whyLetGo: '전시 종료 후 보관 중', finalMessage: '당신만의 스타일을 완성해보세요.' }
    },
];

const MOCK_STORIES_DATA: Story[] = [
    { id: 'story1', userId: 'user2', partyId: 'party1', title: 'Found my all-time favorite jacket at the flea market!', author: '해삐영', excerpt: 'I went to the Ot-gil flea market in Seongsu-dong. I was surprised by how much bigger it was than I expected and how many pretty clothes there were...', content: 'I went to the Ot-gil flea market in Seongsu-dong. I was surprised by how much bigger it was than I expected and how many pretty clothes there were. After looking around for about an hour, I found a denim jacket that was exactly my style! It was in great condition and the seller was so nice. It feels great to get such a cool item while also being good for the environment. I\'ll definitely be going to the next Ot-gil event!', imageUrl: 'https://images.unsplash.com/photo-1573132194429-dec4259b184b?q=80&w=800&auto=format&fit=crop', tags: ['#EventReview', '#FleaMarket', '#GoodFind'], likes: 28, likedBy: ['user1'] },
    { id: 'story2', userId: 'user1', partyId: 'party1', title: 'Making my own eco-bag is not that hard', author: 'EcoFashionista', excerpt: 'An old pair of jeans deep in my closet was reborn as a one-of-a-kind eco-bag. Here are some tips I learned from the Ot-gil workshop!', content: 'An old pair of jeans deep in my closet was reborn as a one-of-a-kind eco-bag. Here are some tips I learned from the Ot-gil workshop! First, get a sturdy pair of jeans. Second, be brave with the scissors! The instructor was very helpful and showed us how to make the straps strong. It was so much fun and now I have a unique bag that I made myself.', imageUrl: 'https://images.unsplash.com/photo-1595303526913-c703773648a9?q=80&w=800&auto=format&fit=crop', tags: ['#Upcycling', '#DIY', '#JeanReform'], likes: 45, likedBy: ['user2', 'user3'] },
    { id: 'story3', userId: 'user2', partyId: 'party2', title: 'Minimalist life through clothing exchange', author: '해삐영', excerpt: 'I sent clothes I no longer wear to people who need them through Ot-gil, and got one new piece that is perfect for me. A lighter closet makes for a lighter mind.', content: 'I\'ve been practicing minimalism for a while, and Ot-gil has been a great help. I sent clothes I no longer wear to people who need them through the app, and got one new piece that is perfect for me. A lighter closet makes for a lighter mind. It\'s not just about having less, but about having things that you truly love and use. Ot-gil helps with that.', imageUrl: 'https://images.unsplash.com/photo-1528993856238-22415d861182?q=80&w=800&auto=format&fit=crop', tags: ['#Minimalism', '#ClosetOrganization'], likes: 12, likedBy: [] },
];

const MOCK_COMMENTS: Comment[] = [
    { id: 'comment1', storyId: 'story1', userId: 'user1', authorNickname: 'EcoFashionista', text: 'Wow, that jacket looks amazing on you! What a great find.', timestamp: '2023-11-20T10:00:00Z' },
    { id: 'comment2', storyId: 'story1', userId: 'user2', authorNickname: '해삐영', text: 'Thank you! I was so lucky.', timestamp: '2023-11-20T10:05:00Z' },
    { id: 'comment3', storyId: 'story2', userId: 'user2', authorNickname: '해삐영', text: 'This is such a cool idea! I want to try it too.', timestamp: '2023-11-21T14:30:00Z' },
];

const MOCK_REPORTS: PerformanceReport[] = [
    { id: 'report1', date: '2023-10-31', title: '2023년 10월 뉴스레터', excerpt: '10월 한 달간 총 521개의 의류가 교환되어 약 2,500,000L의 물을 절약했습니다. 커뮤니티 이벤트 참여율 또한 전월 대비 15% 증가했습니다.'},
    { id: 'report2', date: '2023-09-30', title: '2023년 9월 뉴스레터', excerpt: '9월에는 추석을 맞아 \'지속가능한 명절\' 캠페인을 진행했습니다. 캠페인을 통해 총 380개의 의류가 새로운 주인을 찾았습니다.'},
];

const MOCK_CREDITS: Credit[] = [
    { id: 'credit1', userId: 'user1', date: '2023-10-25', activityName: '빈티지 데님 자켓 기부', type: 'EARNED_CLOTHING', amount: 1000 },
    { id: 'credit2', userId: 'user1', date: '2023-11-18', activityName: '플리마켓 & 워크샵 참여', type: 'EARNED_EVENT', amount: 500 },
    { id: 'credit3', userId: 'user1', date: '2023-11-20', activityName: '친환경 세제 교환', type: 'SPENT_REWARD', amount: 800 },
];

const MOCK_REWARDS: Reward[] = [
    { id: 'reward1', name: '친환경 주방 비누', description: '식물성 원료로 만든 안전한 주방 비누입니다.', cost: 800, imageUrl: 'https://images.unsplash.com/photo-1610992362706-9a2f7d5ba15e?q=80&w=800&auto=format&fit=crop', type: 'GOODS'},
    { id: 'reward2', name: '대나무 칫솔 세트', description: '플라스틱을 줄이는 작은 실천, 대나무 칫솔 (2개입).', cost: 1200, imageUrl: 'https://images.unsplash.com/photo-1629618349142-3c44a8385244?q=80&w=800&auto=format&fit=crop', type: 'GOODS'},
    { id: 'reward3', name: '온라인 세탁 서비스 10% 할인권', description: '옷길 제휴 온라인 세탁 서비스 할인 쿠폰입니다.', cost: 500, imageUrl: 'https://images.unsplash.com/photo-1608174542618-b2a6c1a2f6b3?q=80&w=800&auto=format&fit=crop', type: 'SERVICE'},
];

const MOCK_MAKERS: Maker[] = [
    { id: 'maker1', name: '리페어 아뜰리에', specialty: '의류 수선 및 리폼', location: '서울 성수동', bio: '20년 경력의 수선 장인이 운영하는 곳. 어떤 옷이든 새롭게 만들어 드립니다.', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop' },
    { id: 'maker2', name: '청바지 연구소', specialty: '데님 업사이클링', location: '서울 연남동', bio: '헌 청바지를 가방, 액세서리 등 유니크한 아이템으로 재탄생시킵니다.', imageUrl: 'https://images.unsplash.com/photo-1475179593777-bd12fd56b85d?q=80&w=800&auto=format&fit=crop' },
    { id: 'maker3', name: '니트 클리닉', specialty: '니트웨어 전문 수선', location: '경기 분당', bio: '구멍나거나 올이 나간 니트를 감쪽같이 복원해 드리는 니트 전문 병원입니다.', imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop' },
];

const MOCK_MAKER_PRODUCTS: MakerProduct[] = [
    { id: 'prod1', makerId: 'maker1', name: '업사이클 데님 파우치', description: '헌 청바지로 만든 튼튼하고 스타일리쉬한 파우치입니다.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1566453543945-815341a4a581?q=80&w=800&auto=format&fit=crop'},
    { id: 'prod2', makerId: 'maker1', name: '패치워크 컵 받침 세트', description: '다양한 자투리 천으로 만든 세상에 하나뿐인 컵 받침 4종 세트.', price: 800, imageUrl: 'https://images.unsplash.com/photo-1605461234329-1667b4c0362f?q=80&w=800&auto=format&fit=crop'},
    { id: 'prod3', makerId: 'maker2', name: '청바지 포켓 카드지갑', description: '청바지의 뒷주머니를 그대로 살려 만든 유니크한 카드지갑.', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1618521236939-50953a1523a9?q=80&w=800&auto=format&fit=crop'},
    { id: 'prod4', makerId: 'maker2', name: '데님 헤어 스크런치', description: '부드러운 데님 원단으로 만들어 머릿결 손상이 적습니다.', price: 500, imageUrl: 'https://images.unsplash.com/photo-1588725343467-5e6a27c73f7f?q=80&w=800&auto=format&fit=crop'},
    { id: 'prod5', makerId: 'maker3', name: '니트 짜투리 인형', description: '수선 후 남은 니트 조각들로 만든 귀여운 고양이 인형입니다.', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1598188824731-57f35b89a8a2?q=80&w=800&auto=format&fit=crop'},
];

const MOCK_PARTIES: Party[] = [
    { 
        id: 'party1', 
        hostId: 'user1', 
        title: 'EcoFashionista의 연말 옷장 정리 파티', 
        description: '함께 모여 옷을 교환하고 지속가능한 패션에 대해 이야기 나눠요. 작은 다과가 준비됩니다.',
        date: '2024-12-28', 
        location: '서울 성수동',
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop',
        details: ['Free admission', 'Upcycling workshop materials provided'],
        status: 'UPCOMING', 
        invitationCode: 'ECOPARTY24',
        participants: [
            { userId: 'user1', nickname: 'EcoFashionista', status: 'ACCEPTED' },
            { userId: 'user2', nickname: '해삐영', status: 'ACCEPTED' },
        ],
        kitDetails: { participants: 15, itemsPerPerson: 5, cost: 80000 }
    },
    { 
        id: 'party2', 
        hostId: 'host-of-party2', 
        title: '성수동 플리마켓 애프터파티', 
        description: '플리마켓에서 못다한 이야기를 나누는 시간. 남은 옷들을 교환하고 새로운 친구를 만드세요.',
        date: '2024-11-15', 
        location: '서울 성수동',
        imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
        details: ['First 50 people', 'Eco-friendly detergent for all participants'],
        status: 'UPCOMING', 
        invitationCode: 'SEONGSU24',
        participants: [
            { userId: 'user1', nickname: 'EcoFashionista', status: 'PENDING' },
            { userId: 'user3', nickname: 'StyleSeeker', status: 'PENDING' },
        ],
        kitDetails: { participants: 20, itemsPerPerson: 3, cost: 95000 }
    },
    { 
        id: 'party3', 
        hostId: 'host-of-party3', 
        title: '지난 여름의 옷 교환 파티', 
        description: '작아지거나, 취향이 변한 여름 옷들을 교환하며 다음 여름을 준비해요.',
        date: '2024-09-05', 
        location: '온라인 (Zoom)',
        imageUrl: 'https://images.unsplash.com/photo-1502323777036-f2913972d221?q=80&w=1200&auto=format&fit=crop',
        details: ['Online event via Zoom', 'Breakout rooms for smaller group exchanges'],
        status: 'COMPLETED', 
        invitationCode: 'SUMMER24',
        participants: [
            { userId: 'user1', nickname: 'EcoFashionista', status: 'ATTENDED' },
            { userId: 'user2', nickname: '해삐영', status: 'REJECTED' },
        ],
        impact: { itemsExchanged: 50, waterSaved: 135000, co2Reduced: 275 },
        kitDetails: { participants: 10, itemsPerPerson: 5, cost: 70000 }
    }
];


const MOCK_ADMIN_CODE = 'OTGIL-ADMIN-2024';

const App: React.FC = () => {
    const [page, setPage] = useState<Page>(Page.HOME);
    const [users, setUsers] = useState<User[]>(MOCK_USERS_DATA);
    const [currentUser, setCurrentUser] = useState<User | null>(users[0]); // Initially logged in for demo
    const [clothingItems, setClothingItems] = useState<ClothingItem[]>(MOCK_CLOTHING_ITEMS);
    const [stories, setStories] = useState<Story[]>(MOCK_STORIES_DATA);
    const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
    const [reports, setReports] = useState<PerformanceReport[]>(MOCK_REPORTS);
    const [credits, setCredits] = useState<Credit[]>(MOCK_CREDITS);
    const [makers, setMakers] = useState<Maker[]>(MOCK_MAKERS);
    const [makerProducts, setMakerProducts] = useState<MakerProduct[]>(MOCK_MAKER_PRODUCTS);
    const [parties, setParties] = useState<Party[]>(MOCK_PARTIES);
    
    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
    const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
    const [selectedNeighborId, setSelectedNeighborId] = useState<string | null>(null);


    const handleLogin = (email: string): boolean => {
        const user = users.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
            setPage(Page.MY_PAGE);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setPage(Page.HOME);
    };

    const handleSignUp = (nickname: string, email: string, phoneNumber: string, userType: 'USER' | 'ADMIN', adminCode: string): { success: boolean, message: string } => {
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'This email is already in use.' };
        }

        let isAdmin = false;
        if (userType === 'ADMIN') {
            if (adminCode !== MOCK_ADMIN_CODE) {
                return { success: false, message: 'Invalid admin code.' };
            }
            isAdmin = true;
        }

        const newUser: User = { id: `user${users.length + 1}`, nickname, email, phoneNumber, isAdmin, neighbors: [] };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setPage(Page.HOME);
        return { success: true, message: 'Sign up successful!' };
    };

    const handleSetNeighbors = (userId: string, neighborIds: string[]) => {
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, neighbors: neighborIds } : u));
      setCurrentUser(prevUser => prevUser && prevUser.id === userId ? { ...prevUser, neighbors: neighborIds } : prevUser);
    };

    const handleToggleNeighbor = (neighborId: string) => {
        if (!currentUser) return;
        const currentNeighbors = currentUser.neighbors || [];
        const isNeighbor = currentNeighbors.includes(neighborId);
        let newNeighbors;

        if (isNeighbor) {
            newNeighbors = currentNeighbors.filter(id => id !== neighborId);
        } else {
            newNeighbors = [...currentNeighbors, neighborId];
        }
        handleSetNeighbors(currentUser.id, newNeighbors);
    };
    
    const handleItemAdd = (
        itemInfo: Omit<ClothingInfo, 'description'> & { description: string, size: string, imageUrl: string },
        options: {
            goodbyeTag?: GoodbyeTag;
            helloTag?: HelloTag;
            selectedPartyId?: string | null;
        }
    ) => {
        if (!currentUser) {
            alert("Login is required.");
            setPage(Page.LOGIN);
            return;
        }

        const isHello = !!options.helloTag;
        
        const newItem: ClothingItem = {
            ...itemInfo,
            id: `item${clothingItems.length + 1}`,
            userNickname: currentUser.nickname,
            userId: currentUser.id,
            isListedForExchange: isHello, // HELLO tags are visible on profile by default
            goodbyeTag: options.goodbyeTag,
            helloTag: options.helloTag,
            partySubmissionStatus: !isHello && options.selectedPartyId ? 'PENDING' : undefined,
            submittedPartyId: !isHello ? (options.selectedPartyId || undefined) : undefined,
        };

        setClothingItems(prev => [newItem, ...prev]);
        
        const newCredit: Credit = {
            id: `credit${credits.length + 1}`,
            userId: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            activityName: `${itemInfo.name} 등록`,
            type: 'EARNED_CLOTHING',
            amount: 1000,
        };
        setCredits(prev => [...prev, newCredit]);

        if (isHello) {
             alert('아이템이 내 옷장에 추가되고 프로필에 표시됩니다!');
        } else if (options.selectedPartyId) {
             alert('아이템이 파티 라인업에 등록 신청되었습니다! 관리자 승인 후 공개됩니다.');
        } else {
             alert('아이템이 내 옷장에 추가되었습니다! 이제 21% 파티에 출품할 수 있습니다.');
        }
       
        setPage(Page.MY_PAGE);
    };

    const handleToggleListing = (itemId: string) => {
        setClothingItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId
                    ? { ...item, isListedForExchange: !item.isListedForExchange }
                    : item
            )
        );
    };
    
    const handlePartyApplication = (partyId: string) => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            setPage(Page.LOGIN);
            return;
        }

        setParties(prevParties => {
            const newParties = [...prevParties];
            const partyIndex = newParties.findIndex(p => p.id === partyId);

            if (partyIndex === -1) {
                alert("파티를 찾을 수 없습니다.");
                return prevParties;
            }

            const party = newParties[partyIndex];
            const alreadyApplied = party.participants.some(p => p.userId === currentUser.id);

            if (alreadyApplied) {
                alert("이미 이 파티에 신청했거나 참여중입니다.");
                return prevParties;
            }

            const newParticipant = {
                userId: currentUser.id,
                nickname: currentUser.nickname,
                status: 'PENDING' as const,
            };

            const updatedParty = {
                ...party,
                participants: [...party.participants, newParticipant]
            };
            
            newParties[partyIndex] = updatedParty;
            alert("파티 참가 신청이 완료되었습니다. '마이페이지'에서 상태를 확인하세요.");
            return newParties;
        });
    };
    
    const handleSelectStory = (id: string) => {
        setSelectedStoryId(id);
        setPage(Page.STORY_DETAIL);
    };
    
    const handleSelectParty = (id: string) => {
        setSelectedPartyId(id);
        setPage(Page.PARTY_HOST_DASHBOARD);
    };

    const handleSelectNeighbor = (neighborId: string) => {
        setSelectedNeighborId(neighborId);
    };
    
    const handleAddReport = (reportData: { title: string; date: string; excerpt: string }) => {
        const newReport: PerformanceReport = {
            ...reportData,
            id: `report${reports.length + 1}`,
        };
        setReports(prev => [newReport, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        alert('뉴스레터가 성공적으로 추가되었습니다.');
    };
    
    const handleStorySubmit = (storyData: { id?: string; partyId: string; title: string; excerpt: string; content: string; imageUrl: string; tags: string[] }) => {
        if (!currentUser) return;
    
        if (storyData.id) { // Update
            setStories(stories.map(story => 
                story.id === storyData.id 
                    ? { ...story, ...storyData } 
                    : story
            ));
            alert('Your story has been successfully updated.');
        } else { // Create
            const newStory: Story = {
                id: `story${stories.length + 1}`,
                userId: currentUser.id,
                author: currentUser.nickname,
                ...storyData,
                likes: 0,
                likedBy: [],
            };
            setStories([newStory, ...stories]);
            alert('Your story has been successfully created.');
        }
    };
    
    const handleDeleteStory = (storyId: string) => {
        if (window.confirm('Are you sure you want to delete this story?')) {
            setStories(prev => prev.filter(s => s.id !== storyId));
        }
    };

    const handleToggleLikeStory = (storyId: string) => {
        if (!currentUser) {
            alert('Please log in to like stories.');
            setPage(Page.LOGIN);
            return;
        }
        setStories(prevStories => {
            return prevStories.map(story => {
                if (story.id === storyId) {
                    const isLiked = story.likedBy.includes(currentUser.id);
                    if (isLiked) {
                        return {
                            ...story,
                            likes: story.likes - 1,
                            likedBy: story.likedBy.filter(id => id !== currentUser.id)
                        };
                    } else {
                        return {
                            ...story,
                            likes: story.likes + 1,
                            likedBy: [...story.likedBy, currentUser.id]
                        };
                    }
                }
                return story;
            });
        });
    };

    const handleAddComment = (storyId: string, text: string) => {
        if (!currentUser) return;
        const newComment: Comment = {
            id: `comment${comments.length + 1}`,
            storyId,
            userId: currentUser.id,
            authorNickname: currentUser.nickname,
            text,
            timestamp: new Date().toISOString(),
        };
        setComments(prev => [...prev, newComment]);
    };

    const handleAddParty = (partyData: Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status'>) => {
        if(!currentUser) return;
        const newParty: Party = {
            ...partyData,
            id: `party${parties.length + 1}`,
            hostId: currentUser.id,
            status: 'UPCOMING',
            invitationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            participants: [],
        };
        setParties(prev => [newParty, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        alert('파티가 성공적으로 추가되었습니다.');
    };
    
    const handleUpdateParty = (updatedParty: Party) => {
        setParties(prev => prev.map(party => party.id === updatedParty.id ? updatedParty : party));
        alert('파티가 성공적으로 수정되었습니다.');
    };

    const handleDeleteParty = (partyId: string) => {
        setParties(prev => prev.filter(party => party.id !== partyId));
        alert('파티가 삭제되었습니다.');
    };
    
    const handleUpdateParticipantStatus = (partyId: string, userId: string, newStatus: PartyParticipantStatus) => {
        setParties(prevParties => {
            return prevParties.map(party => {
                if (party.id === partyId) {
                    return {
                        ...party,
                        participants: party.participants.map(p => 
                            p.userId === userId ? { ...p, status: newStatus } : p
                        ),
                    };
                }
                return party;
            });
        });
    };

    const handleHostParty = (partyData: Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status' | 'kitDetails'>) => {
        if (!currentUser) return;
        const newParty: Party = {
            ...partyData,
            id: `party${parties.length + 1}`,
            hostId: currentUser.id,
            status: 'PENDING_APPROVAL',
            invitationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            participants: [{ userId: currentUser.id, nickname: currentUser.nickname, status: 'ACCEPTED' }],
        };
        setParties(prev => [...prev, newParty].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        alert('파티 호스팅 신청이 완료되었습니다. 관리자 승인 후 마이페이지에서 상태를 확인하실 수 있습니다.');
        setPage(Page.MY_PAGE);
    };

    const handleUpdatePartyApprovalStatus = (partyId: string, newStatus: 'UPCOMING' | 'REJECTED') => {
        setParties(prevParties => {
            return prevParties.map(party => {
                if (party.id === partyId && party.status === 'PENDING_APPROVAL') {
                    return { ...party, status: newStatus };
                }
                return party;
            });
        });
        alert(`파티 상태가 '${newStatus === 'UPCOMING' ? '승인됨' : '거절됨'}'으로 변경되었습니다.`);
    };
    
    const handleUpdatePartyImpact = (partyId: string, finalParticipants: number, finalItemsExchanged: number) => {
        const avgWaterSaved = 2700; // T-shirt avg
        const avgCo2Reduced = 5.5; // T-shirt avg
        const newImpact: ImpactStats = {
            itemsExchanged: finalItemsExchanged,
            waterSaved: finalItemsExchanged * avgWaterSaved,
            co2Reduced: finalItemsExchanged * avgCo2Reduced,
        };

        setParties(parties.map(p => 
            p.id === partyId ? { ...p, impact: newImpact, status: 'COMPLETED' } : p
        ));
    };

    const handlePartySubmit = (itemId: string, partyId: string) => {
        setClothingItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, partySubmissionStatus: 'PENDING', submittedPartyId: partyId }
                : item
        ));
        alert('파티 출품 신청이 완료되었습니다. 관리자 승인 후 이웃 옷장에 공개됩니다.');
    };

    const handleCancelPartySubmit = (itemId: string) => {
        setClothingItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const { partySubmissionStatus, submittedPartyId, ...rest } = item;
                return rest;
            }
            return item;
        }));
    };

    const handleUpdatePartyItemStatus = (itemId: string, status: 'APPROVED' | 'REJECTED') => {
        setClothingItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, partySubmissionStatus: status }
                : item
        ));
    };


    const userImpactStats = useMemo<ImpactStats>(() => {
        if (!currentUser) return { itemsExchanged: 0, waterSaved: 0, co2Reduced: 0 };
        const userItems = clothingItems.filter(item => item.userId === currentUser.id);
        
        return userItems.reduce((acc, item) => {
            const factors = IMPACT_FACTORS[item.category];
            if (factors) {
                acc.waterSaved += factors.water;
                acc.co2Reduced += factors.co2;
            }
            return acc;
        }, { itemsExchanged: userItems.length, waterSaved: 0, co2Reduced: 0 });
    }, [currentUser, clothingItems]);
    
    const userCredits = useMemo(() => credits.filter(c => c.userId === currentUser?.id), [credits, currentUser]);

    const userCreditBalance = useMemo(() => {
        return userCredits.reduce((sum, credit) => {
          return credit.type.startsWith('EARNED') ? sum + credit.amount : sum - credit.amount;
        }, 0);
    }, [userCredits]);

    const acceptedUpcomingPartiesForUser = useMemo(() => {
        if (!currentUser) return [];
        return parties.filter(p => 
            p.status === 'UPCOMING' && 
            p.participants.some(participant => participant.userId === currentUser.id && participant.status === 'ACCEPTED')
        );
    }, [parties, currentUser]);

    const handleRedeemReward = (reward: Reward) => {
        if (!currentUser) return;
        if (userCreditBalance < reward.cost) {
            alert('You do not have enough credits.');
            return;
        }
        const newCredit: Credit = {
            id: `credit${credits.length + 1}`,
            userId: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            activityName: `${reward.name} 교환`,
            type: 'SPENT_REWARD',
            amount: reward.cost,
        };
        setCredits(prev => [...prev, newCredit]);
        alert(`'${reward.name}' has been redeemed!`);
    }

    const handlePurchaseMakerProduct = (product: MakerProduct) => {
        if (!currentUser) return;
        if (userCreditBalance < product.price) {
            alert('크레딧이 부족합니다.');
            return;
        }
        const newCredit: Credit = {
            id: `credit${credits.length + 1}`,
            userId: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            activityName: `${product.name} 구매`,
            type: 'SPENT_MAKER_PURCHASE',
            amount: product.price,
        };
        setCredits(prev => [...prev, newCredit]);
        alert(`'${product.name}'를 구매했습니다!`);
    };

    const handleOffsetCredit = (amount: number): boolean => {
        if (!currentUser) return false;
        if (userCreditBalance < amount) {
            alert('You do not have enough credits.');
            return false;
        }
        const newCredit: Credit = {
            id: `credit${credits.length + 1}`,
            userId: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            activityName: '크레딧 소각',
            type: 'SPENT_OFFSET',
            amount: amount,
        };
        setCredits(prev => [...prev, newCredit]);
        return true;
    }

    const renderPage = () => {
        switch (page) {
            case Page.HOME: return <HomePage setPage={setPage} />;
            case Page.BROWSE: return <BrowsePage items={clothingItems} parties={parties} />;
            case Page.NEIGHBORS_CLOSET: return currentUser ? <NeighborsClosetPage currentUser={currentUser} allUsers={users} setPage={setPage} onSelectNeighbor={handleSelectNeighbor} /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.NEIGHBOR_PROFILE:
                const neighbor = users.find(u => u.id === selectedNeighborId);
                const neighborItems = clothingItems.filter(item => item.userId === selectedNeighborId && item.isListedForExchange);
                return currentUser && neighbor ? <NeighborProfilePage
                    neighbor={neighbor}
                    items={neighborItems}
                    currentUser={currentUser}
                    onToggleNeighbor={handleToggleNeighbor}
                    setPage={setPage}
                /> : <NeighborsClosetPage currentUser={currentUser!} allUsers={users} setPage={setPage} onSelectNeighbor={handleSelectNeighbor} />;
            case Page.UPLOAD: return <UploadPage onItemAdd={handleItemAdd} acceptedParties={acceptedUpcomingPartiesForUser} />;
            case Page.LOGIN: return <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.SIGNUP: return <SignUpPage onSignUp={handleSignUp} setPage={setPage} />;
            case Page.MY_PAGE:
                return currentUser ? <MyPage user={currentUser} allUsers={users} onSetNeighbors={handleSetNeighbors} stats={userImpactStats} clothingItems={clothingItems.filter(item => item.userId === currentUser.id)} credits={userCredits} parties={parties} onToggleListing={handleToggleListing} onSelectHostedParty={handleSelectParty} setPage={setPage} onPartySubmit={handlePartySubmit} onCancelPartySubmit={handleCancelPartySubmit} onOffsetCredit={handleOffsetCredit} acceptedUpcomingParties={acceptedUpcomingPartiesForUser} /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.STORY_DETAIL:
                const story = stories.find(s => s.id === selectedStoryId);
                const storyComments = comments.filter(c => c.storyId === selectedStoryId);
                const storyParty = parties.find(p => p.id === story?.partyId);
                return story ? <StoryDetailPage story={story} comments={storyComments} party={storyParty} currentUser={currentUser} onAddComment={handleAddComment} setPage={setPage} /> : <CommunityPage stories={stories} onSelectStory={handleSelectStory} currentUser={currentUser} onStorySubmit={handleStorySubmit} onDeleteStory={handleDeleteStory} onToggleLike={handleToggleLikeStory} reports={reports} onAddReport={handleAddReport} />;
            case Page.COMMUNITY: return <CommunityPage
                stories={stories}
                onSelectStory={handleSelectStory}
                currentUser={currentUser}
                onStorySubmit={handleStorySubmit}
                onDeleteStory={handleDeleteStory}
                onToggleLike={handleToggleLikeStory}
                reports={reports}
                onAddReport={handleAddReport}
             />;
            case Page.REWARDS:
                return currentUser ? <RewardsPage user={currentUser} rewards={MOCK_REWARDS} currentBalance={userCreditBalance} onRedeem={handleRedeemReward} /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.TWENTY_ONE_PERCENT_PARTY:
                return <TwentyOnePercentPartyPage parties={parties} items={clothingItems} currentUser={currentUser} onPartyApply={handlePartyApplication} setPage={setPage} />;
            case Page.PARTY_HOSTING:
                return <PartyHostingPage onHostParty={handleHostParty} />;
            case Page.PARTY_HOST_DASHBOARD:
                const party = parties.find(p => p.id === selectedPartyId);
                return party ? <PartyHostDashboardPage party={party} setPage={setPage} makers={makers} onUpdateImpact={handleUpdatePartyImpact} onUpdateParticipantStatus={handleUpdateParticipantStatus} /> : <MyPage user={currentUser!} stats={userImpactStats} clothingItems={[]} credits={[]} parties={parties} allUsers={users} onSetNeighbors={handleSetNeighbors} onToggleListing={handleToggleListing} setPage={setPage} onSelectHostedParty={handleSelectParty} onPartySubmit={handlePartySubmit} onCancelPartySubmit={handleCancelPartySubmit} onOffsetCredit={handleOffsetCredit} acceptedUpcomingParties={acceptedUpcomingPartiesForUser} />;
            case Page.MAKERS_HUB:
                return currentUser ? <MakersHubPage makers={makers} products={makerProducts} userCreditBalance={userCreditBalance} onPurchase={handlePurchaseMakerProduct} /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.ADMIN:
                return currentUser?.isAdmin ? <AdminPage 
                    parties={parties}
                    clothingItems={clothingItems}
                    users={users}
                    onAddParty={handleAddParty}
                    onUpdateParty={handleUpdateParty}
                    onDeleteParty={handleDeleteParty}
                    onUpdateParticipantStatus={handleUpdateParticipantStatus}
                    onUpdatePartyItemStatus={handleUpdatePartyItemStatus}
                    onUpdatePartyApprovalStatus={handleUpdatePartyApprovalStatus}
                /> : <HomePage setPage={setPage} />;
            default: return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-brand-background">
            <Header currentPage={page} setPage={setPage} user={currentUser} onLogout={handleLogout} />
            <main className="flex-grow">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
};

export default App;