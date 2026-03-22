import client from './client';

export const phasesApi = {
  get: (id: string) => client.get(`/phases/${id}`),
  generateTasks: (id: string) => client.post(`/phases/${id}/generate-tasks`),
};
