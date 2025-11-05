import React from 'react';
import { Reward, User } from '../types';
import RewardCard from '../components/RewardCard';

interface RewardsPageProps {
  user: User;
  rewards: Reward[];
  currentBalance: number;
  onRedeem: (reward: Reward) => void;
}

const RewardsPage: React.FC<RewardsPageProps> = ({ user, rewards, currentBalance, onRedeem }) => {
  return (
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
  );
};

export default RewardsPage;