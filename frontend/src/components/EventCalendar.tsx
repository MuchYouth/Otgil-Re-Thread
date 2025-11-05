import React from 'react';
// FIX: The 'Event' type does not exist; it should be 'Party'.
import { Party } from '../types';

interface EventCalendarProps {
  events: Party[];
  onSelectEvent: (id: string) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onSelectEvent }) => {
  // For simplicity, we'll display a static calendar for Nov 2023.
  // A real implementation would use a library or more complex date logic.
  const year = 2023;
  const month = 10; // 0-indexed for November
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const eventsByDay: { [key: number]: Party[] } = {};
  events.forEach(event => {
    const eventDate = new Date(event.date.replace('년', '-').replace('월', '-').replace('일', ''));
    if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
        const day = eventDate.getDate();
        if (!eventsByDay[day]) {
            eventsByDay[day] = [];
        }
        eventsByDay[day].push(event);
    }
  });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border-r border-b border-stone-200"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = eventsByDay[day] || [];
    calendarDays.push(
      <div key={day} className="p-2 border-r border-b border-stone-200 min-h-[120px] flex flex-col">
        <span className="font-semibold text-sm">{day}</span>
        <div className="mt-1 space-y-1 overflow-y-auto">
            {dayEvents.map(event => (
                <button
                    key={event.id}
                    onClick={() => onSelectEvent(event.id)}
                    className="w-full text-left text-xs bg-brand-secondary/20 text-teal-900 p-1 rounded hover:bg-brand-secondary/30 transition-colors truncate"
                >
                    {event.title}
                </button>
            ))}
        </div>
      </div>
    );
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-stone-800">2023년 11월</h3>
            {/* Navigation for other months could be added here */}
        </div>
      <div className="grid grid-cols-7 border-t border-l border-stone-200">
        {weekdays.map(day => (
          <div key={day} className="text-center font-bold text-sm py-2 border-r border-b border-stone-200 bg-stone-50">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>
    </div>
  );
};

export default EventCalendar;
