import client from './client';

export const studyPathsApi = {
  generate: (subjectId: string) =>
    client.post(`/subjects/${subjectId}/study-paths/generate`),

  getActive: (subjectId: string) =>
    client.get(`/subjects/${subjectId}/study-paths/active`),

  get: (id: string) => client.get(`/study-paths/${id}`),

  getStatus: (id: string) => client.get(`/study-paths/${id}/status`),
};
