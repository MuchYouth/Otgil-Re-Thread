import React, { useState } from 'react';
import { Reward, User } from '../types';
import RewardCard from '../components/RewardCard';

interface RewardsPageProps {
  user: User;
  rewards: Reward[];
  currentBalance: number;
  onRedeem: (reward: Reward) => void;
  onRegisterReward: (reward: Omit<Reward, 'id'>) => void;
}

const RewardRegistrationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reward: Omit<Reward, 'id'>) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: 0,
        imageUrl: '',
        type: 'GOODS' as 'GOODS' | 'SERVICE',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'cost' ? Number(value) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
        setFormData({ name: '', description: '', cost: 0, imageUrl: '', type: 'GOODS' });
    };

    if (!isOpen) return null;

    const standardInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
                 <h3 className="text-2xl font-bold text-brand-text mb-6">바우처 등록 (관리자)</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-brand-text">바우처 이름</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={standardInputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-text">설명</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={standardInputClasses} required></textarea>
                    </div>
                    <div>
                        <label htmlFor="cost" className="block text-sm font-medium text-brand-text">비용 (OL)</label>
                        <input type="number" name="cost" id="cost" value={formData.cost} onChange={handleChange} className={standardInputClasses} min="0" required />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-brand-text">이미지 URL</label>
                        <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className={standardInputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-brand-text">유형</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className={standardInputClasses}>
                            <option value="GOODS">상품 (GOODS)</option>
                            <option value="SERVICE">서비스 (SERVICE)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-primary-dark transition-colors mt-4">
                        등록하기
                    </button>
                 </form>
            </div>
        </div>
    );
};

const RewardsPage: React.FC<RewardsPageProps> = ({ user, rewards, currentBalance, onRedeem, onRegisterReward }) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <>
    <RewardRegistrationModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSubmit={onRegisterReward} 
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">올 스토어</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
          당신의 긍정적인 영향력을 특별한 리워드로 교환하거나, 더 큰 가치를 위해 사용하세요.
        </p>
        <div className="mt-6 inline-block bg-white px-6 py-3 rounded-full shadow-md">
            <span className="text-brand-text/70">현재 잔액: </span>
            <span className="font-bold text-2xl text-brand-primary">{currentBalance.toLocaleString()} OL</span>
        </div>
        {user.isAdmin && (
            <div className="mt-8">
                <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-brand-secondary-dark transition-colors shadow-md"
                >
                    <i className="fa-solid fa-plus mr-2"></i>바우처 등록하기
                </button>
            </div>
        )}
      </div>

      {/* Rewards Section */}
      <div>
        <h3 className="text-3xl font-extrabold text-brand-text mb-8">바우처 교환하기</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} userBalance={currentBalance} onRedeem={onRedeem} />
            ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default RewardsPage;
