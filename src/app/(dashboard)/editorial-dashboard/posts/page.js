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
    Globe,
    Copy,
    BookOpen,
    MessageCircle,
    Share2,
    Star,
    ChevronUp,
    ChevronDown,
    Menu,
    Home
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
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        archived: 0,
        views: 0,
        comments: 0,
        shares: 0
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

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle responsive layout
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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

    // Categories
    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'technology', label: 'Technology' },
        { value: 'business', label: 'Business' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'health', label: 'Health' },
        { value: 'travel', label: 'Travel' },
        { value: 'food', label: 'Food' },
        { value: 'fashion', label: 'Fashion' }
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

            // Update stats with real data
            if (data.stats) {
                setStats(data.stats)
            } else {
                // Calculate stats from posts if not provided
                const newStats = {
                    total: data.posts?.length || 0,
                    published: data.posts?.filter(p => p.status === 'published').length || 0,
                    drafts: data.posts?.filter(p => p.status === 'draft').length || 0,
                    archived: data.posts?.filter(p => p.status === 'archived').length || 0,
                    views: data.posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
                    comments: data.posts?.reduce((sum, p) => sum + (p.comments || 0), 0) || 0,
                    shares: data.posts?.reduce((sum, p) => sum + (p.shares || 0), 0) || 0
                }
                setStats(newStats)
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

            // Update stats after deletion
            const post = posts.find(p => p.id === id)
            if (post) {
                setStats(prev => ({
                    ...prev,
                    total: prev.total - 1,
                    [post.status === 'published' ? 'published' :
                        post.status === 'draft' ? 'drafts' : 'archived']:
                        prev[post.status === 'published' ? 'published' :
                            post.status === 'draft' ? 'drafts' : 'archived'] - 1,
                    views: prev.views - (post.views || 0),
                    comments: prev.comments - (post.comments || 0)
                }))
            }

            fetchPage(pageStack.current[pageStack.current.length - 1])
            setOpenMenuId(null)
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
            setOpenMenuId(null)
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

            // Update stats
            const post = posts.find(p => p.id === id)
            if (post) {
                setStats(prev => ({
                    ...prev,
                    [post.status === 'published' ? 'published' :
                        post.status === 'draft' ? 'drafts' : 'archived']:
                        prev[post.status === 'published' ? 'published' :
                            post.status === 'draft' ? 'drafts' : 'archived'] - 1,
                    [newStatus === 'published' ? 'published' :
                        newStatus === 'draft' ? 'drafts' : 'archived']:
                        prev[newStatus === 'published' ? 'published' :
                            newStatus === 'draft' ? 'drafts' : 'archived'] + 1
                }))
            }

            fetchPage(pageStack.current[pageStack.current.length - 1])
            setOpenMenuId(null)
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

    const toggleMenu = (id, e) => {
        e.stopPropagation()
        setOpenMenuId(openMenuId === id ? null : id)
    }

    const getActiveFilterCount = () => {
        let count = 0
        if (statusFilter !== 'all') count++
        if (authorFilter !== 'all') count++
        if (categoryFilter !== 'all') count++
        if (dateRange.start) count++
        if (dateRange.end) count++
        return count
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Header with Stats - Collapsible */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
                    {/* Header Top Bar with Toggle and Mobile Menu */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 sm:gap-0">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                            >
                                <Menu className="w-5 h-5 text-gray-500" />
                            </button>
                            <div className="ml-1 md:ml-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                    <span className="hidden xs:inline">Blog Posts</span>
                                    <span className="xs:hidden">Posts</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                                    Manage and organize your blog content
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/editorial-dashboard/posts/create"
                                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm font-medium"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">New</span>
                                <span className="xs:hidden">+</span>
                            </Link>
                            <button
                                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title={isHeaderExpanded ? 'Collapse header' : 'Expand header'}
                            >
                                {isHeaderExpanded ? (
                                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Panel */}
                    {isMobileMenuOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border-b border-gray-200 shadow-lg p-4 z-30 md:hidden">
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setActiveTab('all')
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-medium">All Posts</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('my')
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'my' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span className="text-sm font-medium">My Posts</span>
                                </button>
                                <div className="border-t my-2"></div>
                                <Link
                                    href="/editorial-dashboard"
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Home className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Collapsible Content */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHeaderExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                        {/* Tabs - Desktop */}
                        <div className="hidden md:flex items-center gap-1 mb-4 border-b border-gray-200">
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

                        {/* Stats Cards - Responsive Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-4 mb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-blue-600 font-medium truncate">Total</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.total || 0}</p>
                                <p className="text-[8px] sm:text-xs text-blue-600 mt-0.5 sm:mt-1 hidden sm:block">All time</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-green-600 font-medium truncate">Published</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.published || 0}</p>
                                <p className="text-[8px] sm:text-xs text-green-600 mt-0.5 sm:mt-1 hidden sm:block">Live now</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-yellow-600 font-medium truncate">Drafts</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.drafts || 0}</p>
                                <p className="text-[8px] sm:text-xs text-yellow-600 mt-0.5 sm:mt-1 hidden sm:block">In progress</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-gray-600 font-medium truncate">Archived</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.archived || 0}</p>
                                <p className="text-[8px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">Old posts</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-purple-600 font-medium truncate">Views</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.views?.toLocaleString() || 0}</p>
                                <p className="text-[8px] sm:text-xs text-purple-600 mt-0.5 sm:mt-1 hidden sm:block">Total views</p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-indigo-600 font-medium truncate">Comments</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.comments || 0}</p>
                                <p className="text-[8px] sm:text-xs text-indigo-600 mt-0.5 sm:mt-1 hidden sm:block">Engagement</p>
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-pink-600 font-medium truncate">Shares</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.shares || 0}</p>
                                <p className="text-[8px] sm:text-xs text-pink-600 mt-0.5 sm:mt-1 hidden sm:block">Social reach</p>
                            </div>
                        </div>

                        {/* Search and Filters - Responsive */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 sm:pl-10 pr-8 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg transition-all inline-flex items-center justify-center gap-1 sm:gap-2 ${showFilters || getActiveFilterCount() > 0
                                        ? 'bg-blue-50 border-blue-300 text-blue-600'
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm font-medium">Filters</span>
                                    {getActiveFilterCount() > 0 && (
                                        <span className="ml-0.5 sm:ml-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                            {getActiveFilterCount()}
                                        </span>
                                    )}
                                </button>

                                <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 sm:p-2.5 transition-colors ${viewMode === 'grid'
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 sm:p-2.5 transition-colors ${viewMode === 'list'
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <List className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters Panel - Responsive */}
                        {showFilters && (
                            <div className="mt-4 p-3 sm:p-4 bg-white border rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Advanced Filters</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Authors</option>
                                            <option value="me">My Posts</option>
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
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 lg:col-span-5">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Sort By
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

            {/* Main Content */}
            <div className="px-3 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-spin mb-3 sm:mb-4" />
                        <p className="text-xs sm:text-sm text-gray-500">Loading posts...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
                        <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
                        <p className="text-sm sm:text-base text-red-700 font-medium mb-1 sm:mb-2">Error loading posts</p>
                        <p className="text-xs sm:text-sm text-red-600 mb-3 sm:mb-4">{error}</p>
                        <button
                            onClick={() => fetchPage(pageStack.current[pageStack.current.length - 1])}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && posts.length === 0 && (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 sm:p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full mb-3 sm:mb-4">
                            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No posts found</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                                ? 'No posts match your current filters. Try adjusting your search criteria.'
                                : activeTab === 'my'
                                    ? "You haven't created any posts yet. Get started by writing your first blog post."
                                    : 'Get started by creating your first blog post.'}
                        </p>
                        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-2"
                            >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                Clear Filters
                            </button>
                        )}
                        {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && activeTab === 'my' && (
                            <Link
                                href="/editorial-dashboard/posts/create"
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-2"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                Create Your First Post
                            </Link>
                        )}
                    </div>
                )}

                {/* Posts Display */}
                {!loading && posts.length > 0 && (
                    <>
                        {/* Selection Bar - Responsive */}
                        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-3 sm:mb-4">
                            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={selectedPosts.length === posts.length}
                                    onChange={toggleAllSelection}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Select all ({posts.length} {posts.length === 1 ? 'post' : 'posts'})</span>
                            </label>
                            {selectedPosts.length > 0 && (
                                <div className="flex items-center gap-2 w-full xs:w-auto">
                                    <span className="text-xs sm:text-sm bg-blue-50 text-blue-600 px-2 sm:px-3 py-1 rounded-full">
                                        {selectedPosts.length} selected
                                    </span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-2 sm:px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs sm:text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Grid View - Responsive */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        className={`group bg-white rounded-lg sm:rounded-xl border transition-all hover:shadow-md sm:hover:shadow-xl ${selectedPosts.includes(post.id)
                                            ? 'ring-1 sm:ring-2 ring-blue-500 border-blue-500'
                                            : 'border-gray-200 hover:border-blue-200'
                                            }`}
                                    >
                                        <div className="p-3 sm:p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPosts.includes(post.id)}
                                                        onChange={() => togglePostSelection(post.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-lg">
                                                        {post.title?.[0] || 'P'}
                                                    </div>
                                                </div>
                                                <div className="relative" ref={menuRef}>
                                                    <button
                                                        onClick={(e) => toggleMenu(post.id, e)}
                                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                                    </button>

                                                    {/* Dropdown Menu - Responsive */}
                                                    {openMenuId === post.id && (
                                                        <div className="absolute right-0 mt-1 w-40 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1 text-xs sm:text-sm">
                                                            <Link
                                                                href={`/editorial-dashboard/posts/${post.id}`}
                                                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> View
                                                            </Link>
                                                            <Link
                                                                href={`/editorial-dashboard/posts/${post.id}/edit`}
                                                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDuplicate(post)}
                                                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                                                            >
                                                                <Copy className="w-3 h-3 sm:w-4 sm:h-4" /> Duplicate
                                                            </button>

                                                            <div className="border-t my-1"></div>

                                                            <div className="px-2 sm:px-4 py-1">
                                                                <p className="text-[10px] sm:text-xs font-medium text-gray-400">Status</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleStatusChange(post.id, 'published')}
                                                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-green-600 hover:bg-green-50 w-full text-left transition-colors"
                                                            >
                                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Publish
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(post.id, 'draft')}
                                                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-yellow-600 hover:bg-yellow-50 w-full text-left transition-colors"
                                                            >
                                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> Draft
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(post.id, 'archived')}
                                                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-600 hover:bg-gray-50 w-full text-left transition-colors"
                                                            >
                                                                <Archive className="w-3 h-3 sm:w-4 sm:h-4" /> Archive
                                                            </button>

                                                            <div className="border-t my-1"></div>

                                                            <button
                                                                onClick={() => handleDelete(post.id)}
                                                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Title and Meta */}
                                            <div className="mb-2 sm:mb-3">
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                                                    <Link href={`/editorial-dashboard/posts/${post.id}`} className="hover:text-blue-600">
                                                        {post.title || 'Untitled Post'}
                                                    </Link>
                                                </h3>
                                                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                                        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span className="truncate max-w-[60px] sm:max-w-none">{post.authorName || 'Unknown'}</span>
                                                    </span>
                                                    {post.category && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate max-w-[50px] sm:max-w-none">{post.category}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content Preview */}
                                            {post.content && (
                                                <p className="text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">
                                                    {String(post.content).replace(/<[^>]*>/g, '').slice(0, 80)}...
                                                </p>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    {getStatusIcon(post.status)}
                                                    <span className={`text-[10px] sm:text-xs font-medium ${post.status === 'published' ? 'text-green-600' :
                                                        post.status === 'draft' ? 'text-yellow-600' :
                                                            'text-gray-600'
                                                        }`}>
                                                        {post.status || 'draft'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
                                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span className="hidden xs:inline">{getTimeAgo(post.publishedAt || post.createdAt)}</span>
                                                    </span>
                                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        {post.views || 0}
                                                    </span>
                                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                                        <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        {post.comments || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List View - Responsive */}
                        {viewMode === 'list' && (
                            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
                                {/* Mobile List View */}
                                <div className="block sm:hidden">
                                    {posts.map(post => (
                                        <div key={post.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPosts.includes(post.id)}
                                                        onChange={() => togglePostSelection(post.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <Link
                                                            href={`/editorial-dashboard/posts/${post.id}`}
                                                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                        >
                                                            {post.title || 'Untitled Post'}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500">{post.authorName || 'Unknown'}</span>
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700' :
                                                                post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {getStatusIcon(post.status)}
                                                                {post.status || 'draft'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => toggleMenu(post.id, e)}
                                                    className="p-1 hover:bg-gray-200 rounded-full"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500 ml-6">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {getTimeAgo(post.publishedAt || post.createdAt)}
                                                </span>
                                                <div className="flex items-center gap-2">
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
                                    ))}
                                </div>

                                {/* Desktop Table View */}
                                <table className="hidden sm:table min-w-full divide-y divide-gray-200">
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
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                    <button
                                                        onClick={(e) => toggleMenu(post.id, e)}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    {openMenuId === post.id && (
                                                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1" ref={menuRef}>
                                                            <Link
                                                                href={`/editorial-dashboard/posts/${post.id}`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Eye className="w-4 h-4" /> View
                                                            </Link>
                                                            <Link
                                                                href={`/editorial-dashboard/posts/${post.id}/edit`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Edit className="w-4 h-4" /> Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(post.id)}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination - Responsive */}
                        <div className="flex flex-col xs:flex-row items-center justify-between gap-3 mt-4 sm:mt-6 bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                            <button
                                onClick={handlePrevious}
                                disabled={pageStack.current.length <= 1}
                                className="w-full xs:w-auto inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Previous</span>
                                <span className="xs:hidden">Prev</span>
                            </button>

                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <span className="text-gray-600">
                                    Page <span className="font-medium">{pageStack.current.length}</span>
                                </span>
                                <div className="h-4 w-px bg-gray-200 hidden xs:block"></div>
                                <span className="text-gray-500 hidden xs:inline">
                                    {posts.length} posts
                                </span>
                                {hasMore && (
                                    <>
                                        <div className="h-4 w-px bg-gray-200 hidden xs:block"></div>
                                        <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                            More
                                        </span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!hasMore}
                                className="w-full xs:w-auto inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="hidden xs:inline">Next</span>
                                <span className="xs:hidden">Next</span>
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}