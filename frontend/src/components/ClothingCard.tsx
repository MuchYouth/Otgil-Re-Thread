import React from 'react';
import { ClothingItem } from '../types';

interface ClothingItemProps {
    item: ClothingItem;
    onShowTag: (item: ClothingItem, tagType: 'hello' | 'goodbye') => void;
}

const ClothingCard: React.FC<ClothingItemProps> = ({ item, onShowTag }) => {
  return (
    <div className="group h-96 w-full [perspective:1000px]">
        <div className="relative h-full w-full rounded-xl shadow-lg transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
            {/* Front of the card */}
            <div className="absolute inset-0 [backface-visibility:hidden]">
                <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-xl object-cover" />
                <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl">
                    <h3 className="text-xl font-bold text-white truncate">{item.name}</h3>
                    <p className="text-sm text-white/80">by {item.userNickname}</p>
                </div>
            </div>

            {/* Back of the card - Simple Info */}
            <div className="absolute inset-0 h-full w-full rounded-xl bg-white p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between">
                <div className="text-center flex flex-col justify-center h-full">
                     <span className="inline-block bg-brand-secondary/50 text-brand-primary-dark text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                       {item.category}
                   </span>
                   <h3 className="text-2xl font-bold text-brand-text mb-2">{item.name}</h3>
                   <p className="text-brand-text/70 text-lg">사이즈: {item.size}</p>
                   <p className="text-brand-text/80 my-4 text-sm flex-grow overflow-y-auto text-left">{item.description}</p>
                   
                   {item.helloTag ? (
                       <button
                           onClick={(e) => {
                               e.stopPropagation(); 
                               onShowTag(item, 'hello');
                           }}
                           className="w-full bg-brand-secondary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-secondary-dark transition-colors mt-auto"
                       >
                           HELLO 태그 확인하기
                       </button>
                   ) : item.goodbyeTag && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); 
                                onShowTag(item, 'goodbye');
                            }}
                            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-primary-dark transition-colors mt-auto"
                        >
                            GOODBYE 태그 확인하기
                        </button>
                   )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ClothingCard;