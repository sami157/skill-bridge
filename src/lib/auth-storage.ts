/**
 * Token-based auth: store token and user in localStorage.
 * Use getAuthToken() in API calls (Authorization: Bearer <token>).
 * Use getAuthUser() for UI (name, role, etc.).
 */

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

const AUTH_CHANGE_EVENT = "auth-change";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  emailVerified?: boolean;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Reusable helper: get token for API calls. Attach as Authorization: Bearer <token>. */
export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/** Get stored user JSON. */
export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Store token and user after successful login. */
export function setAuth(token: string, user: AuthUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/** Clear token and user on logout. */
export function clearAuth(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/** Subscribe to auth changes (login/logout). */
export function onAuthChange(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, callback);
}
