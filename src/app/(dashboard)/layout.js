'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({ children }) {
  const { user, userRole, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /* ================= ROLE PROTECTION ================= */
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const correctPath = {
        admin: '/admin-dashboard',
        editor: '/editorial-dashboard',
        moderator: '/moderators-dashboard',
      }[userRole];

      if (correctPath && !pathname.startsWith(correctPath)) {
        router.push(correctPath);
      }
    }
  }, [user, userRole, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !userRole) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  /* ================= NAVIGATION ================= */
  const navigationItems = {
    admin: [
      { name: 'Dashboard', href: '/admin-dashboard' },
      { name: 'Users', href: '/admin-dashboard/users' },
      { name: 'Analytics', href: '/admin-dashboard/analytics' },
      { name: 'Settings', href: '/admin-dashboard/settings' },
    ],
    editor: [
      { name: 'Dashboard', href: '/editorial-dashboard' },
      { name: 'Posts', href: '/editorial-dashboard/posts' },
      { name: 'Media', href: '/editorial-dashboard/media' },
      { name: 'Schedule', href: '/editorial-dashboard/schedule' },
    ],
    moderator: [
      { name: 'Dashboard', href: '/moderators-dashboard' },
      { name: 'Reports', href: '/moderators-dashboard/reports' },
      { name: 'Comments', href: '/moderators-dashboard/comments' },
      { name: 'Users', href: '/moderators-dashboard/users' },
    ],
  };

  const currentNav = navigationItems[userRole] || [];

  /* ================= LAYOUT ================= */
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">

        {/* Logo / Title */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold capitalize">
            {userRole} Panel
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {currentNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

          <h1 className="text-lg font-semibold capitalize">
            {userRole} Dashboard
          </h1>

          {/* User Info */}
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <Image
                src={user.avatar}
                width={40}
                height={40}
                alt="avatar"
                className="rounded-full"
              />
            )}

            <div className="text-sm">
              <p className="font-medium">{user?.name || user?.email}</p>
              <p className="text-gray-500 text-xs capitalize">{userRole}</p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
