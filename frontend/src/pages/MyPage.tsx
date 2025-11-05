import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { User, ImpactStats, ClothingItem, Credit, CreditType, Party, Page, PartyParticipantStatus } from '../types';
import ImpactDashboard from '../components/ImpactDashboard';
import EnvironmentalReceipt from '../components/EnvironmentalReceipt';
import QRCodeModal from '../components/QRCodeModal';
import DonationCertificate from '../components/OffsetCertificate';

type MyPageSection = 'DASHBOARD' | 'CLOSET' | 'CREDITS' | 'APPLICATIONS' | 'ACTIVITIES' | 'HOSTING' | 'NEIGHBORS';

interface MyPageProps {
  user: User;
  allUsers: User[];
  onSetNeighbors: (userId: string, neighborIds: string[]) => void;
  stats: ImpactStats;
  clothingItems: ClothingItem[];
  credits: Credit[];
  parties: Party[];
  onToggleListing: (itemId: string) => void;
  setPage: (page: Page) => void;
  onSelectHostedParty: (partyId: string) => void;
  onPartySubmit: (itemId: string, partyId: string) => void;
  onCancelPartySubmit: (itemId: string) => void;
  onOffsetCredit: (amount: number) => boolean;
  acceptedUpcomingParties: Party[];
}

const SectionButton: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
      isActive
        ? 'bg-brand-primary text-white shadow-md'
        : 'text-brand-text/70 hover:bg-stone-100'
    }`}
  >
    <i className={`fa-solid ${icon} w-6 text-center text-lg`}></i>
    <span className="font-medium">{label}</span>
  </button>
);

const CreditRow: React.FC<{ credit: Credit }> = ({ credit }) => {
    const typeInfo: Record<CreditType, { text: string; color: string; icon: string }> = {
        EARNED_CLOTHING: { text: '의류 등록', color: 'text-green-600', icon: 'fa-plus' },
        EARNED_EVENT: { text: '이벤트 참여', color: 'text-blue-600', icon: 'fa-plus' },
        SPENT_REWARD: { text: '리워드 사용', color: 'text-red-600', icon: 'fa-minus' },
        SPENT_OFFSET: { text: '크레딧 소각', color: 'text-purple-600', icon: 'fa-fire' },
        SPENT_MAKER_PURCHASE: { text: '메이커 상품 구매', color: 'text-orange-600', icon: 'fa-shopping-cart' },
    };
    
    const info = typeInfo[credit.type];

    return (
        <tr className="border-b border-stone-200 hover:bg-stone-50">
            <td className="py-3 px-4 text-sm text-brand-text/60">{credit.date}</td>
            <td className="py-3 px-4 text-brand-text">{credit.activityName}</td>
            <td className="py-3 px-4 text-sm text-brand-text/80">{info.text}</td>
            <td className={`py-3 px-4 font-bold ${info.color}`}>
                <i className={`fa-solid ${info.icon} mr-1`}></i>
                {credit.amount.toLocaleString()}
            </td>
        </tr>
    );
};

const MyPage: React.FC<MyPageProps> = ({ user, allUsers, onSetNeighbors, stats, clothingItems, credits, parties, onToggleListing, setPage, onSelectHostedParty, onPartySubmit, onCancelPartySubmit, onOffsetCredit, acceptedUpcomingParties }) => {
  const [activeSection, setActiveSection] = useState<MyPageSection>('CLOSET');
  const [qrModalParty, setQrModalParty] = useState<Party | null>(null);
  const [neighborSearchTerm, setNeighborSearchTerm] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [certificateData, setCertificateData] = useState<{ amount: number } | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);


  const totalCredits = credits.reduce((sum, credit) => {
    return credit.type.startsWith('EARNED') ? sum + credit.amount : sum - credit.amount;
  }, 0);
  
  const userAppliedParties = parties.filter(p => p.participants.some(participant => participant.userId === user.id && p.hostId !== user.id));
  const hostedParties = parties.filter(p => p.hostId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusInfo: Record<PartyParticipantStatus, { text: string; color: string; }> = {
      PENDING: { text: '승인 대기중', color: 'bg-yellow-100 text-yellow-800' },
      ACCEPTED: { text: '참가 승인', color: 'bg-green-100 text-green-800' },
      REJECTED: { text: '참가 거절', color: 'bg-red-100 text-red-800' },
      ATTENDED: { text: '참가 완료', color: 'bg-stone-200 text-stone-700' },
  };

  const handleAddNeighbor = (neighborId: string) => {
    const currentNeighbors = user.neighbors || [];
    if (!currentNeighbors.includes(neighborId)) {
        onSetNeighbors(user.id, [...currentNeighbors, neighborId]);
    }
  };

  const handleRemoveNeighbor = (neighborId: string) => {
      const currentNeighbors = user.neighbors || [];
      onSetNeighbors(user.id, currentNeighbors.filter(id => id !== neighborId));
  };
  
  const searchResults = neighborSearchTerm
    ? allUsers.filter(u => 
        u.id !== user.id &&
        !(user.neighbors || []).includes(u.id) &&
        u.nickname.toLowerCase().includes(neighborSearchTerm.toLowerCase())
      )
    : [];

  const currentNeighbors = allUsers.filter(u => (user.neighbors || []).includes(u.id));
  
  const handleBurnCredits = () => {
    const amountToBurn = parseInt(burnAmount, 10);
    if (isNaN(amountToBurn) || amountToBurn <= 0) {
        alert('올바른 금액을 입력해주세요.');
        return;
    }
    if (amountToBurn > totalCredits) {
        alert('보유한 크레딧이 부족합니다.');
        return;
    }
    if (window.confirm(`${amountToBurn.toLocaleString()} OL을 소각하여 기부하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        const success = onOffsetCredit(amountToBurn);
        if (success) {
            setCertificateData({ amount: amountToBurn });
            setBurnAmount('');
        } else {
            alert('크레딧 소각에 실패했습니다. 다시 시도해주세요.');
        }
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    try {
        const canvas = await html2canvas(certificateRef.current, {
            backgroundColor: '#ffffff',
            useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `otgil-donation-certificate-${user.nickname}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Error downloading certificate:', error);
        alert('인증서 다운로드에 실패했습니다.');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'DASHBOARD':
        return <ImpactDashboard user={user} stats={stats} />;
      case 'CLOSET':
        const submissionStatusInfo: Record<string, { text: string; color: string; }> = {
            PENDING: { text: '파티 승인 대기중', color: 'bg-yellow-100 text-yellow-800' },
            APPROVED: { text: '파티 승인 완료', color: 'bg-green-100 text-green-800' },
            REJECTED: { text: '파티 반려됨', color: 'bg-red-100 text-red-800' },
        };
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-brand-text">나의 옷장 ({clothingItems.length})</h3>
                <button 
                    onClick={() => setPage(Page.UPLOAD)}
                    className="bg-brand-primary text-white font-bold py-2 px-5 rounded-full hover:bg-brand-primary-dark transition-colors shadow-sm"
                >
                    <i className="fa-solid fa-plus mr-2"></i>옷 추가하기
                </button>
            </div>
            {clothingItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {clothingItems.map(item => (
                        <div key={item.id} className="border rounded-lg p-3 flex flex-col bg-white">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-md mb-2" />
                            <div className="flex-grow">
                                <p className="font-semibold truncate text-brand-text">{item.name}</p>
                                <p className="text-sm text-brand-text/60">{item.category} / {item.size}</p>
                            </div>
                            
                            <div className="mt-3 w-full flex flex-col space-y-2">
                                {item.helloTag ? (
                                    <>
                                        <div className="text-center text-xs font-bold text-blue-600 bg-blue-100 py-1 rounded-full">HELLO 태그 아이템</div>
                                        <button
                                            onClick={() => onToggleListing(item.id)}
                                            className={`w-full font-bold py-2 px-4 rounded-full transition-colors ${
                                                item.isListedForExchange
                                                    ? 'bg-stone-500 text-white hover:bg-stone-600'
                                                    : 'bg-brand-secondary text-white hover:bg-brand-secondary-dark'
                                            }`}
                                        >
                                            {item.isListedForExchange ? '프로필에서 숨기기' : '프로필에 표시하기'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center text-xs font-bold text-purple-600 bg-purple-100 py-1 rounded-full">GOODBYE 태그 아이템</div>
                                        {item.partySubmissionStatus ? (
                                            <>
                                                <p className={`text-center text-sm font-semibold p-2 rounded-md ${submissionStatusInfo[item.partySubmissionStatus].color}`}>
                                                    {submissionStatusInfo[item.partySubmissionStatus].text}
                                                </p>
                                                {(item.partySubmissionStatus === 'PENDING' || item.partySubmissionStatus === 'REJECTED') && (
                                                    <button
                                                        onClick={() => onCancelPartySubmit(item.id)}
                                                        className="w-full font-bold py-2 px-4 rounded-full transition-colors bg-gray-500 text-white hover:bg-gray-600"
                                                    >
                                                        파티 출품 취소
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            acceptedUpcomingParties.length > 0 ? (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`'${acceptedUpcomingParties[0].title}' 파티에 이 옷을 출품하시겠습니까?`)) {
                                                            onPartySubmit(item.id, acceptedUpcomingParties[0].id)
                                                        }
                                                    }}
                                                    className="w-full font-bold py-2 px-4 rounded-full transition-colors bg-brand-primary text-white hover:bg-brand-primary-dark"
                                                >
                                                    <i className="fa-solid fa-glass-cheers mr-2"></i>
                                                    21% 파티에 내놓기
                                                </button>
                                            ) : (
                                                <p className="text-center text-xs text-stone-500 p-2 bg-stone-100 rounded-md">참가 승인된 파티가 없어 출품할 수 없습니다.</p>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-brand-text/70 mb-4">아직 옷장에 옷이 없어요.</p>
                    <p className="text-brand-text/70">새 옷을 추가하고 교환을 시작해보세요!</p>
                </div>
            )}
          </div>
        );
      case 'CREDITS':
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                <h3 className="text-xl font-semibold mb-1 text-brand-text">크레딧</h3>
                <p className="text-brand-text/70 mb-6">현재 잔액: <span className="font-bold text-brand-primary">{totalCredits.toLocaleString()} OL</span></p>

                <div className="mb-8 pb-8 border-b border-stone-200">
                    <h4 className="text-lg font-semibold text-brand-text">크레딧 소각 및 기부</h4>
                    <p className="text-brand-text/70 mt-2 mb-4 text-sm">
                        사용하지 않는 크레딧을 소각하여 지속가능한 패션 생태계를 위한 기금에 기여할 수 있습니다. 소각된 크레딧은 투명하게 관리되며, 기부 증서를 발급받을 수 있습니다.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-stone-50 p-4 rounded-lg">
                        <input
                            type="number"
                            value={burnAmount}
                            onChange={(e) => setBurnAmount(e.target.value)}
                            placeholder="소각할 OL 금액"
                            className="w-full sm:w-48 px-4 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                            min="1"
                            step="1"
                        />
                        <button
                            onClick={handleBurnCredits}
                            className="bg-brand-text text-white font-bold py-2 px-6 rounded-full hover:bg-black transition-colors"
                        >
                            <i className="fa-solid fa-fire mr-2"></i>
                            소각하여 기부하기
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold mb-4 text-brand-text">크레딧 사용 내역</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-100">
                                <tr>
                                    <th className="text-left py-2 px-4 text-sm font-semibold text-brand-text/80">날짜</th>
                                    <th className="text-left py-2 px-4 text-sm font-semibold text-brand-text/80">활동</th>
                                    <th className="text-left py-2 px-4 text-sm font-semibold text-brand-text/80">종류</th>
                                    <th className="text-left py-2 px-4 text-sm font-semibold text-brand-text/80">금액</th>
                                </tr>
                            </thead>
                            <tbody>
                                {credits.map(credit => <CreditRow key={credit.id} credit={credit} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
      case 'APPLICATIONS':
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                <h3 className="text-xl font-semibold mb-4 text-brand-text">파티 신청 내역 ({userAppliedParties.length})</h3>
                {userAppliedParties.length > 0 ? (
                    <div className="space-y-4">
                        {userAppliedParties.map(party => {
                             const myStatus = party.participants.find(p => p.userId === user.id)?.status;
                             if (!myStatus) return null;
                             const status = statusInfo[myStatus];

                             return (
                                <div key={party.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div>
                                        <p className="font-bold text-brand-text">{party.title}</p>
                                        <p className="text-sm text-brand-text/60">{party.date} &middot; {party.location}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                        {myStatus === 'ACCEPTED' && (
                                            <button 
                                                onClick={() => setQrModalParty(party)}
                                                className="bg-brand-secondary text-white font-bold py-1 px-3 rounded-full hover:bg-brand-secondary-dark text-sm"
                                            >
                                                <i className="fa-solid fa-qrcode mr-1"></i> QR 보기
                                            </button>
                                        )}
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <p className="text-brand-text/70">아직 신청한 파티가 없어요.</p>
                )}
            </div>
        );
      case 'ACTIVITIES':
         const attendedParties = userAppliedParties.filter(p => p.participants.find(participant => participant.userId === user.id)?.status === 'ATTENDED');
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                <h3 className="text-xl font-semibold mb-4 text-brand-text">활동 내역</h3>
                {attendedParties.length > 0 ? (
                    <div className="space-y-6">
                        {attendedParties.map(party => party.impact && (
                            <div key={party.id} className="border rounded-lg p-4">
                                <p className="font-bold text-brand-text">{party.title}</p>
                                <p className="text-sm text-brand-text/60 mb-4">{party.date}</p>
                                 <EnvironmentalReceipt isEvent={true} eventTitle={party.title} stats={party.impact} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                         <i className="fa-solid fa-ticket text-5xl text-stone-300 mb-4"></i>
                         <p className="text-brand-text/70">아직 완료된 활동이 없어요.</p>
                    </div>
                )}
            </div>
        );
    case 'HOSTING':
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                <h3 className="text-xl font-semibold mb-4 text-brand-text">나의 파티 호스팅 ({hostedParties.length})</h3>
                 {hostedParties.length > 0 ? (
                    <div className="space-y-4">
                        {hostedParties.map(party => (
                            <div key={party.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <p className="font-bold text-brand-text">{party.title}</p>
                                    <p className="text-sm text-brand-text/60">{party.date} &middot; {party.location}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        party.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' : 
                                        party.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                                        party.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-stone-200 text-stone-700'
                                    }`}>
                                        {
                                            party.status === 'UPCOMING' ? '진행 예정' :
                                            party.status === 'PENDING_APPROVAL' ? '승인 대기중' :
                                            party.status === 'REJECTED' ? '거절됨' :
                                            '종료됨'
                                        }
                                    </span>
                                    <button 
                                        onClick={() => onSelectHostedParty(party.id)}
                                        disabled={party.status !== 'UPCOMING' && party.status !== 'COMPLETED'}
                                        className="bg-brand-primary text-white font-bold py-1 px-3 rounded-full hover:bg-brand-primary-dark text-sm disabled:bg-stone-300 disabled:cursor-not-allowed"
                                    >
                                        대시보드로 이동
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-brand-text/70">아직 주최한 파티가 없어요.</p>
                )}
            </div>
        );
    case 'NEIGHBORS':
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in space-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-brand-text mb-4">이웃 관리</h3>
                    <div className="relative">
                         <input
                            type="text"
                            value={neighborSearchTerm}
                            onChange={(e) => setNeighborSearchTerm(e.target.value)}
                            placeholder="닉네임으로 이웃 찾기"
                            className="w-full px-4 py-2 rounded-md border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        />
                        <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"></i>
                    </div>
                </div>

                {neighborSearchTerm && (
                    <div>
                        <h4 className="font-semibold text-brand-text mb-2">검색 결과</h4>
                        {searchResults.length > 0 ? (
                            <ul className="space-y-2">
                                {searchResults.map(foundUser => (
                                    <li key={foundUser.id} className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
                                        <span className="font-medium">{foundUser.nickname}</span>
                                        <button onClick={() => handleAddNeighbor(foundUser.id)} className="text-sm font-bold text-white bg-brand-secondary px-3 py-1 rounded-full hover:bg-brand-secondary-dark">추가</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-brand-text/60">검색 결과가 없습니다.</p>
                        )}
                    </div>
                )}

                <div>
                    <h4 className="font-semibold text-brand-text mb-2">나의 이웃 ({currentNeighbors.length})</h4>
                    {currentNeighbors.length > 0 ? (
                        <ul className="space-y-2">
                            {currentNeighbors.map(neighbor => (
                                <li key={neighbor.id} className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
                                    <span className="font-medium">{neighbor.nickname}</span>
                                    <button onClick={() => handleRemoveNeighbor(neighbor.id)} className="text-sm font-bold text-white bg-red-500 px-3 py-1 rounded-full hover:bg-red-600">끊기</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-brand-text/60">아직 등록된 이웃이 없습니다.</p>
                    )}
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {qrModalParty && <QRCodeModal partyTitle={qrModalParty.title} userName={user.nickname} onClose={() => setQrModalParty(null)} />}
      {certificateData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-stone-50 p-6 sm:p-8 rounded-2xl shadow-2xl text-center">
                <DonationCertificate ref={certificateRef} userNickname={user.nickname} offsetAmount={certificateData.amount} />
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={handleDownloadCertificate} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-brand-primary-dark transition-colors shadow-lg">
                        <i className="fa-solid fa-download mr-2"></i> 인증서 저장
                    </button>
                    <button onClick={() => setCertificateData(null)} className="bg-white text-brand-text font-bold py-3 px-6 rounded-full hover:bg-stone-200 transition-colors border border-stone-200">
                        닫기
                    </button>
                </div>
            </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="text-center mb-4 pb-4 border-b">
                <h2 className="text-xl font-bold text-brand-text">{user.nickname}</h2>
                <p className="text-sm text-brand-text/60">{user.email}</p>
              </div>
              <nav className="space-y-2">
                <SectionButton icon="fa-chart-line" label="대시보드" isActive={activeSection === 'DASHBOARD'} onClick={() => setActiveSection('DASHBOARD')} />
                <SectionButton icon="fa-shirt" label="나의 옷장" isActive={activeSection === 'CLOSET'} onClick={() => setActiveSection('CLOSET')} />
                <SectionButton icon="fa-coins" label="크레딧" isActive={activeSection === 'CREDITS'} onClick={() => setActiveSection('CREDITS')} />
                <SectionButton icon="fa-user-group" label="이웃 관리" isActive={activeSection === 'NEIGHBORS'} onClick={() => setActiveSection('NEIGHBORS')} />
                <SectionButton icon="fa-glass-cheers" label="파티 신청 내역" isActive={activeSection === 'APPLICATIONS'} onClick={() => setActiveSection('APPLICATIONS')} />
                <SectionButton icon="fa-ticket" label="활동 내역" isActive={activeSection === 'ACTIVITIES'} onClick={() => setActiveSection('ACTIVITIES')} />
                {hostedParties.length > 0 && (
                     <SectionButton icon="fa-bullhorn" label="나의 파티 호스팅" isActive={activeSection === 'HOSTING'} onClick={() => setActiveSection('HOSTING')} />
                )}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="md:col-span-3">
              {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
};

export default MyPage;