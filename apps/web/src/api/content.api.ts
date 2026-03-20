import client from './client';
import { useAuthStore } from '../store/auth.store';

export const contentApi = {
  generate: (phaseId: string, contentType = 'EXPLANATION', customPrompt?: string, topic?: string) =>
    client.post(`/phases/${phaseId}/content/generate`, { contentType, customPrompt, topic }),

  get: (id: string) => client.get(`/content/${id}`),

  rebuild: (id: string) => client.post(`/content/${id}/rebuild`),

  streamUrl: (id: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const token = useAuthStore.getState().token;
    return `${baseUrl}/content/${id}/stream?token=${token}`;
  },
};
