import React from 'react';
// FIX: The 'Event' type does not exist; it should be 'Party'.
import { Party } from '../types';
import EventCard from '../components/EventCard';

interface EventsPageProps {
  events: Party[];
  onSelectEvent: (id: string) => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ events, onSelectEvent }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black tracking-tight text-brand-text sm:text-5xl">커뮤니티 이벤트</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text/70">
          옷길 커뮤니티와 함께 지속가능한 패션을 경험하고 즐겨보세요.
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/50 rounded-lg">
          <i className="fa-solid fa-calendar-xmark text-5xl text-stone-300 mb-4"></i>
          <p className="text-brand-text/60">현재 예정된 이벤트가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
