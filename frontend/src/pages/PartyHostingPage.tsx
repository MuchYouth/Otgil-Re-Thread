import React, { useState } from 'react';
import { Party } from '../types';

interface PartyHostingPageProps {
  onHostParty: (partyData: Omit<Party, 'id' | 'impact' | 'participants' | 'invitationCode' | 'hostId' | 'status' | 'kitDetails'>) => void;
}

const PartyHostingPage: React.FC<PartyHostingPageProps> = ({ onHostParty }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        imageUrl: '',
        details: '', // for textarea, will be split into array
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const partyData = {
            ...formData,
            details: formData.details.split('\n').filter(Boolean),
        };
        onHostParty(partyData);
    };
    
    const standardInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary";

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">21% 파티 호스트 되기</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-brand-text/70">
                    당신이 있는 곳 어디든, 지속가능한 패션을 즐기는 파티 공간으로 만들어보세요. 옷길이 필요한 모든 것을 지원합니다.
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-brand-text mb-6 border-b pb-4">파티 정보 입력</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-brand-text">파티 이름</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={standardInputClasses} placeholder="예: 우리 동네 옷 교환 파티" required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-brand-text">예상 날짜</label>
                            <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className={standardInputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-brand-text">예상 장소</label>
                            <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className={standardInputClasses} placeholder="예: 서울 성수동" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-text">파티 소개</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className={standardInputClasses} placeholder="파티에 대해 자유롭게 설명해주세요." required></textarea>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-brand-text">홍보 이미지 URL</label>
                        <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className={standardInputClasses} placeholder="https://example.com/image.jpg" />
                    </div>
                     <div>
                        <label htmlFor="details" className="block text-sm font-medium text-brand-text">상세 정보 (한 줄에 하나씩)</label>
                        <textarea name="details" id="details" value={formData.details} onChange={handleChange} rows={3} className={standardInputClasses} placeholder="예: 참가비 없음&#10;업사이클링 워크샵 진행"></textarea>
                    </div>
                     <div className="text-center pt-4">
                        <button 
                            type="submit"
                            className="bg-brand-text text-white font-bold py-3 px-12 rounded-full hover:bg-black transition-colors text-lg shadow-lg"
                        >
                            호스팅 신청하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartyHostingPage;