# Skill Bridge API Documentation

API for the Skill Bridge tutoring platform: authentication, categories, subjects, tutors, bookings, and user profiles.

**Base URL:** `http://localhost:3000` (or your deployed URL)

**Response format:** JSON. Successful responses use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "message": "...", "details": ... }`.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Categories](#2-categories)
3. [Subjects](#3-subjects)
4. [Tutors](#4-tutors)
5. [Bookings](#5-bookings)
6. [Users (Profile)](#6-users-profile)
7. [Data Models & Enums](#7-data-models--enums)
8. [Error Handling](#8-error-handling)

---

## 1. Authentication

**Base path:** `/api/auth/*`  
**Provider:** Better Auth (email/password).  
**Use for:** Sign up, sign in, sign out, session, and password flows.

| Method | Endpoint | Purpose |
|--------|----------|--------|
| POST | `/api/auth/sign-up/email` | Register a new user (name, email, password) |
| POST | `/api/auth/sign-in/email` | Sign in with email and password |
| POST | `/api/auth/sign-out` | Sign out current session |
| GET | Session | Validate session (used by protected routes via `Authorization` / cookies) |

**Protected routes** require a valid session (cookies or headers as required by Better Auth). Missing or invalid session returns `401 Unauthorized`. Wrong role returns `403 Forbidden`.

**Roles:** `STUDENT` | `TUTOR` | `ADMIN`

---

## 2. Categories

**Base path:** `/categories`  
**Use for:** Listing and managing subject categories (e.g. Math, Science). Used to group subjects and filter tutors.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|--------|
| GET | `/categories` | No | List all categories with their subjects |
| POST | `/categories` | Admin | Create a new category |

### GET `/categories`

List all categories (with nested subjects).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Mathematics",
      "subjects": [
        { "id": "uuid", "name": "Algebra" },
        { "id": "uuid", "name": "Calculus" }
      ]
    }
  ]
}
```

### POST `/categories`

Create a category (Admin only).

**Request body:**
```json
{
  "name": "Mathematics"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Mathematics"
  }
}
```

---

## 3. Subjects

**Base path:** `/subjects`  
**Use for:** Listing and managing subjects (e.g. Algebra, Physics). Subjects belong to a category and are linked to tutor profiles.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|--------|
| GET | `/subjects` | No | List all subjects with category |
| GET | `/subjects/:categoryId` | No | List subjects in a category |
| POST | `/subjects` | Admin | Create a new subject |

### GET `/subjects`

List all subjects with category info.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Algebra",
      "category": { "id": "uuid", "name": "Mathematics" }
    }
  ]
}
```

### GET `/subjects/:categoryId`

List subjects for one category.

**Parameters:** `categoryId` (path) – category UUID.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Algebra" },
    { "id": "uuid", "name": "Calculus" }
  ]
}
```

### POST `/subjects`

Create a subject (Admin only).

**Request body:**
```json
{
  "name": "Algebra",
  "categoryId": "uuid"
}
```

**Response (201):** Subject object (implementation may return created subject in `data`).

---

## 4. Tutors

**Base path:** `/tutors`  
**Use for:** Tutor profiles: create/update profile, list tutors with filters, get one tutor’s details. Students use this to discover and choose tutors.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|--------|
| GET | `/tutors` | No | List tutors with optional filters and sorting |
| GET | `/tutors/:id` | No | Get one tutor profile by ID |
| POST | `/tutors` | Tutor | Create tutor profile |
| POST | `/tutors/update` | Tutor | Update own tutor profile |

### GET `/tutors`

List tutor profiles with optional query filters.

**Query parameters:**

| Parameter   | Type   | Purpose |
|------------|--------|--------|
| `subjectId` | UUID  | Only tutors who teach this subject |
| `categoryId` | UUID | Only tutors who teach a subject in this category |
| `minRating` | number | Minimum average rating (e.g. `4`) |
| `maxPrice`  | number | Maximum price per hour |
| `sortBy`    | string | `rating_asc` \| `rating_desc` \| `price_asc` \| `price_desc` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "bio": "Experienced math tutor",
      "pricePerHour": 50,
      "rating": 4.8,
      "reviewCount": 24,
      "availability": {},
      "user": { "id": "uuid", "name": "Jane Doe", "image": "url" },
      "subjects": [
        { "id": "uuid", "name": "Algebra", "category": { "id": "uuid", "name": "Mathematics" } }
      ]
    }
  ]
}
```

### GET `/tutors/:id`

Get a single tutor profile (for tutor detail page).

**Parameters:** `id` (path) – TutorProfile ID (not User ID).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "bio": "...",
    "pricePerHour": 50,
    "rating": 4.8,
    "reviewCount": 24,
    "user": { "id": "uuid", "name": "Jane Doe", "image": "url", "email": "jane@example.com" },
    "subjects": [...],
    "bookingsAsTutor": [{ "id": "uuid", "review": { "rating": 5, "comment": "..." } }]
  }
}
```

**Error (400):** `"Tutor not found"` if `id` is invalid.

### POST `/tutors`

Create tutor profile (Tutor role only). Call after user has signed up and has role TUTOR.

**Request body:**
```json
{
  "userId": "uuid",
  "bio": "Optional bio text",
  "subjectsIds": ["uuid", "uuid"],
  "availability": {},
  "pricePerHour": 50
}
```

- `userId`: Current user’s ID (must match authenticated user).
- `subjectsIds`: Array of subject IDs the tutor teaches.
- `availability`: Optional JSON (e.g. weekly slots).

**Response (200):** Created tutor profile with `subjects` in `data`.

### POST `/tutors/update`

Update own tutor profile (Tutor role only).

**Request body:** Same shape as create; all fields optional except `userId`.

```json
{
  "userId": "uuid",
  "bio": "Updated bio",
  "subjectsIds": ["uuid"],
  "availability": {},
  "pricePerHour": 55
}
```

**Response (200):** Updated tutor profile in `data`.

---

## 5. Bookings

**Base path:** `/bookings`  
**Use for:** Students book sessions with tutors; students cancel; tutors mark sessions complete; students leave reviews. Used for the full booking lifecycle.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|--------|
| POST | `/bookings` | Student | Create a booking |
| GET | `/bookings` | Student, Tutor | List my bookings (optional filter by status) |
| GET | `/bookings/:bookingId` | Student, Tutor | Get one booking (only if you are student or tutor) |
| PATCH | `/bookings/:bookingId/cancel` | Student | Cancel a booking (student only) |
| PATCH | `/bookings/:bookingId/complete` | Tutor | Mark booking as completed (tutor only) |
| POST | `/bookings/:bookingId/review` | Student | Add a review for a completed booking |

### POST `/bookings`

Create a new booking (Student only).

**Request body:**
```json
{
  "studentId": "uuid",
  "tutorId": "uuid",
  "startTime": "2025-02-15T10:00:00.000Z",
  "endTime": "2025-02-15T11:00:00.000Z"
}
```

- `studentId`: Usually the current user’s ID.
- `tutorId`: TutorProfile ID (from `GET /tutors` or `GET /tutors/:id`).
- `startTime` / `endTime`: ISO 8601; `startTime` must be before `endTime`.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "tutorId": "uuid",
    "startTime": "...",
    "endTime": "...",
    "status": "CONFIRMED",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors (400):**  
- `"Invalid booking time range"`  
- `"Tutor is not available for the selected time"` (overlapping confirmed booking)

### GET `/bookings`

List bookings for the current user (as student or tutor).

**Query parameters:**

| Parameter | Type   | Purpose |
|-----------|--------|--------|
| `status`  | string | Filter: `CONFIRMED` \| `COMPLETED` \| `CANCELLED` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "tutorId": "uuid",
      "startTime": "...",
      "endTime": "...",
      "status": "CONFIRMED",
      "student": { "id": "uuid", "name": "...", "email": "...", "image": "..." },
      "tutor": {
        "id": "uuid",
        "userId": "uuid",
        "bio": "...",
        "pricePerHour": 50,
        "rating": 4.8,
        "reviewCount": 24,
        "user": { "id": "uuid", "name": "...", "email": "...", "image": "..." }
      },
      "review": null
    }
  ]
}
```

### GET `/bookings/:bookingId`

Get one booking. Allowed only if the current user is the booking’s student or tutor.

**Parameters:** `bookingId` (path) – booking UUID.

**Response (200):** Single booking object (same shape as in list, with `student`, `tutor`, `review`).

**Errors (400):** `"Booking not found"` or `"You are not allowed to view this booking"`.

### PATCH `/bookings/:bookingId/cancel`

Cancel a booking (Student only; must be the booking’s student).

**Parameters:** `bookingId` (path).

**Response (200):** Updated booking with `status: "CANCELLED"` in `data`.

**Errors (400):**  
- `"Booking not found"`  
- `"You are not allowed to cancel this booking"`  
- `"Booking is already cancelled"`

### PATCH `/bookings/:bookingId/complete`

Mark a booking as completed (Tutor only; must be the booking’s tutor).

**Parameters:** `bookingId` (path).

**Response (200):** Updated booking with `status: "COMPLETED"` in `data`.

**Errors (400):**  
- `"Booking not found"`  
- `"You are not allowed to complete this booking"`  
- `"Only confirmed bookings can be completed"`

### POST `/bookings/:bookingId/review`

Create a review for a completed booking (Student only; must be the booking’s student). Rating is used to update the tutor’s average rating and review count.

**Parameters:** `bookingId` (path).

**Request body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Great session!"
}
```

- `rating`: Integer (e.g. 1–5).  
- `comment`: Optional string.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "rating": 5,
    "comment": "Great session!",
    "createdAt": "..."
  }
}
```

**Errors (400):**  
- `"Booking not found"`  
- `"You are not allowed to review this booking"`  
- `"Booking must be completed to leave a review"`  
- `"Review already exists for this booking"`

---

## 6. Users (Profile)

**Base path:** `/users`  
**Use for:** Students (or admins) viewing and updating the current user’s profile (name, phone, image).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|--------|
| GET | `/users/profile` | Student, Admin | Get current user profile |
| PUT | `/users/profile` | Student, Admin | Update current user profile |

### GET `/users/profile`

Get the authenticated user’s profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "image": "url",
    "role": "STUDENT",
    "active": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### PUT `/users/profile`

Update the current user’s profile.

**Request body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "image": "https://..."
}
```

All fields optional; only provided fields are updated.

**Response (200):** Updated user object in `data`.

---

## 7. Data Models & Enums

### Enums

- **Role:** `STUDENT` | `TUTOR` | `ADMIN`
- **BookingStatus:** `CONFIRMED` | `COMPLETED` | `CANCELLED`

### Main entities

- **User:** id, name, email, phone, role, active, image, emailVerified, createdAt, updatedAt  
- **TutorProfile:** id, userId, bio, subjects, availability, pricePerHour, rating, reviewCount  
- **Category:** id, name  
- **Subject:** id, name, categoryId  
- **Booking:** id, studentId, tutorId, startTime, endTime, status, createdAt, updatedAt  
- **Review:** id, bookingId, rating, comment, createdAt  

Relations: User has optional TutorProfile; TutorProfile has many Subjects; Booking has Student (User), Tutor (TutorProfile), and optional Review.

---

## 8. Error Handling

- **401 Unauthorized:** No valid session or missing auth.
- **403 Forbidden:** Valid session but role not allowed for this route.
- **400 Bad Request:** Validation or business rule error; `message` and optional `details` in body.

Example:
```json
{
  "success": false,
  "message": "Tutor is not available for the selected time",
  "details": { ... }
}
```

---

## Quick reference: What each section is for

| Section | Use for |
|--------|---------|
| **Authentication** | Sign up, sign in, sign out, session; required for all protected routes. |
| **Categories** | Browsing and managing subject categories; building filters and navigation. |
| **Subjects** | Listing subjects, linking subjects to categories and tutors. |
| **Tutors** | Discovering tutors (with filters/sort), viewing tutor details, creating/updating tutor profile. |
| **Bookings** | Creating and managing sessions (create, list, cancel, complete, review). |
| **Users** | Viewing and editing the logged-in user’s profile (name, phone, image). |
