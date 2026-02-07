'use client';

import { useState, FormEvent } from 'react';
import { SigninFormData, SignupFormData } from '@/types';
import { validateSigninForm, validateSignupForm } from '@/lib/utils/validation';

/**
 * AuthForm Component
 * Reusable form for both signup and signin
 */
interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (data: SigninFormData | SignupFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function AuthForm({ mode, onSubmit, loading = false, error = null }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form data
    const formData = isSignup
      ? { email, password, confirmPassword }
      : { email, password };

    const errors = isSignup
      ? validateSignupForm(formData as SignupFormData)
      : validateSigninForm(formData as SigninFormData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Submit form
    try {
      await onSubmit(formData as SigninFormData | SignupFormData);
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.email
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300'
          }`}
          disabled={loading}
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
        />
        {validationErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.password
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300'
          }`}
          disabled={loading}
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
        />
        {validationErrors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600">
            {validationErrors.password}
          </p>
        )}
        {isSignup && !validationErrors.password && (
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        )}
      </div>

      {/* Confirm Password Field (Signup only) */}
      {isSignup && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.confirmPassword
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={loading}
            aria-invalid={!!validationErrors.confirmPassword}
            aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          {validationErrors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>
      )}

      {/* API Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isSignup ? 'Creating account...' : 'Signing in...'}
          </span>
        ) : (
          <span>{isSignup ? 'Create account' : 'Sign in'}</span>
        )}
      </button>
    </form>
  );
}
