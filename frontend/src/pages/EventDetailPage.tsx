import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
// FIX: The 'Event' type does not exist; it should be 'Party'.
import { Party, Page } from '../types';
import EnvironmentalReceipt from '../components/EnvironmentalReceipt';

interface EventDetailPageProps {
  event: Party;
  setPage: (page: Page) => void;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ event, setPage }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#f5f5f4',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `otgil-event-receipt-${event.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading event receipt:', error);
      alert('Failed to download receipt.');
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button 
        onClick={() => setPage(Page.TWENTY_ONE_PERCENT_PARTY)} 
        className="text-brand-primary hover:text-brand-primary-dark font-semibold mb-6 inline-flex items-center"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i>
        이벤트 캘린더로 돌아가기
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-8">
          <h1 className="text-3xl font-bold text-brand-text mb-2">{event.title}</h1>
          <div className="flex items-center space-x-6 text-brand-text/80 mb-6">
            <p>
              <i className="fa-solid fa-calendar-days mr-2 text-brand-primary"></i>
              {event.date}
            </p>
            <p>
              <i className="fa-solid fa-location-dot mr-2 text-brand-primary"></i>
              {event.location}
            </p>
          </div>
          <p className="text-lg text-brand-text/90 leading-relaxed mb-8">{event.description}</p>
          
          <div className="bg-stone-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-brand-text mb-4">이벤트 상세 정보</h3>
            <ul className="space-y-3">
              {event.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <i className="fa-solid fa-circle-check text-brand-primary/80 mt-1 mr-3"></i>
                  <span className="text-brand-text/90">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-stone-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-brand-text mb-4 text-center">이벤트 임팩트 리포트</h3>
            <div className="flex flex-col items-center gap-6">
                <div className="bg-stone-100 p-4 rounded-lg">
                    <EnvironmentalReceipt
                        ref={receiptRef}
                        isEvent={true}
                        eventTitle={event.title}
                        // FIX: The 'Party' type has an optional 'impact' property, not 'impactStats'.
                        // Provide a default empty stats object to avoid runtime errors if impact is undefined.
                        stats={event.impact || { itemsExchanged: 0, waterSaved: 0, co2Reduced: 0 }}
                    />
                </div>
                <button
                    onClick={handleDownloadReceipt}
                    className="bg-brand-text text-white font-bold py-2 px-6 rounded-full hover:bg-black transition-all duration-300 shadow-md flex items-center"
                >
                    <i className="fa-solid fa-download mr-2"></i>
                    리포트 이미지로 저장하기
                </button>
            </div>
          </div>


          <button className="mt-8 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary-dark transition-colors shadow-md">
            이벤트 참여 신청
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
