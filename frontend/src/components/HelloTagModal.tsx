import React from 'react';
import { ClothingItem } from '../types';

interface HelloTagModalProps {
  item: ClothingItem;
  onClose: () => void;
}

const TagLine: React.FC<{ label: string; value?: string; }> = ({ label, value }) => {
    return (
        <div className="flex items-start text-base mb-3">
            <span className="w-28 shrink-0 text-brand-text/70">{label}</span>
            <span className="font-semibold text-brand-text break-words">
                {value || '______'}
            </span>
        </div>
    );
};

const HelloTagModal: React.FC<HelloTagModalProps> = ({ item, onClose }) => {
  if (!item.helloTag) return null;

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
        <div className="bg-brand-primary/40 p-6 pt-10 text-brand-primary-dark relative">
            {/* Tag hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-stone-200 z-10 flex items-center justify-center">
                 <div className="w-6 h-6 rounded-full bg-brand-primary/20"></div>
            </div>
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black tracking-tighter">OT-GIL</h2>
                <div className="text-right">
                    <p className="font-semibold">나에게 온 옷에게</p>
                    <p className="text-2xl font-bold tracking-wider">Hello★</p>
                </div>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-8 flex flex-col justify-center bg-white">
             <p className="mb-6 text-lg">반가워! <span className="font-bold">{item.name}</span>.</p>
            <div className="space-y-2">
                <TagLine label="널 보낸 사람" value={item.helloTag.receivedFrom} />
                <TagLine label="만난 곳" value={item.helloTag.receivedAt} />
                <TagLine label="첫인상" value={item.helloTag.firstImpression} />
            </div>
            <p className="mt-6 pt-4 border-t border-dashed border-brand-text/20">
                <span className="text-brand-text/70 text-sm">새로운 주인이 남기는 한마디,</span><br/>
                <span className="font-semibold italic text-lg mt-1">"{item.helloTag.helloMessage || '...'}"</span>
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

export default HelloTagModal;
