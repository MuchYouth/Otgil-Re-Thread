import React, { useState, useMemo } from 'react';
import { Maker, MakerProduct } from '../types';
import MakerCard from '../components/MakerCard';

interface MakersHubPageProps {
  makers: Maker[];
  products: MakerProduct[];
  userCreditBalance: number;
  onPurchase: (product: MakerProduct) => void;
}

const MakerDetailModal: React.FC<{
    maker: Maker | null;
    products: MakerProduct[];
    userCreditBalance: number;
    onPurchase: (product: MakerProduct) => void;
    onClose: () => void;
}> = ({ maker, products, userCreditBalance, onPurchase, onClose }) => {
    if (!maker) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-4xl relative max-h-[90vh] flex flex-col">
                 <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-2xl z-20">&times;</button>
                 <div className="flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <img src={maker.imageUrl} alt={maker.name} className="w-full h-auto object-cover rounded-lg aspect-square" />
                            <h3 className="text-3xl font-bold text-brand-text mt-4">{maker.name}</h3>
                            <p className="text-brand-primary font-semibold">{maker.specialty}</p>
                            <p className="text-brand-text/70 text-sm mt-1"><i className="fa-solid fa-location-dot mr-2"></i>{maker.location}</p>
                            <p className="text-brand-text/80 text-sm mt-4">{maker.bio}</p>
                        </div>
                        <div className="md:col-span-2">
                             <h4 className="text-2xl font-bold text-brand-text mb-4 border-b pb-2">메이커 굿즈</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {products.length > 0 ? products.map(product => (
                                    <div key={product.id} className="bg-white rounded-lg border border-stone-200 overflow-hidden flex flex-col">
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h5 className="font-bold text-brand-text">{product.name}</h5>
                                            <p className="text-sm text-brand-text/70 mt-1 flex-grow">{product.description}</p>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="font-bold text-lg text-brand-primary">{product.price.toLocaleString()} OL</span>
                                                <button
                                                    onClick={() => onPurchase(product)}
                                                    disabled={userCreditBalance < product.price}
                                                    className="bg-brand-text text-white font-bold text-sm py-1.5 px-4 rounded-full hover:bg-black transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                                                >
                                                    {userCreditBalance >= product.price ? '구매' : '부족'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-brand-text/60 sm:col-span-2">아직 판매중인 굿즈가 없습니다.</p>
                                )}
                             </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    )
}


const MakersHubPage: React.FC<MakersHubPageProps> = ({ makers, products, userCreditBalance, onPurchase }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaker, setSelectedMaker] = useState<Maker | null>(null);

    const handleSelectMaker = (maker: Maker) => {
        setSelectedMaker(maker);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMaker(null);
    };

    const makerProducts = useMemo(() => {
        if (!selectedMaker) return [];
        return products.filter(p => p.makerId === selectedMaker.id);
    }, [selectedMaker, products]);


  return (
    <>
        <MakerDetailModal 
            maker={selectedMaker}
            products={makerProducts}
            userCreditBalance={userCreditBalance}
            onPurchase={onPurchase}
            onClose={closeModal}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">메이커스 허브</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
            지역의 장인들과 함께 당신의 옷에 새로운 가치를 더하세요. 옷길은 재능 있는 메이커와 의식 있는 소비자를 연결합니다.
            </p>
        </div>

        {makers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {makers.map(maker => (
                <MakerCard key={maker.id} maker={maker} onSelect={handleSelectMaker} />
            ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-white/50 rounded-lg">
            <i className="fa-solid fa-users-slash text-5xl text-stone-300 mb-4"></i>
            <p className="text-brand-text/60">아직 등록된 메이커가 없습니다.</p>
            </div>
        )}
        </div>
    </>
  );
};

export default MakersHubPage;