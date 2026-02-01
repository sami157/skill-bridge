/**
 * Central API client for Skill Bridge frontend
 * Uses BASE_URL from NEXT_PUBLIC_SERVER_ROOT_URL environment variable
 */

// Get BASE_URL from environment variable
const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_ROOT_URL;
  
  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SERVER_ROOT_URL is not set. Please add it to your .env file.\n' +
      'Example: NEXT_PUBLIC_SERVER_ROOT_URL=http://localhost:3000'
    );
  }
  
  return baseUrl;
};

export const BASE_URL = getBaseUrl();

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
 */
export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}/api${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookie-based auth
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
    // Ensure endpoint starts with /api (don't double-prefix if already has /api)
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const url = `${this.baseURL}${apiEndpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Include credentials (cookies) for Better Auth
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important for cookie-based auth
    };

    try {
      const response = await fetch(url, config);
      
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
