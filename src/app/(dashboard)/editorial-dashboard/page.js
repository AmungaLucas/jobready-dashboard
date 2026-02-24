'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import {
    FileText,
    Eye,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Upload,
    Calendar,
    BarChart3,
    Users,
    MessageCircle,
    Share2,
    Edit,
    MoreVertical,
    ChevronRight,
    Loader2,
    Zap,
    Award,
    Target,
    Activity,
    BookOpen,
    PenTool,
    Image as ImageIcon,
    Video,
    Settings,
    HelpCircle,
    Bell,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react';

export default function EditorialDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        viewsToday: 0,
        viewsYesterday: 0,
        engagementRate: 0,
        previousEngagement: 0,
        draftPosts: 0,
        publishedPosts: 0,
        pendingReviews: 0,
        totalPosts: 0,
        totalComments: 0,
        totalShares: 0,
        avgReadTime: 0
    });
    const [recentPosts, setRecentPosts] = useState([]);
    const [performanceData, setPerformanceData] = useState({
        dailyViews: 45,
        weeklyGrowth: 12,
        topCategories: [],
        recentActivity: []
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState('today');

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch stats
                const statsRes = await fetch('/api/dashboard/stats');
                const statsData = await statsRes.json();
                if (!statsRes.ok) throw new Error(statsData.error || 'Failed to fetch stats');
                setStats(statsData);

                // Fetch recent posts
                const postsRes = await fetch('/api/posts?limit=5&sort=newest');
                const postsData = await postsRes.json();
                if (!postsRes.ok) throw new Error(postsData.error || 'Failed to fetch posts');
                setRecentPosts(postsData.posts || []);

                // Fetch performance data
                const perfRes = await fetch('/api/dashboard/performance');
                const perfData = await perfRes.json();
                if (!perfRes.ok) throw new Error(perfData.error || 'Failed to fetch performance');
                setPerformanceData(perfData);

            } catch (err) {
                console.error('Dashboard error:', err);
                setError(err.message);
                
                // Set mock data for demo
                setStats({
                    viewsToday: 1234,
                    viewsYesterday: 1100,
                    engagementRate: 12.5,
                    previousEngagement: 10.2,
                    draftPosts: 8,
                    publishedPosts: 45,
                    pendingReviews: 3,
                    totalPosts: 56,
                    totalComments: 234,
                    totalShares: 89,
                    avgReadTime: 4.5
                });
                
                setRecentPosts([
                    {
                        id: '1',
                        title: 'Getting Started with Next.js',
                        status: 'published',
                        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        views: 1234,
                        comments: 23
                    },
                    {
                        id: '2',
                        title: 'Firebase Authentication Guide',
                        status: 'draft',
                        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        views: 0,
                        comments: 0
                    },
                    {
                        id: '3',
                        title: 'Role-Based Access Control',
                        status: 'review',
                        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        views: 0,
                        comments: 0
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Calculate percentage change
    const getPercentChange = (current, previous) => {
        if (!previous) return '+0%';
        const change = ((current - previous) / previous) * 100;
        return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    };

    // Format date
    const formatTimeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return past.toLocaleDateString();
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Published
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Draft
                    </span>
                );
            case 'review':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Review
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <FileText className="w-3 h-3" />
                        {status}
                    </span>
                );
        }
    };

    // Loading state
    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['editor', 'admin']}>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['editor', 'admin']}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    <nav className="p-4">
                        <ul className="space-y-2">
                            <li>
                                <Link href="/editorial-dashboard" className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <BarChart3 className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/editorial-dashboard/posts" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    <FileText className="w-4 h-4" />
                                    Posts
                                </Link>
                            </li>
                            <li>
                                <Link href="/editorial-dashboard/jobs" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    <Briefcase className="w-4 h-4" />
                                    Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/editorial-dashboard/media" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    <ImageIcon className="w-4 h-4" />
                                    Media
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Top Navigation */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                                >
                                    <Menu className="w-5 h-5 text-gray-500" />
                                </button>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                                        Manage content, track performance, and publish faster.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
                                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        JD
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">John Doe</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Time Range Selector */}
                    <div className="flex items-center justify-end mb-6">
                        <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg p-1">
                            {['today', 'week', 'month'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setSelectedTimeRange(range)}
                                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                        selectedTimeRange === range
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        {/* Views */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    stats.viewsToday > stats.viewsYesterday 
                                        ? 'bg-green-50 text-green-600' 
                                        : 'bg-red-50 text-red-600'
                                }`}>
                                    {getPercentChange(stats.viewsToday, stats.viewsYesterday)}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Views Today</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                {stats.viewsToday?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">vs {stats.viewsYesterday?.toLocaleString()} yesterday</p>
                        </div>

                        {/* Engagement */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    stats.engagementRate > stats.previousEngagement 
                                        ? 'bg-green-50 text-green-600' 
                                        : 'bg-red-50 text-red-600'
                                }`}>
                                    {getPercentChange(stats.engagementRate, stats.previousEngagement)}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Engagement Rate</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.engagementRate}%</p>
                            <p className="text-xs text-gray-400 mt-1">Avg. read time: {stats.avgReadTime}m</p>
                        </div>

                        {/* Drafts */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-yellow-50 rounded-lg">
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                                    {stats.pendingReviews} pending
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Draft Posts</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
                            <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
                        </div>

                        {/* Published */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
                                    Total {stats.totalPosts}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Published</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
                            <p className="text-xs text-gray-400 mt-1">{stats.totalComments} comments • {stats.totalShares} shares</p>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Recent Posts & Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Recent Posts */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Posts</h3>
                                        <Link
                                            href="/editorial-dashboard/posts"
                                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            View All
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {recentPosts.length > 0 ? (
                                        recentPosts.map((post) => (
                                            <div key={post.id} className="p-5 sm:p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={`/editorial-dashboard/posts/${post.id}`}
                                                            className="text-sm sm:text-base font-semibold text-gray-900 hover:text-blue-600 block mb-1 truncate"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatTimeAgo(post.publishedAt || post.updatedAt || post.createdAt)}
                                                            </span>
                                                            {post.status === 'published' && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Eye className="w-3 h-3" />
                                                                        {post.views || 0} views
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <MessageCircle className="w-3 h-3" />
                                                                        {post.comments || 0} comments
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(post.status)}
                                                        <button className="p-1 hover:bg-gray-100 rounded-full">
                                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">No recent posts</p>
                                            <Link
                                                href="/editorial-dashboard/posts/create"
                                                className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create your first post
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-gray-200">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="p-5 sm:p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Post published</p>
                                                <p className="text-xs text-gray-500">Getting Started with Next.js • 2 hours ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Edit className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Post updated</p>
                                                <p className="text-xs text-gray-500">Firebase Authentication Guide • yesterday</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-50 rounded-lg">
                                                <MessageCircle className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">New comment</p>
                                                <p className="text-xs text-gray-500">Great article! Very helpful. • 3 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Quick Actions & Performance */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

                                <div className="space-y-3">
                                    <Link
                                        href="/editorial-dashboard/posts/create"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create New Post
                                    </Link>

                                    <Link
                                        href="/editorial-dashboard/media/upload"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow text-sm font-medium"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Media
                                    </Link>

                                    <Link
                                        href="/editorial-dashboard/schedule"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm hover:shadow text-sm font-medium"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Schedule Content
                                    </Link>
                                </div>
                            </div>

                            {/* Content Performance */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Content Performance</h3>
                                    <select className="text-xs border border-gray-200 rounded-lg px-2 py-1">
                                        <option>This Week</option>
                                        <option>This Month</option>
                                        <option>This Year</option>
                                    </select>
                                </div>

                                {/* Daily Views Progress */}
                                <div className="mb-5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs sm:text-sm text-gray-600">Daily Views Goal</span>
                                        <span className="text-sm font-semibold text-gray-900">{performanceData.dailyViews}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${performanceData.dailyViews}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Target: 10,000 views</p>
                                </div>

                                {/* Weekly Growth */}
                                <div className="mb-5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs sm:text-sm text-gray-600">Weekly Growth</span>
                                        <span className="text-sm font-semibold text-green-600">+{performanceData.weeklyGrowth}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${performanceData.weeklyGrowth}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Top Categories */}
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Top Categories</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Technology</span>
                                            <span className="text-sm font-medium text-gray-900">45%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }} />
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-600">Business</span>
                                            <span className="text-sm font-medium text-gray-900">30%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '30%' }} />
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-600">Lifestyle</span>
                                            <span className="text-sm font-medium text-gray-900">25%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '25%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm p-5 sm:p-6 text-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5" />
                                    <h3 className="text-base font-semibold">Pro Tip</h3>
                                </div>
                                <p className="text-sm text-blue-100 mb-4">
                                    Posts with featured images get 94% more views. Add eye-catching visuals to boost engagement!
                                </p>
                                <Link
                                    href="/editorial-dashboard/learn"
                                    className="inline-flex items-center gap-1 text-sm text-white hover:text-blue-100 transition-colors"
                                >
                                    Learn more
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

// Missing import
import { Briefcase } from 'lucide-react';