import client from './client';

export const tokenUsageApi = {
  getSummary: () => client.get('/admin/token-usage/summary'),
  getHistory: (params: any) => client.get('/admin/token-usage', { params }),
};
