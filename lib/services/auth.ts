'use client';

/**
 * Auth Service
 *
 * React Query hooks for authentication:
 * - Login by phone
 * - OTP verification
 * - User registration
 * - Profile fetching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl, setTokens, getTokens } from '@/lib/api/client';
import type { AuthTokens, UserProfile, LoginResponse } from '@/types/api';

// ============== Types ==============

export interface LoginByPhoneRequest {
  phoneNumber: string;
}

export interface LoginByPhoneResponse {
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresOtp?: boolean;
  isNewUser?: boolean;
  userId?: number;
  message?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  isNewUser?: boolean;
  userId?: number;
  user?: UserProfile;
}

export interface RegisterUserRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface RegisterUserResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

// ============== Hooks ==============

/**
 * Login by phone number
 * Sends OTP to the provided phone number
 */
export function useLoginByPhone() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (data: LoginByPhoneRequest): Promise<LoginByPhoneResponse> => {
      const url = buildUrl(API_ENDPOINTS.auth.loginByPhone, storeId);
      const response = await apiClient.post(url, data);
      return response.data;
    },
  });
}

/**
 * Verify OTP code
 */
export function useVerifyOtp() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
      const url = buildUrl(API_ENDPOINTS.auth.verifyOtp, storeId);
      const response = await apiClient.post(url, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens if provided
      if (data.token && data.refreshToken) {
        setTokens({
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn || 3600,
        });
      }
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Resend OTP code
 */
export function useResendOtp() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (phoneNumber: string): Promise<{ success: boolean; message?: string }> => {
      const url = `${API_ENDPOINTS.auth.resendOtp}?storeId=${storeId}`;
      const response = await apiClient.post(url, { phoneNumber });
      return response.data;
    },
  });
}

/**
 * Register new user
 */
export function useRegisterUser() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
      const url = buildUrl(API_ENDPOINTS.auth.registerUser, storeId);
      const response = await apiClient.post(url, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens
      if (data.token && data.refreshToken) {
        setTokens({
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn || 3600,
        });
      }
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Get user profile
 */
export function useProfile(enabled = true) {
  const { apiClient, storeId } = useApiClient();
  const { accessToken } = getTokens();

  return useQuery({
    queryKey: ['profile', storeId],
    queryFn: async (): Promise<UserProfile> => {
      const url = buildUrl(API_ENDPOINTS.auth.getProfile, storeId);
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: enabled && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Refresh auth token
 */
export function useRefreshToken() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (): Promise<AuthTokens> => {
      const { accessToken, refreshToken } = getTokens();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const url = buildUrl(API_ENDPOINTS.auth.refreshToken, storeId);
      const response = await apiClient.post(url, {
        accessToken,
        refreshToken,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setTokens(data);
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }): Promise<{ success: boolean; message?: string }> => {
      const url = buildUrl(API_ENDPOINTS.auth.changePassword, storeId);
      const response = await apiClient.post(url, data);
      return response.data;
    },
  });
}

/**
 * Delete account
 */
export function useDeleteAccount() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (): Promise<{ success: boolean; message?: string }> => {
      const url = buildUrl(API_ENDPOINTS.auth.deleteAccount, storeId);
      const response = await apiClient.delete(url);
      return response.data;
    },
  });
}
