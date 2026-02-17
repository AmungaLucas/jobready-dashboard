'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {
    HomeIcon,
    UsersIcon,
    ChartBarIcon,
    CogIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    FlagIcon,
    ChatBubbleLeftIcon,
    PhotoIcon,
    CalendarIcon,
    PencilSquareIcon,
    FolderIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

// Role configurations (keep your existing roleConfig here)
const roleConfig = {
    admin: {
        theme: 'blue',
        title: 'Admin Panel',
        subtitle: 'Full system control',
        logo: ShieldCheckIcon,
        bgGradient: 'bg-gray-900',
        textColor: 'text-white',
        mutedTextColor: 'text-gray-400',
        navBg: 'bg-gray-700',
        stats: null,
        navigation: [
            { name: 'Dashboard', href: '/admin-dashboard', icon: HomeIcon },
            { name: 'Users', href: '/admin-dashboard/users', icon: UsersIcon },
            { name: 'Team', href: '/admin-dashboard/team', icon: UserGroupIcon },
            { name: 'Analytics', href: '/admin-dashboard/analytics', icon: ChartBarIcon },
            { name: 'Settings', href: '/admin-dashboard/settings', icon: CogIcon },
            { name: 'Roles & Permissions', href: '/admin-dashboard/roles', icon: ShieldCheckIcon },
            { name: 'Content Moderation', href: '/admin-dashboard/moderation', icon: FlagIcon },
            { name: 'System Logs', href: '/admin-dashboard/logs', icon: DocumentTextIcon },
            { name: 'Comments', href: '/admin-dashboard/comments', icon: ChatBubbleLeftIcon },
        ],
    },
    moderator: {
        theme: 'purple',
        title: 'Moderation',
        subtitle: 'Community Management',
        logo: ShieldCheckIcon,
        bgGradient: 'bg-white',
        textColor: 'text-gray-700',
        mutedTextColor: 'text-gray-500',
        navBg: 'bg-purple-50',
        stats: {
            title: 'Queue Status',
            bgColor: 'bg-purple-50',
            badgeSource: 'moderation-stats',
            items: [
                { label: 'Pending Reports', key: 'pendingReports', color: 'text-purple-600' },
                { label: 'Flagged Comments', key: 'flaggedComments', color: 'text-purple-600' },
                { label: 'Awaiting Review', key: 'awaitingReview', color: 'text-purple-600' },
            ]
        },
        navigation: [
            { name: 'Dashboard', href: '/moderators-dashboard', icon: HomeIcon },
            { name: 'Reports', href: '/moderators-dashboard/reports', icon: FlagIcon },
            {
                name: 'Pending Reports',
                href: '/moderators-dashboard/reports/pending',
                icon: ClockIcon,
                badge: { key: 'pendingReports', color: 'bg-red-500' }
            },
            { name: 'Comments', href: '/moderators-dashboard/comments', icon: ChatBubbleLeftIcon },
            { name: 'Users', href: '/moderators-dashboard/users', icon: UsersIcon },
            { name: 'Flagged Content', href: '/moderators-dashboard/flagged', icon: ExclamationTriangleIcon },
            { name: 'Approved', href: '/moderators-dashboard/approved', icon: CheckCircleIcon },
            { name: 'Moderation Logs', href: '/moderators-dashboard/logs', icon: DocumentTextIcon },
        ],
    },
    editor: {
        theme: 'green',
        title: 'Editorial',
        subtitle: 'Content Management',
        logo: DocumentTextIcon,
        bgGradient: 'bg-white',
        textColor: 'text-gray-700',
        mutedTextColor: 'text-gray-500',
        navBg: 'bg-green-50',
        stats: {
            title: "Today's Stats",
            bgColor: 'bg-gray-50',
            badgeSource: 'editorial-stats',
            items: [
                { label: 'Published', key: 'publishedToday', color: 'text-green-600' },
                { label: 'Drafts', key: 'draftCount', color: 'text-green-600' },
            ]
        },
        navigation: [
            { name: 'Dashboard', href: '/editorial-dashboard', icon: HomeIcon },
            { name: 'All Posts', href: '/editorial-dashboard/posts', icon: DocumentTextIcon },
            { name: 'Create Post', href: '/editorial-dashboard/posts/create', icon: PencilSquareIcon },
            { name: 'Media Library', href: '/editorial-dashboard/media', icon: PhotoIcon },
            { name: 'Categories', href: '/editorial-dashboard/categories', icon: FolderIcon },
            { name: 'Schedule', href: '/editorial-dashboard/schedule', icon: CalendarIcon },
            { name: 'Analytics', href: '/editorial-dashboard/analytics', icon: ChartBarIcon },
            { name: 'Drafts', href: '/editorial-dashboard/drafts', icon: ClockIcon },
        ],
    },
};

export default function DashboardSidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const { userRole = 'admin', logout } = useAuth();
    const [stats, setStats] = useState({});

    const config = roleConfig[userRole] || roleConfig.admin;
    const LogoIcon = config.logo;
    const themeColor = config.theme;

    // Fetch dynamic stats
    useEffect(() => {
        const fetchStats = async () => {
            if (config.stats?.badgeSource) {
                try {
                    const response = await fetch(`/api/stats/${config.stats.badgeSource}`);
                    if (!response.ok) {
                        console.warn('Stats API returned non-OK status', response.status);
                        return;
                    }

                    const contentType = response.headers.get('content-type') || '';
                    if (!contentType.includes('application/json')) {
                        console.warn('Stats API returned non-JSON response', contentType);
                        return;
                    }

                    const data = await response.json();
                    setStats(data || {});
                } catch (error) {
                    console.error('Failed to fetch stats:', error);
                }
            }
        };

        fetchStats();
    }, [config.stats?.badgeSource]);

    const handleLogout = async () => {
        await logout();
    };

    const isActiveRoute = (href) => {
        return pathname === href || pathname?.startsWith(href + '/');
    };

    const getBadgeCount = (badge) => {
        if (!badge) return null;
        return stats[badge.key] || badge.count || 0;
    };

    // Sidebar content
    const sidebarContent = (
        <div className={`flex flex-col h-full ${config.bgGradient} ${config.textColor}`}>
            {/* Logo Section */}
            <div className={`p-4 sm:p-6 border-b ${userRole === 'admin' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                <div className="flex items-center justify-between">
                    <h2 className={`text-lg sm:text-xl font-bold flex items-center truncate`}>
                        <LogoIcon className={`h-6 w-6 sm:h-8 sm:w-8 mr-2 flex-shrink-0 text-${themeColor}-400`} />
                        <span className="truncate">{config.title}</span>
                    </h2>
                    {/* Close button for mobile */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-50"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <p className={`text-xs ${config.mutedTextColor} mt-1 truncate`}>{config.subtitle}</p>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
                {config.navigation.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const badgeCount = getBadgeCount(item.badge);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => onClose && onClose()}
                            className={`
                                flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? `bg-${themeColor}-600 text-white shadow-md`
                                    : `${config.textColor} hover:bg-${themeColor}-50 hover:text-${themeColor}-600`
                                }
                            `}
                        >
                            <div className="flex items-center min-w-0">
                                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : config.mutedTextColor}`} />
                                <span className="truncate">{item.name}</span>
                            </div>
                            {badgeCount > 0 && (
                                <span className={`${item.badge?.color || 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full min-w-5 text-center ml-2 flex-shrink-0`}>
                                    {badgeCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Stats */}
            {config.stats && (
                <div className={`p-4 border-t ${userRole === 'admin' ? 'border-gray-700' : 'border-gray-200'} ${config.stats.bgColor} flex-shrink-0`}>
                    <div className={`text-xs ${userRole === 'admin' ? 'text-gray-400' : `text-${themeColor}-600`} font-semibold mb-2`}>
                        {config.stats.title}
                    </div>
                    <div className="space-y-2">
                        {config.stats.items.map((stat, index) => {
                            const value = stats[stat.key] || stat.value || 0;
                            return (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className={`${config.textColor} truncate`}>{stat.label}</span>
                                    <span className={`font-semibold ${stat.color} ml-2 flex-shrink-0`}>{value}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Logout Button */}
            <div className={`p-4 border-t ${userRole === 'admin' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-white shadow-xl overflow-y-auto">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}