// /**
//  * Authentication API Client
//  * Feature: 003-frontend-integration
//  *
//  * API functions for user authentication (signup, signin, signout)
//  */

// import { apiClient } from './client';
// import { SigninResponse, SignupResponse, User } from '@/types';

// /**
//  * Sign up a new user
//  */
// export async function signup(email: string, password: string): Promise<SignupResponse> {
//   return apiClient.post<SignupResponse>(
//     '/api/auth/signup',
//     { email, password },
//     false // No auth required for signup
//   );
// }

// /**
//  * Sign in an existing user
//  */
// export async function signin(email: string, password: string): Promise<SigninResponse> {
//   return apiClient.post<SigninResponse>(
//     '/api/auth/signin',
//     { email, password },
//     false // No auth required for signin
//   );
// }

// /**
//  * Sign out the current user (optional backend endpoint)
//  */
// export async function signout(): Promise<void> {
//   try {
//     await apiClient.post('/auth/signout', {}, true);
//   } catch (error) {
//     // Ignore errors - signout should always succeed client-side
//     console.warn('Signout endpoint not available or failed:', error);
//   }
// }

// /**
//  * Get current user info (if backend provides this endpoint)
//  */
// export async function getCurrentUser(): Promise<User> {
//   return apiClient.get<User>('/auth/me', true);
// }







import { apiClient } from './client';
import { SigninResponse, SignupResponse, User } from '@/types';

export async function signup(
  email: string,
  password: string
): Promise<SignupResponse> {
  return apiClient.post<SignupResponse>(
    '/api/auth/signup',
    { email, password },
    false
  );
}

export async function signin(
  email: string,
  password: string
): Promise<SigninResponse> {
  return apiClient.post<SigninResponse>(
    '/api/auth/signin',
    { email, password },
    false
  );
}

export async function signout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/signout', {}, true);
  } catch {
    // ignore
  }
}

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>('/api/auth/me', true);
}
