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
 * Better Auth returns { user, session } on success. We treat presence of user as success.
 */
export async function signIn(email: string, password: string) {
  const res = await api.post<Record<string, unknown>>('/api/auth/sign-in/email', {
    email,
    password,
  });

  const user = (res as { user?: User; data?: { user?: User } }).user ?? res.data?.user;
  const success = !!user || res.success === true;
  const message = (res as { message?: string }).message || (success ? undefined : 'Login failed');

  return { success, user: user ?? null, message };
}

/**
 * Sign up with email and password.
 * Better Auth returns { user, session } on success. Role is passed and validated on backend.
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

  const user = (res as { user?: User; data?: { user?: User } }).user ?? res.data?.user;
  const success = !!user || res.success === true;
  const message = (res as { message?: string }).message || (success ? undefined : 'Registration failed');

  return { success, user: user ?? null, message };
}

/**
 * Sign out current session
 */
export async function signOut() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb_auth_user');
    }
  } catch {
    // ignore
  }
  return api.post('/api/auth/sign-out');
}

/**
 * Get current user profile (used to check auth status)
 * Backend returns { success: true, data: user }. Requires session cookie.
 */
export async function getCurrentUser(): Promise<{ user: User | null; role: Role | null }> {
  const response = await api.get<User>('/users/profile');

  const raw = response as { success?: boolean; data?: User; user?: User };
  const user = raw.data ?? raw.user ?? null;

  if (user && typeof user === 'object' && user.id) {
    return {
      user: user as User,
      role: (user as User).role as Role,
    };
  }

  return { user: null, role: null };
}
