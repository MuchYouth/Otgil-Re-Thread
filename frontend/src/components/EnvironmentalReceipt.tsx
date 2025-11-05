import React, { forwardRef } from 'react';
import { ImpactStats } from '../types';

interface EnvironmentalReceiptProps {
  userNickname?: string;
  eventTitle?: string;
  isEvent?: boolean;
  stats: ImpactStats;
}

const ReceiptRow: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="flex justify-between items-end">
        <span>{label}</span>
        <span className="flex-1 border-b border-dashed border-stone-400 mx-2"></span>
        <span className="font-semibold">{value}</span>
    </div>
);

const EnvironmentalReceipt = forwardRef<HTMLDivElement, EnvironmentalReceiptProps>(
  ({ userNickname, eventTitle, isEvent = false, stats }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[320px] bg-white p-5 shadow-lg font-mono text-brand-text border border-stone-200"
        style={{ fontFamily: `'Courier New', Courier, monospace` }}
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">Ot-gil</h2>
          <p className="text-sm">환경 영수증</p>
        </div>
        
        <hr className="border-dashed border-stone-400 my-2" />

        <div className="text-xs mb-3">
          <p>날짜: {new Date().toLocaleDateString()}</p>
          <p>{isEvent ? `이벤트: ${eventTitle}` : `발급 대상: ${userNickname}`}</p>
        </div>
        
        <hr className="border-dashed border-stone-400 my-2" />

        <div className="space-y-2 text-sm">
            <ReceiptRow label="교환된 의류" value={`${stats.itemsExchanged} 개`} />
            <ReceiptRow label="절약한 물 (L)" value={`${stats.waterSaved.toLocaleString()}`} />
            <ReceiptRow label="절감한 CO2 (kg)" value={`${stats.co2Reduced.toFixed(1)}`} />
        </div>

        <hr className="border-dashed border-stone-400 my-3" />

        <div className="text-center my-4">
            <p className="text-xs italic">"규칙은 없어요, 지속가능한 패션이 있을 뿐!"</p>
            <div className="mt-2 text-2xl text-stone-400">
                <i className="fa-solid fa-leaf"></i>
                <i className="fa-solid fa-recycle mx-2"></i>
                <i className="fa-solid fa-earth-asia"></i>
            </div>
        </div>

        {/* Barcode simulation */}
        <div className="flex items-center justify-center space-x-px h-12">
            {[...Array(40)].map((_, i) => (
                <div
                    key={i}
                    className="bg-brand-text"
                    style={{
                        width: `${Math.random() * 2 + 0.5}px`,
                        height: `${Math.random() * 60 + 40}%`
                    }}
                ></div>
            ))}
        </div>
        <p className="text-center text-xs mt-1">
            당신의 영향력에 감사드립니다!
        </p>

      </div>
    );
  }
);

export default EnvironmentalReceipt;