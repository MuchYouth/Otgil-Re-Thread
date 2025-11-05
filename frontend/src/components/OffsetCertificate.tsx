import React, { forwardRef } from 'react';

interface DonationCertificateProps {
  userNickname: string;
  offsetAmount: number;
}

const DonationCertificate = forwardRef<HTMLDivElement, DonationCertificateProps>(
  ({ userNickname, offsetAmount }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[400px] bg-white p-6 shadow-2xl text-brand-text border-2 border-brand-primary relative overflow-hidden"
        style={{ fontFamily: `'Garamond', 'serif'` }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-brand-secondary/20 z-0"></div>
        <div className="relative z-10 text-center">

            <div className="mb-4">
                <p className="text-sm uppercase tracking-widest text-brand-primary-dark">DONATION CERTIFICATE</p>
                <h1 className="text-3xl font-bold text-brand-text">기부 증서</h1>
            </div>

            <p className="my-6 text-lg">
                위 사용자는 옷길(Ot-gil)에서의 활동으로 얻은<br/>
                크레딧을 지속가능한 패션 생태계를 위해<br/>
                기부하였음을 증명합니다.
            </p>

            <div className="bg-white/70 inline-block px-8 py-4 rounded-lg border border-brand-secondary my-4">
                <p className="text-lg text-brand-text/80">기부 크레딧</p>
                <p className="text-4xl font-bold text-brand-primary">
                    {offsetAmount.toLocaleString()} <span className="text-2xl">OL</span>
                </p>
            </div>

            <p className="my-6 text-sm">
                당신의 소중한 기부는 의류 폐기물을 줄이고<br/>
                순환 경제를 촉진하는 데 사용됩니다.
            </p>

            <div className="mt-8 flex justify-between items-center">
                <div className="text-left">
                    <p className="text-sm">{new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-stone-500">발급일</p>
                </div>
                <div>
                     <p className="text-xl font-bold italic text-brand-text">Ot-gil</p>
                     <p className="text-xs text-stone-500">지속가능한 패션 플랫폼</p>
                </div>
            </div>
        </div>
      </div>
    );
  }
);

export default DonationCertificate;