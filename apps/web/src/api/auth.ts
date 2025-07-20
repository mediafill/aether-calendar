import { apiClient } from './client';
import type { AuthResponse } from '@aether/shared-types';

export const authApi = {
  googleAuth: (code: string): Promise<AuthResponse> =>
    apiClient.post('/auth/google', { code }),
};