import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Returns the current session token so the client can send it to the backend.
 * Call with credentials: 'include' from the same origin.
 */
export async function GET(request: NextRequest) {
  const token =
    request.cookies.get("next-auth.session-token")?.value ??
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  return NextResponse.json({ token });
}
