import { useCalendarStore } from '../stores/calendar';
import type { Event } from '../types/shared';

interface MonthViewProps {
  events: Event[];
}

function MonthView({ events }: MonthViewProps) {
  const { currentDate } = useCalendarStore();

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => 
      event.start.split('T')[0] === dateString
    );
  };

  const days = getDaysInMonth();
  const today = new Date();

  return (
    <div className="month-view">
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="week-header">
            {day}
          </div>
        ))}
        
        {days.map(({ date, isCurrentMonth }, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          
          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
            >
              <div className="day-number">
                {date.getDate()}
              </div>
              
              <div className="day-events">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="day-event"
                    style={{
                      backgroundColor: (() => {
                        switch (event.importance) {
                          case 'urgent': return '#ea4335';
                          case 'high': return '#fbbc04';
                          case 'medium': return '#34a853';
                          case 'low': return '#9aa0a6';
                          default: return '#4285f4';
                        }
                      })(),
                    }}
                    title={`${event.title} - ${new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                  >
                    {event.title}
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div
                    className="day-event"
                    style={{ backgroundColor: '#5f6368', fontSize: '11px' }}
                  >
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;