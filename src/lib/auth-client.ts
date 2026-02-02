import { createAuthClient } from "better-auth/react";

// Must match backend; same base as api.ts so auth cookies work for API calls
const getBaseURL = () =>
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "https://skill-bridge-server-eight.vercel.app";

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});