import React from 'react';
import { ClothingItem } from '../types';

interface GoodbyeTagModalProps {
  item: ClothingItem;
  onClose: () => void;
}

const TagLine: React.FC<{ label: string; value?: string | number; }> = ({ label, value }) => {
    return (
        <div className="flex items-start text-base mb-3">
            <span className="w-28 shrink-0 text-brand-text/70">{label}</span>
            <span className="font-semibold text-brand-text break-words">
                {value || '______'}
            </span>
        </div>
    );
};

const GoodbyeTagModal: React.FC<GoodbyeTagModalProps> = ({ item, onClose }) => {
  if (!item.goodbyeTag) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="bg-brand-secondary/40 p-6 pt-10 text-brand-primary-dark relative">
            {/* Tag hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-stone-200 z-10 flex items-center justify-center">
                 <div className="w-6 h-6 rounded-full bg-brand-secondary/20"></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="text-left">
                     <h2 className="text-2xl font-black tracking-tighter">21%</h2>
                     <h3 className="text-3xl font-bold tracking-tight -mt-1">Party</h3>
                </div>
                <div className="text-right">
                    <p className="font-semibold">떠나는 옷에게</p>
                    <p className="text-2xl font-bold tracking-wider">★Goodbye</p>
                </div>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-8 flex flex-col justify-center bg-white">
             <p className="mb-6 text-lg">잘 가! <span className="font-bold">{item.name}</span>.</p>
            <div className="space-y-2">
                <TagLine label="만난 시기" value={item.goodbyeTag.metWhen} />
                <TagLine label="만난 장소" value={item.goodbyeTag.metWhere} />
                <TagLine label="만난 이유" value={item.goodbyeTag.whyGot} />
                <TagLine label="입은 횟수" value={`${item.goodbyeTag.wornCount} 회`} />
                <TagLine label="떠나는 이유" value={item.goodbyeTag.whyLetGo} />
            </div>
            <p className="mt-6 pt-4 border-t border-dashed border-brand-text/20">
                <span className="text-brand-text/70 text-sm">옷을 떠나보내며 한마디,</span><br/>
                <span className="font-semibold italic text-lg mt-1">"{item.goodbyeTag.finalMessage || '...'}"</span>
            </p>
        </div>
        
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white text-brand-text/70 hover:bg-stone-100 hover:text-brand-text transition-colors shadow-lg"
          aria-label="Close tag view"
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default GoodbyeTagModal;
