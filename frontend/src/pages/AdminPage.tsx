import React, { useState, useEffect } from 'react';
import { AdminOverallStats, AdminGroupPerformance, Party, DailyActivity, CategoryDistribution, PartyParticipant, PartyParticipantStatus, ClothingItem, User } from '../types';
import AdminStatCard from '../components/AdminStatCard';
import GroupPerformanceChart from '../components/GroupPerformanceChart';
import PartyManagementList from '../components/EventManagementList'; // Re-using but it's now for Parties
import DailyActivityChart from '../components/DailyActivityChart';
import CategoryDistributionChart from '../components/CategoryDistributionChart';
import PartyFormModal from '../components/EventFormModal'; // Re-using but it's now for Parties
import PartyItemReviewList from '../components/PartyItemReviewList';


// Mock data for Admin page
const MOCK_ADMIN_STATS: AdminOverallStats = {
  totalUsers: 1342,
  totalItems: 5871,
  totalExchanges: 2109,
  totalEvents: 12, // This represents parties now
};

const MOCK_GROUP_PERFORMANCE: AdminGroupPerformance[] = [
  { groupName: 'Seongsu Stylers', users: 56, itemsListed: 340, exchanges: 150 },
  { groupName: 'Yeonnam Vintage Club', users: 45, itemsListed: 280, exchanges: 124 },
  { groupName: 'Pangyo Sharers', users: 89, itemsListed: 450, exchanges: 95 },
];

const MOCK_DAILY_EXCHANGES: DailyActivity[] = [
    { date: '11-21', count: 25 },
    { date: '11-22', count: 31 },
    { date: '11-23', count: 28 },
    { date: '11-24', count: 45 },
    { date: '11-25', count: 52 },
    { date: '11-26', count: 48 },
    { date: '11-27', count: 60 },
];

const MOCK_CATEGORY_DISTRIBUTION: CategoryDistribution[] = [
    { category: 'T-SHIRT', count: 1890 },
    { category: 'JEANS', count: 1240 },
    { category: 'DRESS', count: 980 },
    { category: 'JACKET', count: 1530 },
    { category: 'ACCESSORY', count: 231 },
];

interface AdminPageProps {
  parties: Party[];
  clothingItems: ClothingItem[];
  users: User[];
  onAddParty: (partyData: Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status'>) => void;
  onUpdateParty: (partyData: Party) => void;
  onDeleteParty: (partyId: string) => void;
  onUpdateParticipantStatus: (partyId: string, userId: string, newStatus: PartyParticipantStatus) => void;
  onUpdatePartyItemStatus: (itemId: string, status: 'APPROVED' | 'REJECTED') => void;
  onUpdatePartyApprovalStatus: (partyId: string, newStatus: 'UPCOMING' | 'REJECTED') => void;
}

const ParticipantManagerModal: React.FC<{
    party: Party | null;
    onClose: () => void;
    onUpdateStatus: (partyId: string, userId: string, newStatus: PartyParticipantStatus) => void;
}> = ({ party, onClose, onUpdateStatus }) => {
    if (!party) return null;

    const participantsByStatus = (status: PartyParticipantStatus) => 
        party.participants.filter(p => p.status === status);
    
    const statusConfig = {
        PENDING: { title: '승인 대기중', color: 'border-yellow-500' },
        ACCEPTED: { title: '참가 승인', color: 'border-green-500' },
        REJECTED: { title: '참가 거절', color: 'border-red-500' },
        ATTENDED: { title: '참가 완료', color: 'border-stone-500' },
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative animate-fade-in max-h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors z-20"
                    aria-label="Close participant manager"
                >
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
                <h3 className="text-xl font-bold mb-1 text-brand-text">참가자 관리</h3>
                <p className="text-brand-text/70 mb-4">{party.title}</p>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {Object.keys(statusConfig).map(statusKey => {
                        const s = statusKey as PartyParticipantStatus;
                        const participants = participantsByStatus(s);
                        if (participants.length === 0) return null;

                        return (
                            <div key={s}>
                                <h4 className={`font-semibold mb-2 pb-1 border-b-2 ${statusConfig[s].color}`}>{statusConfig[s].title} ({participants.length})</h4>
                                <ul className="space-y-2">
                                    {participants.map(p => (
                                        <li key={p.userId} className="flex items-center justify-between bg-stone-50 p-2 rounded-md">
                                            <span>{p.nickname}</span>
                                            {s === 'PENDING' && (
                                                <div className="space-x-2">
                                                    <button onClick={() => onUpdateStatus(party.id, p.userId, 'ACCEPTED')} className="text-sm font-bold text-white bg-green-600 px-3 py-1 rounded-full hover:bg-green-700">승인</button>
                                                    <button onClick={() => onUpdateStatus(party.id, p.userId, 'REJECTED')} className="text-sm font-bold text-white bg-red-600 px-3 py-1 rounded-full hover:bg-red-700">거절</button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};


const AdminPage: React.FC<AdminPageProps> = ({ parties, clothingItems, users, onAddParty, onUpdateParty, onDeleteParty, onUpdateParticipantStatus, onUpdatePartyItemStatus, onUpdatePartyApprovalStatus }) => {
    const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
    const [partyToEdit, setPartyToEdit] = useState<Party | null>(null);

    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
    const [partyToManage, setPartyToManage] = useState<Party | null>(null);

    useEffect(() => {
        // This effect syncs the modal's party data with the main 'parties' prop.
        // It ensures that when a participant's status is updated, the change is
        // immediately visible within the open modal without needing to close and reopen it.
        if (isParticipantModalOpen && partyToManage) {
            const updatedParty = parties.find(p => p.id === partyToManage.id);
            if (updatedParty) {
                setPartyToManage(updatedParty);
            } else {
                // If the party was deleted while the modal is open, close the modal.
                setIsParticipantModalOpen(false);
            }
        }
    }, [parties, isParticipantModalOpen, partyToManage]);

    const handleOpenCreateModal = () => {
        setPartyToEdit(null);
        setIsPartyModalOpen(true);
    };

    const handleEditParty = (party: Party) => {
        setPartyToEdit(party);
        setIsPartyModalOpen(true);
    };

    const handleDeleteParty = (id: string) => {
        if(window.confirm(`이 파티를 정말로 삭제하시겠습니까?`)) {
            onDeleteParty(id);
        }
    };
    
    // FIX: Updated function signature to align with the more specific types from PartyFormModal, ensuring type safety.
    const handlePartyFormSubmit = (partyData: Party | Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status'>) => {
        if ('id' in partyData) {
            onUpdateParty(partyData as Party);
        } else {
            onAddParty(partyData);
        }
        setIsPartyModalOpen(false);
        setPartyToEdit(null);
    };
    
    const handleManageParticipants = (party: Party) => {
        setPartyToManage(party);
        setIsParticipantModalOpen(true);
    };

  return (
    <>
      <PartyFormModal 
          isOpen={isPartyModalOpen}
          onClose={() => setIsPartyModalOpen(false)}
          onSubmit={handlePartyFormSubmit}
          eventToEdit={partyToEdit}
      />
      <ParticipantManagerModal
          party={partyToManage}
          onClose={() => setIsParticipantModalOpen(false)}
          onUpdateStatus={onUpdateParticipantStatus}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-text">관리자 대시보드</h2>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard icon="fa-users" label="총 사용자" value={MOCK_ADMIN_STATS.totalUsers.toLocaleString()} color="bg-blue-500" />
          <AdminStatCard icon="fa-shirt" label="총 아이템" value={MOCK_ADMIN_STATS.totalItems.toLocaleString()} color="bg-brand-primary" />
          <AdminStatCard icon="fa-arrows-rotate" label="총 교환 수" value={MOCK_ADMIN_STATS.totalExchanges.toLocaleString()} color="bg-purple-500" />
          <AdminStatCard icon="fa-calendar-check" label="총 21% 파티" value={MOCK_ADMIN_STATS.totalEvents.toLocaleString()} color="bg-brand-secondary" />
        </div>

        {/* Daily Activity Chart */}
        <div>
          <DailyActivityChart data={MOCK_DAILY_EXCHANGES} label="일일 교환" />
        </div>

        {/* Distribution and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CategoryDistributionChart data={MOCK_CATEGORY_DISTRIBUTION} />
          <GroupPerformanceChart data={MOCK_GROUP_PERFORMANCE} />
        </div>

        {/* Party Item Review */}
        <div>
            <PartyItemReviewList
                clothingItems={clothingItems}
                parties={parties}
                users={users}
                onUpdateStatus={onUpdatePartyItemStatus}
            />
        </div>

        {/* Event Management */}
        <div>
          <PartyManagementList 
              parties={parties} 
              onAdd={handleOpenCreateModal}
              onEdit={handleEditParty} 
              onDelete={handleDeleteParty} 
              onManageParticipants={handleManageParticipants}
              onUpdateApprovalStatus={onUpdatePartyApprovalStatus}
          />
        </div>

      </div>
    </>
  );
};

export default AdminPage;