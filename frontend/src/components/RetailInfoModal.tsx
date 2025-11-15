
import React from 'react';
import { ClothingItem } from '../types';
import Spinner from './Spinner';

// FIX: The import for RetailInfo was removed as services/geminiService.ts is not a module.
// The RetailInfo interface is now defined locally to resolve the error.
export interface RetailInfo {
  productName: string;
  brand: string;
  price: string;
  url: string;
}

interface RetailInfoModalProps {
  item: ClothingItem;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  results: RetailInfo[] | null;
  error: string | null;
}

const RetailInfoModal: React.FC<RetailInfoModalProps> = ({
  item,
  isOpen,
  onClose,
  isLoading,
  results,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-stone-200">
             <h2 className="text-xl font-bold text-brand-text">온라인 판매정보 검색 결과</h2>
             <p className="text-sm text-brand-text/70">AI가 찾은 유사 상품 목록입니다.</p>
        </div>
        
        <div className="p-6 bg-stone-50 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-auto object-cover rounded-lg shadow-md aspect-square" />
                    <h3 className="font-bold text-lg mt-3 text-brand-text">{item.name}</h3>
                    <p className="text-sm text-brand-text/70">검색 대상 아이템</p>
                </div>

                <div className="md:col-span-2">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner />
                            <p className="mt-4 text-brand-text/80">AI가 상품 정보를 찾고 있습니다...</p>
                        </div>
                    )}
                    {error && (
                         <div className="flex flex-col items-center justify-center h-full bg-red-50 p-4 rounded-lg">
                            <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-3"></i>
                            <p className="font-semibold text-red-700">오류 발생</p>
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && results && (
                        results.length > 0 ? (
                             <div className="space-y-4">
                                {results.map((result, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-stone-200">
                                        <p className="font-semibold text-brand-text">{result.productName}</p>
                                        <p className="text-sm text-brand-text/70">{result.brand}</p>
                                        <div className="flex justify-between items-center mt-3">
                                            <p className="font-bold text-brand-primary text-lg">{result.price}</p>
                                            <a 
                                                href={result.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="bg-brand-secondary text-white font-bold text-sm py-1.5 px-4 rounded-full hover:bg-brand-secondary-dark transition-colors"
                                            >
                                                구매하러 가기
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full">
                                <i className="fa-solid fa-box-open text-4xl text-stone-400 mb-4"></i>
                                <p className="text-brand-text/80">유사한 상품 정보를 찾을 수 없습니다.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
        
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white text-brand-text/70 hover:bg-stone-100 hover:text-brand-text transition-colors shadow-lg"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default RetailInfoModal;
