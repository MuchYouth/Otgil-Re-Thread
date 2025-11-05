import React from 'react';

interface QRCodeModalProps {
  partyTitle: string;
  userName: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ partyTitle, userName, onClose }) => {
  // Generate a unique string for the QR code
  const qrData = JSON.stringify({ party: partyTitle, user: userName, timestamp: Date.now() });
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative text-center">
        <button onClick={onClose} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-2xl z-20">&times;</button>
        <h3 className="text-xl font-bold text-brand-text mb-2">참가 QR 코드</h3>
        <p className="text-brand-text/70 mb-4">파티 입장 시 스태프에게 보여주세요.</p>
        <img src={qrCodeUrl} alt="Participation QR Code" className="mx-auto rounded-lg border-4 border-white shadow-md" />
        <div className="mt-6 text-left bg-stone-50 p-4 rounded-lg">
          <p><span className="font-semibold">파티:</span> {partyTitle}</p>
          <p><span className="font-semibold">참가자:</span> {userName}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
