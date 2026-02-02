/**
 * API functions for tutors and categories
 */

import { api } from './api';
import type { TutorsResponse, CategoriesResponse, TutorsFilters, TutorProfile, TutorProfileDetail, Category, BookingRequest, BookingResponse, Booking, BookingsResponse, ReviewRequest, Review, TutorProfileUpdate } from './types';

/**
 * Fetch tutors with optional filters
 */
export async function fetchTutors(filters: TutorsFilters = {}): Promise<TutorsResponse> {
  const params = new URLSearchParams();
  
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.subjectId) params.append('subjectId', filters.subjectId);
  if (filters.minRating !== undefined) params.append('minRating', filters.minRating.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  // Note: search query might need to be handled differently if API supports it
  
  const queryString = params.toString();
  const endpoint = `/tutors${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get<TutorProfile[]>(endpoint);
  return {
    success: response.success,
    data: response.data || [],
    message: response.message,
  };
}

/**
 * Fetch all categories with subjects
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await api.get<Category[]>('/categories');
  return {
    success: response.success,
    data: response.data || [],
    message: response.message,
  };
}

/**
 * Fetch a single tutor by ID
 */
export async function fetchTutorById(id: string) {
  const response = await api.get<TutorProfileDetail>(`/tutors/${id}`);
  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}

/**
 * Create a booking
 */
export async function createBooking(booking: BookingRequest): Promise<BookingResponse> {
  const response = await api.post<Booking>('/bookings', booking);
  return {
    success: response.success,
    data: response.data,
    message: response.message,
    details: response.details,
  };
}

/**
 * Fetch bookings for current user
 */
export async function fetchBookings(status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<BookingsResponse> {
  const endpoint = status ? `/bookings?status=${status}` : '/bookings';
  const response = await api.get<Booking[]>(endpoint);
  return {
    success: response.success,
    data: response.data || [],
    message: response.message,
  };
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<BookingResponse> {
  const response = await api.patch<Booking>(`/bookings/${bookingId}/cancel`);
  return {
    success: response.success,
    data: response.data,
    message: response.message,
    details: response.details,
  };
}

/**
 * Create a review for a completed booking
 */
export async function createReview(review: ReviewRequest): Promise<{ success: boolean; data?: Review; message?: string }> {
  const response = await api.post<Review>(`/bookings/${review.bookingId}/review`, {
    bookingId: review.bookingId,
    rating: review.rating,
    comment: review.comment,
  });
  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}

/**
 * Get current user's tutor profile (Tutor only)
 */
export async function fetchMyTutorProfile(): Promise<{ success: boolean; data: TutorProfileDetail | null; message?: string }> {
  const response = await api.get<TutorProfileDetail | null>('/tutors/me');
  return {
    success: response.success,
    data: response.data ?? null,
    message: response.message,
  };
}

/**
 * Create tutor profile (Tutor only). Backend sets userId from session.
 */
export async function createTutorProfile(data: Omit<TutorProfileUpdate, 'userId'>): Promise<{ success: boolean; data?: TutorProfile; message?: string }> {
  const response = await api.post<TutorProfile>('/tutors', data);
  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}

/**
 * Update tutor profile
 */
export async function updateTutorProfile(update: TutorProfileUpdate): Promise<{ success: boolean; data?: TutorProfile; message?: string }> {
  const response = await api.post<TutorProfile>('/tutors/update', update);
  return {
    success: response.success,
    data: response.data,
    message: response.message,
  };
}

/**
 * Complete a booking (Tutor only)
 */
export async function completeBooking(bookingId: string): Promise<BookingResponse> {
  const response = await api.patch<Booking>(`/bookings/${bookingId}/complete`);
  return {
    success: response.success,
    data: response.data,
    message: response.message,
    details: response.details,
  };
}
