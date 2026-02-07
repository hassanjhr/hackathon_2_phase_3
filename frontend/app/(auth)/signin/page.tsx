'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/auth/context';
import { getErrorMessage, getValidationErrors } from '@/lib/utils/errors';
import { SigninFormData } from '@/types';

/**
 * Signin Page
 * User authentication page
 */
export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signin, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Check for success message from signup
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (data: SigninFormData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await signin(data.email, data.password);

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Handle validation errors
      const validationErrors = getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        // Show first validation error
        const firstError = Object.values(validationErrors)[0];
        setError(firstError);
      } else {
        // Show generic error message
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4" role="alert">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Signin Form */}
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm
            mode="signin"
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
