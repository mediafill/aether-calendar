import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isDevMode = process.env.DISABLE_GOOGLE_APIS === 'true';

  constructor() {
    if (!this.isDevMode) {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  async processMessage(prompt: string): Promise<string> {
    if (this.isDevMode) {
      // Return mock AI response for development
      console.log('Mock AI prompt:', prompt);
      
      // Simple keyword-based mock responses
      if (prompt.toLowerCase().includes('create') || prompt.toLowerCase().includes('schedule')) {
        return JSON.stringify({
          intent: 'CREATE_EVENT',
          entities: {
            title: 'Mock Meeting',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            duration: '1 hour'
          }
        });
      } else if (prompt.toLowerCase().includes('view') || prompt.toLowerCase().includes('show')) {
        return JSON.stringify({
          intent: 'READ_EVENTS',
          entities: {
            date: new Date().toISOString().split('T')[0]
          }
        });
      } else {
        return JSON.stringify({
          intent: 'GENERAL_QUERY',
          entities: {}
        });
      }
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to process message with AI');
    }
  }
}

export const geminiService = new GeminiService();