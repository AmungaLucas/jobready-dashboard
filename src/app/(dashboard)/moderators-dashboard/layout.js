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
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar - Fixed/Sticky */}
            <div className="hidden md:block md:flex-shrink-0">
                <div className="h-screen overflow-y-auto sticky top-0">
                    <DashboardSidebar />
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-2xl">
                        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

                {/* Scrollable Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        <div className="min-w-0 max-w-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}