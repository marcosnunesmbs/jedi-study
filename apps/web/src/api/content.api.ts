import client from './client';
import { useAuthStore } from '../store/auth.store';

export const contentApi = {
  generate: (phaseId: string, contentType = 'EXPLANATION', customPrompt?: string) =>
    client.post(`/phases/${phaseId}/content/generate`, { contentType, customPrompt }),

  get: (id: string) => client.get(`/content/${id}`),

  streamUrl: (id: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const token = useAuthStore.getState().token;
    return `${baseUrl}/content/${id}/stream?token=${token}`;
  },
};
