import { useCalendarStore } from '../stores/calendar';

function CalendarHeader() {
  const { currentDate, view, setView, goToPrevious, goToNext, goToToday } = useCalendarStore();

  const formatDate = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } else if (view === 'week') {
      const start = new Date(currentDate);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="calendar-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>
            {formatDate()}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={goToPrevious}>
              ←
            </button>
            <button className="btn btn-secondary" onClick={goToNext}>
              →
            </button>
            <button className="btn btn-secondary" onClick={goToToday}>
              Today
            </button>
          </div>
        </div>

        <div className="calendar-views">
          <button
            className={`view-btn ${view === 'agenda' ? 'active' : ''}`}
            onClick={() => setView('agenda')}
          >
            Agenda
          </button>
          <button
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarHeader;