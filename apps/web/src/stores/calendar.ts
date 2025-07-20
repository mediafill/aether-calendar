import { create } from 'zustand';

type CalendarView = 'month' | 'week' | 'agenda';

interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  view: 'agenda',
  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
  goToToday: () => set({ currentDate: new Date() }),
  goToPrevious: () => {
    const { currentDate, view } = get();
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    
    set({ currentDate: newDate });
  },
  goToNext: () => {
    const { currentDate, view } = get();
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    set({ currentDate: newDate });
  },
}));