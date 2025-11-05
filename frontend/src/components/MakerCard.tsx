import React from 'react';
import { Maker } from '../types';

interface MakerCardProps {
  maker: Maker;
  onSelect: (maker: Maker) => void;
}

const MakerCard: React.FC<MakerCardProps> = ({ maker, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(maker)}
      className="bg-white rounded-lg shadow-lg overflow-hidden group flex flex-col text-left transform hover:-translate-y-1 transition-all duration-300 w-full"
    >
      <div className="relative overflow-hidden h-56">
        <img
          src={maker.imageUrl}
          alt={maker.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-sm font-semibold text-brand-primary">{maker.specialty}</span>
        <h3 className="text-xl font-bold text-brand-text mt-1">{maker.name}</h3>
        <p className="text-brand-text/60 text-sm mt-1">
            <i className="fa-solid fa-location-dot mr-2"></i>{maker.location}
        </p>
        <p className="text-brand-text/80 text-sm mt-3 flex-grow">{maker.bio}</p>
      </div>
       <div className="px-5 pb-4 mt-auto">
         <div className="w-full bg-brand-secondary/20 text-brand-secondary-dark text-center font-bold py-2 px-4 rounded-full transition-colors group-hover:bg-brand-secondary/40">
            굿즈 구경하기
        </div>
      </div>
    </button>
  );
};

export default MakerCard;