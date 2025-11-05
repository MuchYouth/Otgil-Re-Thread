import React from 'react';
// FIX: The 'Event' type does not exist; it should be 'Party'.
import { Party } from '../types';

interface EventCardProps {
  event: Party;
  onSelect: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(event.id)}
      className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-brand-text truncate">{event.title}</h3>
        <p className="text-brand-text/70 text-sm mt-2">
          <i className="fa-solid fa-calendar-days mr-2 text-brand-primary"></i>
          {event.date}
        </p>
        <p className="text-brand-text/70 text-sm mt-1">
          <i className="fa-solid fa-location-dot mr-2 text-brand-primary"></i>
          {event.location}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
