'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { user, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user has a valid role, redirect to their dashboard
    if (userRole) {
      const redirectPath = {
        admin: '/admin-dashboard',
        editor: '/editorial-dashboard',
        moderator: '/moderators-dashboard',
      }[userRole];
      
      if (redirectPath) {
        router.push(redirectPath);
      }
    }
  }, [userRole, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page.
            {user && (
              <span> Your current role is: <strong>{userRole}</strong></span>
            )}
          </p>
        </div>
        
        <div className="space-y-4">
          {user ? (
            <>
              <Link
                href={
                  userRole === 'admin' ? '/admin-dashboard' :
                  userRole === 'editor' ? '/editorial-dashboard' :
                  userRole === 'moderator' ? '/moderators-dashboard' :
                  '/'
                }
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Your Dashboard
              </Link>
              <br />
              <Link
                href="/"
                className="inline-block px-6 py-3 text-gray-600 hover:text-gray-900"
              >
                Return Home
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}