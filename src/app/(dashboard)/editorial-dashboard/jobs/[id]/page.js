import React from 'react'
import Link from 'next/link'
import { adminDb } from '@/lib/firebaseAdmin'
import {
    ArrowLeft,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Clock,
    Calendar,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    AlertCircle,
    Users,
    Globe,
    FileText,
    Zap,
    Mail,
    Phone,
    Link2,
    Share2,
    Printer,
    Bookmark,
    Award,
    TrendingUp,
    BarChart3,
    Download,
    Twitter,
    Facebook,
    Linkedin
} from 'lucide-react'

const PreviewPage = async ({ params }) => {
    // Await the params Promise
    const { id } = await params

    let job = null

    try {
        if (adminDb && id) {
            const doc = await adminDb.collection('jobs').doc(id).get()
            if (doc.exists) job = { id: doc.id, ...doc.data() }
        }
    } catch (err) {
        console.error('Failed to load job:', err)
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
                    <Link
                        href="/editorial-dashboard/jobs"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Jobs
                    </Link>

                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
                            <Briefcase className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
                        <p className="text-gray-500 mb-6">The job posting you're looking for doesn't exist or has been removed.</p>
                        <Link
                            href="/editorial-dashboard/jobs"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Jobs
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Format dates
    const postedDate = job.datePosted ? new Date(job.datePosted) : new Date(job.createdAt || Date.now())
    const deadlineDate = job.applicationDeadline ? new Date(job.applicationDeadline) : null
    const daysRemaining = deadlineDate ? Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)) : null

    // Safely get company name
    const getCompanyName = () => {
        if (job.organisation) return job.organisation
        if (job.companyName) return job.companyName
        if (typeof job.company === 'object' && job.company !== null) {
            return job.company.name || 'Company Name'
        }
        if (typeof job.company === 'string') return job.company
        return 'Company Name'
    }

    // Get status badge
    const getStatusBadge = () => {
        switch (job.status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                    </span>
                )
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        Draft
                    </span>
                )
            case 'filled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <Users className="w-3.5 h-3.5" />
                        Filled
                    </span>
                )
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Expired
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {job.status || 'Draft'}
                    </span>
                )
        }
    }

    // Format salary
    const formatSalary = () => {
        if (!job.salaryMin && !job.salaryMax) return 'Salary not specified'
        if (job.salaryMin && !job.salaryMax) return `$${job.salaryMin.toLocaleString()}+`
        if (!job.salaryMin && job.salaryMax) return `Up to $${job.salaryMax.toLocaleString()}`
        return `$${job.salaryMin?.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`
    }

    // Get job type icon
    const getJobTypeIcon = (type) => {
        switch (type) {
            case 'full-time': return <Clock className="w-4 h-4 text-blue-500" />
            case 'part-time': return <Clock className="w-4 h-4 text-purple-500" />
            case 'contract': return <FileText className="w-4 h-4 text-orange-500" />
            case 'remote': return <Globe className="w-4 h-4 text-green-500" />
            case 'hybrid': return <Building2 className="w-4 h-4 text-indigo-500" />
            case 'freelance': return <Zap className="w-4 h-4 text-yellow-500" />
            case 'internship': return <Users className="w-4 h-4 text-pink-500" />
            default: return <Briefcase className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header with Actions */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-4 sm:px-6 py-3 max-w-5xl mx-auto">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/editorial-dashboard/jobs"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to Jobs</span>
                            <span className="sm:hidden">Back</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/editorial-dashboard/jobs/${id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit Job</span>
                            </Link>
                            <Link
                                href={`/editorial-dashboard/jobs/${id}/applications`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                            >
                                <Users className="w-4 h-4" />
                                <span className="hidden sm:inline">Applications</span>
                            </Link>
                            <button
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                onClick={async () => {
                                    'use server'
                                    // Handle delete
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">
                {/* Job Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    {/* Company Banner (if exists) */}
                    {job.companyBanner && (
                        <div className="w-full h-32 sm:h-40 bg-gray-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={job.companyBanner}
                                alt={getCompanyName()}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-5 sm:p-8">
                        {/* Title and Status */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
                                    {job.title || 'Untitled Position'}
                                </h1>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="w-4 h-4" />
                                    <span className="text-sm sm:text-base">{getCompanyName()}</span>
                                </div>
                            </div>
                            {getStatusBadge()}
                        </div>

                        {/* Key Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-xs font-medium">Location</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {job.location || 'Not specified'}
                                    {job.isRemote && <span className="ml-1 text-green-600 text-xs">(Remote)</span>}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-xs font-medium">Salary</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">{formatSalary()}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    {getJobTypeIcon(job.type)}
                                    <span className="text-xs font-medium">Job Type</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 capitalize">{job.type || 'full-time'}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <Award className="w-4 h-4" />
                                    <span className="text-xs font-medium">Experience</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 capitalize">{job.experienceLevel || 'Not specified'}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <Users className="w-4 h-4" />
                                    <span className="text-xs font-medium">Openings</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">{job.openings || 1}</p>
                            </div>
                        </div>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Posted: {postedDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            {deadlineDate && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span className={daysRemaining < 0 ? 'text-red-500' : daysRemaining < 3 ? 'text-orange-500' : ''}>
                                        Deadline: {deadlineDate.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {daysRemaining > 0 && <span className="ml-1">({daysRemaining} days left)</span>}
                                        {daysRemaining < 0 && <span className="ml-1">(Expired)</span>}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stats Bar */}
                        <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">{job.views || 0}</span>
                                <span className="text-xs text-gray-400 hidden sm:inline">views</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">{job.applications || 0}</span>
                                <span className="text-xs text-gray-400 hidden sm:inline">applications</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">{job.conversionRate || '0%'}</span>
                                <span className="text-xs text-gray-400 hidden sm:inline">conversion</span>
                            </div>
                            <div className="flex-1" />
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5 sm:p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                                <div
                                    className="prose prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-img:rounded-lg"
                                    dangerouslySetInnerHTML={{
                                        __html: job.description || '<p class="text-gray-400 italic">No description available for this position.</p>'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5 sm:p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                                    <ul className="space-y-2">
                                        {job.requirements.map((req, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Responsibilities */}
                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5 sm:p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h2>
                                    <ul className="space-y-2">
                                        {job.responsibilities.map((resp, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <span>{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Benefits */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5 sm:p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {job.benefits.map((benefit, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                <Award className="w-4 h-4 text-purple-500" />
                                                <span>{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        {/* Company Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">About Company</h3>
                                {job.companyLogo && (
                                    <div className="mb-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={job.companyLogo}
                                            alt={getCompanyName()}
                                            className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 mb-4">
                                    {job.companyDescription || 'No company description provided.'}
                                </p>
                                {job.website && (
                                    <a
                                        href={job.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-2"
                                    >
                                        <Globe className="w-4 h-4" />
                                        {job.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                                {job.industry && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <Briefcase className="w-4 h-4" />
                                        {job.industry}
                                    </div>
                                )}
                                {job.companySize && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4" />
                                        {job.companySize} employees
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        {(job.contactEmail || job.contactPhone) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
                                    {job.contactEmail && (
                                        <a
                                            href={`mailto:${job.contactEmail}`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-3"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {job.contactEmail}
                                        </a>
                                    )}
                                    {job.contactPhone && (
                                        <a
                                            href={`tel:${job.contactPhone}`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            <Phone className="w-4 h-4" />
                                            {job.contactPhone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Job Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Views</span>
                                        <span className="text-sm font-medium text-gray-900">{job.views || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Applications</span>
                                        <span className="text-sm font-medium text-gray-900">{job.applications || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Conversion Rate</span>
                                        <span className="text-sm font-medium text-green-600">{job.conversionRate || '0%'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Shortlisted</span>
                                        <span className="text-sm font-medium text-gray-900">{job.shortlisted || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Interviews</span>
                                        <span className="text-sm font-medium text-gray-900">{job.interviews || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Offers Made</span>
                                        <span className="text-sm font-medium text-gray-900">{job.offers || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-5">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Application Link */}
                        {job.applicationLink && (
                            <a
                                href={job.applicationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                            >
                                Apply for this position
                            </a>
                        )}
                    </div>
                </div>

                {/* Share Actions */}
                <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Share this job:</span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Twitter className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-800 transition-colors">
                            <Facebook className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-700 transition-colors">
                            <Linkedin className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Link2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            <Bookmark className="w-4 h-4" />
                            <span className="hidden sm:inline">Save</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>

                {/* Similar Jobs */}
                {job.similarJobs && job.similarJobs.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {job.similarJobs.map((similarJob, index) => (
                                <Link
                                    key={index}
                                    href={`/editorial-dashboard/jobs/${similarJob.id}`}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                                >
                                    <h4 className="font-medium text-gray-900 mb-1">{similarJob.title}</h4>
                                    <p className="text-sm text-gray-600">{similarJob.company}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        {similarJob.location}
                                        <span>•</span>
                                        <DollarSign className="w-3 h-3" />
                                        {formatSalary(similarJob.salaryMin, similarJob.salaryMax)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PreviewPage