import { groupBy } from 'lodash';
import { useCalendarStore } from '../stores/calendar';
import EventCard from './EventCard';
import type { Event } from '@aether/shared-types';

interface AgendaViewProps {
  events: Event[];
}

function AgendaView({ events }: AgendaViewProps) {
  const { currentDate } = useCalendarStore();

  const getDaysInRange = () => {
    const days = [];
    const startDate = new Date(currentDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const eventsByDate = groupBy(events, (event) => 
    formatDateKey(new Date(event.start))
  );

  const days = getDaysInRange();

  return (
    <div className="agenda-view">
      {days.map((date) => {
        const dateKey = formatDateKey(date);
        const dayEvents = eventsByDate[dateKey] || [];
        const isToday = date.toDateString() === new Date().toDateString();

        return (
          <div key={dateKey}>
            <div className="agenda-date" style={{ 
              color: isToday ? '#4285f4' : '#202124',
              fontWeight: isToday ? '700' : '600'
            }}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              {isToday && ' (Today)'}
            </div>
            
            {dayEvents.length === 0 ? (
              <div style={{ 
                padding: '16px', 
                color: '#9aa0a6', 
                fontStyle: 'italic',
                marginBottom: '24px'
              }}>
                No events scheduled
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                {dayEvents
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
              </div>
            )}
          </div>
        );
      })}

      {events.length === 0 && (
        <div className="no-events">
          No events found for this period.
          Try asking Aether to schedule something for you!
        </div>
      )}
    </div>
  );
}

export default AgendaView;