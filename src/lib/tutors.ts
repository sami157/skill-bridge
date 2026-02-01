/**
 * API functions for tutors and categories
 */

import { api } from './api';
import type { TutorsResponse, CategoriesResponse, TutorsFilters, TutorProfile, Category } from './types';

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
  
  return api.get<TutorProfile[]>(endpoint);
}

/**
 * Fetch all categories with subjects
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
  return api.get<Category[]>('/categories');
}

/**
 * Fetch a single tutor by ID
 */
export async function fetchTutorById(id: string) {
  return api.get<TutorProfile>(`/tutors/${id}`);
}
