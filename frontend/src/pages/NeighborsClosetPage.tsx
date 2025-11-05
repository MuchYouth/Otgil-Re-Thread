import React from 'react';
import { User, Page } from '../types';

interface NeighborProfileCardProps {
    neighbor: User;
    onClick: () => void;
}

const NeighborProfileCard: React.FC<NeighborProfileCardProps> = ({ neighbor, onClick }) => {
    return (
        <button 
            onClick={onClick} 
            className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
        >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 border-2 border-stone-200">
                <i className="fa-solid fa-user text-3xl sm:text-4xl text-stone-400"></i>
            </div>
            <h3 className="font-bold text-lg text-brand-text truncate">{neighbor.nickname}</h3>
            <p className="text-sm text-brand-text/60">{neighbor.neighbors?.length || 0} 이웃</p>
        </button>
    );
};

interface NeighborsClosetPageProps {
  currentUser: User;
  allUsers: User[];
  setPage: (page: Page) => void;
  onSelectNeighbor: (neighborId: string) => void;
}

const NeighborsClosetPage: React.FC<NeighborsClosetPageProps> = ({ currentUser, allUsers, setPage, onSelectNeighbor }) => {
    const neighborIds = currentUser.neighbors || [];
    const neighbors = allUsers.filter(u => neighborIds.includes(u.id));

    const handleNeighborClick = (neighborId: string) => {
        onSelectNeighbor(neighborId);
        setPage(Page.NEIGHBOR_PROFILE);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">이웃의 옷장</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
                    이웃의 옷장을 방문하여 그들의 스타일과 이야기를 만나보세요.
                </p>
            </div>

            {neighbors.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {neighbors.map(neighbor => (
                       <NeighborProfileCard key={neighbor.id} neighbor={neighbor} onClick={() => handleNeighborClick(neighbor.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/50 rounded-lg">
                    <i className="fa-solid fa-users-slash text-6xl text-stone-300 mb-4"></i>
                    <p className="text-brand-text/60">아직 이웃이 없습니다.</p>
                    <p className="text-brand-text/60 mt-2">마이페이지에서 이웃을 추가해보세요!</p>
                </div>
            )}
        </div>
    );
};

export default NeighborsClosetPage;