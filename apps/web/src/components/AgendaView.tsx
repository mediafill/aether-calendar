import { groupBy } from 'lodash';
import { useCalendarStore } from '../stores/calendar';
import type { Event } from '../types/shared';

interface AgendaViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
}

function AgendaView({ events, onEventClick, onDateClick }: AgendaViewProps) {
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
            
            <div className="agenda-events">
              {dayEvents.length === 0 ? (
                <div style={{ 
                  padding: '24px', 
                  color: '#9aa0a6', 
                  fontStyle: 'italic',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  No events scheduled
                </div>
              ) : (
                dayEvents
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .map((event) => {
                    const eventStart = new Date(event.start);
                    
                    return (
                      <div 
                        key={event.id} 
                        className="agenda-event"
                        onClick={() => onEventClick?.(event)}
                      >
                        <div 
                          className={`agenda-importance ${event.importance || 'medium'}`}
                        />
                        <div className="agenda-time">
                          {eventStart.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                        <div className="agenda-content">
                          <div className="agenda-title">{event.title}</div>
                          <div className="agenda-details">
                            {event.description && (
                              <div style={{ marginBottom: '4px' }}>{event.description}</div>
                            )}
                            {event.location && (
                              <div style={{ color: '#5f6368', fontSize: '12px' }}>
                                📍 {event.location}
                              </div>
                            )}
                            {event.guests && event.guests.length > 0 && (
                              <div style={{ color: '#5f6368', fontSize: '12px', marginTop: '4px' }}>
                                👥 {event.guests.length} guest{event.guests.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        );
      })}

      {events.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No events scheduled</h3>
          <p>Your calendar is clear for the next 7 days.<br/>Try asking Aether to schedule something for you!</p>
          <button 
            className="btn btn-primary"
            onClick={() => onDateClick?.(new Date())}
          >
            Create New Event
          </button>
        </div>
      )}
    </div>
  );
}

export default AgendaView;