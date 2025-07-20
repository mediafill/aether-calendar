import { useCalendarStore } from '../stores/calendar';
import type { Event } from '@aether/shared-types';

interface WeekViewProps {
  events: Event[];
}

function WeekView({ events }: WeekViewProps) {
  const { currentDate } = useCalendarStore();

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const eventDate = eventStart.toISOString().split('T')[0];
      
      return eventDate === dateString &&
             eventStart.getHours() <= hour &&
             eventEnd.getHours() > hour;
    });
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const weekDays = getWeekDays();
  const hours = getHours();
  const today = new Date();

  return (
    <div className="week-view">
      <div className="week-header"></div>
      {weekDays.map(date => {
        const isToday = date.toDateString() === today.toDateString();
        return (
          <div
            key={date.toISOString()}
            className="week-header"
            style={{
              color: isToday ? '#4285f4' : '#202124',
              fontWeight: isToday ? '700' : '600',
            }}
          >
            <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div style={{ fontSize: '18px' }}>{date.getDate()}</div>
          </div>
        );
      })}

      {hours.map(hour => (
        <div key={`row-${hour}`} style={{ display: 'contents' }}>
          <div className="week-time">
            {formatHour(hour)}
          </div>
          
          {weekDays.map(date => {
            const cellEvents = getEventsForDateAndHour(date, hour);
            
            return (
              <div key={`${date.toISOString()}-${hour}`} className="week-cell">
                {cellEvents.map(event => {
                  const eventStart = new Date(event.start);
                  const eventEnd = new Date(event.end);
                  const startHour = eventStart.getHours();
                  const endHour = eventEnd.getHours();
                  const duration = endHour - startHour;
                  
                  if (startHour === hour) {
                    return (
                      <div
                        key={event.id}
                        className="week-event"
                        style={{
                          height: `${duration * 60}px`,
                          backgroundColor: (() => {
                            switch (event.importance) {
                              case 'urgent': return '#ea4335';
                              case 'high': return '#fbbc04';
                              case 'medium': return '#34a853';
                              case 'low': return '#9aa0a6';
                              default: return '#4285f4';
                            }
                          })(),
                          top: `${(eventStart.getMinutes() / 60) * 60}px`,
                        }}
                        title={event.description || event.title}
                      >
                        <div style={{ fontWeight: '600' }}>{event.title}</div>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>
                          {eventStart.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default WeekView;