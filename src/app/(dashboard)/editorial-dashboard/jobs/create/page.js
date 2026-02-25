// app/(dashboard)/jobs/create/page.jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor from '@/app/(dashboard)/components/TiptapEditor';
import categoryData from '@/app/data/CategoryData';

import {
    BriefcaseIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    ArrowLeftIcon,
    GlobeAltIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    CurrencyDollarIcon,
    CheckBadgeIcon,
    PlusIcon,
    XMarkIcon,
    PencilSquareIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';
import ImagePicker from '@/app/(dashboard)/components/ImagePicker';
import Image from 'next/image';

export default function CreateJobPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [organisations, setOrganisations] = useState([]);
    const [orgSearch, setOrgSearch] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [completedTabs, setCompletedTabs] = useState({});

    // Form data structured according to your schema
    const [formData, setFormData] = useState({
        title: '',
        organisation: '', // companyId
        featuredImage: '',
        gallery: [], // New: for multiple images
        category: '',
        subCategory: '',
        content: '', // RTE content
        jobType: 'full-time',
        postType: 'job',
        createdBy: {
            userId: user.uid,
            name: user.name || user.email,
            avatar: user.avatar
        },
        datePosted: null,
        createdAt: null,
        updatedAt: null,
        status: 'draft',
        isVerified: false,

        stats: {
            views: 0,
            comments: 0,
            updatedAt: null
        },
        location: {
            city: '',
            country: '',
            remote: false,
            address: ''
        },
        salary: {
            min: '',
            max: '',
            currency: 'USD',
            period: 'year'
        },
        requirements: [],
        benefits: [],
        skills: [],
        experience: {
            min: 0,
            max: 0,
            level: 'entry' // entry, mid, senior, executive
        },
        education: '',
        applicationDeadline: '',
        contactEmail: '',
        howToApply: ''
    });

    const [errors, setErrors] = useState({});
    const [charCount, setCharCount] = useState({
        title: 0,
        content: 0
    });

    // Tab configuration
    const tabs = [
        {
            id: 'basic',
            name: 'Basic Info',
            icon: PencilSquareIcon,
            description: 'Job title, type, and category',
            fields: ['title', 'postType', 'jobType', 'category', 'subCategory'],
            isComplete: () => {
                return (
                    formData.title?.length >= 10 &&
                    formData.category
                );
            }
        },
        {
            id: 'organisation',
            name: 'Organisation',
            icon: BuildingOfficeIcon,
            description: 'Select or create an organisation',
            fields: ['organisation'],
            isComplete: () => {
                return formData.organisation;
            }
        },
        {
            id: 'details',
            name: 'Job Details',
            icon: BriefcaseIcon,
            description: 'Location, salary, and requirements',
            fields: ['location', 'salary', 'experience'],
            isComplete: () => {
                return true; // Optional fields
            }
        },
        {
            id: 'content',
            name: 'Description',
            icon: DocumentDuplicateIcon,
            description: 'Job description and requirements',
            fields: ['content'],
            isComplete: () => {
                return formData.content?.length >= 100;
            }
        },
        {
            id: 'media',
            name: 'Media & Settings',
            icon: PhotoIcon,
            description: 'Images and job settings',
            fields: ['featuredImage', 'gallery', 'status', 'isVerified'],
            isComplete: () => {
                return true; // Optional fields
            }
        }
    ];

    const jobTypes = [
        { value: 'full-time', label: 'Full Time', icon: '💼' },
        { value: 'part-time', label: 'Part Time', icon: '🕒' },
        { value: 'contract', label: 'Contract', icon: '📝' },
        { value: 'freelance', label: 'Freelance', icon: '⚡' },
        { value: 'internship', label: 'Internship', icon: '🎓' },
        { value: 'temporary', label: 'Temporary', icon: '⏳' }
    ];

    const postTypes = [
        { value: 'job', label: 'Job' },
        { value: 'internship', label: 'Internship' },
        { value: 'fellowship', label: 'Fellowship' },
        { value: 'grant', label: 'Grant' },
    ];

    const experienceLevels = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior Level' },
        { value: 'executive', label: 'Executive' }
    ];

    const currencies = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'JPY', label: 'JPY (¥)' },
        { value: 'CAD', label: 'CAD ($)' },
        { value: 'AUD', label: 'AUD ($)' }
    ];

    // Fetch organisations on mount
    useEffect(() => {
        fetchOrganisations();
        setFormData(prev => ({ ...prev, createdBy: user?.uid }));
    }, [user]);

    useEffect(() => {
        const categoryObj = categoryData.find(c => c.name === formData.category);
        setSubCategories(categoryObj ? categoryObj.subcategories : []);
    }, [formData.category]);

    useEffect(() => {
        setCharCount({
            title: formData.title.length,
            content: formData.content?.length || 0
        });

        // Update completed tabs
        const newCompletedTabs = {};
        tabs.forEach((tab, index) => {
            if (tab.isComplete()) {
                newCompletedTabs[index] = true;
            }
        });
        setCompletedTabs(newCompletedTabs);
    }, [formData]);

    const fetchOrganisations = async () => {
        try {
            const response = await fetch('/api/organisations');
            if (response.ok) {
                const data = await response.json();
                setOrganisations(data);
            }
        } catch (error) {
            console.error('Error fetching organisations:', error);
        }
    };

    const validateTab = (tabIndex) => {
        const tab = tabs[tabIndex];
        const newErrors = { ...errors };

        if (tab.id === 'basic') {
            if (!formData.title.trim()) {
                newErrors.title = 'Job title is required';
            } else if (formData.title.length < 10) {
                newErrors.title = 'Job title should be at least 10 characters';
            } else {
                delete newErrors.title;
            }

            if (!formData.category) {
                newErrors.category = 'Category is required';
            } else {
                delete newErrors.category;
            }
        }

        if (tab.id === 'organisation') {
            if (!formData.organisation) {
                newErrors.organisation = 'Company/Institution is required';
            } else {
                delete newErrors.organisation;
            }
        }

        if (tab.id === 'content') {
            if (!formData.content || formData.content.length < 100) {
                newErrors.content = 'Job description should be at least 100 characters';
            } else {
                delete newErrors.content;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).filter(key => tab.fields.includes(key)).length === 0;
    };

    const handleNext = () => {
        if (validateTab(activeTab)) {
            setActiveTab(prev => Math.min(prev + 1, tabs.length - 1));
        }
    };

    const handlePrevious = () => {
        setActiveTab(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all tabs
        const allTabsValid = tabs.every((_, index) => validateTab(index));

        if (!allTabsValid) {
            // Find first tab with errors
            const firstInvalidTab = tabs.findIndex((_, index) => !validateTab(index));
            setActiveTab(firstInvalidTab);

            const firstError = document.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setSaving(true);
        try {
            const now = new Date().toISOString();
            const jobData = {
                ...formData,
                createdAt: now,
                updatedAt: now,
                datePosted: formData.status === 'published' ? now : null,
            };

            const response = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            if (response.ok) {
                router.push('/editorial-dashboard');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to create job');
            }
        } catch (error) {
            console.error('Error creating job:', error);
            alert('Failed to create job');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        setFormData({ ...formData, status: 'draft' });
        await handleSubmit(new Event('submit'));
    };

    const selectedOrg = organisations.find(org => org.id === formData.organisation);

    // When creating/updating a post that uses images
    const trackMediaUsage = async (mediaUrls, sourceType, sourceId, action = 'add') => {
        // Find media IDs from URLs (you'll need a way to map URLs to IDs)
        // This could be done by storing the ID in the URL or having a separate lookup

        for (const url of mediaUrls) {
            // Find media document by URL
            const response = await fetch(`/api/media/find-by-url?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const { id } = await response.json();
                if (id) {
                    await fetch('/api/media/usage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mediaId: id,
                            sourceType,
                            sourceId,
                            action
                        })
                    });
                }
            }
        }
    };

    // Call this after successful creation/update
    // trackMediaUsage([formData.featuredImage, ...formData.gallery], 'post', postId);
    // Preview Component

    const JobPreview = () => (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <EyeIcon className="h-5 w-5" />
                        Job Preview
                    </h2>
                    <span className="text-white/80 text-sm">
                        {formData.status === 'published' ? 'Published' : 'Draft Mode'}
                    </span>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                {/* Header with Company Info */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                    {formData.featuredImage ? (
                        <Image
                            width={400}
                            height={300}
                            src={formData.featuredImage}
                            alt={formData.title}
                            unoptimized
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                        />
                    ) : selectedOrg?.logoUrl ? (
                        <Image
                            width={400}
                            height={300}
                            src={selectedOrg.logoUrl}
                            alt={selectedOrg.companyName}
                            unoptimized
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-xl bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <BuildingOfficeIcon className="h-10 w-10 text-blue-600" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            {formData.title || 'Job Title'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-lg text-gray-700">
                                {selectedOrg?.companyName || 'Company Name'}
                            </span>
                            {formData.isVerified && (
                                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    <CheckBadgeSolid className="h-3 w-3" />
                                    Verified
                                </span>
                            )}
                            <span className="text-sm text-gray-500">
                                {postTypes.find(p => p.value === formData.postType)?.label || 'Job'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Job Meta Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {jobTypes.find(j => j.value === formData.jobType)?.icon}
                        {jobTypes.find(j => j.value === formData.jobType)?.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {formData.category || 'Category'}
                        {formData.subCategory && ` / ${formData.subCategory}`}
                    </span>
                    {formData.location?.city && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                            <MapPinIcon className="h-4 w-4" />
                            {formData.location.city}, {formData.location.country}
                        </span>
                    )}
                    {formData.salary?.min && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            {formData.salary.currency} {formData.salary.min} - {formData.salary.max} /{formData.salary.period}
                        </span>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Posted</p>
                        <p className="font-medium text-sm">
                            {formData.datePosted ? new Date(formData.datePosted).toLocaleDateString() : 'Not published'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="font-medium text-sm">{formData.views || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-medium text-sm capitalize">{formData.status}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="font-medium text-sm">
                            {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : 'Just now'}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="prose max-w-none mb-6">
                    <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                    <div dangerouslySetInnerHTML={{
                        __html: formData.content || '<p class="text-gray-500 italic">No description provided yet.</p>'
                    }} />
                </div>

                {/* Gallery */}
                {formData.gallery?.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Gallery</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {formData.gallery.map((img, index) => (
                                <Image
                                    width={400}
                                    height={300}
                                    key={index}
                                    src={img}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg"
                                    unoptimized
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
            <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 ">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0 mt-1"
                                aria-label="Go back"
                            >
                                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 wrap-break-word">
                                    Create New Job
                                </h1>
                                <p className="text-sm text-gray-500 mt-1 wrap-break-word">
                                    {preview ? 'Preview your job posting' : tabs[activeTab].description}
                                </p>
                            </div>
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="hidden sm:flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setPreview(!preview)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 shadow-sm whitespace-nowrap"
                            >
                                <EyeIcon className="h-4 w-4" />
                                {preview ? 'Edit' : 'Preview'}
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 whitespace-nowrap"
                            >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                                Save Draft
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 whitespace-nowrap"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="hidden lg:inline">Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <GlobeAltIcon className="h-4 w-4" />
                                        <span className="hidden lg:inline">Publish</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {preview ? (
                    <JobPreview />
                ) : (
                    <>
                        {/* Tabs Navigation */}
                        <div className="mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="flex -mb-px space-x-8 overflow-x-auto pb-1" aria-label="Tabs">
                                    {tabs.map((tab, index) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === index;
                                        const isCompleted = completedTabs[index];

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(index)}
                                                className={`
                                                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                                    ${isActive
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                <Icon className={`
                                                    -ml-0.5 mr-2 h-5 w-5
                                                    ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                                                `} />
                                                <span>{tab.name}</span>
                                                {isCompleted && (
                                                    <CheckCircleIcon className="ml-2 h-4 w-4 text-green-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === 0 && (
                                        <div className="space-y-6">
                                            {/* Title */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Job Title <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="e.g., Senior Frontend Developer"
                                                />
                                                {errors.title ? (
                                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                                ) : (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {charCount.title}/10 characters minimum
                                                    </p>
                                                )}
                                            </div>

                                            {/* Post Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Post Type
                                                </label>
                                                <select
                                                    value={formData.postType}
                                                    onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    {postTypes.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Job Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Job Type
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {jobTypes.map((type) => (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, jobType: type.value })}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.jobType === type.value
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {type.icon} {type.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Category & Subcategory */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.category}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, category: e.target.value, subCategory: '' });
                                                        }}
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                            }`}
                                                    >
                                                        <option value="">Select category</option>
                                                        {categoryData.map((c) => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    {errors.category && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Sub Category
                                                    </label>
                                                    {subCategories.length > 0 ? (
                                                        <select
                                                            value={formData.subCategory}
                                                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select subcategory</option>
                                                            {subCategories.map((sc) => (
                                                                <option key={sc} value={sc}>{sc}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={formData.subCategory}
                                                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                                            placeholder="Enter subcategory"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select Organisation <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <div className="relative flex-1">
                                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={orgSearch}
                                                                onChange={(e) => {
                                                                    setOrgSearch(e.target.value);
                                                                    setShowOrgDropdown(true);
                                                                }}
                                                                onFocus={() => setShowOrgDropdown(true)}
                                                                placeholder="Search organisations..."
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <Link
                                                            href="/admin-dashboard/organisations/create"
                                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                                                        >
                                                            <PlusIcon className="h-4 w-4" />
                                                            <span>New Organisation</span>
                                                        </Link>
                                                    </div>

                                                    {showOrgDropdown && organisations.length > 0 && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setShowOrgDropdown(false)}
                                                            />
                                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                {organisations
                                                                    .filter(o => o.companyName?.toLowerCase().includes(orgSearch.toLowerCase()))
                                                                    .map((org) => (
                                                                        <button
                                                                            key={org.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, organisation: org.id });
                                                                                setOrgSearch(org.companyName);
                                                                                setShowOrgDropdown(false);
                                                                            }}
                                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-0"
                                                                        >
                                                                            {org.logoUrl ? (
                                                                                <Image
                                                                                    src={org.logoUrl}
                                                                                    alt={org.companyName}
                                                                                    width={32}
                                                                                    height={32}
                                                                                    unoptimized
                                                                                    className="w-8 h-8 rounded-lg object-cover" />
                                                                            ) : (
                                                                                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                                    <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <p className="font-medium">{org.companyName}</p>
                                                                                <p className="text-xs text-gray-500">{org.location?.city}, {org.location?.country}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {formData.organisation && selectedOrg && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                                                        {selectedOrg.logoUrl ? (
                                                            <Image
                                                                src={selectedOrg.logoUrl} alt={selectedOrg.companyName}
                                                                width={48}
                                                                height={48}
                                                                unoptimized
                                                                className="w-12 h-12 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                                                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold truncate">{selectedOrg.companyName}</p>
                                                            <p className="text-sm text-gray-600 truncate">{selectedOrg.location?.city}, {selectedOrg.location?.country}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, organisation: '' });
                                                                setOrgSearch('');
                                                            }}
                                                            className="text-gray-400 hover:text-gray-600 shrink-0"
                                                        >
                                                            <XMarkIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {errors.organisation && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.organisation}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 2 && (
                                        <div className="space-y-6">
                                            {/* Location */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                                                    Location
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">City</label>
                                                        <input
                                                            type="text"
                                                            value={formData.location.city}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                location: { ...formData.location, city: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., San Francisco"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                                                        <input
                                                            type="text"
                                                            value={formData.location.country}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                location: { ...formData.location, country: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., United States"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-xs text-gray-500 mb-1">Full Address</label>
                                                        <input
                                                            type="text"
                                                            value={formData.location.address}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                location: { ...formData.location, address: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Street address"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.location.remote}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    location: { ...formData.location, remote: e.target.checked }
                                                                })}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">This is a remote position</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Salary */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                                                    Salary Range
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Currency</label>
                                                        <select
                                                            value={formData.salary.currency}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                salary: { ...formData.salary, currency: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            {currencies.map(c => (
                                                                <option key={c.value} value={c.value}>{c.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Min</label>
                                                        <input
                                                            type="number"
                                                            value={formData.salary.min}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                salary: { ...formData.salary, min: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="50000"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Max</label>
                                                        <input
                                                            type="number"
                                                            value={formData.salary.max}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                salary: { ...formData.salary, max: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="100000"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Period</label>
                                                        <select
                                                            value={formData.salary.period}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                salary: { ...formData.salary, period: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="hour">per hour</option>
                                                            <option value="day">per day</option>
                                                            <option value="week">per week</option>
                                                            <option value="month">per month</option>
                                                            <option value="year">per year</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Experience */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                                                    Experience
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Level</label>
                                                        <select
                                                            value={formData.experience.level}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                experience: { ...formData.experience, level: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            {experienceLevels.map(level => (
                                                                <option key={level.value} value={level.value}>{level.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Min Years</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="50"
                                                            value={formData.experience.min}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                experience: { ...formData.experience, min: parseInt(e.target.value) }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Max Years</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="50"
                                                            value={formData.experience.max}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                experience: { ...formData.experience, max: parseInt(e.target.value) }
                                                            })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description <span className="text-red-500">*</span>
                                                </label>
                                                <TiptapEditor
                                                    content={formData.content}
                                                    onChange={(content) => setFormData({ ...formData, content })}
                                                    placeholder="Describe the job role, responsibilities, and requirements..."
                                                />
                                                {errors.content ? (
                                                    <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                                                ) : (
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        {charCount.content}/100 characters minimum
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 4 && (
                                        <div className="space-y-6">
                                            {/* Featured Image */}
                                            <ImagePicker
                                                label="Featured Image"
                                                value={formData.featuredImage}
                                                onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                                                coverOnly={true}
                                            />

                                            {/* Gallery */}
                                            <div className="mt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Gallery Images
                                                </label>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Add multiple images to showcase the workplace or team
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {formData.gallery.map((url, index) => (
                                                        <div key={index} className="relative group">
                                                            <Image
                                                                width={400}
                                                                height={300}
                                                                src={url}
                                                                unoptimized
                                                                alt={`Gallery ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newGallery = formData.gallery.filter((_, i) => i !== index);
                                                                    setFormData({ ...formData, gallery: newGallery });
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Open media library with multi-select
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.multiple = true;
                                                            input.accept = 'image/*';
                                                            input.onchange = async (e) => {
                                                                const files = Array.from(e.target.files);
                                                                // Here you would upload each file and get URLs
                                                                // For now, we'll create object URLs
                                                                const newUrls = files.map(file => URL.createObjectURL(file));
                                                                setFormData({
                                                                    ...formData,
                                                                    gallery: [...formData.gallery, ...newUrls]
                                                                });
                                                            };
                                                            input.click();
                                                        }}
                                                        className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                                                        <span className="text-xs text-gray-500">Add Images</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Status & Verification */}
                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Status
                                                        </label>
                                                        <select
                                                            value={formData.status}
                                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="draft">Draft</option>
                                                            <option value="published">Published</option>
                                                        </select>
                                                    </div>

                                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.isVerified}
                                                            onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700 flex items-center gap-1">
                                                            <CheckBadgeIcon className="h-4 w-4" />
                                                            Mark as verified job
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={activeTab === 0}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {activeTab < tabs.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    <span>Creating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <GlobeAltIcon className="h-4 w-4" />
                                                    <span>Create Job</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
                <div className="flex items-center justify-around p-2 overflow-x-auto">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === index;
                        const isCompleted = completedTabs[index];

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(index)}
                                className={`flex flex-col items-center p-2 rounded-lg transition-colors relative min-w-15 ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs mt-1 truncate max-w-15">{tab.name}</span>
                                {isCompleted && (
                                    <CheckCircleIcon className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-2 p-2 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => setPreview(!preview)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2 text-sm"
                    >
                        <EyeIcon className="h-4 w-4" />
                        {preview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        {saving ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <>
                                <GlobeAltIcon className="h-4 w-4" />
                                <span className="hidden xs:inline">Publish</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}