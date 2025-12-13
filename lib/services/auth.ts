'use client';

/**
 * Auth Service
 *
 * React Query hooks for authentication matching Flutter app flow:
 * - Login by phone (AuthenticateByPhoneNumberTwilio)
 * - OTP/Password verification (VerifyOTPTwilio)
 * - User registration (RegisterUserTwilio - ALWAYS Twilio, with password)
 * - Profile fetching
 *
 * API Response Structure:
 * {
 *   "result": { "code": 200, "message": "..." },
 *   "data": { "accessToken": "...", "refreshToken": "..." }
 * }
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl, setTokens, getTokens } from '@/lib/api/client';
import type { AuthTokens, UserProfile } from '@/types/api';

// ============== Types ==============

export interface LoginByPhoneRequest {
  phoneNumber: string;
}

/**
 * API Response structure matches Flutter's ApiResponse model
 */
export interface ApiResponseWrapper<T> {
  result?: {
    code?: number;
    message?: string;
  };
  data?: T;
}

export interface LoginByPhoneData {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresOtp?: boolean;
  isNewUser?: boolean;
  isVerified?: boolean;
  userId?: number;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  password?: string;
}

export interface VerifyOtpData {
  accessToken?: string;
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
  password: string;
  email?: string;
}

// ============== Helper to extract tokens ==============

function extractTokens(responseData: any): { accessToken?: string; refreshToken?: string; expiresIn?: number } {
  // API returns: { result: {...}, data: { accessToken, refreshToken } }
  const data = responseData?.data || responseData;
  return {
    accessToken: data?.accessToken,
    refreshToken: data?.refreshToken,
    expiresIn: data?.expiresIn,
  };
}

// ============== Hooks ==============

/**
 * Login by phone number
 * Uses AuthenticateByPhoneNumberTwilio
 */
export function useLoginByPhone() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (data: LoginByPhoneRequest): Promise<ApiResponseWrapper<LoginByPhoneData>> => {
      const url = buildUrl(API_ENDPOINTS.auth.loginByPhone, storeId);
      const response = await apiClient.post(url, data);
      console.log('LoginByPhone raw response:', response.data);
      return response.data;
    },
  });
}

/**
 * Verify OTP or Password
 * Uses VerifyOTPTwilio
 */
export function useVerifyOtp() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyOtpRequest): Promise<ApiResponseWrapper<VerifyOtpData>> => {
      const url = buildUrl(API_ENDPOINTS.auth.verifyOtp, storeId);
      const response = await apiClient.post(url, data);
      console.log('VerifyOtp raw response:', response.data);
      return response.data;
    },
    onSuccess: (responseData) => {
      const tokens = extractTokens(responseData);
      if (tokens.accessToken && tokens.refreshToken) {
        setTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn || 3600,
        });
      }
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
 * Uses RegisterUserTwilio - ALWAYS
 *
 * Flow (matching Flutter exactly):
 * 1. Get valid userId from GetValidId
 * 2. Register with RegisterUserTwilio
 * 3. Verify with password → This step returns tokens for password-based auth!
 * 4. If verify didn't return tokens, try login as fallback
 */
export function useRegisterUser() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterUserRequest): Promise<ApiResponseWrapper<LoginByPhoneData>> => {
      // Step 1: Get valid userId
      const validIdUrl = `${API_ENDPOINTS.auth.getValidId}?storeId=${storeId}`;
      const validIdResponse = await apiClient.get(validIdUrl);
      const userId = Number(validIdResponse.data);
      console.log('[Register] Step 1 - Got valid userId:', userId);

      // Step 2: Register with RegisterUserTwilio
      const registerUrl = buildUrl(API_ENDPOINTS.auth.registerUser, storeId);
      const registerResponse = await apiClient.post(registerUrl, {
        userId: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        phoneNumber: data.phoneNumber,
        ...(data.email && { email: data.email }),
      });
      console.log('[Register] Step 2 - Registration response:', registerResponse.data);

      // Step 3: Verify with password - this should return tokens for password auth!
      const verifyUrl = buildUrl(API_ENDPOINTS.auth.verifyOtp, storeId);
      const verifyResponse = await apiClient.post(verifyUrl, {
        phoneNumber: data.phoneNumber,
        otp: data.password,
        password: data.password,
      });
      console.log('[Register] Step 3 - Verify response:', verifyResponse.data);

      // Check if verify step returned tokens
      const verifyTokens = extractTokens(verifyResponse.data);
      if (verifyTokens.accessToken && verifyTokens.refreshToken) {
        console.log('[Register] Got tokens from verify step!');
        return verifyResponse.data;
      }

      // Step 4: Fallback - Login to get tokens if verify didn't return them
      console.log('[Register] Step 4 - Verify did not return tokens, trying login...');
      const loginUrl = buildUrl(API_ENDPOINTS.auth.loginByPhone, storeId);
      const loginResponse = await apiClient.post(loginUrl, {
        phoneNumber: data.phoneNumber,
      });
      console.log('[Register] Step 4 - Login response:', loginResponse.data);

      // Check if login returned tokens
      const loginTokens = extractTokens(loginResponse.data);
      if (loginTokens.accessToken && loginTokens.refreshToken) {
        console.log('[Register] Got tokens from login step!');
        return loginResponse.data;
      }

      // Check if login said "OTP sent" - need to verify again with password
      const loginMessage = loginResponse.data?.result?.message || '';
      if (loginMessage.includes('OTP') || loginMessage.includes('otp')) {
        console.log('[Register] Login returned OTP message, retrying verify...');
        // The user is now registered, try verifying again with password
        const retryVerifyResponse = await apiClient.post(verifyUrl, {
          phoneNumber: data.phoneNumber,
          otp: data.password,
          password: data.password,
        });
        console.log('[Register] Retry verify response:', retryVerifyResponse.data);
        return retryVerifyResponse.data;
      }

      // Return whatever we got from login
      return loginResponse.data;
    },
    onSuccess: (responseData) => {
      const tokens = extractTokens(responseData);
      if (tokens.accessToken && tokens.refreshToken) {
        console.log('[Register] onSuccess - Setting tokens');
        setTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn || 3600,
        });
      }
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
      // API returns: { customerId, customerInfo: { result, data: {...} } }
      return response.data?.customerInfo?.data || response.data?.data || response.data;
    },
    enabled: enabled && !!accessToken,
    staleTime: 5 * 60 * 1000,
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

      const tokens = extractTokens(response.data);
      return {
        accessToken: tokens.accessToken || '',
        refreshToken: tokens.refreshToken || '',
        expiresIn: tokens.expiresIn || 3600,
      };
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

/**
 * Start chat session
 * Returns session ID for SignalR connection
 */
export interface ChatSessionData {
  sessionId: string;
  botMessage?: {
    message: string;
    choices?: string[];
  };
}

export function useStartChatSession() {
  const { apiClient, storeId, baseUrl } = useApiClient();

  return useMutation({
    mutationFn: async (): Promise<ChatSessionData> => {
      // Matches Flutter: POST /RetailAPI/Customer/Chat/StartSession/{storeId}
      const url = `${baseUrl}/RetailAPI/Customer/Chat/StartSession/${storeId}`;
      console.log('[ChatSession] Starting session:', url);

      const response = await apiClient.post(url, {});
      console.log('[ChatSession] Response:', response.data);

      // Extract session ID (handles both data.sessionId and data.data.sessionId)
      const data = response.data?.data || response.data;
      const sessionId = data?.sessionId;

      if (!sessionId) {
        throw new Error('No session ID in response');
      }

      return {
        sessionId: sessionId.toString(),
        botMessage: data?.botMessage,
      };
    },
  });
}
