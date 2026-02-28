const API_BASE = 'https://api.thedesignhive.tech';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('auth_token');
};

export const api = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { method = 'GET', body, headers = {}, auth = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // response wasn't JSON
    }
    throw new ApiError(errorMessage, response.status);
  }

  // Handle HTML responses (e.g., invoice)
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('text/html')) {
    return (await response.text()) as unknown as T;
  }

  return response.json();
};

// Convenience methods
export const apiGet = <T = unknown>(endpoint: string, auth = false) =>
  api<T>(endpoint, { auth });

export const apiPost = <T = unknown>(endpoint: string, body: unknown, auth = false) =>
  api<T>(endpoint, { method: 'POST', body, auth });

export const apiPut = <T = unknown>(endpoint: string, body: unknown, auth = false) =>
  api<T>(endpoint, { method: 'PUT', body, auth });

export const apiPatch = <T = unknown>(endpoint: string, body: unknown, auth = false) =>
  api<T>(endpoint, { method: 'PATCH', body, auth });

export const apiDelete = <T = unknown>(endpoint: string, auth = false) =>
  api<T>(endpoint, { method: 'DELETE', auth });
