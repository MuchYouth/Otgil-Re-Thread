import React, { useState, useMemo, useEffect } from 'react';
import { Party, Page, User, ClothingItem } from '../types';
import ClothingCard from '../components/ClothingCard';
import GoodbyeTagModal from '../components/GoodbyeTagModal';
import HelloTagModal from '../components/HelloTagModal';
import HelloTagFormModal from '../components/HelloTagFormModal'; // [추가] HelloTag 입력 폼

interface TwentyOnePercentPartyPageProps {
  parties: Party[];
  items: ClothingItem[];
  currentUser: User | null;
  onPartyApply: (partyId: string) => void;
  setPage: (page: Page) => void;
  onExchangeComplete: () => void;
}

const TwentyOnePercentPartyPage: React.FC<TwentyOnePercentPartyPageProps> = ({ parties, items, currentUser, onPartyApply, setPage , onExchangeComplete }) => {
  const [view, setView] = useState<'parties' | 'lineup'>('parties');
  
  // 모달 상태 관리
  const [goodbyeTagModalItem, setGoodbyeTagModalItem] = useState<ClothingItem | null>(null);
  const [helloTagModalItem, setHelloTagModalItem] = useState<ClothingItem | null>(null);
  
  // [추가] 교환할 아이템 상태 관리 (이게 있으면 교환 모달이 뜹니다)
  const [exchangeItem, setExchangeItem] = useState<ClothingItem | null>(null);

  // 라인업 데이터 관리
  const [lineupItems, setLineupItems] = useState<ClothingItem[]>([]);
  const [isLoadingLineup, setIsLoadingLineup] = useState(false);

  const upcomingParties = parties.filter(p => p.status === 'UPCOMING');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  // 1. 라인업 데이터 가져오기 (API 호출)
  useEffect(() => {
    const fetchLineup = async () => {
        if (view === 'lineup' && selectedFilter) {
            setIsLoadingLineup(true);
            try {
                const response = await fetch(`http://localhost:8000/parties/${selectedFilter}/items`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // 백엔드 데이터(snake_case) -> 프론트엔드 타입(camelCase) 매핑
                    const formattedItems: ClothingItem[] = data.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        category: item.category,
                        size: item.size,
                        imageUrl: item.image_url,
                        // ▼▼▼ [확인] 이 부분이 정확히 연결되어야 합니다! ▼▼▼
                        userId: item.user_id,             // user_id -> userId
                        userNickname: item.user_nickname, // user_nickname -> userNickname
                        // ▲▲▲ --------------------------------------- ▲▲▲
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
                    }));

                    setLineupItems(formattedItems);
                } else {
                    console.error("라인업 불러오기 실패");
                    setLineupItems([]);
                }
            } catch (error) {
                console.error("에러 발생:", error);
            } finally {
                setIsLoadingLineup(false);
            }
        }
    };
    fetchLineup();
  }, [view, selectedFilter]);

  const handleShowTag = (item: ClothingItem, tagType: 'hello' | 'goodbye') => {
    if (tagType === 'hello') {
        setHelloTagModalItem(item);
    } else {
        setGoodbyeTagModalItem(item);
    }
  };
  
  const handleViewLineup = (partyId: string) => {
    setSelectedFilter(partyId);
    setView('lineup');
  };

  const handleConfirmExchange = async (tagData: any) => {
    if (!exchangeItem || !currentUser) return;
    
    // 교환 비용
    const EXCHANGE_COST = 1000; 

    if (!window.confirm(`'${exchangeItem.name}'을(를) 교환하시겠습니까?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('access_token');
        
        // ▼▼▼ [핵심 수정] 백엔드가 원하는 모양(스네이크 케이스)으로 변환 ▼▼▼
        const payload = {
            hello_tag: {
                // 왼쪽(백엔드용): 오른쪽(프론트엔드 데이터)
                received_from: tagData.receivedFrom || "알 수 없음", // <--- 여기가 핵심!      
                received_at: tagData.receivedAt,           
                first_impression: tagData.firstImpression, 
                hello_message: tagData.helloMessage        
            }
        };
        // ▲▲▲ --------------------------------------------------- ▲▲▲

        const response = await fetch(`http://localhost:8000/items/${exchangeItem.id}/exchange`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload) // 변환된 payload 전송
        });
        
        if (response.ok) {
            alert("교환이 완료되었습니다! 내 옷장에서 확인해보세요.");
            setExchangeItem(null); // 모달 닫기
            
            // 라인업 목록에서 해당 아이템 제거 (화면 갱신)
            setLineupItems(prev => prev.filter(i => i.id !== exchangeItem.id));

            onExchangeComplete()
        } else {
            const err = await response.json();
            // 에러 내용을 보기 쉽게 문자열로 변환하여 출력
            console.error("교환 에러 상세:", err); 
            alert(`교환 실패:\n${JSON.stringify(err.detail, null, 2)}`);
        }
    } catch (e) { 
        console.error(e);
        alert("통신 오류가 발생했습니다.");
    }
  };
  // --------------------------------------------------------------------------------
  // 3. 라인업 뷰 렌더링
  // --------------------------------------------------------------------------------
  if (view === 'lineup') {
    const selectedParty = parties.find(p => p.id === selectedFilter);
    
    // [수정] 이제 Types.ts에 isActive가 있으므로 안전하게 접근 가능
    const isPartyActive = selectedParty?.isActive; 

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <button 
          onClick={() => setView('parties')} 
          className="text-brand-primary hover:text-brand-primary-dark font-semibold mb-6 inline-flex items-center"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          파티 목록으로 돌아가기
        </button>
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">
            {selectedParty ? `"${selectedParty.title}" 라인업` : '파티 라인업'}
          </h2>
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="max-w-2xl mx-auto text-lg text-brand-text/70">
              {isPartyActive 
                  ? "지금 바로 마음에 드는 옷을 교환해보세요!" 
                  : "현재는 아이템 구경만 가능합니다. 파티가 시작되면 교환 버튼이 활성화됩니다."}
            </p>
            {/* 상태 배지 표시 */}
            {isPartyActive ? (
                <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    🟢 교환 진행 중
                </span>
            ) : (
                <span className="bg-stone-100 text-stone-600 text-sm font-bold px-3 py-1 rounded-full">
                    ⏳ 교환 대기 중
                </span>
            )}
          </div>
        </div>

        {isLoadingLineup ? (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p>라인업을 불러오는 중입니다...</p>
            </div>
        ) : lineupItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {lineupItems.map(item => (
                <div key={item.id} className="relative group">
                    {/* 기존 아이템 카드 */}
                    <ClothingCard item={item} onShowTag={handleShowTag} />
                    
                    {/* [4] 교환 버튼 오버레이 
                        조건: 파티 활성(isActive) + 내 옷 아님 + 로그인 됨 
                    */}
                    {isPartyActive && currentUser && item.userId !== currentUser.id && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl z-10 cursor-default">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // 카드 상세 클릭 방지
                                    setExchangeItem(item);
                                }}
                                className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-brand-primary-dark"
                            >
                                <i className="fa-solid fa-right-left mr-2"></i>
                                교환하기 (1,000 OL)
                            </button>
                        </div>
                    )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 rounded-lg">
              <i className="fa-solid fa-box-open text-6xl text-stone-300 mb-4"></i>
              <p className="text-brand-text/60">
                해당 파티에 승인된 출품작이 아직 없습니다.
              </p>
          </div>
        )}

        {/* 기존 조회용 모달들 */}
        {goodbyeTagModalItem && (
          <GoodbyeTagModal item={goodbyeTagModalItem} onClose={() => setGoodbyeTagModalItem(null)} />
        )}
        {helloTagModalItem && (
          <HelloTagModal item={helloTagModalItem} onClose={() => setHelloTagModalItem(null)} />
        )}

        {/* [5] 교환(Hello Tag 작성) 모달 렌더링 */}
        {exchangeItem && (
            <HelloTagFormModal 
                item={exchangeItem}
                onClose={() => setExchangeItem(null)}
                onSubmit={handleConfirmExchange}
            />
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // 4. 파티 목록 뷰 렌더링 (기존 코드 유지)
  // --------------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">21% PARTY</h2>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-brand-text/70">
          전 세계 담수오염의 21%는 패션산업의 폐수로부터 비롯됩니다. 우리는 이 문제를 잊지 않고, 함께 배우고 즐기며 긍정적인 변화를 만들어갑니다. 옷길의 오프라인 파티에 참여하여 지속가능한 패션을 향한 걸음에 동참해주세요.
        </p>
      </div>

      <div className="bg-brand-primary text-white rounded-xl shadow-lg p-8 md:p-12 mb-12 grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2">
            <h3 className="text-3xl font-bold">나만의 21% 파티를 열어보세요!</h3>
            <p className="mt-3 opacity-90">
                당신이 직접 호스트가 되어 지속가능한 패션의 즐거움을 주변에 알려주세요. 옷길이 파티 준비부터 임팩트 측정까지 모든 과정을 도와드립니다.
            </p>
        </div>
        <div className="text-center">
            <button 
                onClick={() => setPage(Page.PARTY_HOSTING)}
                className="bg-white text-brand-primary font-bold py-3 px-8 rounded-full hover:bg-stone-100 transition-colors text-lg shadow-md"
            >
                자세히 알아보기
            </button>
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-brand-text mb-8">참여 가능한 파티</h3>
        {upcomingParties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingParties.map(party => {
              const hasApplied = currentUser && party.participants.some(p => p.userId === currentUser.id);
              return (
                <div key={party.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={party.imageUrl}
                      alt={party.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-brand-text">{party.title}</h4>
                        {/* 파티 상태 배지 */}
                        {party.isActive && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">LIVE</span>}
                    </div>
                    
                    <div className="text-sm text-brand-text/70 mt-2 space-y-1">
                      <p><i className="fa-solid fa-calendar-days w-5 text-brand-primary"></i> {party.date}</p>
                      <p><i className="fa-solid fa-location-dot w-5 text-brand-primary"></i> {party.location}</p>
                    </div>
                    <p className="text-sm text-brand-text/80 mt-3 flex-grow">{party.description}</p>
                    <div className="mt-4 w-full flex flex-col space-y-2">
                        <button
                          onClick={() => onPartyApply(party.id)}
                          disabled={!!hasApplied}
                          className={`w-full font-bold py-2 px-4 rounded-full transition-colors duration-300 ${
                            hasApplied
                              ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                              : 'bg-brand-secondary text-white hover:bg-brand-secondary-dark'
                            }`}
                        >
                          {hasApplied ? '신청 완료' : '참가 신청하기'}
                        </button>
                        <button
                          onClick={() => handleViewLineup(party.id)}
                          className="w-full font-bold py-2 px-4 rounded-full transition-colors duration-300 bg-white text-brand-primary border border-brand-primary hover:bg-brand-primary/10"
                        >
                          <i className="fa-solid fa-vest-patches mr-2"></i>
                          라인업 보기
                        </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 rounded-lg">
            <i className="fa-solid fa-calendar-xmark text-5xl text-stone-300 mb-4"></i>
            <p className="text-brand-text/60">현재 예정된 파티가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwentyOnePercentPartyPage;