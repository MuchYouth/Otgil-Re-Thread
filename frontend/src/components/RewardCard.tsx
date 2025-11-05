import React from 'react';
import { Reward } from '../types';

interface RewardCardProps {
  reward: Reward;
  userBalance: number;
  onRedeem: (reward: Reward) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, userBalance, onRedeem }) => {
  const canAfford = userBalance >= reward.cost;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="relative h-48">
        <img
          src={reward.imageUrl}
          alt={reward.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 right-2 bg-brand-primary text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
          {reward.cost.toLocaleString()} OL
        </span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <span className={`text-xs font-semibold uppercase ${reward.type === 'GOODS' ? 'text-purple-600' : 'text-blue-600'}`}>
            {reward.type}
        </span>
        <h3 className="text-lg font-bold text-brand-text mt-1">{reward.name}</h3>
        <p className="text-brand-text/70 text-sm mt-1 flex-grow">{reward.description}</p>
        <button
          onClick={() => onRedeem(reward)}
          disabled={!canAfford}
          className={`mt-4 w-full font-bold py-2 px-4 rounded-full transition-colors duration-300
            ${canAfford
              ? 'bg-brand-text text-white hover:bg-black'
              : 'bg-stone-200 text-stone-500 cursor-not-allowed'
            }`}
        >
          {canAfford ? '교환하기' : 'OL이 부족합니다'}
        </button>
      </div>
    </div>
  );
};

export default RewardCard;