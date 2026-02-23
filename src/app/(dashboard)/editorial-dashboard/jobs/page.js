'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Clock,
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
    CheckCircle,
    AlertCircle,
    Users,
    Globe,
    Copy,
    User,
    FileText,
    Zap,
    ChevronUp,
    ChevronDown,
    BarChart3,
    Download,
    Share2,
    Mail,
    Printer
} from 'lucide-react'

export default function JobsPage() {
    const LIMIT = 12
    const [activeTab, setActiveTab] = useState('all') // 'all' or 'my'
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(false)
    const [lastId, setLastId] = useState(null)
    const [viewMode, setViewMode] = useState('grid')
    const [selectedJobs, setSelectedJobs] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
    const [openMenuId, setOpenMenuId] = useState(null)
    const menuRef = useRef(null)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        draft: 0,
        filled: 0,
        expired: 0,
        views: 0,
        applications: 0
    })

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [locationFilter, setLocationFilter] = useState('all')
    const [salaryRange, setSalaryRange] = useState({ min: '', max: '' })
    const [experienceFilter, setExperienceFilter] = useState('all')
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

    // Job types for filtering
    const jobTypes = [
        { value: 'all', label: 'All Types', icon: Briefcase },
        { value: 'full-time', label: 'Full Time', icon: Clock, color: 'text-blue-600' },
        { value: 'part-time', label: 'Part Time', icon: Clock, color: 'text-purple-600' },
        { value: 'contract', label: 'Contract', icon: FileText, color: 'text-orange-600' },
        { value: 'remote', label: 'Remote', icon: Globe, color: 'text-green-600' },
        { value: 'hybrid', label: 'Hybrid', icon: Building2, color: 'text-indigo-600' },
        { value: 'freelance', label: 'Freelance', icon: Zap, color: 'text-yellow-600' },
        { value: 'internship', label: 'Internship', icon: Users, color: 'text-pink-600' }
    ]

    // Status options
    const statusOptions = [
        { value: 'all', label: 'All Status', icon: Briefcase },
        { value: 'active', label: 'Active', icon: CheckCircle, color: 'text-green-600' },
        { value: 'draft', label: 'Draft', icon: FileText, color: 'text-yellow-600' },
        { value: 'filled', label: 'Filled', icon: Users, color: 'text-blue-600' },
        { value: 'expired', label: 'Expired', icon: Clock, color: 'text-gray-600' }
    ]

    // Experience level options
    const experienceOptions = [
        { value: 'all', label: 'Any Experience' },
        { value: 'entry', label: 'Entry Level' },
        { value: 'junior', label: 'Junior (1-3 years)' },
        { value: 'mid', label: 'Mid Level (3-5 years)' },
        { value: 'senior', label: 'Senior (5-8 years)' },
        { value: 'lead', label: 'Lead (8+ years)' },
        { value: 'executive', label: 'Executive' }
    ]

    // Sort options
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'salary_high', label: 'Highest Salary' },
        { value: 'salary_low', label: 'Lowest Salary' },
        { value: 'applications', label: 'Most Applications' },
        { value: 'views', label: 'Most Viewed' },
        { value: 'deadline', label: 'Closing Soon' }
    ]

    // Debounce search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(searchTimeout.current)
    }, [searchQuery])

    // Fetch jobs with filters
    const fetchPage = useCallback(async (startAfter = null) => {
        setLoading(true)
        setError(null)
        try {
            const url = new URL(window.location.href)
            url.pathname = '/api/jobs'

            // Add query parameters
            url.searchParams.set('limit', String(LIMIT))
            if (startAfter) url.searchParams.set('startAfter', startAfter)
            if (debouncedSearch) url.searchParams.set('search', debouncedSearch)
            if (statusFilter !== 'all') url.searchParams.set('status', statusFilter)
            if (typeFilter !== 'all') url.searchParams.set('type', typeFilter)
            if (locationFilter !== 'all') url.searchParams.set('location', locationFilter)
            if (salaryRange.min) url.searchParams.set('salaryMin', salaryRange.min)
            if (salaryRange.max) url.searchParams.set('salaryMax', salaryRange.max)
            if (experienceFilter !== 'all') url.searchParams.set('experience', experienceFilter)
            if (dateRange.start) url.searchParams.set('dateStart', dateRange.start)
            if (dateRange.end) url.searchParams.set('dateEnd', dateRange.end)
            url.searchParams.set('sort', sortBy)

            // Add tab filter
            if (activeTab === 'my') {
                url.searchParams.set('myJobs', 'true')
            }

            const res = await fetch(url.toString())
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch')

            setJobs(data.jobs || [])
            setLastId(data.lastId || null)
            setHasMore(Boolean(data.hasMore))

            // Update stats with real data
            if (data.stats) {
                setStats(data.stats)
            } else {
                // Calculate stats from jobs if not provided
                const newStats = {
                    total: data.jobs?.length || 0,
                    active: data.jobs?.filter(j => j.status === 'active').length || 0,
                    draft: data.jobs?.filter(j => j.status === 'draft').length || 0,
                    filled: data.jobs?.filter(j => j.status === 'filled').length || 0,
                    expired: data.jobs?.filter(j => j.status === 'expired').length || 0,
                    views: data.jobs?.reduce((sum, j) => sum + (j.views || 0), 0) || 0,
                    applications: data.jobs?.reduce((sum, j) => sum + (j.applications || 0), 0) || 0
                }
                setStats(newStats)
            }
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, statusFilter, typeFilter, locationFilter, salaryRange, experienceFilter, dateRange, sortBy, activeTab])

    // Initial fetch and filter changes
    useEffect(() => {
        pageStack.current = [null]
        setSelectedJobs([])
        fetchPage(null)
    }, [debouncedSearch, statusFilter, typeFilter, locationFilter, salaryRange, experienceFilter, dateRange, sortBy, activeTab, fetchPage])

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
        if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return
        try {
            const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            // Update stats after deletion
            setStats(prev => ({
                ...prev,
                total: prev.total - 1,
                [jobs.find(j => j.id === id)?.status || 'draft']: prev[jobs.find(j => j.id === id)?.status || 'draft'] - 1
            }))
            fetchPage(pageStack.current[pageStack.current.length - 1])
            setOpenMenuId(null)
        } catch (err) {
            alert('Failed to delete job')
        }
    }

    const handleBulkDelete = async () => {
        if (selectedJobs.length === 0) return
        if (!confirm(`Delete ${selectedJobs.length} selected job postings?`)) return

        try {
            await Promise.all(selectedJobs.map(id =>
                fetch(`/api/jobs/${id}`, { method: 'DELETE' })
            ))
            setSelectedJobs([])
            fetchPage(pageStack.current[pageStack.current.length - 1])
        } catch (err) {
            alert('Failed to delete some jobs')
        }
    }

    const handleDuplicate = async (job) => {
        try {
            const res = await fetch(`/api/jobs/${job.id}/duplicate`, { method: 'POST' })
            if (!res.ok) throw new Error('Duplicate failed')
            fetchPage(pageStack.current[pageStack.current.length - 1])
            setOpenMenuId(null)
        } catch (err) {
            alert('Failed to duplicate job')
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Update failed')

            // Update stats
            const job = jobs.find(j => j.id === id)
            if (job) {
                setStats(prev => ({
                    ...prev,
                    [job.status]: prev[job.status] - 1,
                    [newStatus]: prev[newStatus] + 1
                }))
            }

            fetchPage(pageStack.current[pageStack.current.length - 1])
            setOpenMenuId(null)
        } catch (err) {
            alert('Failed to update job status')
        }
    }

    const toggleJobSelection = (id) => {
        setSelectedJobs(prev =>
            prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
        )
    }

    const toggleAllSelection = () => {
        if (selectedJobs.length === jobs.length) {
            setSelectedJobs([])
        } else {
            setSelectedJobs(jobs.map(j => j.id))
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setDebouncedSearch('')
        setStatusFilter('all')
        setTypeFilter('all')
        setLocationFilter('all')
        setSalaryRange({ min: '', max: '' })
        setExperienceFilter('all')
        setDateRange({ start: '', end: '' })
        setSortBy('newest')
    }

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Salary not specified'
        if (min && !max) return `$${min.toLocaleString()}+`
        if (!min && max) return `Up to $${max.toLocaleString()}`
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`
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

    const getDaysRemaining = (deadline) => {
        if (!deadline) return null
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const diffTime = deadlineDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return 'Expired'
        if (diffDays === 0) return 'Last day'
        if (diffDays === 1) return '1 day left'
        return `${diffDays} days left`
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'draft': return <FileText className="w-4 h-4 text-yellow-500" />
            case 'filled': return <Users className="w-4 h-4 text-blue-500" />
            case 'expired': return <Clock className="w-4 h-4 text-gray-500" />
            default: return <Briefcase className="w-4 h-4 text-gray-500" />
        }
    }

    const toggleMenu = (id, e) => {
        e.stopPropagation()
        setOpenMenuId(openMenuId === id ? null : id)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header with Stats - Collapsible */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="px-6 py-4 max-w-7xl mx-auto">
                    {/* Header Top Bar with Toggle */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                                Job Postings
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage and track all your job listings
                            </p>
                        </div>
                        <button
                            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={isHeaderExpanded ? 'Collapse header' : 'Expand header'}
                        >
                            {isHeaderExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    </div>

                    {/* Collapsible Content */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHeaderExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
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
                                    All Jobs
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
                                    My Jobs
                                </div>
                                {activeTab === 'my' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                )}
                            </button>
                        </div>

                        {/* Stats Cards - Dynamic */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                                <p className="text-xs text-blue-600 font-medium">Total Jobs</p>
                                <p className="text-xl font-bold text-gray-900">{stats.total || 0}</p>
                                <p className="text-xs text-blue-600 mt-1">All time</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                                <p className="text-xs text-green-600 font-medium">Active</p>
                                <p className="text-xl font-bold text-gray-900">{stats.active || 0}</p>
                                <p className="text-xs text-green-600 mt-1">Currently hiring</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
                                <p className="text-xs text-yellow-600 font-medium">Draft</p>
                                <p className="text-xl font-bold text-gray-900">{stats.draft || 0}</p>
                                <p className="text-xs text-yellow-600 mt-1">In progress</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                                <p className="text-xs text-purple-600 font-medium">Filled</p>
                                <p className="text-xl font-bold text-gray-900">{stats.filled || 0}</p>
                                <p className="text-xs text-purple-600 mt-1">Positions filled</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
                                <p className="text-xs text-gray-600 font-medium">Expired</p>
                                <p className="text-xl font-bold text-gray-900">{stats.expired || 0}</p>
                                <p className="text-xs text-gray-600 mt-1">Past deadline</p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
                                <p className="text-xs text-indigo-600 font-medium">Views</p>
                                <p className="text-xl font-bold text-gray-900">{stats.views?.toLocaleString() || 0}</p>
                                <p className="text-xs text-indigo-600 mt-1">Total views</p>
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3">
                                <p className="text-xs text-pink-600 font-medium">Applications</p>
                                <p className="text-xl font-bold text-gray-900">{stats.applications || 0}</p>
                                <p className="text-xs text-pink-600 mt-1">Total received</p>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search jobs by title, company, or description..."
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
                                className={`px-4 py-2.5 border rounded-lg transition-all inline-flex items-center gap-2 ${showFilters || statusFilter !== 'all' || typeFilter !== 'all' || locationFilter !== 'all' || salaryRange.min || experienceFilter !== 'all'
                                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium">Filters</span>
                                {(statusFilter !== 'all' || typeFilter !== 'all' || locationFilter !== 'all' || salaryRange.min || experienceFilter !== 'all') && (
                                    <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {[statusFilter !== 'all', typeFilter !== 'all', locationFilter !== 'all', !!salaryRange.min, experienceFilter !== 'all'].filter(Boolean).length}
                                    </span>
                                )}
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
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Job Type
                                        </label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {jobTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

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
                                            Experience Level
                                        </label>
                                        <select
                                            value={experienceFilter}
                                            onChange={(e) => setExperienceFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {experienceOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="City, State, Remote..."
                                            value={locationFilter !== 'all' ? locationFilter : ''}
                                            onChange={(e) => setLocationFilter(e.target.value || 'all')}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Min Salary ($)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={salaryRange.min}
                                            onChange={(e) => setSalaryRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Max Salary ($)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={salaryRange.max}
                                            onChange={(e) => setSalaryRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div className="lg:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Date Posted
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="From"
                                            />
                                            <input
                                                type="date"
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="To"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3">
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
            </div>

            {/* Main Content */}
            <div className="px-6 py-6 max-w-7xl mx-auto">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500">Loading jobs...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-700 font-medium mb-2">Error loading jobs</p>
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
                {!loading && jobs.length === 0 && (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
                            <Briefcase className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                                ? 'No jobs match your current filters. Try adjusting your search criteria.'
                                : activeTab === 'my'
                                    ? "You haven't posted any jobs yet. Get started by creating your first job posting."
                                    : 'Get started by creating your first job posting.'}
                        </p>
                        {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                        {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && activeTab === 'my' && (
                            <Link
                                href="/editorial-dashboard/jobs/create"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Post Your First Job
                            </Link>
                        )}
                    </div>
                )}

                {/* Jobs Display */}
                {!loading && jobs.length > 0 && (
                    <>
                        {/* Selection Bar */}
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={selectedJobs.length === jobs.length}
                                    onChange={toggleAllSelection}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Select all ({jobs.length} jobs)
                            </label>
                            {selectedJobs.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                        {selectedJobs.length} selected
                                    </span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                                    >
                                        Delete Selected
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {jobs.map(job => {
                                    const daysRemaining = getDaysRemaining(job.applicationDeadline)
                                    return (
                                        <div
                                            key={job.id}
                                            className={`group bg-white rounded-xl border transition-all hover:shadow-xl ${selectedJobs.includes(job.id)
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
                                                            checked={selectedJobs.includes(job.id)}
                                                            onChange={() => toggleJobSelection(job.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                                            {job.companyName?.[0] || job.organisation?.[0] || 'J'}
                                                        </div>
                                                    </div>
                                                    <div className="relative" ref={menuRef}>
                                                        <button
                                                            onClick={(e) => toggleMenu(job.id, e)}
                                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {openMenuId === job.id && (
                                                            <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1">
                                                                <Link
                                                                    href={`/editorial-dashboard/jobs/${job.id}`}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Eye className="w-4 h-4" /> View Details
                                                                </Link>
                                                                <Link
                                                                    href={`/editorial-dashboard/jobs/${job.id}/edit`}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Edit className="w-4 h-4" /> Edit Job
                                                                </Link>
                                                                <Link
                                                                    href={`/editorial-dashboard/jobs/${job.id}/applications`}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Users className="w-4 h-4" /> View Applications
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDuplicate(job)}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                                                                >
                                                                    <Copy className="w-4 h-4" /> Duplicate
                                                                </button>

                                                                <div className="border-t my-1"></div>

                                                                <div className="px-4 py-2">
                                                                    <p className="text-xs font-medium text-gray-400 mb-1">Change Status</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'active')}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 w-full text-left transition-colors"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" /> Set Active
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'draft')}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-yellow-600 hover:bg-yellow-50 w-full text-left transition-colors"
                                                                >
                                                                    <FileText className="w-4 h-4" /> Save as Draft
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'filled')}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 w-full text-left transition-colors"
                                                                >
                                                                    <Users className="w-4 h-4" /> Mark as Filled
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'expired')}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 w-full text-left transition-colors"
                                                                >
                                                                    <Clock className="w-4 h-4" /> Mark as Expired
                                                                </button>

                                                                <div className="border-t my-1"></div>

                                                                <button
                                                                    onClick={() => handleDelete(job.id)}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete Job
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Company and Title */}
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                                        <Link href={`/editorial-dashboard/jobs/${job.id}`} className="hover:text-blue-600">
                                                            {job.title || 'Untitled Position'}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {job.organisation || job.companyName || 'Company Name'}
                                                    </p>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{job.location || 'Location not specified'}</span>
                                                        {job.isRemote && (
                                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0">
                                                                Remote
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <DollarSign className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                                                        <span className="capitalize truncate">{job.type || 'full-time'}</span>
                                                        {job.experienceLevel && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate">{job.experienceLevel}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Description Preview */}
                                                {job.description && (
                                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                        {String(job.description).replace(/<[^>]*>/g, '').slice(0, 120)}...
                                                    </p>
                                                )}

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(job.status)}
                                                        <span className={`text-xs font-medium ${job.status === 'active' ? 'text-green-600' :
                                                            job.status === 'draft' ? 'text-yellow-600' :
                                                                job.status === 'filled' ? 'text-blue-600' :
                                                                    'text-gray-600'
                                                            }`}>
                                                            {job.status || 'draft'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                                        {daysRemaining && (
                                                            <span className={`flex items-center gap-1 ${daysRemaining.includes('Expired') ? 'text-red-500' :
                                                                daysRemaining.includes('Last day') ? 'text-orange-500' :
                                                                    'text-gray-400'
                                                                }`}>
                                                                <Clock className="w-3 h-3" />
                                                                {daysRemaining}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {getTimeAgo(job.datePosted || job.createdAt)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" />
                                                            {job.views || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {job.applications || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
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
                                                    checked={selectedJobs.length === jobs.length}
                                                    onChange={toggleAllSelection}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Job Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Salary
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Posted
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Deadline
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Apps
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {jobs.map(job => (
                                            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedJobs.includes(job.id)}
                                                        onChange={() => toggleJobSelection(job.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <Link
                                                            href={`/editorial-dashboard/jobs/${job.id}`}
                                                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                        >
                                                            {job.title || 'Untitled Position'}
                                                        </Link>
                                                        {job.experienceLevel && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {job.experienceLevel}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {job.organisation || job.companyName || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {job.location || 'Remote'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-500 capitalize">
                                                        {job.type || 'full-time'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                            job.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {getStatusIcon(job.status)}
                                                        {job.status || 'draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatSalary(job.salaryMin, job.salaryMax)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {getTimeAgo(job.datePosted || job.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {job.applicationDeadline && (
                                                        <span className={`text-sm ${new Date(job.applicationDeadline) < new Date()
                                                            ? 'text-red-500'
                                                            : 'text-gray-500'
                                                            }`}>
                                                            {new Date(job.applicationDeadline).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {job.applications || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => toggleMenu(job.id, e)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                            title="More actions"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {openMenuId === job.id && (
                                                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1" ref={menuRef}>
                                                            <Link
                                                                href={`/editorial-dashboard/jobs/${job.id}`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Eye className="w-4 h-4" /> View
                                                            </Link>
                                                            <Link
                                                                href={`/editorial-dashboard/jobs/${job.id}/edit`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <Edit className="w-4 h-4" /> Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(job.id)}
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
                                    Showing {jobs.length} jobs
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