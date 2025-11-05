import React, { useState, useRef, useEffect } from 'react';
import { Party, Page, Maker, ImpactStats, PartyParticipantStatus } from '../types';
import MakerCard from '../components/MakerCard';

interface QRScannerModalProps {
    onClose: () => void;
    onScanSuccess: (data: string) => void;
    onError: (error: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScanSuccess, onError }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startScan = async () => {
            if (!('BarcodeDetector' in window)) {
                onError('QR 코드 스캔이 이 브라우저에서 지원되지 않습니다.');
                return;
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(console.error);
                    };

                    const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                    
                    const detect = () => {
                        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
                           animationFrameRef.current = requestAnimationFrame(detect);
                           return;
                        }
                        barcodeDetector.detect(videoRef.current)
                            .then((barcodes: any[]) => {
                                if (barcodes.length > 0) {
                                    onScanSuccess(barcodes[0].rawValue);
                                } else {
                                   animationFrameRef.current = requestAnimationFrame(detect);
                                }
                            })
                            .catch((err: Error) => {
                                console.error("Barcode detection failed:", err);
                                animationFrameRef.current = requestAnimationFrame(detect);
                            });
                    };
                    animationFrameRef.current = requestAnimationFrame(detect);
                }
            } catch (err) {
                onError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
            }
        };

        startScan();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScanSuccess, onError]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative text-center">
                <button onClick={onClose} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-2xl z-20">&times;</button>
                <h3 className="text-xl font-bold text-brand-text mb-4">QR 코드로 체크인</h3>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover"></video>
                    <div className="absolute inset-0 border-8 border-white/50 rounded-lg"></div>
                </div>
                <p className="mt-4 text-brand-text/70">참가자의 QR 코드를 사각형 안에 맞춰주세요.</p>
            </div>
        </div>
    );
};


interface PartyHostDashboardPageProps {
  party: Party;
  setPage: (page: Page) => void;
  makers: Maker[];
  onUpdateImpact: (partyId: string, finalParticipants: number, finalItemsExchanged: number) => void;
  onUpdateParticipantStatus: (partyId: string, userId: string, newStatus: PartyParticipantStatus) => void;
}

const DashboardCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
        <h3 className="text-xl font-semibold text-brand-text mb-4 flex items-center">
            <i className={`fa-solid ${icon} mr-3 text-brand-primary`}></i>
            {title}
        </h3>
        {children}
    </div>
);

const PartyHostDashboardPage: React.FC<PartyHostDashboardPageProps> = ({ party, setPage, makers, onUpdateImpact, onUpdateParticipantStatus }) => {
    const [finalParticipants, setFinalParticipants] = useState(party.participants.length);
    const [finalItems, setFinalItems] = useState(0);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const invitationLink = `https://ot-gil.com/party/invite/${party.invitationCode}`;

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (finalItems <= 0) {
            alert('교환된 의류 수를 입력해주세요.');
            return;
        }
        onUpdateImpact(party.id, finalParticipants, finalItems);
    };

    const handleScanError = (errorMessage: string) => {
        alert(`스캔 오류: ${errorMessage}`);
        setIsScannerOpen(false);
    };

    const handleScanSuccess = (scannedData: string) => {
        setIsScannerOpen(false);
        try {
            const data = JSON.parse(scannedData);
            if (!data.party || !data.user) {
                throw new Error("유효하지 않은 QR 코드 형식입니다.");
            }
            if (data.party !== party.title) {
                alert(`잘못된 파티 QR 코드입니다.\n기대: ${party.title}\n스캔: ${data.party}`);
                return;
            }
            
            const participant = party.participants.find(p => p.nickname === data.user);
            if (!participant) {
                alert(`참가자 명단에 없는 사용자입니다: ${data.user}`);
                return;
            }

            if (participant.status === 'ATTENDED') {
                alert(`${participant.nickname}님은 이미 체크인되었습니다.`);
                return;
            }
            
            if (participant.status !== 'ACCEPTED') {
                 alert(`이 참가자는 승인된 상태가 아닙니다 (현재 상태: ${participant.status}).`);
                 return;
            }

            onUpdateParticipantStatus(party.id, participant.userId, 'ATTENDED');
            alert(`${participant.nickname}님의 체크인이 완료되었습니다!`);

        } catch (error) {
            alert(`QR 코드 처리 중 오류가 발생했습니다: ${(error as Error).message}`);
        }
    };

    const statusInfo: Record<PartyParticipantStatus, { text: string; color: string; }> = {
        PENDING: { text: '승인 대기중', color: 'bg-yellow-100 text-yellow-800' },
        ACCEPTED: { text: '참가 승인', color: 'bg-green-100 text-green-800' },
        REJECTED: { text: '참가 거절', color: 'bg-red-100 text-red-800' },
        ATTENDED: { text: '참가 완료', color: 'bg-blue-100 text-blue-800' },
    };


    return (
        <>
        {isScannerOpen && (
            <QRScannerModal 
                onClose={() => setIsScannerOpen(false)}
                onError={handleScanError}
                onScanSuccess={handleScanSuccess}
            />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
            <div>
                <button 
                    onClick={() => setPage(Page.MY_PAGE)} 
                    className="text-brand-primary hover:text-brand-primary-dark font-semibold mb-4 inline-flex items-center"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    마이페이지로 돌아가기
                </button>
                <h2 className="text-3xl font-bold tracking-tight text-brand-text">{party.title}</h2>
                <p className="text-brand-text/70 mt-1">{party.date} &middot; <span className={`font-bold ${party.status === 'UPCOMING' ? 'text-blue-600' : 'text-stone-600'}`}>{party.status}</span></p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Impact Report Section */}
                    <DashboardCard title="Impact Report" icon="fa-chart-line">
                        {party.impact ? (
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-brand-primary">{party.impact.itemsExchanged}</p>
                                    <p className="text-sm text-brand-text/80">교환된 의류</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-brand-primary">{party.impact.waterSaved.toLocaleString()}</p>
                                    <p className="text-sm text-brand-text/80">절약된 물 (L)</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-brand-primary">{party.impact.co2Reduced.toFixed(1)}</p>
                                    <p className="text-sm text-brand-text/80">절감된 CO₂ (kg)</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleReportSubmit} className="space-y-4">
                                <p className="text-sm text-brand-text/70">파티가 끝난 후, 최종 결과를 입력하여 임팩트 리포트를 생성하세요.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">최종 참여 인원</label>
                                        <input type="number" value={finalParticipants} onChange={e => setFinalParticipants(Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md border-stone-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">총 교환된 의류 수</label>
                                        <input type="number" value={finalItems} onChange={e => setFinalItems(Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md border-stone-300" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-brand-text text-white font-bold py-2 rounded-lg hover:bg-black transition-colors">리포트 생성하기</button>
                            </form>
                        )}
                    </DashboardCard>

                    {/* Participant List */}
                    <DashboardCard title={`참가자 (${party.participants.length}명)`} icon="fa-users">
                        <div className="max-h-60 overflow-y-auto pr-2">
                           <ul className="space-y-2">
                                {party.participants.map(p => {
                                    const pStatus = statusInfo[p.status] || { text: p.status, color: 'bg-stone-200 text-stone-700'};
                                    return (
                                        <li key={p.userId} className="flex items-center justify-between bg-stone-50 p-2 rounded-md">
                                            <span className="text-brand-text/90">{p.nickname}</span>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${pStatus.color}`}>{pStatus.text}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </DashboardCard>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                     <DashboardCard title="초대 및 체크인" icon="fa-share-alt">
                        <div>
                            <label className="text-sm font-medium">초대 링크</label>
                            <div className="flex mt-1">
                                <input type="text" readOnly value={invitationLink} className="w-full p-2 border rounded-l-md bg-stone-100 border-stone-300"/>
                                <button onClick={() => navigator.clipboard.writeText(invitationLink)} className="bg-brand-primary text-white px-4 rounded-r-md hover:bg-brand-primary-dark">복사</button>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <label className="text-sm font-medium">체크인 QR 코드 (참가자용 아님)</label>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otgil-party-checkin-party1" alt="Check-in QR Code" className="mx-auto mt-2 rounded-lg" />
                        </div>
                        <div className="border-t border-stone-200 mt-4 pt-4">
                            <button 
                                onClick={() => setIsScannerOpen(true)}
                                className="w-full bg-brand-secondary text-white font-bold py-2 rounded-lg hover:bg-brand-secondary-dark transition-colors flex items-center justify-center"
                            >
                                <i className="fa-solid fa-qrcode mr-2"></i>
                                QR 스캔으로 체크인
                            </button>
                        </div>
                    </DashboardCard>
                    
                    <DashboardCard title="메이커 초대하기" icon="fa-paint-brush">
                        <p className="text-sm text-brand-text/70 mb-4">파티를 더 특별하게 만들어 줄 지역 메이커를 초대해보세요.</p>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                           {makers.slice(0,2).map(maker => (
                               <div key={maker.id} className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg">
                                   <img src={maker.imageUrl} alt={maker.name} className="w-10 h-10 rounded-full object-cover"/>
                                   <div>
                                       <p className="font-semibold text-sm">{maker.name}</p>
                                       <p className="text-xs text-stone-500">{maker.specialty}</p>
                                   </div>
                                   <button className="ml-auto text-xs bg-brand-secondary text-white font-bold px-3 py-1 rounded-full hover:bg-brand-secondary-dark">초대</button>
                               </div>
                           ))}
                        </div>
                        <button onClick={() => setPage(Page.MAKERS_HUB)} className="text-sm text-brand-primary font-semibold mt-4 w-full text-center hover:underline">
                            메이커스 허브 더보기
                        </button>
                    </DashboardCard>
                </div>
            </div>
        </div>
    </>
    );
};

export default PartyHostDashboardPage;