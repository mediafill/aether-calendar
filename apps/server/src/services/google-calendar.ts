import { google } from 'googleapis';
import type { EventCreateRequest, EventUpdateRequest } from '@aether/shared-types';

class GoogleCalendarService {
  private getCalendarClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async getEvents(accessToken: string, startDate: string, endDate: string) {
    const calendar = this.getCalendarClient(accessToken);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []).map(event => ({
      id: event.id!,
      title: event.summary || 'Untitled Event',
      start: event.start?.dateTime || event.start?.date!,
      end: event.end?.dateTime || event.end?.date!,
      description: event.description || '',
      location: event.location || '',
      guests: event.attendees?.map(attendee => attendee.email!).filter(Boolean) || [],
      googleEventId: event.id!,
    }));
  }

  async createEvent(accessToken: string, eventData: EventCreateRequest) {
    const calendar = this.getCalendarClient(accessToken);

    const event = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.start,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'America/New_York',
      },
      attendees: eventData.guests?.map(email => ({ email })),
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    const createdEvent = response.data;
    return {
      id: createdEvent.id!,
      title: createdEvent.summary || 'Untitled Event',
      start: createdEvent.start?.dateTime || createdEvent.start?.date!,
      end: createdEvent.end?.dateTime || createdEvent.end?.date!,
      description: createdEvent.description || '',
      location: createdEvent.location || '',
      guests: createdEvent.attendees?.map(attendee => attendee.email!).filter(Boolean) || [],
      googleEventId: createdEvent.id!,
    };
  }

  async updateEvent(accessToken: string, eventId: string, eventData: EventUpdateRequest) {
    const calendar = this.getCalendarClient(accessToken);

    const updateData: any = {};
    
    if (eventData.title !== undefined) updateData.summary = eventData.title;
    if (eventData.description !== undefined) updateData.description = eventData.description;
    if (eventData.location !== undefined) updateData.location = eventData.location;
    if (eventData.start !== undefined) {
      updateData.start = {
        dateTime: eventData.start,
        timeZone: 'America/New_York',
      };
    }
    if (eventData.end !== undefined) {
      updateData.end = {
        dateTime: eventData.end,
        timeZone: 'America/New_York',
      };
    }
    if (eventData.guests !== undefined) {
      updateData.attendees = eventData.guests.map(email => ({ email }));
    }

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: updateData,
    });

    const updatedEvent = response.data;
    return {
      id: updatedEvent.id!,
      title: updatedEvent.summary || 'Untitled Event',
      start: updatedEvent.start?.dateTime || updatedEvent.start?.date!,
      end: updatedEvent.end?.dateTime || updatedEvent.end?.date!,
      description: updatedEvent.description || '',
      location: updatedEvent.location || '',
      guests: updatedEvent.attendees?.map(attendee => attendee.email!).filter(Boolean) || [],
      googleEventId: updatedEvent.id!,
    };
  }

  async deleteEvent(accessToken: string, eventId: string) {
    const calendar = this.getCalendarClient(accessToken);
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  }
}

export const googleCalendarService = new GoogleCalendarService();