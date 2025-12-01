import React, { useState } from 'react';
import { ClothingItem } from '../types';

interface HelloTagFormModalProps {
  item: ClothingItem;
  onClose: () => void;
  onSubmit: (tagData: any) => void;
}

const HelloTagFormModal: React.FC<HelloTagFormModalProps> = ({ item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    receivedFrom: item.userNickname, // 이전 주인 닉네임 자동 입력
    receivedAt: '21% Party', // 파티 이름이나 장소 (기본값)
    firstImpression: '',
    helloMessage: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstImpression || !formData.helloMessage) {
        alert("첫인상과 메시지를 모두 입력해주세요.");
        return;
    }
    onSubmit(formData);
  };

  const inputClasses = "w-full border-b border-brand-text/30 focus:border-brand-primary outline-none bg-transparent py-1 text-brand-text font-semibold placeholder-stone-400 text-sm transition-colors";

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner (기존 디자인 유지) */}
        <div className="bg-brand-primary/40 p-6 pt-10 text-brand-primary-dark relative">
            {/* Tag hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-stone-200 z-10 flex items-center justify-center">
                 <div className="w-6 h-6 rounded-full bg-brand-primary/20"></div>
            </div>
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black tracking-tighter">OT-GIL</h2>
                <div className="text-right">
                    <p className="font-semibold">교환 확정하기</p>
                    <p className="text-2xl font-bold tracking-wider">Hello★</p>
                </div>
            </div>
        </div>
        
        {/* Content (입력 폼으로 변경) */}
        <div className="p-8 flex flex-col justify-center bg-white">
             <p className="mb-6 text-lg">반가워! <span className="font-bold">{item.name}</span>.</p>
            
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-end text-base">
                    <span className="w-24 shrink-0 text-brand-text/70 pb-1">널 보낸 사람</span>
                    <input type="text" name="receivedFrom" value={formData.receivedFrom} onChange={handleChange} className={inputClasses} readOnly />
                </div>
                <div className="flex items-end text-base">
                    <span className="w-24 shrink-0 text-brand-text/70 pb-1">만난 곳</span>
                    <input type="text" name="receivedAt" value={formData.receivedAt} onChange={handleChange} className={inputClasses} />
                </div>
                <div className="flex items-end text-base">
                    <span className="w-24 shrink-0 text-brand-text/70 pb-1">첫인상</span>
                    <input type="text" name="firstImpression" value={formData.firstImpression} onChange={handleChange} className={inputClasses} placeholder="예: 보자마자 내꺼다 싶었어!" autoFocus />
                </div>
                
                <div className="mt-6 pt-4 border-t border-dashed border-brand-text/20">
                    <span className="text-brand-text/70 text-sm block mb-2">새로운 주인이 남기는 한마디,</span>
                    <textarea 
                        name="helloMessage" 
                        value={formData.helloMessage} 
                        onChange={handleChange} 
                        rows={2} 
                        className="w-full bg-stone-50 p-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm resize-none italic"
                        placeholder="앞으로 잘 부탁해!"
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-primary-dark transition-colors shadow-md mt-4"
                >
                    교환 확정
                </button>
             </form>
        </div>
        
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white text-brand-text/70 hover:bg-stone-100 hover:text-brand-text transition-colors shadow-lg"
          aria-label="Close form"
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default HelloTagFormModal;