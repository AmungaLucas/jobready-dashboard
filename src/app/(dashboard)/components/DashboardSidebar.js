'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
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
    FolderIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
    XMarkIcon,
    ChevronDownIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

// Role configurations
const roleConfig = {
    admin: {
        theme: 'blue',
        title: 'Admin Panel',
        subtitle: 'Full system control',
        logo: ShieldCheckIcon,
        stats: null,
        navigation: [
            { name: 'Dashboard', href: '/admin-dashboard', icon: HomeIcon },
            { name: 'Users', href: '/admin-dashboard/users', icon: UsersIcon },
            { name: 'Team', href: '/admin-dashboard/team', icon: UserGroupIcon },
            { name: 'Organisations', href: '/admin-dashboard/organisations', icon: BuildingOfficeIcon },
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
        stats: {
            title: 'Queue Status',
            badgeSource: 'moderation-stats',
            items: [
                { label: 'Pending Reports', key: 'pendingReports' },
                { label: 'Flagged Comments', key: 'flaggedComments' },
                { label: 'Awaiting Review', key: 'awaitingReview' },
            ],
        },
        navigation: [
            { name: 'Dashboard', href: '/moderators-dashboard', icon: HomeIcon },
            { name: 'Reports', href: '/moderators-dashboard/reports', icon: FlagIcon },
            {
                name: 'Pending Reports',
                href: '/moderators-dashboard/reports/pending',
                icon: ClockIcon,
                badge: { key: 'pendingReports' },
            },
            { name: 'Comments', href: '/moderators-dashboard/comments', icon: ChatBubbleLeftIcon },
            { name: 'Users', href: '/moderators-dashboard/users', icon: UsersIcon },
            { name: 'Organisations', href: '/moderators-dashboard/organisations', icon: BuildingOfficeIcon },
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
        stats: {
            title: "Today's Stats",
            badgeSource: 'editorial-stats',
            items: [
                { label: 'Published', key: 'publishedToday' },
                { label: 'Drafts', key: 'draftCount' },
            ],
        },
        navigation: [
            { name: 'Dashboard', href: '/editorial-dashboard', icon: HomeIcon },
            {
                name: 'Posts',
                href: '/editorial-dashboard/posts',
                icon: DocumentTextIcon,
                children: [
                    { name: 'All Posts', href: '/editorial-dashboard/posts' },
                    { name: 'Create Post', href: '/editorial-dashboard/posts/create' },
                ],
            },
            {
                name: 'Jobs',
                href: '/editorial-dashboard/jobs',
                icon: FolderIcon,
                children: [
                    { name: 'All Jobs', href: '/editorial-dashboard/jobs' },
                    { name: 'Create Job', href: '/editorial-dashboard/jobs/create' },
                ],
            },
            { name: 'Media Library', href: '/editorial-dashboard/media', icon: PhotoIcon },
            { name: 'Organisations', href: '/editorial-dashboard/organisations', icon: BuildingOfficeIcon },
            { name: 'Categories', href: '/editorial-dashboard/categories', icon: FolderIcon },
            { name: 'Schedule', href: '/editorial-dashboard/schedule', icon: CalendarIcon },
            { name: 'Analytics', href: '/editorial-dashboard/analytics', icon: ChartBarIcon },
            { name: 'Drafts', href: '/editorial-dashboard/drafts', icon: ClockIcon },
        ],
    },
};

// Clean styling tokens (works with Tailwind JIT safely)
const themeTokens = {
    blue: {
        accent: 'bg-blue-600',
        accentText: 'text-blue-600',
        activeBg: 'bg-blue-50',
        activeText: 'text-blue-700',
        hoverBg: 'hover:bg-gray-50',
        icon: 'text-gray-500',
        iconActive: 'text-blue-700',
        badge: 'bg-blue-600',
    },
    purple: {
        accent: 'bg-purple-600',
        accentText: 'text-purple-600',
        activeBg: 'bg-purple-50',
        activeText: 'text-purple-700',
        hoverBg: 'hover:bg-gray-50',
        icon: 'text-gray-500',
        iconActive: 'text-purple-700',
        badge: 'bg-purple-600',
    },
    green: {
        accent: 'bg-green-600',
        accentText: 'text-green-600',
        activeBg: 'bg-green-50',
        activeText: 'text-green-700',
        hoverBg: 'hover:bg-gray-50',
        icon: 'text-gray-500',
        iconActive: 'text-green-700',
        badge: 'bg-green-600',
    },
};

function cn() {
    return Array.from(arguments).filter(Boolean).join(' ');
}

export default function DashboardSidebar(props) {
    const { isOpen, onClose } = props || {};
    const pathname = usePathname();
    const { userRole = 'admin', logout } = useAuth();

    const [stats, setStats] = useState({});
    const [openSections, setOpenSections] = useState({});

    const config = roleConfig[userRole] || roleConfig.admin;
    const LogoIcon = config.logo;

    const theme = useMemo(() => themeTokens[config.theme] || themeTokens.blue, [config.theme]);

    const isActiveExact = (href) => pathname === href;

    // Parent active when any child is active OR route sits under that section
    const isParentActive = (item) => {
        if (item.children && item.children.length) return item.children.some((c) => pathname === c.href);
        return pathname === item.href || (pathname && pathname.startsWith(item.href + '/'));
    };

    useEffect(() => {
        const next = {};
        (config.navigation || []).forEach((item) => {
            if (item.children && item.children.length) {
                const childOn = item.children.some((c) => pathname === c.href);
                if (childOn) next[item.href] = true;
            }
        });
        setOpenSections((prev) => ({ ...prev, ...next }));
    }, [pathname, config.navigation]);

    const toggleSection = (href) => setOpenSections((prev) => ({ ...prev, [href]: !prev[href] }));

    useEffect(() => {
        const fetchStats = async () => {
            if (!config.stats || !config.stats.badgeSource) return;
            try {
                const res = await fetch(`/api/stats/${config.stats.badgeSource}`);
                if (!res.ok) return;
                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('application/json')) return;
                const data = await res.json();
                setStats(data || {});
            } catch {
                // silent
            }
        };
        fetchStats();
    }, [config.stats && config.stats.badgeSource]);

    const getBadgeCount = (badge) => {
        if (!badge) return 0;
        if (badge.key && stats[badge.key] != null) return stats[badge.key];
        return badge.count || 0;
    };

    const handleLogout = async () => {
        await logout();
    };

    const SidebarInner = (
        <div className="flex h-full flex-col bg-white">
            {/* Header */}
            <div className="shrink-0 border-b border-gray-200 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl', theme.activeBg)}>
                                <LogoIcon className={cn('h-5 w-5', theme.accentText)} />
                            </span>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-gray-900">{config.title}</div>
                                <div className="truncate text-xs text-gray-500">{config.subtitle}</div>
                            </div>
                        </div>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="md:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            aria-label="Close sidebar"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
                <div className="space-y-1">
                    {(config.navigation || []).map((item) => {
                        const hasChildren = !!(item.children && item.children.length);
                        const parentActive = isParentActive(item);
                        const sectionOpen = hasChildren ? (openSections[item.href] != null ? openSections[item.href] : parentActive) : false;
                        const badgeCount = getBadgeCount(item.badge);

                        const RowBase = cn(
                            'group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition',
                            theme.hoverBg
                        );

                        const LeftRail = (
                            <span
                                className={cn(
                                    'absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full opacity-0 transition',
                                    theme.accent,
                                    parentActive && 'opacity-100'
                                )}
                            />
                        );

                        if (!hasChildren) {
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => onClose && onClose()}
                                    className={cn(RowBase, parentActive ? cn(theme.activeBg, theme.activeText) : 'text-gray-700')}
                                >
                                    {LeftRail}
                                    <div className="flex min-w-0 items-center gap-3">
                                        <item.icon className={cn('h-5 w-5 shrink-0', parentActive ? theme.iconActive : theme.icon)} />
                                        <span className="truncate">{item.name}</span>
                                    </div>

                                    {badgeCount > 0 && (
                                        <span
                                            className={cn(
                                                'ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold text-white',
                                                theme.badge
                                            )}
                                        >
                                            {badgeCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        }

                        return (
                            <div key={item.name} className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection(item.href)}
                                    className={cn(RowBase, parentActive ? cn(theme.activeBg, theme.activeText) : 'text-gray-700')}
                                    aria-expanded={sectionOpen}
                                >
                                    {LeftRail}
                                    <div className="flex min-w-0 items-center gap-3">
                                        <item.icon className={cn('h-5 w-5 shrink-0', parentActive ? theme.iconActive : theme.icon)} />
                                        <span className="truncate">{item.name}</span>
                                    </div>

                                    <ChevronDownIcon
                                        className={cn('h-4 w-4 shrink-0 text-gray-500 transition-transform', sectionOpen && 'rotate-180')}
                                    />
                                </button>

                                {sectionOpen && (
                                    <div className="ml-3 border-l border-gray-200 pl-3">
                                        <div className="space-y-1">
                                            {item.children.map((child) => {
                                                const childActive = isActiveExact(child.href);
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        onClick={() => onClose && onClose()}
                                                        className={cn(
                                                            'relative flex items-center rounded-xl px-3 py-2 text-sm transition',
                                                            theme.hoverBg,
                                                            childActive ? cn(theme.activeBg, theme.activeText) : 'text-gray-700'
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full opacity-0',
                                                                theme.accent,
                                                                childActive && 'opacity-100'
                                                            )}
                                                        />
                                                        <span className="truncate">{child.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Stats */}
            {config.stats && (
                <div className="shrink-0 border-t border-gray-200 px-4 py-3">
                    <div className="mb-2 text-xs font-semibold text-gray-600">{config.stats.title}</div>
                    <div className="grid grid-cols-1 gap-2">
                        {config.stats.items.map((s) => (
                            <div key={s.key} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                                <span className="truncate text-sm text-gray-700">{s.label}</span>
                                <span className={cn('text-sm font-semibold', theme.accentText)}>{stats[s.key] ?? 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-200 p-4">
                <button
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop */}
            <aside className="hidden h-screen w-72 shrink-0 border-r border-gray-200 md:block">
                {SidebarInner}
            </aside>

            {/* Mobile */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/40" onClick={onClose} />
                    <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] overflow-hidden shadow-2xl">
                        {SidebarInner}
                    </div>
                </div>
            )}
        </>
    );
}