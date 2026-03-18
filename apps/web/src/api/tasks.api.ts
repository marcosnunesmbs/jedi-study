import client from './client';

export const tasksApi = {
  get: (id: string) => client.get(`/tasks/${id}`),

  submit: (id: string, content: string, contentType = 'TEXT') =>
    client.post(`/tasks/${id}/submit`, { content, contentType }),

  getSubmissionStatus: (submissionId: string) =>
    client.get(`/submissions/${submissionId}/status`),

  getAnalysis: (submissionId: string) =>
    client.get(`/submissions/${submissionId}/analysis`),
};
