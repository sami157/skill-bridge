/**
 * Type definitions for Skill Bridge API responses
 */

export interface Category {
  id: string;
  name: string;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  category?: Category;
  categoryId?: string;
}

export interface TutorUser {
  id: string;
  name: string;
  image?: string;
  email?: string;
}

export interface TutorProfile {
  id: string;
  userId: string;
  bio?: string;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  availability?: Record<string, unknown>;
  user: TutorUser;
  subjects: Subject[];
}

export interface TutorsResponse {
  success: boolean;
  data: TutorProfile[];
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

export interface TutorsFilters {
  categoryId?: string;
  subjectId?: string;
  minRating?: number;
  maxPrice?: number;
  sortBy?: 'rating_asc' | 'rating_desc' | 'price_asc' | 'price_desc';
  search?: string;
}
