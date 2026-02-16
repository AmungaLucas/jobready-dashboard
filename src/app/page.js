'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push('/login');
      } else {
        // User exists, check role and redirect accordingly
        if (!userRole) {
          // User has no role assigned - show unauthorized
          router.push('/unauthorized');
        } else {
          // Redirect based on role
          switch (userRole) {
            case 'admin':
              router.push('/admin-dashboard');
              break;
            case 'editor':
              router.push('/editorial-dashboard');
              break;
            case 'moderator':
              router.push('/moderators-dashboard');
              break;
            default:
              // Invalid role
              router.push('/unauthorized');
          }
        }
      }
    }
  }, [user, userRole, loading, router]);

  // Show loading spinner while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}