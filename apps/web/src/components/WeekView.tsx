import React from 'react';
import { useCalendarStore } from '../stores/calendar';
import type { Event } from '../types/shared';

interface WeekViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
}

function WeekView({ events, onEventClick, onDateClick }: WeekViewProps) {
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
      <div className="week-header-row">
        <div className="time-column">Time</div>
        {weekDays.map(date => {
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div
              key={date.toISOString()}
              className={`week-day-header ${isToday ? 'today' : ''}`}
            >
              <div className="week-day-name">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="week-day-number">{date.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="week-grid">
        {hours.map(hour => (
          <React.Fragment key={`row-${hour}`}>
            <div className="time-slot">
              {hour % 2 === 0 ? formatHour(hour) : ''}
            </div>
            
            {weekDays.map(date => {
              const cellEvents = getEventsForDateAndHour(date, hour);
              
              return (
                <div 
                  key={`${date.toISOString()}-${hour}`} 
                  className="week-day-column"
                  onClick={() => {
                    const clickedDate = new Date(date);
                    clickedDate.setHours(hour, 0, 0, 0);
                    onDateClick?.(clickedDate);
                  }}
                >
                  {cellEvents.map(event => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    const startHour = eventStart.getHours();
                    const durationHours = eventEnd.getTime() - eventStart.getTime();
                    const durationPixels = (durationHours / (1000 * 60 * 60)) * 60;
                    
                    if (startHour === hour) {
                      return (
                        <div
                          key={event.id}
                          className="week-event"
                          style={{
                            height: `${Math.max(durationPixels, 20)}px`,
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
                          title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div style={{ fontWeight: '600', fontSize: '11px', marginBottom: '2px' }}>
                            {event.title}
                          </div>
                          <div style={{ fontSize: '10px', opacity: 0.9 }}>
                            {eventStart.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
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
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default WeekView;