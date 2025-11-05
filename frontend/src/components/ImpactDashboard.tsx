import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { ImpactStats, User } from '../types';
import ImpactStatCard from './ImpactStatCard';
import EnvironmentalReceipt from './EnvironmentalReceipt';

interface ImpactDashboardProps {
  stats: ImpactStats;
  user: User;
}

const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ stats, user }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#f5f5f4', // bg-stone-100
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `otgil-receipt-${user.nickname}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-semibold mb-1 text-brand-text">{user.nickname}님의 긍정적인 영향력</h3>
        <p className="text-brand-text/70">
          옷길과 함께한 당신의 여정이 지구에 어떤 놀라운 변화를 만들었는지 확인해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImpactStatCard
          icon="fa-arrows-rotate"
          label="교환/기부한 의류"
          value={`${stats.itemsExchanged}`}
          color="bg-brand-primary"
        />
        <ImpactStatCard
          icon="fa-droplet"
          label="절약한 물(L)"
          value={`${stats.waterSaved.toLocaleString()}`}
          color="bg-blue-500"
        />
        <ImpactStatCard
          icon="fa-smog"
          label="절감한 CO₂(kg)"
          value={`${stats.co2Reduced.toFixed(1)}`}
          color="bg-stone-500"
        />
      </div>

      <div className="mt-8 bg-white p-8 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-brand-text">나의 환경 영수증</h3>
        <div className="flex flex-col items-center gap-6">
            <div className="bg-stone-100 p-4 rounded-lg">
                <EnvironmentalReceipt ref={receiptRef} userNickname={user.nickname} stats={stats} />
            </div>
            <button
                onClick={handleDownloadReceipt}
                className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-brand-primary-dark transition-all duration-300 shadow-md flex items-center"
            >
                <i className="fa-solid fa-download mr-2"></i>
                영수증 이미지로 저장
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;