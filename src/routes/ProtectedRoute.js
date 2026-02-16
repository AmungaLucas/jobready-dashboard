'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const roleBasedPaths = {
  admin: '/admin-dashboard',
  editor: '/editorial-dashboard',
  moderator: '/moderators-dashboard',
};

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Case 1: No user - redirect to login
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Case 2: User has no role or invalid role
      if (!userRole || !['admin', 'editor', 'moderator'].includes(userRole)) {
        router.push('/unauthorized');
        return;
      }

      // Case 3: User has role but not allowed for this page
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Instead of 404, show unauthorized
        router.push('/unauthorized');
        return;
      }

      // Case 4: User is on wrong dashboard based on their role
      const expectedPath = roleBasedPaths[userRole];
      if (expectedPath && !pathname.startsWith(expectedPath) && 
          !pathname.startsWith('/unauthorized') && 
          !pathname.startsWith('/login')) {
        router.push(expectedPath);
      }
    }
  }, [user, userRole, loading, router, allowedRoles, pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check authorization
  if (!user || !userRole) {
    return null;
  }

  // If user role is not allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
};