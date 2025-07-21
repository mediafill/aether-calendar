import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCalendarStore } from '../stores/calendar';
import { useAuthStore } from '../stores/auth';
import { eventsApi } from '../api/events';
import CalendarHeader from '../components/CalendarHeader';
import AgendaView from '../components/AgendaView';
import MonthView from '../components/MonthView';
import WeekView from '../components/WeekView';
import AetherChat from '../components/AetherChat';
import EventModal from '../components/EventModal';
import type { Event, EventCreateRequest } from '../types/shared';

function Calendar() {
  const { user, logout } = useAuthStore();
  const { currentDate, view } = useCalendarStore();
  const [showChat, setShowChat] = useState(false);
  const [eventModal, setEventModal] = useState<{
    isOpen: boolean;
    event?: Event | null;
    selectedDate?: Date;
  }>({ isOpen: false });

  const queryClient = useQueryClient();
  

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

  // Mutations for event operations
  const createEventMutation = useMutation({
    mutationFn: (eventData: EventCreateRequest) => eventsApi.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Event> & { id: string }) => 
      eventsApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Failed to update event:', error);
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Failed to delete event:', error);
    }
  });


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

  // Event handlers
  const handleCreateEvent = () => {
    setEventModal({ isOpen: true, selectedDate: new Date() });
  };

  const handleEditEvent = (event: Event) => {
    setEventModal({ isOpen: true, event });
  };

  const handleSaveEvent = (eventData: Partial<Event>) => {
    if (eventModal.event) {
      // Update existing event
      updateEventMutation.mutate({ id: eventModal.event.id, ...eventData });
    } else {
      // Create new event - ensure required fields are present
      const createData: EventCreateRequest = {
        title: eventData.title || '',
        start: eventData.start || new Date().toISOString(),
        end: eventData.end || new Date().toISOString(),
        description: eventData.description,
        location: eventData.location,
        guests: eventData.guests,
        importance: eventData.importance,
        tags: eventData.tags,
        nagDate: eventData.nagDate
      };
      createEventMutation.mutate(createData);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
      setEventModal({ isOpen: false });
    }
  };

  const handleCloseModal = () => {
    setEventModal({ isOpen: false });
  };

  const handleDateClick = (date: Date) => {
    setEventModal({ isOpen: true, selectedDate: date });
  };

  const renderCalendarView = () => {
    const viewProps = {
      events,
      onEventClick: handleEditEvent,
      onDateClick: handleDateClick
    };

    switch (view) {
      case 'month':
        return <MonthView {...viewProps} />;
      case 'week':
        return <WeekView {...viewProps} />;
      default:
        return <AgendaView {...viewProps} />;
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

      {!showChat && (
        <button
          className="create-event-btn"
          onClick={handleCreateEvent}
          title="Create New Event"
        >
          +
        </button>
      )}

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

      <EventModal
        isOpen={eventModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={eventModal.event}
        selectedDate={eventModal.selectedDate}
      />
    </div>
  );
}

export default Calendar;