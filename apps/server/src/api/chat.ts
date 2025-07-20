import { Router } from 'express';
import { authenticateToken } from '../services/auth';
import { geminiService } from '../services/gemini';
import { googleCalendarService } from '../services/google-calendar';
import { prisma } from '../config/database';
import type { ChatMessage, ChatResponse, AIIntent } from '@aether/shared-types';

export const chatRouter = Router();

chatRouter.use(authenticateToken);

chatRouter.post('/', async (req, res) => {
  try {
    const { message }: ChatMessage = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.accessToken) {
      return res.status(401).json({ error: 'Google Calendar access not available' });
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const systemPrompt = `You are Aether, an intelligent calendar assistant. Analyze the user's request and respond with a JSON object describing the action to be taken. Do not add any conversational text, only the JSON object.

The user's request is: "${message}"
Current date is: ${currentDate}.

Possible intents are: 'CREATE_EVENT', 'READ_EVENTS', 'UPDATE_EVENT', 'DELETE_EVENT', 'GENERAL_QUERY'.
Extract entities such as 'title', 'date', 'time', 'attendees', 'duration', 'location', 'importance', 'tags'.

Respond only with a JSON object in this format:
{
  "intent": "CREATE_EVENT",
  "entities": {
    "title": "Meeting with Jane",
    "date": "2025-07-21",
    "time": "14:00",
    "duration": "1 hour"
  }
}`;

    const aiResponse = await geminiService.processMessage(systemPrompt);
    let intent: AIIntent;

    try {
      intent = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return res.json({
        reply: "I'm sorry, I couldn't understand your request. Could you please rephrase it?"
      } as ChatResponse);
    }

    let reply = '';

    switch (intent.intent) {
      case 'CREATE_EVENT':
        try {
          if (!intent.entities.title) {
            reply = "I need more information to create the event. What should I call it?";
            break;
          }

          const startDate = parseDateTime(intent.entities.date, intent.entities.time);
          const endDate = parseEndDateTime(startDate, intent.entities.duration);

          const eventData = {
            title: intent.entities.title,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            location: intent.entities.location,
            guests: intent.entities.attendees,
            importance: intent.entities.importance,
            tags: intent.entities.tags,
          };

          const createdEvent = await googleCalendarService.createEvent(
            user.accessToken,
            eventData
          );

          if (eventData.importance || eventData.tags) {
            await prisma.event.create({
              data: {
                googleEventId: createdEvent.id,
                userId,
                importance: eventData.importance,
                tags: eventData.tags || [],
              },
            });
          }

          reply = `I've created "${intent.entities.title}" for ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}.`;
        } catch (error) {
          console.error('Error creating event:', error);
          reply = "I couldn't create the event. Please check the details and try again.";
        }
        break;

      case 'READ_EVENTS':
        try {
          const startDate = parseDateTime(intent.entities.date) || new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);

          const events = await googleCalendarService.getEvents(
            user.accessToken,
            startDate.toISOString(),
            endDate.toISOString()
          );

          if (events.length === 0) {
            reply = "You don't have any events scheduled for that time.";
          } else {
            const eventList = events.map(event => 
              `• ${event.title} at ${new Date(event.start).toLocaleTimeString()}`
            ).join('\n');
            reply = `Here are your events:\n${eventList}`;
          }
        } catch (error) {
          console.error('Error reading events:', error);
          reply = "I couldn't retrieve your events. Please try again.";
        }
        break;

      case 'GENERAL_QUERY':
        reply = "I'm Aether, your calendar assistant. I can help you create, view, update, and delete calendar events. What would you like me to help you with?";
        break;

      default:
        reply = "I understand you want to work with your calendar, but I need more specific information. Could you tell me what you'd like me to do?";
    }

    res.json({ reply } as ChatResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

function parseDateTime(date?: string, time?: string): Date {
  const today = new Date();
  
  if (!date) {
    return today;
  }

  let parsedDate: Date;
  
  if (date.toLowerCase().includes('today')) {
    parsedDate = new Date(today);
  } else if (date.toLowerCase().includes('tomorrow')) {
    parsedDate = new Date(today);
    parsedDate.setDate(parsedDate.getDate() + 1);
  } else {
    parsedDate = new Date(date);
  }

  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    parsedDate.setHours(hours, minutes, 0, 0);
  } else {
    parsedDate.setHours(9, 0, 0, 0);
  }

  return parsedDate;
}

function parseEndDateTime(startDate: Date, duration?: string): Date {
  const endDate = new Date(startDate);
  
  if (duration) {
    const durationMatch = duration.match(/(\d+)\s*(hour|minute)s?/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      if (unit === 'hour') {
        endDate.setHours(endDate.getHours() + value);
      } else if (unit === 'minute') {
        endDate.setMinutes(endDate.getMinutes() + value);
      }
    } else {
      endDate.setHours(endDate.getHours() + 1);
    }
  } else {
    endDate.setHours(endDate.getHours() + 1);
  }

  return endDate;
}