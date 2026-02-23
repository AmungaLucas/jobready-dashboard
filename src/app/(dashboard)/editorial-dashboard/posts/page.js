'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
    FileText,
    User,
    Calendar,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Search,
    X,
    Filter,
    Grid,
    List,
    MoreVertical,
    Clock,
    CheckCircle,
    Archive,
    AlertCircle,
    Users,
    TrendingUp,
    BookOpen,
    MessageCircle,
    Share2,
    Star,
    Copy,
    Download,
    Globe
} from 'lucide-react'

export default function PostsPage() {
    const LIMIT = 12
    const [activeTab, setActiveTab] = useState('all') // 'all' or 'my'
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(false)
    const [lastId, setLastId] = useState(null)
    const [viewMode, setViewMode] = useState('grid')
    const [selectedPosts, setSelectedPosts] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        archived: 0,
        views: 0,
        comments: 0
    })

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [authorFilter, setAuthorFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [dateRange, setDateRange] = useState({ start: '', end: '' })
    const [sortBy, setSortBy] = useState('newest')

    const pageStack = useRef([null])
    const searchTimeout = useRef(null)

    // Status options
    const statusOptions = [
        { value: 'all', label: 'All Status', icon: FileText },
        { value: 'published', label: 'Published', icon: CheckCircle, color: 'text-green-600' },
        { value: 'draft', label: 'Draft', icon: Clock, color: 'text-yellow-600' },
        { value: 'archived', label: 'Archived', icon: Archive, color: 'text-gray-600' }
    ]

    // Sort options
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'title_asc', label: 'Title A-Z' },
        { value: 'title_desc', label: 'Title Z-A' },
        { value: 'views', label: 'Most Viewed' },
        { value: 'comments', label: 'Most Comments' }
    ]

    // Categories (example - replace with actual categories from your data)
    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'technology', label: 'Technology' },
        { value: 'business', label: 'Business' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'health', label: 'Health' }
    ]

    // Debounce search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(searchTimeout.current)
    }, [searchQuery])

    // Fetch posts with filters
    const fetchPage = useCallback(async (startAfter = null) => {
        setLoading(true)
        setError(null)
        try {
            const url = new URL(window.location.href)
            url.pathname = '/api/posts'

            // Add query parameters
            url.searchParams.set('limit', String(LIMIT))
            if (startAfter) url.searchParams.set('startAfter', startAfter)
            if (debouncedSearch) url.searchParams.set('search', debouncedSearch)
            if (statusFilter !== 'all') url.searchParams.set('status', statusFilter)
            if (authorFilter !== 'all') url.searchParams.set('author', authorFilter)
            if (categoryFilter !== 'all') url.searchParams.set('category', categoryFilter)
            if (dateRange.start) url.searchParams.set('dateStart', dateRange.start)
            if (dateRange.end) url.searchParams.set('dateEnd', dateRange.end)
            url.searchParams.set('sort', sortBy)

            // Add tab filter
            if (activeTab === 'my') {
                url.searchParams.set('myPosts', 'true')
            }

            const res = await fetch(url.toString())
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch')

            setPosts(data.posts || [])
            setLastId(data.lastId || null)
            setHasMore(Boolean(data.hasMore))

            // Update stats if available
            if (data.stats) {
                setStats(data.stats)
            }
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, statusFilter, authorFilter, categoryFilter, dateRange, sortBy, activeTab])

    // Initial fetch and filter changes
    useEffect(() => {
        pageStack.current = [null]
        setSelectedPosts([])
        fetchPage(null)
    }, [debouncedSearch, statusFilter, authorFilter, categoryFilter, dateRange, sortBy, activeTab, fetchPage])

    const handleNext = async () => {
        if (!hasMore) return
        pageStack.current.push(lastId)
        await fetchPage(lastId)
    }

    const handlePrevious = async () => {
        if (pageStack.current.length <= 1) return
        pageStack.current.pop()
        const startAfter = pageStack.current[pageStack.current.length - 1]
        await fetchPage(startAfter)
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return
        try {
            const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            fetchPage(pageStack.current[pageStack.current.length - 1])
        } catch (err) {
            alert('Failed to delete post')
        }
    }

    const handleBulkDelete = async () => {
        if (selectedPosts.length === 0) return
        if (!confirm(`Delete ${selectedPosts.length} selected posts?`)) return

        try {
            await Promise.all(selectedPosts.map(id =>
                fetch(`/api/posts/${id}`, { method: 'DELETE' })
            ))
            setSelectedPosts([])
            fetchPage(pageStack.current[pageStack.current.length - 1])
        } catch (err) {
            alert('Failed to delete some posts')
        }
    }

    const handleDuplicate = async (post) => {
        try {
            const res = await fetch(`/api/posts/${post.id}/duplicate`, { method: 'POST' })
            if (!res.ok) throw new Error('Duplicate failed')
            fetchPage(pageStack.current[pageStack.current.length - 1])
        } catch (err) {
            alert('Failed to duplicate post')
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Update failed')
            fetchPage(pageStack.current[pageStack.current.length - 1])
        } catch (err) {
            alert('Failed to update post status')
        }
    }

    const togglePostSelection = (id) => {
        setSelectedPosts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const toggleAllSelection = () => {
        if (selectedPosts.length === posts.length) {
            setSelectedPosts([])
        } else {
            setSelectedPosts(posts.map(p => p.id))
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setDebouncedSearch('')
        setStatusFilter('all')
        setAuthorFilter('all')
        setCategoryFilter('all')
        setDateRange({ start: '', end: '' })
        setSortBy('newest')
    }

    const getTimeAgo = (date) => {
        const now = new Date()
        const posted = new Date(date)
        const diffTime = Math.abs(now - posted)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return `${Math.floor(diffDays / 30)} months ago`
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'published': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'draft': return <Clock className="w-4 h-4 text-yellow-500" />
            case 'archived': return <Archive className="w-4 h-4 text-gray-500" />
            default: return <FileText className="w-4 h-4 text-blue-500" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header with Stats */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600" />
                                Blog Posts
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage and organize your blog content
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedPosts.length > 0 && (
                                <>
                                    <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                        {selectedPosts.length} selected
                                    </span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium inline-flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Selected
                                    </button>
                                </>
                            )}
                            <Link
                                href="/editorial-dashboard/posts/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <Plus className="w-4 h-4" />
                                New Post
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'all'
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                All Posts
                            </div>
                            {activeTab === 'all' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'my'
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                My Posts
                            </div>
                            {activeTab === 'my' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                            <p className="text-xs text-blue-600 font-medium">Total Posts</p>
                            <p className="text-xl font-bold text-gray-900">{stats.total || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                            <p className="text-xs text-green-600 font-medium">Published</p>
                            <p className="text-xl font-bold text-gray-900">{stats.published || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
                            <p className="text-xs text-yellow-600 font-medium">Drafts</p>
                            <p className="text-xl font-bold text-gray-900">{stats.drafts || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
                            <p className="text-xs text-gray-600 font-medium">Archived</p>
                            <p className="text-xl font-bold text-gray-900">{stats.archived || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                            <p className="text-xs text-purple-600 font-medium">Views</p>
                            <p className="text-xl font-bold text-gray-900">{stats.views?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
                            <p className="text-xs text-indigo-600 font-medium">Comments</p>
                            <p className="text-xl font-bold text-gray-900">{stats.comments || 0}</p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search posts by title or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 border rounded-lg transition-all inline-flex items-center gap-2 ${showFilters || statusFilter !== 'all' || categoryFilter !== 'all' || dateRange.start
                                ? 'bg-blue-50 border-blue-300 text-blue-600'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filters</span>
                        </button>

                        <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 transition-colors ${viewMode === 'list'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-white border rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">Advanced Filters</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Author
                                    </label>
                                    <select
                                        value={authorFilter}
                                        onChange={(e) => setAuthorFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="all">All Authors</option>
                                        <option value="me">My Posts</option>
                                        {/* Add more authors dynamically */}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <div className="lg:col-span-5">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-6 max-w-7xl mx-auto">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500">Loading posts...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-700 font-medium mb-2">Error loading posts</p>
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => fetchPage(pageStack.current[pageStack.current.length - 1])}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && posts.length === 0 && (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
                            <FileText className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                                ? 'No posts match your current filters. Try adjusting your search criteria.'
                                : activeTab === 'my'
                                    ? "You haven't created any posts yet. Get started by writing your first blog post."
                                    : 'Get started by creating your first blog post.'}
                        </p>
                        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                        {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && activeTab === 'my' && (
                            <Link
                                href="/editorial-dashboard/posts/create"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create Your First Post
                            </Link>
                        )}
                    </div>
                )}

                {/* Posts Display */}
                {!loading && posts.length > 0 && (
                    <>
                        {/* Selection Bar */}
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={selectedPosts.length === posts.length}
                                    onChange={toggleAllSelection}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Select all ({posts.length} posts)
                            </label>
                            {selectedPosts.length > 0 && (
                                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                    {selectedPosts.length} selected
                                </span>
                            )}
                        </div>

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        className={`group bg-white rounded-xl border transition-all hover:shadow-xl hover:scale-[1.02] ${selectedPosts.includes(post.id)
                                            ? 'ring-2 ring-blue-500 border-blue-500'
                                            : 'border-gray-200 hover:border-blue-200'
                                            }`}
                                    >
                                        <div className="p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPosts.includes(post.id)}
                                                        onChange={() => togglePostSelection(post.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                                        {post.title?.[0] || 'P'}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <button className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                                                        <Link
                                                            href={`/editorial-dashboard/posts/${post.id}`}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Eye className="w-4 h-4" /> View Details
                                                        </Link>
                                                        <Link
                                                            href={`/editorial-dashboard/posts/${post.id}/edit`}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Edit className="w-4 h-4" /> Edit Post
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDuplicate(post)}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                                        >
                                                            <Copy className="w-4 h-4" /> Duplicate
                                                        </button>
                                                        <div className="border-t my-1"></div>
                                                        <div className="px-4 py-2">
                                                            <p className="text-xs text-gray-500 mb-1">Change Status</p>
                                                            <div className="space-y-1">
                                                                <button
                                                                    onClick={() => handleStatusChange(post.id, 'published')}
                                                                    className="flex items-center gap-2 text-sm text-green-600 hover:bg-green-50 w-full text-left px-2 py-1 rounded"
                                                                >
                                                                    <CheckCircle className="w-3 h-3" /> Publish
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(post.id, 'draft')}
                                                                    className="flex items-center gap-2 text-sm text-yellow-600 hover:bg-yellow-50 w-full text-left px-2 py-1 rounded"
                                                                >
                                                                    <Clock className="w-3 h-3" /> Save as Draft
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(post.id, 'archived')}
                                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 w-full text-left px-2 py-1 rounded"
                                                                >
                                                                    <Archive className="w-3 h-3" /> Archive
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="border-t my-1"></div>
                                                        <button
                                                            onClick={() => handleDelete(post.id)}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete Post
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title and Meta */}
                                            <div className="mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                                    <Link href={`/editorial-dashboard/posts/${post.id}`} className="hover:text-blue-600">
                                                        {post.title || 'Untitled Post'}
                                                    </Link>
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {post.authorName || 'Unknown'}
                                                    </span>
                                                    {post.category && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{post.category}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content Preview */}
                                            {post.content && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {String(post.content).replace(/<[^>]*>/g, '').slice(0, 150)}...
                                                </p>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(post.status)}
                                                    <span className={`text-xs font-medium ${post.status === 'published' ? 'text-green-600' :
                                                        post.status === 'draft' ? 'text-yellow-600' :
                                                            'text-gray-600'
                                                        }`}>
                                                        {post.status || 'draft'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {getTimeAgo(post.publishedAt || post.createdAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {post.views || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3" />
                                                        {post.comments || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPosts.length === posts.length}
                                                    onChange={toggleAllSelection}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Author
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Views
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Comments
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {posts.map(post => (
                                            <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPosts.includes(post.id)}
                                                        onChange={() => togglePostSelection(post.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <Link
                                                            href={`/editorial-dashboard/posts/${post.id}`}
                                                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                        >
                                                            {post.title || 'Untitled Post'}
                                                        </Link>
                                                        {post.content && (
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                                {String(post.content).replace(/<[^>]*>/g, '').slice(0, 100)}...
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {post.authorName || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {post.category || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700' :
                                                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {getStatusIcon(post.status)}
                                                        {post.status || 'draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {getTimeAgo(post.publishedAt || post.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {post.views || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {post.comments || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/editorial-dashboard/posts/${post.id}`}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/editorial-dashboard/posts/${post.id}/edit`}
                                                            className="text-gray-400 hover:text-yellow-600 transition-colors"
                                                            title="Edit Post"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleStatusChange(post.id, 'published')}
                                                            className="text-gray-400 hover:text-green-600 transition-colors"
                                                            title="Publish"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(post.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete Post"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-lg border border-gray-200">
                            <button
                                onClick={handlePrevious}
                                disabled={pageStack.current.length <= 1}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    Page <span className="font-medium">{pageStack.current.length}</span>
                                </span>
                                <div className="h-4 w-px bg-gray-200"></div>
                                <span className="text-sm text-gray-500">
                                    Showing {posts.length} posts per page
                                </span>
                                {hasMore && (
                                    <>
                                        <div className="h-4 w-px bg-gray-200"></div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            More available
                                        </span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!hasMore}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}