# Skill Bridge (Frontend)

Student–tutor booking app: browse tutors, book sessions, manage profile and bookings.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Radix UI, Lucide icons
- **Auth:** NextAuth + JWT (token in localStorage)
- **API:** REST client to backend (`NEXT_PUBLIC_API_URL`)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Set `.env.local` with `NEXT_PUBLIC_API_URL` pointing at your backend.

## Scripts

| Command   | Description        |
|----------|--------------------|
| `npm run dev`   | Dev server (Turbopack) |
| `npm run build` | Production build   |
| `npm run start` | Run production build |
