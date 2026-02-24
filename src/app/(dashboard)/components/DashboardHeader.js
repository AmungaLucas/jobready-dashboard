'use client';

import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
    BellIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    UserIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    FlagIcon,
    ChatBubbleLeftIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    DocumentIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';

// Role-specific configurations (keep your existing roleConfig here)
const roleConfig = {
    admin: {
        theme: 'blue',
        roleName: 'Administrator',
        searchPlaceholder: 'Search users, posts, settings...',
        stats: [],
        menuItems: [
            { href: '/admin-dashboard/profile', icon: UserIcon, label: 'Your Profile' },
            { href: '/admin-dashboard/settings', icon: Cog6ToothIcon, label: 'Settings' },
        ],
        notificationTypes: {
            user: { icon: UserGroupIcon, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
            system: { icon: Cog6ToothIcon, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
        }
    },
    moderator: {
        theme: 'purple',
        roleName: 'Moderator',
        searchPlaceholder: 'Search reports, comments, users...',
        stats: [
            { icon: FlagIcon, bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-500', count: 12, type: 'reports' },
            { icon: ChatBubbleLeftIcon, bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', iconColor: 'text-yellow-500', count: 8, type: 'flagged' },
            { icon: UserGroupIcon, bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-500', count: 3, type: 'users' },
        ],
        menuItems: [
            { href: '/moderators-dashboard/profile', icon: UserIcon, label: 'Your Profile' },
            { href: '/moderators-dashboard/settings', icon: Cog6ToothIcon, label: 'Settings' },
            { href: '/moderators-dashboard/activity', icon: DocumentIcon, label: 'Activity Log' },
        ],
        notificationTypes: {
            report: { icon: FlagIcon, bgColor: 'bg-red-100', iconColor: 'text-red-600' },
            comment: { icon: ChatBubbleLeftIcon, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
            user: { icon: UserGroupIcon, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
        }
    },
    editor: {
        theme: 'green',
        roleName: 'Editor',
        searchPlaceholder: 'Search articles, pages, media...',
        stats: [
            { icon: DocumentIcon, bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', count: 5, type: 'pending' },
            { icon: ChatBubbleLeftIcon, bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-500', count: 12, type: 'comments' },
        ],
        menuItems: [
            { href: '/editorial-dashboard/profile', icon: UserIcon, label: 'Your Profile' },
            { href: '/editorial-dashboard/settings', icon: Cog6ToothIcon, label: 'Settings' },
        ],
        notificationTypes: {
            article: { icon: DocumentIcon, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
            comment: { icon: ChatBubbleLeftIcon, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
        }
    }
};

// Sample notifications function (keep your existing one)
const getNotificationsForRole = (role) => {
    const notifications = {
        admin: [
            { id: 1, text: '5 new user registrations', time: '10 min ago', type: 'user' },
            { id: 2, text: 'System update available', time: '1 hour ago', type: 'system' },
            { id: 3, text: '3 reports need attention', time: '2 hours ago', type: 'user' },
        ],
        moderator: [
            { id: 1, text: '12 new reports pending review', time: '5 min ago', type: 'report' },
            { id: 2, text: '8 comments flagged as spam', time: '15 min ago', type: 'comment' },
            { id: 3, text: '3 users require moderation action', time: '1 hour ago', type: 'user' },
        ],
        editor: [
            { id: 1, text: '5 articles pending review', time: '10 min ago', type: 'article' },
            { id: 2, text: '12 new comments on your posts', time: '25 min ago', type: 'comment' },
            { id: 3, text: 'Scheduled publication completed', time: '1 hour ago', type: 'article' },
        ],
    };
    return notifications[role] || [];
};

export default function DashboardHeader({ onMenuClick }) {
    const { user, userRole = 'admin', logout } = useAuth(); // Add logout here
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Refs for dropdowns
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);

    const config = roleConfig[userRole] || roleConfig.admin;
    const notifications = getNotificationsForRole(userRole);
    const themeColor = config.theme;

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            // The logout function from AuthContext should handle redirect
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center border-b sticky top-0 z-40">
            {/* Left side - Menu button for mobile and Search */}
            <div className="flex items-center flex-1 min-w-0">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-2"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Search - hidden on mobile, visible on sm and up */}
                <div className="hidden sm:block flex-1 max-w-md lg:max-w-xs">
                    <label htmlFor="dashboard-search" className="sr-only">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="dashboard-search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={config.searchPlaceholder}
                            type="search"
                        />
                    </div>
                </div>
            </div>

            {/* Right side - Actions & Profile */}
            <div className="flex items-center gap-1 sm:gap-3">
                {/* Quick Stats - Hide on mobile, show on md and up */}
                {config.stats && config.stats.length > 0 && (
                    <div className="hidden md:flex items-center gap-2 mr-2">
                        {config.stats.map((stat, index) => (
                            <div key={index} className={`flex items-center gap-1 px-3 py-1 ${stat.bgColor} rounded-full`}>
                                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                                <span className={`text-sm font-medium ${stat.textColor}`}>{stat.count}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 text-gray-400 hover:text-${themeColor}-600 hover:bg-${themeColor}-50 rounded-lg transition-colors`}
                    >
                        <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.map((notif) => {
                                    const notifType = config.notificationTypes[notif.type] || config.notificationTypes.user;
                                    const IconComponent = notifType.icon;
                                    return (
                                        <div key={notif.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full shrink-0 ${notifType.bgColor}`}>
                                                    <IconComponent className={`h-4 w-4 ${notifType.iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-800 wrap-break-word">{notif.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-3 border-t border-gray-200">
                                <button className={`text-sm text-${themeColor}-600 hover:text-${themeColor}-700 font-medium`}>
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`flex items-center gap-1 sm:gap-3 p-1 sm:p-2 rounded-lg hover:bg-${themeColor}-50 transition-colors`}
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            {user?.avatar ? (
                                <Image
                                    src={user.avatar}
                                    width={36}
                                    height={36}
                                    alt="avatar"
                                    className="rounded-full ring-2 ring-blue-500 h-8 w-8 sm:h-10 sm:w-10"
                                />
                            ) : (
                                <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-linear-to-r from-${themeColor}-500 to-${themeColor}-600 flex items-center justify-center text-white font-bold shadow-md text-sm sm:text-base`}>
                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="text-left hidden lg:block">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-37.5">
                                    {user?.name || user?.email}
                                </p>
                                <p className={`text-xs text-${themeColor}-600 flex items-center`}>
                                    <ShieldCheckIcon className="h-3 w-3 mr-1 shrink-0" />
                                    <span className="truncate">{config.roleName}</span>
                                </p>
                            </div>
                            <ChevronDownIcon className="h-4 w-4 text-gray-500 hidden lg:block shrink-0" />
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                                {config.menuItems.map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.href}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                    </a>
                                ))}
                                <div className="border-t border-gray-200 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">Sign out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}