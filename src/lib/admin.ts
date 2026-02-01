/**
 * API functions for admin operations
 * Note: Some endpoints (like /admin/users) are not explicitly documented in API.md
 * but are implemented as requested
 */

import { api } from './api';
import type { User } from './auth';
import type { Booking, Category, Subject } from './types';

export interface AdminUsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface AdminUserUpdate {
  active?: boolean;
}

export interface AdminUserUpdateResponse {
  success: boolean;
  data?: User;
  message?: string;
}

/**
 * Fetch all users (Admin only)
 * Note: This endpoint is not explicitly documented in API.md
 */
export async function fetchAdminUsers(): Promise<AdminUsersResponse> {
  const response = await api.get<User[]>('/admin/users');
  return {
    success: response.success,
    data: response.data || [],
    message: response.message,
  };
}

/**
 * Update user (ban/unban) (Admin only)
 * Note: This endpoint is not explicitly documented in API.md
 */
export async function updateAdminUser(userId: string, update: AdminUserUpdate): Promise<AdminUserUpdateResponse> {
  const response = await api.patch<User>(`/admin/users/${userId}`, update);
  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}

/**
 * Fetch all bookings (Admin only)
 * Uses GET /bookings - assumes admin can access all bookings
 */
export async function fetchAdminBookings(status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') {
  const endpoint = status ? `/bookings?status=${status}` : '/bookings';
  const response = await api.get<Booking[]>(endpoint);
  return {
    success: response.success,
    data: response.data || [],
    message: response.message,
  };
}

/**
 * Fetch all tutors (for admin stats)
 */
export async function fetchTutors(filters = {}): Promise<{ success: boolean; data: unknown[]; message?: string }> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  const queryString = params.toString();
  const endpoint = `/tutors${queryString ? `?${queryString}` : ''}`;
  const response = await api.get(endpoint);
  return {
    success: response.success,
    data: Array.isArray(response.data) ? response.data : [],
    message: response.message,
  };
}

/**
 * Create a category (Admin only)
 */
export async function createCategory(name: string) {
  const response = await api.post<Category>('/categories', { name });
  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}

/**
 * Create a subject (Admin only)
 */
export async function createSubject(name: string, categoryId: string) {
  const response = await api.post<Subject>('/subjects', { name, categoryId });
  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}
