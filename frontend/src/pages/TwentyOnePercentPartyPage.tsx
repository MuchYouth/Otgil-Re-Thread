import React, { useState, useMemo } from 'react';
import { Party, Page, User, ClothingItem } from '../types';
import ClothingCard from '../components/ClothingCard';
import GoodbyeTagModal from '../components/GoodbyeTagModal';
import HelloTagModal from '../components/HelloTagModal';

interface TwentyOnePercentPartyPageProps {
  parties: Party[];
  items: ClothingItem[];
  currentUser: User | null;
  onPartyApply: (partyId: string) => void;
  setPage: (page: Page) => void;
}

const TwentyOnePercentPartyPage: React.FC<TwentyOnePercentPartyPageProps> = ({ parties, items, currentUser, onPartyApply, setPage }) => {
  const [view, setView] = useState<'parties' | 'lineup'>('parties');
  const [goodbyeTagModalItem, setGoodbyeTagModalItem] = useState<ClothingItem | null>(null);
  const [helloTagModalItem, setHelloTagModalItem] = useState<ClothingItem | null>(null);
  
  const upcomingParties = parties.filter(p => p.status === 'UPCOMING');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const filteredItems = useMemo(() => {
    if (!selectedFilter) return [];
    return items.filter(item => item.submittedPartyId === selectedFilter && item.partySubmissionStatus === 'APPROVED');
  }, [items, selectedFilter]);

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

  if (view === 'lineup') {
    const selectedParty = parties.find(p => p.id === selectedFilter);
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
          <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
            파티에 출품된 옷들을 둘러보세요.
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredItems.map(item => (
              <ClothingCard key={item.id} item={item} onShowTag={handleShowTag} />
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

        {goodbyeTagModalItem && (
          <GoodbyeTagModal item={goodbyeTagModalItem} onClose={() => setGoodbyeTagModalItem(null)} />
        )}
        {helloTagModalItem && (
          <HelloTagModal item={helloTagModalItem} onClose={() => setHelloTagModalItem(null)} />
        )}
      </div>
    );
  }

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
                    <h4 className="text-xl font-bold text-brand-text">{party.title}</h4>
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