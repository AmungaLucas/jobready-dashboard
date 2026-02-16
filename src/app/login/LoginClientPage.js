'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginClientPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, userRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (user && userRole) {
      const roleRedirect = {
        admin: '/admin-dashboard',
        editor: '/editorial-dashboard',
        moderator: '/moderators-dashboard',
      }[userRole] || '/unauthorized';
      
      router.push(roleRedirect);
    }
  }, [user, userRole, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Login successful - redirect will be handled by useEffect
      console.log('Login successful');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Demo credentials: admin@example.com / editor@example.com / moderator@example.com
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Demo login buttons */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('password123');
              }}
              className="text-xs bg-purple-100 text-purple-800 px-3 py-2 rounded hover:bg-purple-200"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('editor@example.com');
                setPassword('password123');
              }}
              className="text-xs bg-green-100 text-green-800 px-3 py-2 rounded hover:bg-green-200"
            >
              Editor Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('moderator@example.com');
                setPassword('password123');
              }}
              className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded hover:bg-yellow-200"
            >
              Moderator Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}