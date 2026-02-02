/**
 * Auth helpers using NextAuth.js
 * - signIn / signOut via NextAuth
 * - signUp calls backend register
 * - getCurrentUser calls backend /users/profile (session cookie sent)
 */

import { api } from "./api";

export type Role = "STUDENT" | "TUTOR" | "ADMIN";

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
 * Sign up: create user on backend, then caller should sign in with NextAuth.
 */
export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  image?: string;
  role?: "STUDENT" | "TUTOR";
}) {
  const res = await api.post<{ success?: boolean; user?: User; message?: string }>(
    "/api/auth/register",
    {
      name: data.name,
      email: data.email,
      password: data.password,
      image: data.image,
      role: data.role ?? "STUDENT",
    }
  );

  const user = (res as { user?: User }).user ?? null;
  const success = !!res.success && !!user;
  const message = (res as { message?: string }).message || (success ? undefined : "Registration failed");

  return { success, user, message };
}

/**
 * Get current user from backend (session cookie or JWT sent with request).
 */
export async function getCurrentUser(): Promise<{ user: User | null; role: Role | null }> {
  const response = await api.get<User>("/users/profile");
  const raw = response as { success?: boolean; data?: User; user?: User };
  const user = raw.data ?? raw.user ?? null;

  if (user && typeof user === "object" && user.id) {
    return {
      user: user as User,
      role: (user as User).role as Role,
    };
  }

  return { user: null, role: null };
}
