export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  guests?: string[];
  importance?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  nagDate?: string;
  googleEventId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export interface EventCreateRequest {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  guests?: string[];
  importance?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  nagDate?: string;
}

export interface EventUpdateRequest extends Partial<EventCreateRequest> {}

export interface EventsQueryParams {
  startDate: string;
  endDate: string;
}

export interface AIIntent {
  intent: 'CREATE_EVENT' | 'READ_EVENTS' | 'UPDATE_EVENT' | 'DELETE_EVENT' | 'GENERAL_QUERY';
  entities: {
    title?: string;
    date?: string;
    time?: string;
    attendees?: string[];
    duration?: string;
    location?: string;
    importance?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  };
}