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

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface BookingWithReview {
  id: string;
  review?: Review;
}

export interface TutorProfileDetail extends TutorProfile {
  bookingsAsTutor?: BookingWithReview[];
}

export interface BookingRequest {
  studentId: string;
  tutorId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  student?: TutorUser;
  tutor?: {
    id: string;
    userId: string;
    bio?: string;
    pricePerHour: number;
    rating: number;
    reviewCount: number;
    user: TutorUser;
  };
  review?: Review | null;
}

export interface BookingResponse {
  success: boolean;
  data?: Booking;
  message?: string;
  details?: unknown;
}

export interface BookingsResponse {
  success: boolean;
  data: Booking[];
  message?: string;
}

export interface ReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface TutorProfileUpdate {
  userId: string;
  bio?: string;
  subjectsIds?: string[];
  availability?: Record<string, unknown>;
  pricePerHour?: number;
}

export interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}
