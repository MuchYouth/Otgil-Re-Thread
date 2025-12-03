import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Page, User, ClothingItem, ImpactStats, Story, Credit, Reward, PerformanceReport, Comment, Party, Maker, MakerProduct, PartyParticipantStatus } from './types';
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

const App: React.FC = () => {
    // --- 상태 관리 ---
    const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [reports, setReports] = useState<PerformanceReport[]>([]);
    const [credits, setCredits] = useState<Credit[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [makers, setMakers] = useState<Maker[]>([]);
    const [makerProducts, setMakerProducts] = useState<MakerProduct[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    
    const [page, setPage] = useState<Page>(Page.HOME);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
    const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
    const [selectedNeighborId, setSelectedNeighborId] = useState<string | null>(null);

    // --- API 데이터 로드 함수들 ---

    // [API] 내 정보 가져오기
    const fetchCurrentUser = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            const response = await fetch("http://localhost:8000/users/me", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                const userData = await response.json();
                const mappedUser: User = {
                    ...userData,
                    isAdmin: userData.is_admin,
                    phoneNumber: userData.phone_number
                };
                setCurrentUser(mappedUser);
                
                fetchCredits(); // 크레딧 내역 로드

                setUsers(prev => {
                    if (!prev.find(u => u.id === mappedUser.id)) {
                        return [...prev, mappedUser];
                    }
                    return prev;
                });
                return mappedUser;
            } else {
                console.error("Failed to fetch user (invalid token)");
                localStorage.removeItem('access_token');
                setCurrentUser(null);
                setCredits([]);
                return null;
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    }, []);

    // [API] 전체 유저 목록 가져오기
    const fetchAllUsers = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/users/");
            if (response.ok) {
                const data = await response.json();
                const realUsers: User[] = data.map((u: any) => ({
                    id: u.id,
                    nickname: u.nickname,
                    email: u.email,
                    phoneNumber: u.phone_number,
                    isAdmin: u.is_admin,
                    neighbors: u.neighbors || []
                }));
                setUsers(realUsers);
            }
        } catch (error) {
            console.error("Error fetching all users:", error);
        }
    }, []);

    // [API] 크레딧 내역 조회
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
                const formattedCredits: Credit[] = data.map((c: any) => ({
                    id: c.id,
                    userId: c.user_id,
                    date: new Date(c.date).toLocaleDateString(),
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

    // [API] 리워드 목록 조회
    const fetchRewards = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/rewards/");
            if (response.ok) {
                const data = await response.json();
                const formattedRewards: Reward[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    cost: item.cost,
                    imageUrl: item.image_url,
                    type: item.type
                }));
                setRewards(formattedRewards);
            }
        } catch (error) {
            console.error("Error fetching rewards:", error);
        }
    }, []);

    // [API] 메이커 목록 조회
    const fetchMakers = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/makers/");
            if (response.ok) {
                const data = await response.json();
                const formattedMakers: Maker[] = data.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    specialty: m.specialty,
                    location: m.location,
                    bio: m.bio,
                    // 이미지 경로 수정 (백엔드 URL 포함)
                    imageUrl: `http://localhost:8000${m.image_url}`
                }));
                setMakers(formattedMakers);
            }
        } catch (error) {
            console.error("Error fetching makers:", error);
        }
    }, []);

    // [API] 파티 목록 조회
    const fetchParties = useCallback(async () => {
        try {
            const [upcomingRes, completedRes, pendingRes] = await Promise.all([
                fetch("http://localhost:8000/parties/?status_filter=UPCOMING"),
                fetch("http://localhost:8000/parties/?status_filter=COMPLETED"),
                fetch("http://localhost:8000/parties/?status_filter=PENDING_APPROVAL")
            ]);

            let allParties: any[] = [];
            if (upcomingRes.ok) allParties = [...allParties, ...await upcomingRes.json()];
            if (completedRes.ok) allParties = [...allParties, ...await completedRes.json()];
            if (pendingRes.ok) allParties = [...allParties, ...await pendingRes.json()];

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
                } : undefined,
                isActive: p.is_active
            }));

            const uniqueParties = Array.from(new Map(formattedParties.map(item => [item.id, item])).values());
            uniqueParties.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setParties(uniqueParties);

        } catch (error) {
            console.error("Error fetching parties:", error);
        }
    }, []);

    // [API] 커뮤니티 스토리 조회
    const fetchStories = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/community/stories");
            if (response.ok) {
                const data = await response.json();
                const formattedStories: Story[] = data.map((s: any) => ({
                    id: s.id,
                    userId: s.user_id,
                    partyId: s.party_id,
                    title: s.title,
                    author: s.author,
                    excerpt: s.excerpt,
                    content: s.content,
                    imageUrl: s.image_url,
                    tags: s.tags.map((t: any) => t.name),
                    likes: s.likes,
                    likedBy: s.liked_by
                }));
                setStories(formattedStories);
            }
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    }, []);

    // [API] 리포트 조회
    const fetchReports = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/community/reports");
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    }, []);

    // [API] 스토리 상세 조회
    const fetchStoryDetail = useCallback(async (storyId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/community/stories/${storyId}`);
            if (response.ok) {
                const data = await response.json();
                const fetchedComments: Comment[] = data.comments.map((c: any) => ({
                    id: c.id,
                    storyId: c.story_id,
                    userId: c.user_id,
                    authorNickname: c.author_nickname,
                    text: c.text,
                    timestamp: c.timestamp
                }));
                
                setComments(prev => {
                    const otherComments = prev.filter(c => c.storyId !== storyId);
                    return [...otherComments, ...fetchedComments];
                });
            }
        } catch (error) {
            console.error("Error fetching story detail:", error);
        }
    }, []);

    // [API] 의류 아이템 조회
    const fetchClothingItems = useCallback(async () => {
        try {
            // 1. 전체 공개 아이템 (limit=100)
            const publicRes = await fetch("http://localhost:8000/items/?limit=100");
            let allItems: any[] = [];
            if (publicRes.ok) {
                allItems = await publicRes.json();
            } else {
                console.error("Failed to fetch public items");
            }
            
            // 2. 내 아이템
            const token = localStorage.getItem('access_token');
            let myItems: any[] = [];
            
            if (token) {
                const myRes = await fetch("http://localhost:8000/items/my-items", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (myRes.ok) {
                    myItems = await myRes.json();
                } else if (myRes.status === 401) {
                    console.warn("Unauthorized access to my-items. Clearing token.");
                    localStorage.removeItem('access_token');
                    setCurrentUser(null);
                }
            }
            
            const combinedItemsMap = new Map();
            allItems.forEach(item => combinedItemsMap.set(item.id, item));
            myItems.forEach(item => combinedItemsMap.set(item.id, item));

            const uniqueItems = Array.from(combinedItemsMap.values());

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

    // 초기 데이터 로드
    useEffect(() => {
        fetchCurrentUser();
        fetchRewards();
        fetchParties();
        fetchStories();
        fetchReports();
        fetchClothingItems();
        fetchAllUsers();
        fetchMakers();
    }, [fetchCurrentUser, fetchRewards, fetchParties, fetchStories, fetchReports, fetchClothingItems, fetchAllUsers, fetchMakers]);

    // --- 핸들러 함수들 ---

    const handleLogin = async (email: string) => {
        const loggedInUser = await fetchCurrentUser();
        if (loggedInUser && loggedInUser.isAdmin) {
             setPage(Page.ADMIN);
        } else {
             setPage(Page.MY_PAGE);
        }
        return true;
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setCurrentUser(null);
        setPage(Page.HOME);
        alert("로그아웃 되었습니다.");
    };

    const handleSignUp = (nickname: string, email: string, phoneNumber: string, userType: 'USER' | 'ADMIN', adminCode: string) => {
        return { success: true, message: 'Sign up handled internally' };
    };

    const handleToggleNeighbor = async (neighborId: string) => {
        if (!currentUser) return;
        const currentNeighbors = currentUser.neighbors || [];
        const isNeighbor = currentNeighbors.some((n: any) => {
            return typeof n === 'string' ? n === neighborId : n.id === neighborId;
        });

        const token = localStorage.getItem('access_token');
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const url = `http://localhost:8000/users/${neighborId}/neighbors`;
            const method = isNeighbor ? "DELETE" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchCurrentUser();
            } else {
                alert("서버 요청 실패! 로그를 확인하세요.");
            }
        } catch (error) {
            console.error(error);
            alert("에러가 발생했습니다.");
        }
    };

    const handleCreditChange = async (amount: number, activityName: string, type: string) => {
        if (!currentUser) return false;
        const token = localStorage.getItem('access_token');
        if (!token) return false;

        try {
            const payload = {
                user_id: currentUser.id,
                amount: Math.abs(amount),
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
                fetchCredits();
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

    // [API] 리워드 등록 (파일 업로드 지원)
    const handleRegisterReward = async (rewardData: any) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const formData = new FormData();
        formData.append('name', rewardData.name);
        formData.append('description', rewardData.description);
        formData.append('cost', rewardData.cost.toString());
        formData.append('type', rewardData.type);
        if (rewardData.imageFile) {
            formData.append('image', rewardData.imageFile);
        }

        try {
            const response = await fetch("http://localhost:8000/rewards/", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert('새로운 바우처가 등록되었습니다.');
                fetchRewards();
            } else {
                const err = await response.json();
                alert(`등록 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error registering reward:", error);
        }
    };

    // [API] 아이템 등록 (태그 포함)
    const handleItemAdd = async (itemInfo: any, options: any) => {
        if (!currentUser) {
            alert("Login is required.");
            setPage(Page.LOGIN);
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
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
            
            if (!createRes.ok) {
                const err = await createRes.json();
                throw new Error(err.detail || "아이템 등록 실패");
            }
            
            const createdItem = await createRes.json();
            const itemId = createdItem.id;

            const tagHeaders = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            if (options.goodbyeTag) {
                const goodbyePayload = {
                    clothing_item_id: itemId,
                    met_when: options.goodbyeTag.metWhen,
                    met_where: options.goodbyeTag.metWhere,
                    why_got: options.goodbyeTag.whyGot,
                    worn_count: Number(options.goodbyeTag.wornCount),
                    why_let_go: options.goodbyeTag.whyLetGo,
                    final_message: options.goodbyeTag.finalMessage,
                };

                if (options.selectedPartyId) {
                     await fetch(`http://localhost:8000/items/modify/${itemId}`, {
                        method: "PATCH",
                        headers: tagHeaders,
                        body: JSON.stringify({ 
                            submitted_party_id: options.selectedPartyId,
                            party_submission_status: 'PENDING'
                        })
                    });
                }

                await fetch(`http://localhost:8000/tags/goodbye`, {
                    method: "POST",
                    headers: tagHeaders,
                    body: JSON.stringify(goodbyePayload)
                });
            }

            if (options.helloTag) {
                const helloPayload = {
                    clothing_item_id: itemId,
                    received_from: options.helloTag.receivedFrom,
                    received_at: options.helloTag.receivedAt,
                    first_impression: options.helloTag.firstImpression,
                    hello_message: options.helloTag.helloMessage
                };

                await fetch(`http://localhost:8000/tags/hello`, {
                    method: "POST",
                    headers: tagHeaders,
                    body: JSON.stringify(helloPayload)
                });
            }

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

    const handlePartyApplication = async (partyId: string) => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            setPage(Page.LOGIN);
            return;
        }

        if (!window.confirm("참가를 신청하시겠습니까?")) {
            return;
        }

        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`http://localhost:8000/parties/${partyId}/join`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert("파티 참가 신청이 완료되었습니다!");
                await fetchParties();
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
        fetchStoryDetail(id);
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
            if (storyData.id) {
                response = await fetch(`http://localhost:8000/community/stories/${storyData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch("http://localhost:8000/community/stories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                alert(`스토리가 성공적으로 ${storyData.id ? '수정' : '작성'}되었습니다.`);
                fetchStories();
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
                fetchStoryDetail(storyId);
            } else {
                alert('댓글 작성 실패');
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleAddParty = async (partyData: Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status' | 'kitDetails'>) => {
        if (!currentUser) return;
        const token = localStorage.getItem('access_token');
        
        try {
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
                alert('파티가 성공적으로 등록되었습니다.');
                fetchParties();
            } else {
                const err = await response.json();
                alert(`등록 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error adding party:", error);
            alert("서버 통신 오류가 발생했습니다.");
        }
    };

    const handleUpdateParty = (updatedParty: Party) => {
        setParties(prev => prev.map(party => party.id === updatedParty.id ? updatedParty : party));
        alert('파티가 성공적으로 수정되었습니다.');
    };

    const handleDeleteParty = (partyId: string) => {
        setParties(prev => prev.filter(party => party.id !== partyId));
        alert('파티가 삭제되었습니다.');
    };

    const handleUpdateParticipantStatus = async (partyId: string, userId: string, newStatus: PartyParticipantStatus) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            let response: Response | null = null;

            if (newStatus === 'ATTENDED') {
                response = await fetch(`http://localhost:8000/parties/${partyId}/check-in?user_id=${userId}`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                response = await fetch(`http://localhost:8000/admin/parties/${partyId}/participants/${userId}/status`, {
                    method: "PATCH",
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status: newStatus })
                });
            }

            if (!response) throw new Error("서버 응답이 없습니다.");

            if (response.ok) {
                setParties(prevParties => {
                    return prevParties.map(party => {
                        if (party.id === partyId) {
                            return {
                                ...party,
                                participants: (party.participants || []).map(p => 
                                    p.userId === userId ? { ...p, status: newStatus } : p
                                ),
                            };
                        }
                        return party;
                    });
                });
                alert("상태가 성공적으로 변경되었습니다.");
            } else {
                const err = await response.json();
                alert(`처리 실패: ${err.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("Error updating participant status:", error);
            alert(`오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
        }
    };

    const handleHostParty = async (partyData: Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status' | 'kitDetails'>) => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            setPage(Page.LOGIN);
            return;
        }
        const token = localStorage.getItem('access_token');
        
        try {
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
                fetchParties();
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

    const handleUpdatePartyApprovalStatus = async (partyId: string, newStatus: 'UPCOMING' | 'REJECTED') => {
        if (!currentUser?.isAdmin) {
            alert("관리자 권한이 필요합니다.");
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:8000/admin/parties/${partyId}/status`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setParties(prevParties => {
                    return prevParties.map(party => {
                        if (party.id === partyId) {
                            return { ...party, status: newStatus };
                        }
                        return party;
                    });
                });
                alert(`파티 상태가 '${newStatus === 'UPCOMING' ? '승인됨' : '거절됨'}'으로 변경되었습니다.`);
            } else {
                const err = await response.json();
                alert(`상태 변경 실패: ${err.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("Error updating party status:", error);
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    const handleUpdatePartyImpact = (partyId: string, finalParticipants: number, finalItemsExchanged: number) => {
        const avgWaterSaved = 2700;
        const avgCo2Reduced = 5.5;
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

    // [API] 메이커 등록 (파일 업로드 지원)
    const handleRegisterMaker = async (makerData: any) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const formData = new FormData();
        formData.append('name', makerData.name);
        formData.append('specialty', makerData.specialty);
        formData.append('location', makerData.location);
        formData.append('bio', makerData.bio);
        if (makerData.imageFile) {
            formData.append('image', makerData.imageFile);
        }

        try {
            const response = await fetch("http://localhost:8000/makers/", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert('새로운 메이커가 등록되었습니다.');
                fetchMakers();
            } else {
                const err = await response.json();
                alert(`등록 실패: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error registering maker:", error);
        }
    };

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

    const handleOffsetCredit = async (amount: number): Promise<boolean> => {
        if (!currentUser) return false;
        if (userCreditBalance < amount) {
            alert('크레딧이 부족합니다.');
            return false;
        }
        
        return await handleCreditChange(amount, '크레딧 소각 (기부)', 'SPENT_OFFSET');
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!currentUser) return;
        if (!window.confirm("정말로 이 옷을 삭제하시겠습니까? 복구할 수 없습니다.")) {
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:8000/items/delete/${itemId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert("옷이 삭제되었습니다.");
                fetchClothingItems();
            } else {
                const err = await response.json();
                alert(`삭제 실패: ${err.detail || '권한이 없거나 오류가 발생했습니다.'}`);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("서버 통신 오류가 발생했습니다.");
        }
    };

    // 파생 상태
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

    const userCredits = useMemo(() => {
        if (!currentUser) return [];
        return credits.filter(c => c.userId === currentUser.id);
    }, [credits, currentUser]);

    const userCreditBalance = useMemo(() => {
        return userCredits.reduce((sum, credit) => {
            if (credit.type.startsWith('EARNED')) return sum + Math.abs(credit.amount);
            return sum - Math.abs(credit.amount);
        }, 0);
    }, [userCredits]);

    const acceptedUpcomingPartiesForUser = useMemo(() => {
        if (!currentUser) return [];
        return parties.filter(p => 
            p.status === 'UPCOMING' && 
            p.participants.some(participant => participant.userId === currentUser.id && participant.status === 'ACCEPTED')
        );
    }, [parties, currentUser]);

    // 렌더링 로직
    const renderPage = () => {
        switch (page) {
            case Page.HOME: return <HomePage setPage={setPage} />;
            case Page.BROWSE: return <BrowsePage items={clothingItems} parties={parties} />;
            case Page.NEIGHBORS_CLOSET: return currentUser ? <NeighborsClosetPage currentUser={currentUser} allUsers={users} clothingItems={clothingItems} parties={parties} setPage={setPage} onSelectNeighbor={handleSelectNeighbor} /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.NEIGHBOR_PROFILE:
                const neighbor = users.find(u => u.id === selectedNeighborId);
                const neighborItems = clothingItems.filter(item => item.userId === selectedNeighborId && item.isListedForExchange);
                return currentUser && neighbor ? <NeighborProfilePage
                    neighbor={neighbor}
                    items={neighborItems}
                    currentUser={currentUser}
                    onToggleNeighbor={handleToggleNeighbor}
                    setPage={setPage}
                /> : <NeighborsClosetPage currentUser={currentUser!} allUsers={users} clothingItems={clothingItems} parties={parties} setPage={setPage} onSelectNeighbor={handleSelectNeighbor} />;
            case Page.UPLOAD: return <UploadPage onItemAdd={handleItemAdd} acceptedParties={acceptedUpcomingPartiesForUser} />;
            case Page.LOGIN: return <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.SIGNUP: return <SignUpPage onSignUp={handleSignUp} setPage={setPage} />;
            case Page.MY_PAGE:
                return currentUser ? <MyPage user={currentUser} allUsers={users} onToggleNeighbor={handleToggleNeighbor} stats={userImpactStats} clothingItems={clothingItems.filter(item => item.userId === currentUser.id)} credits={userCredits} parties={parties} onToggleListing={handleToggleListing} onSelectHostedParty={handleSelectParty} setPage={setPage} onPartySubmit={handlePartySubmit} onCancelPartySubmit={handleCancelPartySubmit} onDeleteItem={handleDeleteItem} onOffsetCredit={handleOffsetCredit} acceptedUpcomingParties={acceptedUpcomingPartiesForUser} /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
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
                return currentUser ? <RewardsPage 
                    user={currentUser} 
                    rewards={rewards} 
                    currentBalance={userCreditBalance} 
                    onRedeem={handleRedeemReward} 
                    onRegisterReward={handleRegisterReward}
                /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
            case Page.TWENTY_ONE_PERCENT_PARTY:
                return <TwentyOnePercentPartyPage parties={parties} items={clothingItems} currentUser={currentUser} onPartyApply={handlePartyApplication} onExchangeComplete={fetchClothingItems} setPage={setPage} />;
            case Page.PARTY_HOSTING:
                return <PartyHostingPage onHostParty={handleHostParty} />;
            case Page.PARTY_HOST_DASHBOARD:
                const party = parties.find(p => p.id === selectedPartyId);
                return party ? <PartyHostDashboardPage party={party} setPage={setPage} makers={makers} onUpdateImpact={handleUpdatePartyImpact} onUpdateParticipantStatus={handleUpdateParticipantStatus} /> : <MyPage user={currentUser!} stats={userImpactStats} clothingItems={[]} credits={[]} parties={parties} allUsers={users} onToggleNeighbor={handleToggleNeighbor} onToggleListing={handleToggleListing} setPage={setPage} onSelectHostedParty={handleSelectParty} onPartySubmit={handlePartySubmit} onCancelPartySubmit={handleCancelPartySubmit} onOffsetCredit={handleOffsetCredit} acceptedUpcomingParties={acceptedUpcomingPartiesForUser} onDeleteItem={handleDeleteItem} />;
            case Page.MAKERS_HUB:
                return currentUser ? <MakersHubPage 
                    makers={makers} 
                    products={makerProducts} 
                    userCreditBalance={userCreditBalance} 
                    onPurchase={handlePurchaseMakerProduct} 
                    currentUser={currentUser} 
                    onRegisterMaker={handleRegisterMaker} 
                /> : <LoginPage onLogin={handleLogin} setPage={setPage} />;
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