import { apiClient } from './client';
import type { Event, EventCreateRequest, EventUpdateRequest } from '../types/shared';

export const eventsApi = {
  getEvents: (startDate: string, endDate: string): Promise<Event[]> =>
    apiClient.get(`/events?startDate=${startDate}&endDate=${endDate}`),
  
  createEvent: (data: EventCreateRequest): Promise<Event> =>
    apiClient.post('/events', data),
    
  updateEvent: (id: string, data: EventUpdateRequest): Promise<Event> =>
    apiClient.put(`/events/${id}`, data),
    
  deleteEvent: (id: string): Promise<void> =>
    apiClient.delete(`/events/${id}`),
};