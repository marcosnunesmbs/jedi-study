import client from './client';

export const usersApi = {
  updateProfile: (displayName: string) =>
    client.patch('/users/profile', { displayName }),

  updatePassword: (oldPassword: string, newPassword: string) =>
    client.patch('/users/password', { oldPassword, newPassword }),
};
