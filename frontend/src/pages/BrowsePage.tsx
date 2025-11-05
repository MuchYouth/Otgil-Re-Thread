import React, { useState, useMemo } from 'react';
import { ClothingItem, Party } from '../types';
import ClothingCard from '../components/ClothingCard';
import GoodbyeTagModal from '../components/GoodbyeTagModal';
import HelloTagModal from '../components/HelloTagModal';

interface BrowsePageProps {
  items: ClothingItem[];
  parties: Party[];
}

const BrowsePage: React.FC<BrowsePageProps> = ({ items, parties }) => {
    const [selectedFilter, setSelectedFilter] = useState<string>('ALL'); // 'ALL' or a party.id
    const [goodbyeTagModalItem, setGoodbyeTagModalItem] = useState<ClothingItem | null>(null);
    const [helloTagModalItem, setHelloTagModalItem] = useState<ClothingItem | null>(null);

    const filteredItems = useMemo(() => {
        if (selectedFilter === 'ALL') {
            return items.filter(item => item.isListedForExchange);
        }
        return items.filter(item => item.submittedPartyId === selectedFilter && item.partySubmissionStatus === 'APPROVED');
    }, [items, selectedFilter]);

    const handleShowTag = (item: ClothingItem, tagType: 'hello' | 'goodbye') => {
        if (tagType === 'hello') {
            setHelloTagModalItem(item);
        } else {
            setGoodbyeTagModalItem(item);
        }
    };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">새로운 스타일을 발견하세요</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
          당신에게 영감을 주는 옷을 찾고, 주인을 기다리는 옷에게 새로운 생명을 불어넣어 주세요.
        </p>
      </div>

      <div className="flex justify-center flex-wrap gap-3 mb-10">
         <button 
            onClick={() => setSelectedFilter('ALL')} 
            className={`px-5 py-2 text-sm font-bold rounded-full transition-colors ${selectedFilter === 'ALL' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-brand-text/80 hover:bg-stone-100'}`}
        >
            일반 교환
        </button>
        {parties.map(party => (
            <button 
                key={party.id} 
                onClick={() => setSelectedFilter(party.id)} 
                className={`px-5 py-2 text-sm font-bold rounded-full transition-colors ${selectedFilter === party.id ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-brand-text/80 hover:bg-stone-100'}`}
            >
                <i className="fa-solid fa-glass-cheers mr-2"></i>
                {party.title}
            </button>
        ))}
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
                {selectedFilter === 'ALL' 
                    ? '현재 교환 가능한 옷이 없습니다.' 
                    : '해당 파티에 승인된 출품작이 아직 없습니다.'
                }
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
};

export default BrowsePage;