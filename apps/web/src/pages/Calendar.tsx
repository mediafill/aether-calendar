import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCalendarStore } from '../stores/calendar';
import { useAuthStore } from '../stores/auth';
import { eventsApi } from '../api/events';
import CalendarHeader from '../components/CalendarHeader';
import AgendaView from '../components/AgendaView';
import MonthView from '../components/MonthView';
import WeekView from '../components/WeekView';
import AetherChat from '../components/AetherChat';

function Calendar() {
  const { user, logout } = useAuthStore();
  const { currentDate, view } = useCalendarStore();
  const [showChat, setShowChat] = useState(false);
  

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    } else if (view === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
    } else {
      end.setDate(end.getDate() + 7);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const { startDate, endDate } = getDateRange();


  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', startDate, endDate],
    queryFn: () => eventsApi.getEvents(startDate, endDate),
    retry: false,
    // Add mock events fallback for testing (when API is disabled)
    initialData: import.meta.env.VITE_GOOGLE_CLIENT_ID === 'disabled-for-development' ? [
      {
        id: 'mock-1',
        title: 'Team Meeting',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        description: 'Weekly team sync meeting',
        location: 'Conference Room A',
        guests: ['john@company.com', 'jane@company.com'],
        importance: 'medium' as const,
        tags: ['work', 'meeting'],
        googleEventId: 'mock-1',
        userId: 'dev-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mock-2',
        title: 'Project Review',
        start: new Date(Date.now() + 86400000).toISOString(),
        end: new Date(Date.now() + 86400000 + 7200000).toISOString(),
        description: 'Review project progress and next steps',
        location: '',
        guests: [],
        importance: 'high' as const,
        tags: ['project', 'review'],
        googleEventId: 'mock-2',
        userId: 'dev-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mock-3',
        title: 'Lunch with Client',
        start: new Date(Date.now() + 172800000).toISOString(),
        end: new Date(Date.now() + 172800000 + 3600000).toISOString(),
        description: 'Business lunch discussion',
        location: 'Downtown Restaurant',
        guests: ['client@example.com'],
        importance: 'urgent' as const,
        tags: ['client', 'business'],
        googleEventId: 'mock-3',
        userId: 'dev-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] : [],
  });

  const renderCalendarView = () => {
    switch (view) {
      case 'month':
        return <MonthView events={events} />;
      case 'week':
        return <WeekView events={events} />;
      default:
        return <AgendaView events={events} />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">Aether Calendar</div>
            <div className="user-menu">
              <span>Welcome, {user?.name}</span>
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="user-avatar"
                />
              )}
              <button
                className="btn btn-secondary"
                onClick={logout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <CalendarHeader />
        
        {error && (
          <div className="error">
            Failed to load events: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}

        {isLoading ? (
          <div className="loading">Loading events...</div>
        ) : (
          renderCalendarView()
        )}
      </main>

      {showChat ? (
        <AetherChat onClose={() => setShowChat(false)} />
      ) : (
        <button
          className="fab"
          onClick={() => setShowChat(true)}
          title="Open Aether Assistant"
        >
          💬
        </button>
      )}
    </div>
  );
}

export default Calendar;