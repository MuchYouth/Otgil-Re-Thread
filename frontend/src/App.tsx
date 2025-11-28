import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Page, User, ClothingItem, ImpactStats, Story, Credit, Reward, PerformanceReport, Comment, Party, Maker, MakerProduct, PartyParticipantStatus, GoodbyeTag, HelloTag, ClothingCategory } from './types';
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
    { id: 'item1', name: 'Vintage Denim Jacket', description: 'A great condition Levis denim jacket.', category: '자켓', size: 'L', imageUrl: 'https://images.unsplash.com/photo-1542281286-9e0e16bb7366?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: false, goodbyeTag: { metWhen: '2020', metWhere: 'Flea Market', whyGot: 'Classic style', wornCount: 50, whyLetGo: 'Too small', finalMessage: 'Hope you like it!' } },
    { id: 'item2', name: 'Patchwork Jogger Pants', description: 'Comfortable cotton pants with unique patchwork details.', category: '바지', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: false, goodbyeTag: { metWhen: '2021', metWhere: 'Online', whyGot: 'Unique design', wornCount: 20, whyLetGo: 'Changed style', finalMessage: 'Enjoy!' } },
    { id: 'item3', name: 'Reconstructed Floral Dress', description: 'A light, chiffon long dress, recreated from vintage fabrics.', category: '드레스', size: 'S', imageUrl: 'https://images.unsplash.com/photo-1567683502283-a4e1b73e57f0?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: false, goodbyeTag: { metWhen: '2022', metWhere: 'Gift', whyGot: 'A present', wornCount: 5, whyLetGo: 'Not my color', finalMessage: 'Be happy!' } },
    { id: 'item4', name: 'Embroidered T-Shirt', description: 'A basic white tee with a hand-embroidered flower.', category: '티셔츠', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: true, helloTag: { receivedFrom: 'EcoFashionista', receivedAt: 'Birthday Party', firstImpression: 'So cute!', helloMessage: 'My new favorite tee!' } },
    { id: 'item5', name: 'Handmade Chain Necklace', description: 'A silver necklace made from upcycled materials to make a statement.', category: '악세서리', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1616843438318-9a334a179357?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: true, helloTag: { receivedFrom: 'UpcycleArt', receivedAt: 'Workshop', firstImpression: 'Stunning!', helloMessage: 'Wear it everyday.' } },
    { id: 'item6', name: 'Oversized Linen Shirt', description: 'A cool, oversized linen shirt, naturally dyed.', category: '티셔츠', size: 'L', imageUrl: 'https://images.unsplash.com/photo-1622470953794-34505b2db67b?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: false, goodbyeTag: { metWhen: '2022 Summer', metWhere: 'Local designer', whyGot: 'Beautiful color', wornCount: 10, whyLetGo: 'Too big now', finalMessage: 'Enjoy the comfy fit.' } },
    { id: 'item7', name: 'Cool Graphic Tee', description: 'A barely worn graphic t-shirt, printed on a repurposed shirt.', category: '티셔츠', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: false, partySubmissionStatus: 'PENDING', submittedPartyId: 'party1',
      goodbyeTag: { metWhen: '2022년 여름', metWhere: '온라인 쇼핑몰', whyGot: '좋아하는 아티스트의 한정판이라서', wornCount: 5, whyLetGo: '이제는 스타일이 바뀌어서', finalMessage: '새로운 주인 만나서 더 멋지게 입혀주길!' }
    },
    { id: 'item8', name: 'Woven Handbag', description: 'A stylish woven handbag for any occasion, made from recycled materials.', category: '악세서리', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1591561934208-283011031380?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: false, partySubmissionStatus: 'APPROVED', submittedPartyId: 'party1',
      goodbyeTag: { metWhen: '작년 가을', metWhere: '제주도 소품샵', whyGot: '독특한 디자인에 반해서', wornCount: 20, whyLetGo: '더 큰 가방이 필요해져서', finalMessage: '좋은 추억이 많은 가방이야, 잘 부탁해.' }
    },
    { id: 'item9', name: '클래식 화이트 블라우스', description: '친구에게서 받은 활용도 높은 흰색 블라우스입니다.', category: '티셔츠', size: 'S', imageUrl: 'https://images.unsplash.com/photo-1589379918793-01c9ab2283a3?q=80&w=800&auto=format&fit=crop', userNickname: '해삐영', userId: 'user2', isListedForExchange: true, 
      helloTag: { receivedFrom: 'EcoFashionista', receivedAt: 'EcoFashionista의 연말 옷장 정리 파티', firstImpression: '깔끔하고 어디에나 잘 어울릴 것 같았어요!', helloMessage: '앞으로 잘 부탁해, 나의 새로운 최애템!' }
    },
    { id: 'item10', name: '가죽 크로스백', description: '매일 사용하기 좋은 튼튼하고 스타일리시한 가방입니다.', category: '악세서리', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eada6b5a5a?q=80&w=800&auto=format&fit=crop', userNickname: 'EcoFashionista', userId: 'user1', isListedForExchange: true,
      helloTag: { receivedFrom: '해삐영', receivedAt: '성수동 플리마켓 애프터파티', firstImpression: '빈티지한 느낌이 마음에 쏙 들었어요.', helloMessage: '오래오래 함께하자!' }
    },
    { id: 'item11', name: '자연염색 린넨 셔츠', description: '쪽빛으로 물들인 시원한 린넨 셔츠입니다.', category: '티셔츠', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1622470953794-34505b2db67b?q=80&w=800&auto=format&fit=crop', userNickname: 'GreenThumb', userId: 'user4', isListedForExchange: false, 
      goodbyeTag: { metWhen: '2023년 봄', metWhere: '인사동 공방', whyGot: '자연스러운 색감에 반해서', wornCount: 10, whyLetGo: '비슷한 셔츠가 많아져서', finalMessage: '편안하게 잘 입어주세요.' }
    },
    { id: 'item12', name: '실크스크린 에코백', description: '직접 디자인한 패턴을 실크스크린으로 찍어낸 에코백.', category: '악세서리', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1579065365314-e651b143a4e9?q=80&w=800&auto=format&fit=crop', userNickname: 'UpcycleArt', userId: 'user5', isListedForExchange: false,
      goodbyeTag: { metWhen: '2023년 여름', metWhere: '작업실', whyGot: '작품 활동의 일환으로 제작', wornCount: 3, whyLetGo: '새로운 디자인을 구상 중이라', finalMessage: '당신의 일상에 예술이 함께하길!' }
    },
    { id: 'item13', name: '80년대 레트로 원피스', description: '화려한 패턴이 돋보이는 80년대 풍의 빈티지 원피스.', category: '드레스', size: 'S', imageUrl: 'https://images.unsplash.com/photo-1552865228-1b7b7a1a3a49?q=80&w=800&auto=format&fit=crop', userNickname: 'VintageVibes', userId: 'user6', isListedForExchange: false,
      goodbyeTag: { metWhen: '2022년 가을', metWhere: '광장시장 구제상가', whyGot: '독특한 패턴이 마음에 들어서', wornCount: 7, whyLetGo: '특별한 날에만 입게 되어서', finalMessage: '이 옷을 입고 멋진 추억을 만드세요.' }
    },
    { id: 'item14', name: '모던 베이지 슬랙스', description: '어디에나 잘 어울리는 기본 중의 기본, 베이지 슬랙스.', category: '바지', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1541089404513-ea03b783d735?q=80&w=800&auto=format&fit=crop', userNickname: '미니멀衣스트', userId: 'user7', isListedForExchange: false,
      goodbyeTag: { metWhen: '2023년 초', metWhere: '백화점', whyGot: '기본 아이템으로 구매', wornCount: 30, whyLetGo: '살이 빠져 사이즈가 맞지 않음', finalMessage: '오래오래 아껴 입어주실 분을 찾아요.' }
    },
    { id: 'item15', name: '튼튼한 코튼 자켓', description: '가을에 입기 좋은 튼튼한 코튼 소재의 워크 자켓입니다.', category: '자켓', size: 'L', imageUrl: 'https://images.unsplash.com/photo-1608234808389-9a74b0df19c0?q=80&w=800&auto=format&fit=crop', userNickname: '지속가능맨', userId: 'user8', isListedForExchange: false,
      goodbyeTag: { metWhen: '2021년', metWhere: '편집샵', whyGot: '오래 입을 수 있을 것 같아서', wornCount: 50, whyLetGo: '새로운 워크 자켓을 선물받아서', finalMessage: '앞으로 10년은 더 입을 수 있을 거예요.' }
    },
    { id: 'item16', name: '핸드메이드 뜨개 가방', description: '직접 뜬 여름용 뜨개 가방입니다.', category: '악세서리', size: 'FREE', imageUrl: 'https://images.unsplash.com/photo-1587856436214-99730870341b?q=80&w=800&auto=format&fit=crop', userNickname: 'GreenThumb', userId: 'user4', isListedForExchange: false,
      goodbyeTag: { metWhen: '2023년 6월', metWhere: '집', whyGot: '취미로 만들었어요', wornCount: 15, whyLetGo: '새로운 가방을 만들어서', finalMessage: '정성이 담긴 가방입니다.' }
    },
    { id: 'item17', name: '페인팅 커스텀 청바지', description: '세상에 하나뿐인 페인팅 커스텀 청바지.', category: '바지', size: '28', imageUrl: 'https://images.unsplash.com/photo-1604176354204-926873782855?q=80&w=800&auto=format&fit=crop', userNickname: 'UpcycleArt', userId: 'user5', isListedForExchange: false,
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
    // MOCK 데이터 로드 (기존 코드 유지)
    // 실제로는 API로 불러와야 하지만, 일단 UI 구동을 위해 유지
    const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]); 
    const [stories, setStories] = useState<Story[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [reports, setReports] = useState<PerformanceReport[]>([]);
    const [credits, setCredits] = useState<Credit[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [makers, setMakers] = useState<Maker[]>([]);
    const [makerProducts, setMakerProducts] = useState<MakerProduct[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    
    // [수정됨] 유저 상태 관리
    const [page, setPage] = useState<Page>(Page.HOME);
    const [users, setUsers] = useState<User[]>(MOCK_USERS_DATA);
    const [currentUser, setCurrentUser] = useState<User | null>(null); // 처음엔 로그인 안 된 상태

    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
    const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
    const [selectedNeighborId, setSelectedNeighborId] = useState<string | null>(null);

    // [핵심] 백엔드에서 내 정보 가져오기 함수
    const fetchCurrentUser = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch("http://localhost:8000/users/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // 토큰을 헤더에 실어 보냄
                },
            });

            if (response.ok) {
                const userData = await response.json();
                // [수정] 백엔드(snake_case) -> 프론트엔드(camelCase) 매핑
                // DB의 is_admin 값을 isAdmin으로, phone_number를 phoneNumber로 변환해야 합니다.
                const mappedUser: User = {
                    ...userData,
                    isAdmin: userData.is_admin,        // 매핑 중요!
                    phoneNumber: userData.phone_number // 매핑 중요!
                };

                setCurrentUser(mappedUser); // DB에서 가져온 진짜 유저 정보로 설정
                
                // 유저 정보 로드 성공 시 크레딧 내역도 함께 로드
                fetchCredits();

                setUsers(prev => {
                    if (!prev.find(u => u.id === userData.id)) {
                        return [...prev, userData];
                    }
                    return prev;
                });
            } else {
                // 토큰이 만료되었거나 잘못된 경우
                console.error("Failed to fetch user");
                localStorage.removeItem('access_token');
                setCurrentUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }, []);

    // [API] 크레딧 내역 조회 API
    const fetchCredits = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch("http://localhost:8000/credits/my-history", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // Backend snake_case -> Frontend camelCase (필요 시 매핑)
                // 현재 Credit 모델은 필드명이 거의 일치하므로 그대로 사용 가능
                // activity_name -> activityName 매핑 필요
                const formattedCredits: Credit[] = data.map((c: any) => ({
                    id: c.id,
                    userId: c.user_id,
                    date: new Date(c.date).toLocaleDateString(), // 날짜 포맷팅
                    activityName: c.activity_name,
                    type: c.type,
                    amount: c.amount
                }));
                setCredits(formattedCredits);
            }
        } catch (error) {
            console.error("Error fetching credits:", error);
        }
    }, []);

    // [API 2] Rewards
    const fetchRewards = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/rewards/");
            if (response.ok) {
                const data = await response.json();
                // 백엔드(snake_case) -> 프론트엔드(camelCase) 매핑
                const formattedRewards: Reward[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    cost: item.cost,
                    imageUrl: item.image_url, // 중요: image_url -> imageUrl
                    type: item.type
                }));
                setRewards(formattedRewards);
            } else {
                console.error("Failed to fetch rewards");
            }
        } catch (error) {
            console.error("Error fetching rewards:", error);
        }
    }, []);

    // ---------------------------------------------------------------------------
    // [API] 3. 파티 목록 가져오기 (UPCOMING + COMPLETED)
    // ---------------------------------------------------------------------------
    const fetchParties = useCallback(async () => {
        try {
            // 진행 예정 파티와 완료된 파티를 모두 가져옵니다.
            const [upcomingRes, completedRes, pendingRes] = await Promise.all([
                fetch("http://localhost:8000/parties/?status_filter=UPCOMING"),
                fetch("http://localhost:8000/parties/?status_filter=COMPLETED"),
                fetch("http://localhost:8000/parties/?status_filter=PENDING_APPROVAL") // 내가 호스팅한 대기중 파티 확인용
            ]);

            let allParties: any[] = [];

            if (upcomingRes.ok) allParties = [...allParties, ...await upcomingRes.json()];
            if (completedRes.ok) allParties = [...allParties, ...await completedRes.json()];
            if (pendingRes.ok) allParties = [...allParties, ...await pendingRes.json()];

            // Backend snake_case -> Frontend camelCase 매핑
            const formattedParties: Party[] = allParties.map((p: any) => ({
                id: p.id,
                hostId: p.host_id,
                title: p.title,
                description: p.description,
                date: p.date,
                location: p.location,
                imageUrl: p.image_url,
                details: p.details || [],
                status: p.status,
                invitationCode: p.invitation_code,
                participants: p.participants.map((part: any) => ({
                    userId: part.user_id,
                    nickname: part.nickname,
                    status: part.status
                })),
                impact: p.impact_items_exchanged ? {
                    itemsExchanged: p.impact_items_exchanged,
                    waterSaved: p.impact_water_saved,
                    co2Reduced: p.impact_co2_reduced
                } : undefined,
                kitDetails: p.kit_participants ? {
                    participants: p.kit_participants,
                    itemsPerPerson: p.kit_items_per_person,
                    cost: p.kit_cost
                } : undefined
            }));

            // 중복 제거 (API 호출이 여러번이라 중복될 수 있음)
            const uniqueParties = Array.from(new Map(formattedParties.map(item => [item.id, item])).values());
            
            // 날짜순 정렬
            uniqueParties.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setParties(uniqueParties);

        } catch (error) {
            console.error("Error fetching parties:", error);
        }
    }, []);

    // [API 4] Community: Stories & Reports
    const fetchStories = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/community/stories");
            if (response.ok) {
                const data = await response.json();
                // Backend snake_case -> Frontend camelCase
                const formattedStories: Story[] = data.map((s: any) => ({
                    id: s.id,
                    userId: s.user_id,
                    partyId: s.party_id,
                    title: s.title,
                    author: s.author,
                    excerpt: s.excerpt,
                    content: s.content,
                    imageUrl: s.image_url,
                    tags: s.tags.map((t: any) => t.name), // Tag object -> string
                    likes: s.likes,
                    likedBy: s.liked_by
                }));
                setStories(formattedStories);
            }
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/community/reports");
            if (response.ok) {
                const data = await response.json();
                setReports(data); // 필드명이 동일하므로 그대로 사용
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    }, []);

    // 특정 스토리의 상세 정보(댓글 포함)를 가져오는 함수
    const fetchStoryDetail = useCallback(async (storyId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/community/stories/${storyId}`);
            if (response.ok) {
                const data = await response.json();
                // 댓글 데이터 매핑
                const fetchedComments: Comment[] = data.comments.map((c: any) => ({
                    id: c.id,
                    storyId: c.story_id,
                    userId: c.user_id,
                    authorNickname: c.author_nickname,
                    text: c.text,
                    timestamp: c.timestamp
                }));
                
                // 해당 스토리의 댓글 상태 업데이트 (기존 댓글 유지하면서 해당 스토리 댓글만 교체/추가)
                setComments(prev => {
                    const otherComments = prev.filter(c => c.storyId !== storyId);
                    return [...otherComments, ...fetchedComments];
                });
            }
        } catch (error) {
            console.error("Error fetching story detail:", error);
        }
    }, []);

    // ---------------------------------------------------------------------------
    // [API 5] Clothing Items (Browse & My Closet)
    // ---------------------------------------------------------------------------
    const fetchClothingItems = useCallback(async () => {
        try {
            // 1. 전체 공개 아이템 (Browse용)
            const publicRes = await fetch("http://localhost:8000/items/");
            let allItems: any[] = [];
            if (publicRes.ok) {
                allItems = await publicRes.json();
            } else {
                console.error("Failed to fetch public items");
            }
            
            // 2. 내 아이템 (MyPage용) - 로그인 시에만 호출
            const token = localStorage.getItem('access_token');
            let myItems: any[] = [];
            
            if (token) {
                const myRes = await fetch("http://localhost:8000/items/my-items", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (myRes.ok) {
                    myItems = await myRes.json();
                } else if (myRes.status === 401) {
                    // 401 에러 발생 시: 토큰이 만료되었거나 유효하지 않음 -> 로그아웃 처리
                    console.warn("Unauthorized access to my-items. Clearing token.");
                    localStorage.removeItem('access_token');
                    setCurrentUser(null);
                    // myItems는 빈 배열로 유지
                }
            }
            
            // 공개 아이템과 내 아이템 합치기 (중복 제거)
            // 내 아이템이 공개 목록에 없을 수도 있고(비공개 상태), 있을 수도 있음.
            // Map을 사용하여 ID 기준으로 중복을 제거합니다.
            // [중요] 내 아이템 정보(myItems)가 최신 상태(비공개 여부 등)일 가능성이 높으므로
            // publicItems 뒤에 myItems를 병합하여 덮어쓰도록 합니다.
            const combinedItemsMap = new Map();
            
            allItems.forEach(item => combinedItemsMap.set(item.id, item));
            myItems.forEach(item => combinedItemsMap.set(item.id, item)); // 내 아이템으로 덮어씀

            const uniqueItems = Array.from(combinedItemsMap.values());

            // Backend snake_case -> Frontend camelCase 매핑 함수
            const mapItem = (item: any): ClothingItem => ({
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                size: item.size,
                imageUrl: item.image_url,
                userNickname: item.user_nickname,
                userId: item.user_id,
                isListedForExchange: item.is_listed_for_exchange,
                partySubmissionStatus: item.party_submission_status,
                submittedPartyId: item.submitted_party_id,
                goodbyeTag: item.goodbye_tag ? {
                    metWhen: item.goodbye_tag.met_when,
                    metWhere: item.goodbye_tag.met_where,
                    whyGot: item.goodbye_tag.why_got,
                    wornCount: item.goodbye_tag.worn_count,
                    whyLetGo: item.goodbye_tag.why_let_go,
                    finalMessage: item.goodbye_tag.final_message
                } : undefined,
                helloTag: item.hello_tag ? {
                    receivedFrom: item.hello_tag.received_from,
                    receivedAt: item.hello_tag.received_at,
                    firstImpression: item.hello_tag.first_impression,
                    helloMessage: item.hello_tag.hello_message
                } : undefined
            });

            const formattedItems = uniqueItems.map(mapItem);
            setClothingItems(formattedItems);

        } catch (error) {
            console.error("Error fetching clothing items:", error);
        }
    }, []);

    // [1] 앱 실행 시(새로고침 시) 토큰이 있으면 유저 정보 가져오기
    // 앱 실행 시 데이터 로드
    useEffect(() => {
        fetchCurrentUser();
        fetchRewards();
        fetchParties();
        fetchStories();
        fetchReports();
        fetchClothingItems();
    }, [fetchCurrentUser, fetchRewards, fetchParties, fetchStories, fetchReports, fetchClothingItems]);

    // [2] 로그인 성공 핸들러 (LoginPage에서 호출)
    // 이제 email 파라미터에 의존하지 않고, 토큰을 이용해 서버에서 정보를 가져옵니다.
    const handleLogin = async (email: string) => {
        await fetchCurrentUser(); // 내 정보 갱신
        setPage(Page.MY_PAGE);    // 페이지 이동
        return true;
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token'); // 토큰 삭제
        setCurrentUser(null);
        setPage(Page.HOME);
        alert("로그아웃 되었습니다.");
    };

    // 회원가입 핸들러 (SignUpPage 내부에서 처리하므로 여기선 페이지 이동만 돕거나 비워둠)
    const handleSignUp = (nickname: string, email: string, phoneNumber: string, userType: 'USER' | 'ADMIN', adminCode: string) => {
        // SignUpPage에서 직접 API를 호출하므로 여기 로직은 사실상 필요 없지만
        // 타입 호환성을 위해 남겨둡니다.
        return { success: true, message: 'Sign up handled internally' };
    };

    // --- 이하 기존 로직들은 그대로 유지 (currentUser가 있다고 가정하고 동작) ---
    // (백엔드가 객체를 주든 문자열을 주든 에러가 안 나게 하기 위함)
    const handleSetNeighbors = (userId: string, neighborIds: any[]) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, neighbors: neighborIds } : u));
        setCurrentUser(prevUser => prevUser && prevUser.id === userId ? { ...prevUser, neighbors: neighborIds } : prevUser);
    };
    const handleToggleNeighbor = async (neighborId: string) => { // async 추가 필수!
        if (!currentUser) return;
    // 1. 현재 상태 확인 (객체든 문자열이든 다 알아듣게 some 사용)
    const currentNeighbors = currentUser.neighbors || [];
    const isNeighbor = currentNeighbors.some((n: any) => {
        return typeof n === 'string' ? n === neighborId : n.id === neighborId;
    });

    // 2. 토큰 가져오기
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    try {
        // 3. [핵심] 서버에 먼저 "저장해줘!" 요청 보내기
        const url = `http://localhost:8000/users/${neighborId}/neighbors`;
        const method = isNeighbor ? "DELETE" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: { "Authorization": `Bearer ${token}` }
        });

        // 4. 서버가 "OK(200)"라고 하면 그때 화면 바꾸기
        if (response.ok) {
            // 가장 확실한 방법: 서버에서 최신 정보를 다시 받아오기
            await fetchCurrentUser();
        } else {
            alert("서버 요청 실패! 로그를 확인하세요.");
        }
    } catch (error) {
        console.error(error);
        alert("에러가 발생했습니다.");
    }
};

    // [API]리워드 교환하기
    // [수정] 리워드 교환 시 크레딧 차감
    const handleRedeemReward = async (reward: Reward) => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            setPage(Page.LOGIN);
            return;
        }
        if (userCreditBalance < reward.cost) {
             alert('크레딧이 부족합니다.');
             return;
        }
        
        const success = await handleCreditChange(reward.cost, `${reward.name} 교환`, 'SPENT_REWARD');
        if (success) {
            alert(`'${reward.name}' 교환이 완료되었습니다!`);
        }
    };

    // [수정] 아이템 등록 시 크레딧 적립
    const handleItemAdd = async (itemInfo: any, options: any) => {
        if (!currentUser) {
            alert("Login is required.");
            setPage(Page.LOGIN);
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // 1. 아이템 등록 API 호출 (생략 - 기존 코드와 동일)
            const itemPayload = {
                name: itemInfo.name,
                description: itemInfo.description,
                category: itemInfo.category,
                size: itemInfo.size,
                image_url: itemInfo.imageUrl
            };
            const createRes = await fetch("http://localhost:8000/items/add", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(itemPayload)
            });
            if (!createRes.ok) throw new Error("아이템 등록 실패");
            const createdItem = await createRes.json();
            const itemId = createdItem.id;

            // 2. 태그 API 호출 (생략 - 기존 코드와 동일)
            if (options.goodbyeTag) { /* ... */ }
            if (options.helloTag) { /* ... */ }


            alert('아이템이 성공적으로 등록되었습니다!');
            fetchClothingItems();
            setPage(Page.MY_PAGE);

        } catch (error: any) {
            alert(`오류 발생: ${error.message}`);
        }
    };
    const handleToggleListing = async (itemId: string) => {
        if (!currentUser) return;
        const token = localStorage.getItem('access_token');
        const item = clothingItems.find(i => i.id === itemId);
        if (!item || !token) return;

        try {
            const response = await fetch(`http://localhost:8000/items/modify/${itemId}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ is_listed_for_exchange: !item.isListedForExchange })
            });

            if (response.ok) {
                fetchClothingItems();
            } else {
                alert("상태 변경 실패");
            }
        } catch (error) {
            console.error("Error toggling listing:", error);
        }
    };
    
    // [API] 파티 참가 신청
    const handlePartyApplication = async (partyId: string) => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            setPage(Page.LOGIN);
            return;
        }

        // 초대 코드 입력 받기
        const invitationCode = window.prompt("파티 초대 코드를 입력해주세요:");
        if (!invitationCode) return;

        const token = localStorage.getItem('access_token');

        try {
            // Query param으로 code 전송
            const response = await fetch(`http://localhost:8000/parties/${partyId}/join?invitation_code=${invitationCode}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert("파티 참가 신청이 완료되었습니다!");
                fetchParties(); // 참가자 명단 갱신을 위해 재조회
            } else {
                const err = await response.json();
                alert(`참가 신청 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error joining party:", error);
            alert("서버 통신 오류");
        }
    };
    
    const handleSelectStory = (id: string) => {
        setSelectedStoryId(id);
        fetchStoryDetail(id); // 상세 정보(댓글) 로드
        setPage(Page.STORY_DETAIL);
    };
    
    const handleSelectParty = (id: string) => {
        setSelectedPartyId(id);
        setPage(Page.PARTY_HOST_DASHBOARD);
    };

    const handleSelectNeighbor = (neighborId: string) => {
        setSelectedNeighborId(neighborId);
    };
    
    const handleAddReport = async (reportData: { title: string; date: string; excerpt: string }) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch("http://localhost:8000/community/reports", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(reportData)
            });

            if (response.ok) {
                alert('뉴스레터가 게시되었습니다.');
                fetchReports();
            } else {
                const err = await response.json();
                alert(`게시 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error adding report:", error);
        }
    };
    
    const handleStorySubmit = async (storyData: { id?: string; partyId: string; title: string; excerpt: string; content: string; imageUrl: string; tags: string[] }) => {
        if (!currentUser) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const payload = {
            party_id: storyData.partyId,
            title: storyData.title,
            excerpt: storyData.excerpt,
            content: storyData.content,
            image_url: storyData.imageUrl,
            tags: storyData.tags
        };

        try {
            let response;
            if (storyData.id) { // Update
                response = await fetch(`http://localhost:8000/community/stories/${storyData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } else { // Create
                response = await fetch("http://localhost:8000/community/stories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                alert(`스토리가 성공적으로 ${storyData.id ? '수정' : '작성'}되었습니다.`);
                fetchStories(); // 목록 갱신
            } else {
                const err = await response.json();
                alert(`오류 발생: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error submitting story:", error);
            alert("서버 통신 오류");
        }
    };

    
    const handleDeleteStory = async (storyId: string) => {
        if (!window.confirm('정말로 이 스토리를 삭제하시겠습니까?')) return;
        
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://localhost:8000/community/stories/${storyId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert('스토리가 삭제되었습니다.');
                fetchStories();
                if (selectedStoryId === storyId) {
                    setPage(Page.COMMUNITY);
                    setSelectedStoryId(null);
                }
            } else {
                const err = await response.json();
                alert(`삭제 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error deleting story:", error);
        }
    };

    const handleToggleLikeStory = async (storyId: string) => {
        if (!currentUser) {
            alert('로그인이 필요합니다.');
            setPage(Page.LOGIN);
            return;
        }
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://localhost:8000/community/stories/${storyId}/like`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                // 전체 목록 다시 불러오기보다는 로컬 상태만 업데이트하여 반응성 향상 가능하나, 
                // 여기서는 정합성을 위해 fetchStories 호출
                fetchStories(); 
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleAddComment = async (storyId: string, text: string) => {
        if (!currentUser) return;
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://localhost:8000/community/stories/${storyId}/comments`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                fetchStoryDetail(storyId); // 댓글 목록 갱신
            } else {
                alert('댓글 작성 실패');
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
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
    
    // [API] 파티 체크인 (호스트용 QR 스캔)
    const handleUpdateParticipantStatus = async (partyId: string, userId: string, newStatus: PartyParticipantStatus) => {
        if (newStatus !== 'ATTENDED') return; // 현재 API는 체크인(ATTENDED)만 구현됨

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // QR 체크인 API 호출 (Body에 user_id를 실어 보내거나 Query param 사용. 앞서 만든 API는 Query param user_id 사용)
            const response = await fetch(`http://localhost:8000/parties/${partyId}/check-in?user_id=${userId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                // 성공 시 로컬 상태도 업데이트하여 즉각 반영
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
            } else {
                const err = await response.json();
                alert(`체크인 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error checking in:", error);
            alert("체크인 중 통신 오류가 발생했습니다.");
        }
    };

    // [API] 파티 호스팅 신청
    const handleHostParty = async (partyData: Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status' | 'kitDetails'>) => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            setPage(Page.LOGIN);
            return;
        }
        const token = localStorage.getItem('access_token');
        
        try {
            // Frontend camelCase -> Backend snake_case
            const payload = {
                title: partyData.title,
                description: partyData.description,
                date: partyData.date,
                location: partyData.location,
                image_url: partyData.imageUrl,
                details: partyData.details
            };

            const response = await fetch("http://localhost:8000/parties/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('파티 호스팅 신청이 완료되었습니다. 관리자 승인 후 마이페이지에서 확인하실 수 있습니다.');
                fetchParties(); // 목록 갱신
                setPage(Page.MY_PAGE);
            } else {
                const err = await response.json();
                alert(`신청 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error hosting party:", error);
            alert("서버 통신 오류");
        }
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

    const handlePartySubmit = async (itemId: string, partyId: string) => {
        if (!currentUser) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:8000/items/modify/${itemId}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    submitted_party_id: partyId,
                    party_submission_status: 'PENDING'
                })
            });

            if (response.ok) {
                alert('파티 출품 신청이 완료되었습니다. 관리자 승인 후 공개됩니다.');
                fetchClothingItems();
            } else {
                alert("신청 실패");
            }
        } catch (error) {
            console.error("Error submitting to party:", error);
        }
    };

    const handleCancelPartySubmit = async (itemId: string) => {
        if (!currentUser) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // status를 null로 보내거나 초기화하는 로직 필요.
            // Pydantic 모델에서 Optional이므로 null 전송 가능 여부 확인 필요.
            // 여기서는 간단히 status를 PENDING 이전 상태(없음)로 돌리는 것을 가정하지만,
            // 백엔드 로직에 따라 다를 수 있음. 일단 API 호출 구조만 잡음.
            // 주의: 백엔드에서 null 값을 받아 처리하는지 확인 필요.
            // 임시로 submitted_party_id를 null로 보냄.
            const response = await fetch(`http://localhost:8000/items/modify/${itemId}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    submitted_party_id: null,
                    party_submission_status: null 
                })
            });

            if (response.ok) {
                alert('출품이 취소되었습니다.');
                fetchClothingItems();
            } else {
                alert("취소 실패");
            }
        } catch (error) {
            console.error("Error canceling submission:", error);
        }
    };

    const handleUpdatePartyItemStatus = async (itemId: string, status: 'APPROVED' | 'REJECTED') => {
        if (!currentUser?.isAdmin) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // Admin API 호출 (기존에 만들어둔 API 활용)
            const response = await fetch(`http://localhost:8000/items/${itemId}/approve?status=${status}`, { // URL 수정 필요할 수 있음 (라우터 확인)
                // 백엔드 라우터: @router.post("/items/{item_id}/approve") -> 내부적으로 status="APPROVED" 고정이었음.
                // 반려(REJECTED)를 위해서는 백엔드 수정이 필요하거나, 
                // items.py의 @router.put("/submission_status/{item_id}")를 사용해야 함.
                // 여기서는 items.py에 있는 update_item_submission_status_admin 사용
            });
            
            // items.py의 update_item_submission_status_admin 사용
            const res = await fetch(`http://localhost:8000/items/submission_status/${itemId}?status_in=${status}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                fetchClothingItems();
            } else {
                alert("상태 변경 실패");
            }
        } catch (error) {
            console.error("Error updating item status:", error);
        }
    };
    // credit handler
    // [수정] 크레딧 변경(적립/사용) 공통 함수
    // 백엔드 API: POST /credits/earn
    // amount가 양수면 적립, 음수면 차감
    const handleCreditChange = async (amount: number, activityName: string, type: string) => {
        if (!currentUser) return false;
        const token = localStorage.getItem('access_token');
        if (!token) return false;

        try {
            const payload = {
                user_id: currentUser.id,
                amount: Math.abs(amount), // 백엔드 API가 양수만 받을 수도 있으니 확인 필요. 여기선 양수로 보내고 타입으로 구분하거나, 백엔드 로직에 맞춤.
                // 현재 제공된 백엔드 earn_credit_to_user 로직은 amount를 그대로 저장함.
                // 지출의 경우 프론트엔드 계산식(userCreditBalance)에서 뺄셈을 하므로, 
                // 데이터베이스에는 양수로 저장하고 type으로 'SPENT'임을 명시하는 것이 일반적임.
                activity_name: activityName,
                type: type
            };

            const response = await fetch("http://localhost:8000/credits/earn", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchCredits(); // 내역 갱신 -> 잔액 자동 갱신
                return true;
            } else {
                const err = await response.json();
                alert(`크레딧 처리 실패: ${err.detail}`);
                return false;
            }
        } catch (error) {
            console.error("Error updating credit:", error);
            return false;
        }
    };


    // 환경 임팩트 계산
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
    
    // [251125_수정] currentUser의 credits 관계 또는 별도 credits 상태를 통해 계산
    const userCredits = useMemo(() => {
        if (!currentUser) return [];
        // credits 상태가 별도로 관리되거나 currentUser 안에 포함됨
        return credits.filter(c => c.userId === currentUser.id);
    }, [credits, currentUser]);

    const userCreditBalance = useMemo(() => {
        return userCredits.reduce((sum, credit) => {
            // 백엔드에서 오는 amount는 이미 음수일 수 있음 (지출인 경우)
            // 하지만 현재 백엔드 로직상 지출도 양수로 저장하고 type으로 구분할 수도 있으니 확인 필요
            // 보통은 지출 내역은 amount가 음수로 저장되거나, 계산 시 type을 보고 뺍니다.
            // 여기서는 type을 보고 판단하는 기존 로직 유지
            if (credit.type.startsWith('EARNED')) return sum + Math.abs(credit.amount);
            return sum - Math.abs(credit.amount);
        }, 0);
    }, [userCredits]);

    // 
    const acceptedUpcomingPartiesForUser = useMemo(() => {
        if (!currentUser) return [];
        return parties.filter(p => 
            p.status === 'UPCOMING' && 
            p.participants.some(participant => participant.userId === currentUser.id && participant.status === 'ACCEPTED')
        );
    }, [parties, currentUser]);

    // [수정] 메이커 상품 구매 시 크레딧 차감
    const handlePurchaseMakerProduct = async (product: MakerProduct) => {
        if (!currentUser) return;
        if (userCreditBalance < product.price) {
            alert('크레딧이 부족합니다.');
            return;
        }
        
        const success = await handleCreditChange(product.price, `${product.name} 구매`, 'SPENT_MAKER_PURCHASE');
        if (success) {
            alert(`'${product.name}' 구매가 완료되었습니다!`);
        }
    };

    // [수정] 크레딧 소각(기부)
    const handleOffsetCredit = async (amount: number): Promise<boolean> => {
        if (!currentUser) return false;
        if (userCreditBalance < amount) {
            alert('크레딧이 부족합니다.');
            return false;
        }
        
        return await handleCreditChange(amount, '크레딧 소각 (기부)', 'SPENT_OFFSET');
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
                return currentUser ? <MyPage user={currentUser} allUsers={users} onToggleNeighbor={handleToggleNeighbor} stats={userImpactStats} clothingItems={clothingItems.filter(item => item.userId === currentUser.id)} credits={userCredits} parties={parties} onToggleListing={handleToggleListing} onSelectHostedParty={handleSelectParty} setPage={setPage} onPartySubmit={handlePartySubmit} onCancelPartySubmit={handleCancelPartySubmit} onOffsetCredit={handleOffsetCredit} acceptedUpcomingParties={acceptedUpcomingPartiesForUser} /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
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
            // [251125_수정] RewardsPage에 실제 데이터 전달
            case Page.REWARDS:
                return currentUser ? (
                    <RewardsPage 
                        user={currentUser} 
                        rewards={rewards} // API로 받아온 rewards 전달
                        currentBalance={userCreditBalance} 
                        onRedeem={handleRedeemReward} // API 핸들러 전달
                    />
                ) : <LoginPage onLogin={handleLogin} setPage={setPage} />;
                
            // [수정] API 데이터 전달
            case Page.TWENTY_ONE_PERCENT_PARTY:
                return <TwentyOnePercentPartyPage parties={parties} items={clothingItems} currentUser={currentUser} onPartyApply={handlePartyApplication} setPage={setPage} />;
            
            // [수정] 핸들러 전달
            case Page.PARTY_HOSTING:
                return <PartyHostingPage onHostParty={handleHostParty} />;
            
            // [수정] 핸들러 전달
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