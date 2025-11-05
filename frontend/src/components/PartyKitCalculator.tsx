import React, { useState, useMemo } from 'react';

const PartyKitCalculator: React.FC = () => {
    const [participants, setParticipants] = useState(30);
    const [itemsPerPerson, setItemsPerPerson] = useState(5);

    const kitDetails = useMemo(() => {
        const tickets = participants * itemsPerPerson;
        const tags = participants * itemsPerPerson;
        const receipts = participants;

        // Pricing logic: Base fee + per participant fee
        const baseFee = 50000;
        const perParticipantFee = 2183;
        const totalCost = baseFee + (participants * perParticipantFee);

        return {
            tickets,
            tags,
            receipts,
            totalCost
        };
    }, [participants, itemsPerPerson]);

    const providedItems = [
        { name: '환경포스터 (B2, 랜덤발송)', quantity: 8, unit: '장' },
        { name: '티켓', quantity: kitDetails.tickets, unit: '장' },
        { name: '태그', quantity: kitDetails.tags, unit: '장' },
        { name: '환경영수증 (1인 1매 랜덤 발송)', quantity: kitDetails.receipts, unit: '장' },
        { name: '21% Party Guide 방법설명서', quantity: 1, unit: '장' },
        { name: '업사이클 천가방', quantity: 1, unit: '개' },
        { name: '법제정운동 포스터 (A3)', quantity: 1, unit: '장' },
    ];

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-brand-text mb-6 text-center">파티 규모 계산하기</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label htmlFor="participants" className="block text-sm font-medium text-brand-text">예상 참여 인원</label>
                    <input
                        type="range"
                        id="participants"
                        min="10"
                        max="100"
                        value={participants}
                        onChange={(e) => setParticipants(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center font-bold text-brand-primary text-lg mt-2">{participants}명</div>
                </div>
                <div>
                    <label htmlFor="items" className="block text-sm font-medium text-brand-text">1인당 교환할 옷</label>
                    <input
                        type="range"
                        id="items"
                        min="1"
                        max="10"
                        value={itemsPerPerson}
                        onChange={(e) => setItemsPerPerson(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center font-bold text-brand-primary text-lg mt-2">{itemsPerPerson}벌</div>
                </div>
            </div>

            <div className="bg-stone-50 rounded-lg p-6">
                <h4 className="font-bold text-lg mb-4 text-brand-text">제공 물품 목록</h4>
                <div className="space-y-2">
                    {providedItems.map(item => (
                        <div key={item.name} className="flex justify-between text-brand-text/80">
                            <span>{item.name}</span>
                            <span className="font-medium text-brand-text">{item.quantity.toLocaleString()} {item.unit}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-dashed my-4"></div>
                <div className="flex justify-between items-center text-xl font-bold text-brand-primary">
                    <span>예상 금액 (배송비 포함)</span>
                    <span>{kitDetails.totalCost.toLocaleString()}원</span>
                </div>
            </div>
        </div>
    );
};

export default PartyKitCalculator;
