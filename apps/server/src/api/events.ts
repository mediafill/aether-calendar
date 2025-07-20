import { Router } from 'express';
import { authenticateToken } from '../services/auth';
import { googleCalendarService } from '../services/google-calendar';
import { prisma } from '../config/database';
import type { EventCreateRequest, EventUpdateRequest, EventsQueryParams } from '@aether/shared-types';

export const eventsRouter = Router();

eventsRouter.use(authenticateToken);

eventsRouter.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query as EventsQueryParams;
    const userId = req.user.userId;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.accessToken) {
      return res.status(401).json({ error: 'Google Calendar access not available' });
    }

    const googleEvents = await googleCalendarService.getEvents(
      user.accessToken,
      startDate,
      endDate
    );

    const eventIds = googleEvents.map(event => event.id);
    const aetherMetadata = await prisma.event.findMany({
      where: {
        userId,
        googleEventId: { in: eventIds },
      },
    });

    const metadataMap = new Map(
      aetherMetadata.map(event => [event.googleEventId, event])
    );

    const eventsWithMetadata = googleEvents.map(googleEvent => ({
      ...googleEvent,
      importance: metadataMap.get(googleEvent.id)?.importance || undefined,
      tags: metadataMap.get(googleEvent.id)?.tags || [],
      nagDate: metadataMap.get(googleEvent.id)?.nagDate?.toISOString() || undefined,
    }));

    res.json(eventsWithMetadata);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

eventsRouter.post('/', async (req, res) => {
  try {
    const eventData: EventCreateRequest = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.accessToken) {
      return res.status(401).json({ error: 'Google Calendar access not available' });
    }

    const googleEvent = await googleCalendarService.createEvent(
      user.accessToken,
      eventData
    );

    if (eventData.importance || eventData.tags || eventData.nagDate) {
      await prisma.event.create({
        data: {
          googleEventId: googleEvent.id,
          userId,
          importance: eventData.importance,
          tags: eventData.tags || [],
          nagDate: eventData.nagDate ? new Date(eventData.nagDate) : null,
        },
      });
    }

    res.status(201).json({
      ...googleEvent,
      importance: eventData.importance,
      tags: eventData.tags || [],
      nagDate: eventData.nagDate,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

eventsRouter.put('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventData: EventUpdateRequest = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.accessToken) {
      return res.status(401).json({ error: 'Google Calendar access not available' });
    }

    const updatedGoogleEvent = await googleCalendarService.updateEvent(
      user.accessToken,
      eventId,
      eventData
    );

    const existingMetadata = await prisma.event.findFirst({
      where: {
        googleEventId: eventId,
        userId,
      },
    });

    if (eventData.importance || eventData.tags || eventData.nagDate || existingMetadata) {
      await prisma.event.upsert({
        where: {
          googleEventId_userId: {
            googleEventId: eventId,
            userId,
          },
        },
        update: {
          importance: eventData.importance,
          tags: eventData.tags,
          nagDate: eventData.nagDate ? new Date(eventData.nagDate) : undefined,
        },
        create: {
          googleEventId: eventId,
          userId,
          importance: eventData.importance,
          tags: eventData.tags || [],
          nagDate: eventData.nagDate ? new Date(eventData.nagDate) : null,
        },
      });
    }

    res.json({
      ...updatedGoogleEvent,
      importance: eventData.importance,
      tags: eventData.tags || [],
      nagDate: eventData.nagDate,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

eventsRouter.delete('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.accessToken) {
      return res.status(401).json({ error: 'Google Calendar access not available' });
    }

    await googleCalendarService.deleteEvent(user.accessToken, eventId);

    await prisma.event.deleteMany({
      where: {
        googleEventId: eventId,
        userId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});