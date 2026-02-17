'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';

export default function ModeratorDashboardLayout({ children }) {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!['moderator', 'admin'].includes(userRole)) {
                router.push('/editorial-dashboard');
            }
        }
    }, [user, userRole, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user || !['moderator', 'admin'].includes(userRole)) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
                    <div className="min-w-0 max-w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}