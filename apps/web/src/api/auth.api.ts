import client from './client';

export const authApi = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),

  register: (email: string, password: string, displayName?: string) =>
    client.post('/auth/register', { email, password, displayName }),

  me: () => client.get('/auth/me'),
};
