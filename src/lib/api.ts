/**
 * Central API client for Skill Bridge frontend.
 * All requests go to BACKEND (BASE_URL). In browser, we add Authorization: Bearer
 * by fetching the session token from /api/auth/token (same-origin).
 */

export const BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'https://skill-bridge-server-eight.vercel.app';

const isBrowser = typeof window !== 'undefined';

const buildUrl = (base: string, path: string) => {
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

function getUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return buildUrl(BASE_URL, p);
}

let cachedToken: string | null = null;

async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    const res = await fetch('/api/auth/token', { credentials: 'include' });
    const data = await res.json();
    cachedToken = data?.token ?? null;
    return cachedToken;
  } catch {
    return null;
  }
}

/** Call after signOut so the next request fetches a fresh token. */
export function clearAuthToken(): void {
  cachedToken = null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: unknown;
}

export interface ApiError {
  success: false;
  message: string;
  details?: unknown;
}

/**
 * Helper function to make GET requests with automatic BASE_URL prefix
 * Does NOT add /api prefix (except for /api/auth routes which should already have it)
 */
export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const url = getUrl(path);
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (isBrowser) {
    const token = await getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      return {
        success: false,
        message: errorData.message || `HTTP error! status: ${response.status}`,
        details: errorData.details,
      };
    }

    let data;
    try {
      const text = await response.text();
      if (!text) {
        return {
          success: false,
          message: 'Empty response from server',
          details: { status: response.status },
        };
      }
      data = JSON.parse(text);
    } catch (parseError) {
      return {
        success: false,
        message: 'Failed to parse JSON response from server',
        details: { 
          status: response.status,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        },
      };
    }
    
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred',
      details: error,
    };
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = getUrl(endpoint);
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (isBrowser) {
      const token = await getAuthToken();
      if (token) (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
      mode: 'cors',
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        let errorText = '';
        try {
          errorText = await response.text();
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}`, raw: errorText };
        }
        
        // Log CORS/403 errors for debugging
        if (response.status === 403) {
          console.error('403 Forbidden - Possible CORS issue:', {
            url,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            errorData,
          });
        }
        
        return {
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          details: { ...errorData.details, status: response.status, raw: errorText },
        };
      }

      let data;
      try {
        const text = await response.text();
        if (!text) {
          return {
            success: false,
            message: 'Empty response from server',
            details: { status: response.status },
          };
        }
        data = JSON.parse(text);
      } catch (parseError) {
        return {
          success: false,
          message: 'Failed to parse JSON response from server',
          details: { 
            status: response.status,
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          },
        };
      }
      
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        details: error,
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(BASE_URL);
