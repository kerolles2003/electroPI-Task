import type { UserProfileResponse } from '@/types/api';
import { del, get, post } from './client';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  preferredLocale: 'EN' | 'AR';
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  me: () => get<UserProfileResponse>('/auth/me'),

  login: (data: LoginInput) => post<UserProfileResponse>('/auth/login', data),

  register: (data: RegisterInput) =>
    post<{ message: string; user: UserProfileResponse }>('/auth/register', data),

  logout: () => post<{ success: boolean }>('/auth/logout'),

  refresh: () => post<UserProfileResponse>('/auth/refresh'),

  verifyEmail: (otp: string) =>
    post<{ message: string }>('/auth/verify-email', { otp }),

  forgotPassword: (email: string) =>
    post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    post<{ message: string }>('/auth/reset-password', { token, password }),

  logoutAll: () => del<{ success: boolean }>('/auth/sessions'),
};
