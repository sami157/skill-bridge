/**
 * Auth helpers for managing authentication state
 * Better Auth uses cookies for session management, so we primarily work with API calls
 */

import { api } from './api';

export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: Role;
  active: boolean;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User | null;
  role: Role | null;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  return api.post<{ user: User }>('/api/auth/sign-in/email', {
    email,
    password,
  });
}

/**
 * Sign up with email and password
 */
export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  image?: string;
}) {
  return api.post<{ user: User }>('/api/auth/sign-up/email', {
    name: data.name,
    email: data.email,
    password: data.password,
    image: data.image,
  });
}

/**
 * Sign out current session
 */
export async function signOut() {
  return api.post('/api/auth/sign-out');
}

/**
 * Get current user profile (used to check auth status)
 * This endpoint requires authentication and returns the current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; role: Role | null }> {
  const response = await api.get<User>('/users/profile');
  
  if (response.success && response.data) {
    return {
      user: response.data,
      role: response.data.role,
    };
  }
  
  return { user: null, role: null };
}
