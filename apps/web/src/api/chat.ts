import { apiClient } from './client';
import type { ChatMessage, ChatResponse } from '../types/shared';

export const chatApi = {
  sendMessage: (message: string): Promise<ChatResponse> =>
    apiClient.post('/chat', { message } as ChatMessage),
};