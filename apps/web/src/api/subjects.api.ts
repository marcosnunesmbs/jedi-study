import client from './client';

export const subjectsApi = {
  list: () => client.get('/subjects'),

  get: (id: string) => client.get(`/subjects/${id}`),

  create: (data: { title: string; description?: string; skillLevel?: string; goals?: string[] }) =>
    client.post('/subjects', data),

  delete: (id: string) => client.delete(`/subjects/${id}`),
};
