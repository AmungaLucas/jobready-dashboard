'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';

export default function EditorialDashboardLayout({ children }) {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileStatus, setProfileStatus] = useState({
        needsProfileUpdate: false,
        loading: true
    });

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!['editor', 'admin'].includes(userRole)) {
                router.push('/moderators-dashboard');
            } else if (user?.uid) {
                // Check profile status
                checkProfileStatus();
            }
        }
    }, [user, userRole, loading, router]);

    const checkProfileStatus = async () => {
        try {
            const response = await fetch(`/api/editor/status?userId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setProfileStatus({
                    needsProfileUpdate: data.needsProfileUpdate,
                    loading: false
                });
            } else {
                setProfileStatus({ needsProfileUpdate: false, loading: false });
            }
        } catch (error) {
            console.error('Error checking profile status:', error);
            setProfileStatus({ needsProfileUpdate: false, loading: false });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
            </div>
        );
    }

    if (!user || !['editor', 'admin'].includes(userRole)) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar - Fixed/sticky on desktop */}
            <div className="hidden md:block md:flex-shrink-0">
                <DashboardSidebar />
            </div>

            {/* Mobile Sidebar - Slide-over panel */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Sidebar panel */}
                    <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-2xl">
                        <DashboardSidebar
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

                {/* Scrollable main content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-0 sm:p-2">
                        {/* Profile Update Banner */}
                        {!profileStatus.loading && profileStatus.needsProfileUpdate && (
                            <div className="mb-6 p-4 rounded-lg bg-linear-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 shadow-md">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-200 rounded-full">
                                            <svg className="h-5 w-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-yellow-800">Complete Your Editor Profile</h3>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Your editor profile needs additional information before you can start publishing.
                                                Please complete your bio and at least one social link.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <a
                                            href="/editorial-dashboard/profile/edit"
                                            className="flex-1 sm:flex-none px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium text-center"
                                        >
                                            Complete Profile
                                        </a>
                                        <button
                                            onClick={() => setProfileStatus(prev => ({ ...prev, needsProfileUpdate: false }))}
                                            className="px-3 py-2 text-yellow-700 hover:text-yellow-900 text-sm font-medium"
                                        >
                                            Later
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}