'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Landing Page
 * Redirects users based on authentication status
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has token in localStorage
    const token = localStorage.getItem('auth_token');

    if (token) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not authenticated, redirect to signin
      router.push('/signin');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
