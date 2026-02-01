/**
 * API functions for tutors and categories
 */

import { api } from './api';
import type { TutorsResponse, CategoriesResponse, TutorsFilters, TutorProfile, TutorProfileDetail, Category, BookingRequest, BookingResponse, Booking } from './types';

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
