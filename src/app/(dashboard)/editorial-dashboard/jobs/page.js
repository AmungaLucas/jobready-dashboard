// app/(dashboard)/editorial-dashboard/jobs/page.js
'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
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
    Tag,
    Folder
} from 'lucide-react'

export default function JobsPage() {
    const { user } = useAuth();
    const LIMIT = 12
    const [activeTab, setActiveTab] = useState('all')
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

    // Store organisation and user data
    const [organisations, setOrganisations] = useState({})
    const [creators, setCreators] = useState({})

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

    // Debounce search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(searchTimeout.current)
    }, [searchQuery])

    // Fetch organisation names
    const fetchOrganisations = async (organisationIds) => {
        const uniqueIds = [...new Set(organisationIds.filter(id => id && !organisations[id]))];

        if (uniqueIds.length === 0) return;

        try {
            const response = await fetch('/api/organisations/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organisationIds: uniqueIds })
            });

            if (response.ok) {
                const orgs = await response.json();
                const orgMap = {};
                orgs.forEach(org => {
                    orgMap[org.id] = org.companyName || 'Unknown Organisation';
                });
                setOrganisations(prev => ({ ...prev, ...orgMap }));
            }
        } catch (error) {
            console.error('Error fetching organisations:', error);
        }
    };

    // Fetch creator names from users collection
    const fetchCreators = async (creatorIds) => {
        const uniqueIds = [...new Set(creatorIds.filter(id => id && !creators[id]))];

        if (uniqueIds.length === 0) return;

        try {
            const response = await fetch('/api/users/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: uniqueIds })
            });

            if (response.ok) {
                const users = await response.json();
                const creatorMap = {};
                users.forEach(user => {
                    creatorMap[user.uid] = user.name || user.displayName || user.email || 'Unknown User';
                });
                setCreators(prev => ({ ...prev, ...creatorMap }));
            }
        } catch (error) {
            console.error('Error fetching creators:', error);
        }
    };

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

            // Add tab filter - filter by current user's UID for "My Jobs"
            if (activeTab === 'my') {
                url.searchParams.set('createdBy', user?.uid);
            }

            const res = await fetch(url.toString())
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch')

            setJobs(data.jobs || [])

            // Fetch organisation names for all jobs
            const organisationIds = data.jobs?.map(job => job.organisation).filter(Boolean) || [];
            fetchOrganisations(organisationIds);

            // Fetch creator names for all jobs
            const creatorIds = data.jobs?.map(job => job.createdBy).filter(Boolean) || [];
            fetchCreators(creatorIds);

            setLastId(data.lastId || null)
            setHasMore(Boolean(data.hasMore))

            // Update stats
            if (data.stats) {
                setStats(data.stats)
            }
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, statusFilter, typeFilter, locationFilter, salaryRange, experienceFilter, dateRange, sortBy, activeTab, user?.uid])

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

    const formatSalary = (salary) => {
        if (!salary?.min && !salary?.max) return 'Salary not specified'
        const { min, max, currency = 'USD', period = 'year' } = salary
        if (min && !max) return `${currency} ${min.toLocaleString()}+ /${period}`
        if (!min && max) return `Up to ${currency} ${max.toLocaleString()} /${period}`
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} /${period}`
    }

    const getTimeAgo = (date) => {
        if (!date) return 'Unknown'
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

    const getActiveFilterCount = () => {
        let count = 0
        if (statusFilter !== 'all') count++
        if (typeFilter !== 'all') count++
        if (locationFilter !== 'all') count++
        if (salaryRange.min) count++
        if (experienceFilter !== 'all') count++
        if (dateRange.start) count++
        if (dateRange.end) count++
        return count
    }

    const getOrganisationName = (job) => {
        if (job.organisation) {
            return organisations[job.organisation] || 'Loading...';
        }
        return job.companyName || 'Unknown Organisation';
    };

    const getCreatorName = (job) => {
        if (job.createdBy === user?.uid) {
            return 'You';
        }
        return creators[job.createdBy] || 'Loading...';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header with Stats - Collapsible */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
                    {/* Header Top Bar */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                <span className="hidden xs:inline">Job Postings</span>
                                <span className="xs:hidden">Jobs</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                                Manage and track all your job listings
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/editorial-dashboard/jobs/create"
                                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm font-medium"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">New Job</span>
                                <span className="xs:hidden">New</span>
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

                    {/* Collapsible Content */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHeaderExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
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

                        {/* Stats Cards - Responsive Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-4 mb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-blue-600 font-medium truncate">Total</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.total || 0}</p>
                                <p className="text-[8px] sm:text-xs text-blue-600 mt-0.5 sm:mt-1 hidden sm:block">All time</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-green-600 font-medium truncate">Active</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.active || 0}</p>
                                <p className="text-[8px] sm:text-xs text-green-600 mt-0.5 sm:mt-1 hidden sm:block">Hiring now</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-yellow-600 font-medium truncate">Draft</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.draft || 0}</p>
                                <p className="text-[8px] sm:text-xs text-yellow-600 mt-0.5 sm:mt-1 hidden sm:block">In progress</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-purple-600 font-medium truncate">Filled</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.filled || 0}</p>
                                <p className="text-[8px] sm:text-xs text-purple-600 mt-0.5 sm:mt-1 hidden sm:block">Positions filled</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-gray-600 font-medium truncate">Expired</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.expired || 0}</p>
                                <p className="text-[8px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">Past deadline</p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-indigo-600 font-medium truncate">Views</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.views?.toLocaleString() || 0}</p>
                                <p className="text-[8px] sm:text-xs text-indigo-600 mt-0.5 sm:mt-1 hidden sm:block">Total views</p>
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-pink-600 font-medium truncate">Applications</p>
                                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.applications || 0}</p>
                                <p className="text-[8px] sm:text-xs text-pink-600 mt-0.5 sm:mt-1 hidden sm:block">Total received</p>
                            </div>
                        </div>

                        {/* Search and Filters - Responsive */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search jobs by title, company, or description..."
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Job Type
                                        </label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            Experience
                                        </label>
                                        <select
                                            value={experienceFilter}
                                            onChange={(e) => setExperienceFilter(e.target.value)}
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Min Salary
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={salaryRange.min}
                                            onChange={(e) => setSalaryRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Max Salary
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={salaryRange.max}
                                            onChange={(e) => setSalaryRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Date Posted
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="From"
                                            />
                                            <input
                                                type="date"
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="To"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 lg:col-span-3">
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
                        <p className="text-xs sm:text-sm text-gray-500">Loading jobs...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
                        <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
                        <p className="text-sm sm:text-base text-red-700 font-medium mb-1 sm:mb-2">Error loading jobs</p>
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
                {!loading && jobs.length === 0 && (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 sm:p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full mb-3 sm:mb-4">
                            <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No jobs found</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                                ? 'No jobs match your current filters. Try adjusting your search criteria.'
                                : activeTab === 'my'
                                    ? "You haven't posted any jobs yet. Get started by creating your first job posting."
                                    : 'Get started by creating your first job posting.'}
                        </p>
                        {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-2"
                            >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                Clear Filters
                            </button>
                        )}
                        {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && activeTab === 'my' && (
                            <Link
                                href="/editorial-dashboard/jobs/create"
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-2"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                Post Your First Job
                            </Link>
                        )}
                    </div>
                )}

                {/* Jobs Display */}
                {!loading && jobs.length > 0 && (
                    <>
                        {/* Selection Bar - Responsive */}
                        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-3 sm:mb-4">
                            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={selectedJobs.length === jobs.length}
                                    onChange={toggleAllSelection}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Select all ({jobs.length} {jobs.length === 1 ? 'job' : 'jobs'})</span>
                            </label>
                            {selectedJobs.length > 0 && (
                                <div className="flex items-center gap-2 w-full xs:w-auto">
                                    <span className="text-xs sm:text-sm bg-blue-50 text-blue-600 px-2 sm:px-3 py-1 rounded-full">
                                        {selectedJobs.length} selected
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
                                {jobs.map(job => {
                                    const daysRemaining = getDaysRemaining(job.applicationDeadline)
                                    const organisationName = getOrganisationName(job);
                                    const creatorName = getCreatorName(job);

                                    return (
                                        <div
                                            key={job.id}
                                            className={`group bg-white rounded-lg sm:rounded-xl border transition-all hover:shadow-md sm:hover:shadow-xl ${selectedJobs.includes(job.id)
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
                                                            checked={selectedJobs.includes(job.id)}
                                                            onChange={() => toggleJobSelection(job.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-lg">
                                                            {organisationName?.[0] || 'J'}
                                                        </div>
                                                    </div>
                                                    <div className="relative" ref={menuRef}>
                                                        <button
                                                            onClick={(e) => toggleMenu(job.id, e)}
                                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                        >
                                                            <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                                        </button>

                                                        {/* Dropdown Menu - Responsive */}
                                                        {openMenuId === job.id && (
                                                            <div className="absolute right-0 mt-1 w-40 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1 text-xs sm:text-sm">
                                                                <Link
                                                                    href={`/editorial-dashboard/jobs/${job.id}`}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> View
                                                                </Link>
                                                                <Link
                                                                    href={`/editorial-dashboard/jobs/${job.id}/edit`}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
                                                                </Link>
                                                                <Link
                                                                    href={`/editorial-dashboard/jobs/${job.id}/applications`}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" /> Applications
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDuplicate(job)}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                                                                >
                                                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" /> Duplicate
                                                                </button>

                                                                <div className="border-t my-1"></div>

                                                                <div className="px-2 sm:px-4 py-1">
                                                                    <p className="text-[10px] sm:text-xs font-medium text-gray-400">Status</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'active')}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-green-600 hover:bg-green-50 w-full text-left transition-colors"
                                                                >
                                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Active
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'draft')}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-yellow-600 hover:bg-yellow-50 w-full text-left transition-colors"
                                                                >
                                                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Draft
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'filled')}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-blue-600 hover:bg-blue-50 w-full text-left transition-colors"
                                                                >
                                                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" /> Filled
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(job.id, 'expired')}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-gray-600 hover:bg-gray-50 w-full text-left transition-colors"
                                                                >
                                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> Expired
                                                                </button>

                                                                <div className="border-t my-1"></div>

                                                                <button
                                                                    onClick={() => handleDelete(job.id)}
                                                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Company and Title */}
                                                <div className="mb-2 sm:mb-3">
                                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                                                        <Link href={`/editorial-dashboard/jobs/${job.id}`} className="hover:text-blue-600">
                                                            {job.title || 'Untitled Position'}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                                                        <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span className="truncate">{organisationName}</span>
                                                    </p>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                                                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {job.location?.city || job.location || 'Location not specified'}
                                                            {job.location?.country && `, ${job.location.country}`}
                                                        </span>
                                                        {job.location?.remote && (
                                                            <span className="bg-green-100 text-green-700 px-1 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium flex-shrink-0">
                                                                Remote
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                                                        <DollarSign className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                                        <span className="truncate">{formatSalary(job.salary)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                                                        <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                                        <span className="capitalize truncate">{job.jobType || 'full-time'}</span>
                                                        {job.experience?.level && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate capitalize">{job.experience.level}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Description Preview */}
                                                {job.content && (
                                                    <p className="text-[10px] sm:text-xs text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                                                        {String(job.content).replace(/<[^>]*>/g, '').slice(0, 80)}...
                                                    </p>
                                                )}

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        {getStatusIcon(job.status)}
                                                        <span className={`text-[10px] sm:text-xs font-medium ${job.status === 'active' ? 'text-green-600' :
                                                            job.status === 'draft' ? 'text-yellow-600' :
                                                                job.status === 'filled' ? 'text-blue-600' :
                                                                    'text-gray-600'
                                                            }`}>
                                                            {job.status || 'draft'}
                                                        </span>
                                                    </div>
                                                    {daysRemaining && (
                                                        <span className={`text-[8px] sm:text-[10px] flex items-center gap-0.5 sm:gap-1 ${daysRemaining.includes('Expired') ? 'text-red-500' :
                                                            daysRemaining.includes('Last day') ? 'text-orange-500' :
                                                                'text-gray-400'
                                                            }`}>
                                                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            <span className="hidden xs:inline">{daysRemaining}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-1 mt-1 sm:mt-2 text-[8px] sm:text-xs text-gray-400">
                                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                                        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span className="truncate max-w-[50px] sm:max-w-none">{creatorName}</span>
                                                    </span>
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <span className="flex items-center gap-0.5 sm:gap-1">
                                                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            <span className="hidden xs:inline">{getTimeAgo(job.datePosted || job.createdAt)}</span>
                                                        </span>
                                                        <span className="flex items-center gap-0.5 sm:gap-1">
                                                            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            {job.views || 0}
                                                        </span>
                                                        <span className="flex items-center gap-0.5 sm:gap-1">
                                                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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

                        {/* List View - Responsive */}
                        {viewMode === 'list' && (
                            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
                                {/* Mobile List View */}
                                <div className="block sm:hidden">
                                    {jobs.map(job => {
                                        const organisationName = getOrganisationName(job);
                                        const creatorName = getCreatorName(job);

                                        return (
                                            <div key={job.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedJobs.includes(job.id)}
                                                            onChange={() => toggleJobSelection(job.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <Link
                                                                href={`/editorial-dashboard/jobs/${job.id}`}
                                                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                            >
                                                                {job.title || 'Untitled Position'}
                                                            </Link>
                                                            <p className="text-xs text-gray-600 mt-1">{organisationName}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => toggleMenu(job.id, e)}
                                                        className="p-1 hover:bg-gray-200 rounded-full"
                                                    >
                                                        <MoreVertical className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500 ml-6">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="truncate">{job.location?.city || 'Remote'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" />
                                                        <span className="capitalize">{job.jobType || 'full-time'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {getTimeAgo(job.datePosted || job.createdAt)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {job.applications || 0} apps
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-2 ml-6">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                            job.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {getStatusIcon(job.status)}
                                                        {job.status || 'draft'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        Posted by: {creatorName}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Desktop Table View */}
                                <table className="hidden sm:table min-w-full divide-y divide-gray-200">
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
                                                Posted By
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
                                        {jobs.map(job => {
                                            const organisationName = getOrganisationName(job);
                                            const creatorName = getCreatorName(job);

                                            return (
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
                                                            {job.experience?.level && (
                                                                <p className="text-xs text-gray-500 mt-1 capitalize">
                                                                    {job.experience.level}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {organisationName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {job.location?.city || job.location || 'Remote'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-500 capitalize">
                                                            {job.jobType || 'full-time'}
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
                                                        {formatSalary(job.salary)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {creatorName}
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                        <button
                                                            onClick={(e) => toggleMenu(job.id, e)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
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
                                                                <Link
                                                                    href={`/editorial-dashboard/jobs/${job.id}/applications`}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Users className="w-4 h-4" /> Applications
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
                                            )
                                        })}
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
                                    {jobs.length} jobs
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