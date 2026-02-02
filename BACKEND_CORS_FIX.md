# Backend CORS Configuration Fix

## Problem
Frontend is getting `403 Forbidden` errors when making requests to the backend API, specifically for authentication endpoints like `/api/auth/sign-in/email`.

This is a **CORS (Cross-Origin Resource Sharing)** issue. The backend needs to explicitly allow requests from the frontend domain.

---

## Solution: Configure CORS on Backend

### Step 1: Identify Your Frontend URL

Your frontend is deployed at (check your Vercel/deployment URL):
- Example: `https://skill-bridge-frontend.vercel.app`
- Or: `http://localhost:3001` (for local development)

**Note:** The backend is at: `https://skill-bridge-server-eight.vercel.app`

---

### Step 2: Configure Better Auth CORS

If you're using Better Auth, add CORS configuration in your backend setup:

#### Option A: Better Auth Configuration (Recommended)

In your backend Better Auth initialization file (usually `auth.ts` or `lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // ... your existing config
  baseURL: process.env.BETTER_AUTH_URL || "https://skill-bridge-server-eight.vercel.app",
  basePath: "/api/auth",
  
  // Add CORS configuration
  trustedOrigins: [
    "https://skill-bridge-frontend.vercel.app", // Your frontend URL
    "http://localhost:3001", // Local development
    "http://localhost:3000", // If frontend runs on 3000
  ],
  
  // Enable CORS
  advanced: {
    cors: {
      origin: [
        "https://skill-bridge-frontend.vercel.app",
        "http://localhost:3001",
        "http://localhost:3000",
      ],
      credentials: true, // Important for cookies
    },
  },
});
```

---

### Step 3: Configure Express/Next.js CORS Middleware

If your backend uses Express or Next.js API routes, add CORS middleware:

#### For Express Backend:

```typescript
import cors from 'cors';
import express from 'express';

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://skill-bridge-frontend.vercel.app', // Your frontend URL
    'http://localhost:3001', // Local development
    'http://localhost:3000',
  ],
  credentials: true, // CRITICAL: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'X-Requested-With',
  ],
  exposedHeaders: ['Set-Cookie'],
}));

// Handle preflight requests
app.options('*', cors());
```

#### For Next.js API Routes:

If using Next.js API routes, create a middleware file:

**`middleware.ts`** (in your backend project root):

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS
  const response = NextResponse.next();
  
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://skill-bridge-frontend.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Cookie, X-Requested-With'
    );
    response.headers.set('Access-Control-Expose-Headers', 'Set-Cookie');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

### Step 4: Environment Variables

Ensure your backend has these environment variables set:

```env
# Backend URL
BETTER_AUTH_URL=https://skill-bridge-server-eight.vercel.app
BETTER_AUTH_SECRET=your-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=https://skill-bridge-frontend.vercel.app

# Database (if using)
DATABASE_URL=your-database-url
```

---

### Step 5: Verify Better Auth Base URL

In your Better Auth configuration, ensure:

```typescript
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL, // Should match your backend URL
  basePath: "/api/auth",
  // ... rest of config
});
```

---

### Step 6: Test CORS Configuration

After deploying, test with curl:

```bash
# Test preflight request
curl -X OPTIONS \
  https://skill-bridge-server-eight.vercel.app/api/auth/sign-in/email \
  -H "Origin: https://skill-bridge-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Should return:
# Access-Control-Allow-Origin: https://skill-bridge-frontend.vercel.app
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: POST, GET, OPTIONS
```

---

## Common Issues & Solutions

### Issue 1: Still getting 403
- **Solution:** Check that `credentials: true` is set in CORS config
- **Solution:** Verify the frontend URL in `trustedOrigins` matches exactly (no trailing slashes)

### Issue 2: Cookies not being sent
- **Solution:** Ensure `credentials: 'include'` in frontend fetch (already done)
- **Solution:** Backend must have `Access-Control-Allow-Credentials: true` header

### Issue 3: Preflight requests failing
- **Solution:** Make sure OPTIONS method is handled and returns 200 with CORS headers

### Issue 4: Multiple origins
- **Solution:** Use an array of allowed origins, or use a function to dynamically check:

```typescript
origin: (origin, callback) => {
  const allowedOrigins = [
    'https://skill-bridge-frontend.vercel.app',
    'http://localhost:3001',
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

---

## Quick Checklist

- [ ] CORS middleware configured with frontend URL
- [ ] `credentials: true` set in CORS config
- [ ] `Access-Control-Allow-Credentials: true` header sent
- [ ] OPTIONS method handled for preflight requests
- [ ] Better Auth `trustedOrigins` includes frontend URL
- [ ] Environment variables set correctly
- [ ] Backend deployed with new CORS config
- [ ] Tested with curl or browser DevTools

---

## Testing After Fix

1. Open browser DevTools → Network tab
2. Try to log in from frontend
3. Check the request headers:
   - Should see `Origin: https://your-frontend-url`
4. Check the response headers:
   - Should see `Access-Control-Allow-Origin: https://your-frontend-url`
   - Should see `Access-Control-Allow-Credentials: true`
5. If still failing, check the console for the detailed error message

---

## Need Help?

If the issue persists after following these steps:
1. Check backend logs for CORS-related errors
2. Verify the exact frontend URL (check Vercel deployment URL)
3. Ensure no trailing slashes in URLs
4. Test with a simple curl request to verify CORS headers are being sent
