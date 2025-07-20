import { apiClient } from './client';
import type { ChatMessage, ChatResponse } from '@aether/shared-types';

export const chatApi = {
  sendMessage: (message: string): Promise<ChatResponse> =>
    apiClient.post('/chat', { message } as ChatMessage),
};