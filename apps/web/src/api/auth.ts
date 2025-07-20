import { apiClient } from './client';
import type { AuthResponse } from '../types/shared';

export const authApi = {
  googleAuth: (code: string): Promise<AuthResponse> =>
    apiClient.post('/auth/google', { code }),
};