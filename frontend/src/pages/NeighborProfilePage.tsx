import React, { useState } from 'react';
import { User, ClothingItem, Page } from '../types';
import HelloTagModal from '../components/HelloTagModal';
import GoodbyeTagModal from '../components/GoodbyeTagModal';

// New component for the grid item
const ClothingGridItem: React.FC<{ item: ClothingItem; onClick: () => void; }> = ({ item, onClick }) => {
    return (
        <button onClick={onClick} className="aspect-square block group relative overflow-hidden">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center p-2">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    <p className="font-bold">{item.helloTag ? 'HELLO 태그' : 'GOODBYE 태그'}</p>
                    <p className="text-sm">자세히 보기</p>
                </div>
            </div>
        </button>
    );
};

interface NeighborProfilePageProps {
  neighbor: User;
  items: ClothingItem[];
  currentUser: User;
  onToggleNeighbor: (neighborId: string) => void;
  setPage: (page: Page) => void;
}

const NeighborProfilePage: React.FC<NeighborProfilePageProps> = ({ neighbor, items, currentUser, onToggleNeighbor, setPage }) => {
  const [helloTagModalItem, setHelloTagModalItem] = useState<ClothingItem | null>(null);
  const [goodbyeTagModalItem, setGoodbyeTagModalItem] = useState<ClothingItem | null>(null);

  const isNeighbor = currentUser.neighbors?.includes(neighbor.id);

  const handleShowTag = (item: ClothingItem) => {
    if (item.helloTag) {
      setHelloTagModalItem(item);
    } else if (item.goodbyeTag) {
      setGoodbyeTagModalItem(item);
    }
  };

  const neighborItemsWithTags = items.filter(item => (item.helloTag || item.goodbyeTag) && item.isListedForExchange);

  return (
    <>
    <div className="max-w-4xl mx-auto px-0 sm:px-4 lg:px-8 py-8 animate-fade-in">
        <div className="px-4">
            <button onClick={() => setPage(Page.NEIGHBORS_CLOSET)} className="text-brand-primary hover:text-brand-primary-dark font-semibold mb-6 inline-flex items-center">
                <i className="fa-solid fa-arrow-left mr-2"></i>
                이웃 목록으로 돌아가기
            </button>
        </div>

        {/* Profile Header */}
        <header className="flex items-start p-4 border-b border-stone-200">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-stone-100 flex items-center justify-center mr-4 sm:mr-8 shrink-0 border">
                <i className="fa-solid fa-user text-4xl sm:text-6xl text-stone-400"></i>
            </div>
            <div className="flex-grow">
                <h2 className="text-2xl font-semibold text-brand-text">{neighbor.nickname}</h2>
                <div className="flex space-x-6 my-3 text-sm sm:text-base text-brand-text/80">
                    <div><span className="font-bold text-brand-text">{items.length}</span> Posts</div>
                    <div><span className="font-bold text-brand-text">{items.filter(i => i.helloTag).length}</span> Exchanges</div>
                    <div><span className="font-bold text-brand-text">{neighbor.neighbors?.length || 0}</span> Neighbors</div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => onToggleNeighbor(neighbor.id)}
                        className={`w-full py-2 px-4 rounded-md text-sm font-bold transition-colors ${
                            isNeighbor
                                ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                                : 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                        }`}
                    >
                        {isNeighbor ? '이웃 끊기' : '이웃 추가'}
                    </button>
                </div>
            </div>
        </header>

        {/* Tabs */}
        <div className="flex justify-center border-b border-stone-200">
            <button className="flex-grow text-center py-3 border-b-2 border-brand-text font-semibold text-brand-text">
                <i className="fa-solid fa-th-large mr-2"></i>POSTS
            </button>
        </div>

        {/* Clothing Feed */}
        <main className="grid grid-cols-3 gap-0.5 sm:gap-1 mt-1">
            {neighborItemsWithTags.length > 0 ? (
                neighborItemsWithTags.map(item => (
                    <ClothingGridItem key={item.id} item={item} onClick={() => handleShowTag(item)} />
                ))
            ) : (
                <div className="col-span-3 text-center py-16 bg-white/50 rounded-lg">
                    <i className="fa-solid fa-box-open text-6xl text-stone-300 mb-4"></i>
                    <p className="text-brand-text/60">아직 공유된 옷이 없습니다.</p>
                </div>
            )}
        </main>
      
    </div>
    {/* Modals */}
    {goodbyeTagModalItem && (
        <GoodbyeTagModal item={goodbyeTagModalItem} onClose={() => setGoodbyeTagModalItem(null)} />
    )}
    {helloTagModalItem && (
        <HelloTagModal item={helloTagModalItem} onClose={() => setHelloTagModalItem(null)} />
    )}
    </>
  );
};

export default NeighborProfilePage;