import React from 'react';
import { ClothingItem, Party, User } from '../types';

interface PartyItemReviewListProps {
  clothingItems: ClothingItem[];
  parties: Party[];
  users: User[];
  onUpdateStatus: (itemId: string, status: 'APPROVED' | 'REJECTED') => void;
}

const PartyItemReviewList: React.FC<PartyItemReviewListProps> = ({ clothingItems, parties, users, onUpdateStatus }) => {
  const pendingItems = clothingItems.filter(item => item.partySubmissionStatus === 'PENDING');

  const findPartyName = (partyId?: string) => parties.find(p => p.id === partyId)?.title || 'N/A';

  if (pendingItems.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-stone-800 mb-2">파티 출품 아이템 검수</h3>
        <p className="text-stone-500">현재 검수 대기 중인 아이템이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-stone-800 mb-4">파티 출품 아이템 검수 ({pendingItems.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-stone-500">
          <thead className="text-xs text-stone-700 uppercase bg-stone-100">
            <tr>
              <th scope="col" className="px-4 py-3">아이템</th>
              <th scope="col" className="px-6 py-3">사용자</th>
              <th scope="col" className="px-6 py-3">파티</th>
              <th scope="col" className="px-6 py-3">신청일</th>
              <th scope="col" className="px-6 py-3">작업</th>
            </tr>
          </thead>
          <tbody>
            {pendingItems.map(item => (
              <tr key={item.id} className="bg-white border-b hover:bg-stone-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-16 object-cover rounded-md" />
                    <div>
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-500">{item.category} / {item.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{item.userNickname}</td>
                <td className="px-6 py-4">{findPartyName(item.submittedPartyId)}</td>
                <td className="px-6 py-4">{new Date().toLocaleDateString()}</td> {/* Mock date */}
                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                  <button onClick={() => onUpdateStatus(item.id, 'APPROVED')} className="font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full text-xs">승인</button>
                  <button onClick={() => onUpdateStatus(item.id, 'REJECTED')} className="font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full text-xs">반려</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyItemReviewList;
