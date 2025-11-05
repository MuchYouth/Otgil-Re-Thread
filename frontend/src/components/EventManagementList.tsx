import React from 'react';
import { Party } from '../types';

interface PartyManagementListProps {
  parties: Party[];
  onAdd: () => void;
  onEdit: (party: Party) => void;
  onDelete: (id: string) => void;
  onManageParticipants: (party: Party) => void;
  onUpdateApprovalStatus: (partyId: string, newStatus: 'UPCOMING' | 'REJECTED') => void;
}

const PartyManagementList: React.FC<PartyManagementListProps> = ({ parties, onAdd, onEdit, onDelete, onManageParticipants, onUpdateApprovalStatus }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-stone-800">21% 파티 관리</h3>
        <button onClick={onAdd} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary-dark transition-colors">
          새 파티 추가
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-stone-500">
          <thead className="text-xs text-stone-700 uppercase bg-stone-100">
            <tr>
              <th scope="col" className="px-6 py-3">파티명</th>
              <th scope="col" className="px-6 py-3">날짜</th>
              <th scope="col" className="px-6 py-3">참가자</th>
              <th scope="col" className="px-6 py-3">상태</th>
              <th scope="col" className="px-6 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party) => {
              const pendingCount = party.participants.filter(p => p.status === 'PENDING').length;
              return (
                <tr key={party.id} className="bg-white border-b hover:bg-stone-50">
                  <th scope="row" className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">
                    {party.title}
                  </th>
                  <td className="px-6 py-4">{party.date}</td>
                  <td className="px-6 py-4">
                    {party.participants.length}명
                    {pendingCount > 0 && <span className="ml-2 text-xs font-bold text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-full">{pendingCount}명 대기</span>}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        party.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                        party.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                        party.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-stone-200 text-stone-700'
                    }`}>
                        {
                            party.status === 'UPCOMING' ? '진행 예정' :
                            party.status === 'PENDING_APPROVAL' ? '승인 대기' :
                            party.status === 'REJECTED' ? '거절됨' :
                            '종료'
                        }
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                    {party.status === 'PENDING_APPROVAL' ? (
                        <>
                            <button onClick={() => onUpdateApprovalStatus(party.id, 'UPCOMING')} className="font-medium text-green-600 hover:underline">승인</button>
                            <button onClick={() => onUpdateApprovalStatus(party.id, 'REJECTED')} className="font-medium text-red-600 hover:underline">거절</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => onManageParticipants(party)} className="font-medium text-green-600 hover:underline">참가자</button>
                            <button onClick={() => onEdit(party)} className="font-medium text-blue-600 hover:underline">수정</button>
                            <button onClick={() => onDelete(party.id)} className="font-medium text-red-600 hover:underline">삭제</button>
                        </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyManagementList;