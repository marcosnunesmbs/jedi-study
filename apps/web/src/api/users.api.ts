import client from './client';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export const usersApi = {
  updateProfile: (displayName: string) =>
    client.patch('/users/profile', { displayName }),

  updatePassword: (oldPassword: string, newPassword: string) =>
    client.patch('/users/password', { oldPassword, newPassword }),

  admin: {
    list: (params: { page?: number; limit?: number; search?: string; role?: string; withDeleted?: boolean }) =>
      client.get<UserListResponse>('/admin/users', { params }),

    create: (data: { email: string; displayName?: string; role?: string }) =>
      client.post<{ user: User; password: string }>('/admin/users', data),

    resetPassword: (id: string) =>
      client.patch<{ password: string }>(`/admin/users/${id}/reset-password`),

    remove: (id: string) =>
      client.delete(`/admin/users/${id}`),

    removeBulk: (ids: string[]) =>
      client.delete('/admin/users/bulk', { data: { ids } }),

    restore: (id: string) =>
      client.patch(`/admin/users/${id}/restore`),
  },
};
