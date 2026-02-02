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
 * Sign in with email and password.
 * Treat presence of { token, user } as success even if backend does not return a `success` flag.
 */
export async function signIn(email: string, password: string) {
  const res = await api.post<Record<string, unknown>>('/api/auth/sign-in/email', {
    email,
    password,
  });

  // Normalize response
  const token = (res as { token?: string; data?: { token?: string } }).token ?? res.data?.token;
  const user = (res as { user?: User; data?: { user?: User } }).user ?? res.data?.user;
  const success = !!token && !!user;
  const message = res.message || (success ? undefined : 'Login failed');

  return { success, token, user, message };
}

/**
 * Sign up with email and password.
 * Treat presence of { token, user } as success even if backend does not return a `success` flag.
 */
export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  image?: string;
  role?: 'STUDENT' | 'TUTOR';
}) {
  const res = await api.post<Record<string, unknown>>('/api/auth/sign-up/email', {
    name: data.name,
    email: data.email,
    password: data.password,
    image: data.image,
    role: data.role || 'STUDENT',
  });

  const token = (res as { token?: string; data?: { token?: string } }).token ?? res.data?.token;
  const user = (res as { user?: User; data?: { user?: User } }).user ?? res.data?.user;
  const success = !!token && !!user;
  const message = res.message || (success ? undefined : 'Registration failed');

  return { success, token, user, message };
}

/**
 * Sign out current session
 */
export async function signOut() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb_auth_token');
      localStorage.removeItem('sb_auth_user');
      window.dispatchEvent(new Event('sb-auth-updated'));
    }
  } catch {
    // ignore
  }
  return api.post('/api/auth/sign-out');
}

/**
 * Get current user profile (used to check auth status)
 * This endpoint requires authentication and returns the current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; role: Role | null }> {
  const response = await api.get<User>('/users/profile');

  // Backend might not include a `success` flag; prefer data presence.
  const user = (response as { user?: User; data?: User }).user ?? response.data ?? null;

  if (user) {
    return {
      user,
      role: (user as User).role,
    };
  }

  return { user: null, role: null };
}
