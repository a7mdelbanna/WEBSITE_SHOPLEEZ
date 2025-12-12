/**
 * API Client
 *
 * Axios-based HTTP client with:
 * - Automatic token injection
 * - Token refresh on 401
 * - Tenant/Store ID injection
 * - Error handling
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, AuthTokens } from '@/types/api';

// Token storage keys
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers with new token
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Get stored tokens
 */
export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

/**
 * Store tokens
 */
export function setTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

/**
 * Clear tokens (logout)
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const { accessToken } = getTokens();
  return !!accessToken;
}

/**
 * Create API client instance
 */
export function createApiClient(
  baseUrl: string,
  storeId: number,
  locale: 'en' | 'ar' = 'ar'
): AxiosInstance {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken } = getTokens();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Add store ID to URL if not already present
      // Most endpoints have {storeId} in the path
      if (config.url && !config.url.includes('{storeId}')) {
        // URLs that need storeId appended
        // This is handled per-endpoint, not globally
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Wait for token refresh
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { refreshToken, accessToken } = getTokens();

          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Call refresh endpoint
          const response = await axios.post(
            `${baseUrl}/RetailAPI/Auth/RefreshToken/${storeId}`,
            {
              refreshToken,
              accessToken,
            }
          );

          const newTokens: AuthTokens = response.data;
          setTokens(newTokens);

          // Notify subscribers
          onTokenRefreshed(newTokens.accessToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          clearTokens();
          // Redirect to home - the login modal will be triggered when user tries authenticated action
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Transform error for consistency
      // API returns various formats:
      // 1. { result: { code, message }, data: {...} }
      // 2. { "Phone Number Not Verified": ["The phone number not veified!!"] }
      // 3. { message: "..." }
      const responseData = error.response?.data as Record<string, unknown> | undefined;

      // Debug log for API errors
      console.log('API Error Response:', {
        status: error.response?.status,
        data: responseData,
        url: error.config?.url,
      });

      // Extract error message from various response formats
      let apiMessage = 'An unexpected error occurred';

      if (responseData) {
        const resultObj = responseData.result as { message?: string } | undefined;
        if (resultObj?.message) {
          // Format 1: { result: { message } }
          apiMessage = resultObj.message;
        } else if (typeof responseData.message === 'string') {
          // Format 3: { message }
          apiMessage = responseData.message;
        } else if (typeof responseData === 'object') {
          // Format 2: { "Key": ["message"] } - validation errors
          const keys = Object.keys(responseData);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const value = responseData[firstKey];
            if (Array.isArray(value) && value.length > 0) {
              apiMessage = value[0];
            } else if (typeof value === 'string') {
              apiMessage = value;
            }
          }
        }
      }

      // Fallback to axios error message
      if (apiMessage === 'An unexpected error occurred' && error.message) {
        apiMessage = error.message;
      }

      const apiError: ApiError = {
        statusCode: error.response?.status || 500,
        message: apiMessage,
        errors: responseData?.errors as Record<string, string[]> | undefined,
        // Preserve the full API response data for detailed error handling
        data: (responseData?.data || responseData) as Record<string, unknown> | undefined,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
}

/**
 * API helper functions
 */
export function buildUrl(template: string, storeId: number, params?: Record<string, string | number>): string {
  let url = template.replace('{storeId}', storeId.toString());

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value.toString());
    });
  }

  return url;
}
