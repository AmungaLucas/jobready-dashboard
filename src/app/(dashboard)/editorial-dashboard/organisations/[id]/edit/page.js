"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import categoryData from '@/app/data/CategoryData';
import ImagePicker from '@/app/(dashboard)/components/ImagePicker';
import MultiImagePicker from '@/app/(dashboard)/components/MultiImagePicker';

import {
    BuildingOfficeIcon,
    PhotoIcon,
    MapPinIcon,
    DocumentTextIcon,
    EyeIcon,
    ArrowLeftIcon,
    GlobeAltIcon,
    CheckCircleIcon,
    XMarkIcon,
    SparklesIcon,
    ClockIcon,
    UserIcon,
    ChartBarIcon,
    LinkIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    BoltIcon,
    PlusIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    TagIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export default function OrganisationEditPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [completedTabs, setCompletedTabs] = useState({});
    const [preview, setPreview] = useState(false);
    const [form, setForm] = useState({
        companyName: '',
        logoUrl: '',
        featuredImage: '',
        gallery: [],
        website: '',
        category: '',
        subcategory: '',
        about: '',
        location: { city: '', country: '' },
        status: 'active',
        isVerified: false,
        social: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
        },
        contact: {
            email: '',
            phone: '',
            address: ''
        }
    });

    const [subCategories, setSubCategories] = useState([]);
    const [originalData, setOriginalData] = useState(null);
    const [charCounts, setCharCounts] = useState({
        about: 0
    });

    // Tab configuration
    const tabs = [
        {
            id: 'basic',
            name: 'Basic Info',
            icon: BuildingOfficeIcon,
            description: 'Company name, category, and about',
            fields: ['companyName', 'category', 'about'],
            isComplete: () => {
                return form.companyName?.trim().length >= 2;
            }
        },
        {
            id: 'media',
            name: 'Media',
            icon: PhotoIcon,
            description: 'Logo, featured image, and gallery',
            fields: ['logoUrl', 'featuredImage', 'gallery'],
            isComplete: () => {
                return true; // Optional
            }
        },
        {
            id: 'details',
            name: 'Details',
            icon: DocumentTextIcon,
            description: 'Status, verification, and social links',
            fields: ['status', 'isVerified', 'social'],
            isComplete: () => {
                return true; // Optional
            }
        },
        {
            id: 'location',
            name: 'Location',
            icon: MapPinIcon,
            description: 'Address and contact information',
            fields: ['location', 'contact'],
            isComplete: () => {
                return true; // Optional
            }
        }
    ];

    // Fetch organisation data
    useEffect(() => {
        const fetchOrganisation = async () => {
            try {
                console.log('Fetching organisation with ID:', params.id);

                const res = await fetch(`/api/organisations/${params.id}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to fetch organisation');
                }

                console.log('Fetched data:', data);

                // Ensure gallery exists
                setForm({
                    ...data,
                    gallery: data.gallery || [],
                    social: data.social || { facebook: '', twitter: '', linkedin: '', instagram: '' },
                    contact: data.contact || { email: '', phone: '', address: '' }
                });
                setOriginalData(data);

            } catch (err) {
                console.error('Fetch error:', err);
                setFetchError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params?.id) {
            fetchOrganisation();
        } else {
            setFetchError('No organisation ID provided');
            setLoading(false);
        }
    }, [params?.id]);

    // Update subcategories when category changes
    useEffect(() => {
        const cat = categoryData.find(c => c.name === form.category);
        setSubCategories(cat ? cat.subcategories : []);
    }, [form.category]);

    // Update character counts and completed tabs
    useEffect(() => {
        setCharCounts({
            about: form.about?.length || 0
        });

        // Update completed tabs
        const newCompletedTabs = {};
        tabs.forEach((tab, index) => {
            if (tab.isComplete()) {
                newCompletedTabs[index] = true;
            }
        });
        setCompletedTabs(newCompletedTabs);
    }, [form]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.companyName.trim()) {
            alert('Company name is required');
            setActiveTab(0);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/organisations/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                router.push('/editorial-dashboard/organisations');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update organisation');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update organisation');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this organisation? This action cannot be undone.')) {
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/organisations/${params.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/editorial-dashboard/organisations');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete organisation');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete organisation');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = () => {
        if (!originalData) return false;
        return JSON.stringify(form) !== JSON.stringify(originalData);
    };

    const handleNext = () => {
        setActiveTab(prev => Math.min(prev + 1, tabs.length - 1));
    };

    const handlePrevious = () => {
        setActiveTab(prev => Math.max(prev - 1, 0));
    };

    const validateTab = (tabIndex) => {
        const tab = tabs[tabIndex];

        if (tab.id === 'basic') {
            if (!form.companyName?.trim()) {
                return false;
            }
        }

        return true;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading organisation...</p>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Organisation</h2>
                    <p className="text-gray-600 mb-6">{fetchError}</p>
                    <Link
                        href="/editorial-dashboard/organisations"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        ← Back to Organisations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
            <div className="max-w-4xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
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
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                                    Edit Organisation
                                </h1>
                                <p className="text-sm text-gray-500 mt-1 break-words">
                                    {preview ? 'Preview organisation' : tabs[activeTab].description}
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
                                type="button"
                                onClick={handleDelete}
                                disabled={saving}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 whitespace-nowrap"
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/editorial-dashboard/organisations')}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm whitespace-nowrap"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Unsaved changes warning */}
                {hasChanges() && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    You have unsaved changes. Don't forget to save your updates.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {preview ? (
                    // Preview Mode
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <EyeIcon className="h-5 w-5 text-gray-500" />
                                <h2 className="font-semibold text-gray-700">Preview Mode</h2>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8">
                            <article className="prose prose-lg max-w-none">
                                {/* Featured Image */}
                                {form.featuredImage && (
                                    <div className="relative h-64 sm:h-96 w-full mb-8 rounded-xl overflow-hidden shadow-lg">
                                        <img
                                            src={form.featuredImage}
                                            alt={form.companyName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Logo and Title */}
                                <div className="flex items-center gap-4 mb-6">
                                    {form.logoUrl && (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                            <img
                                                src={form.logoUrl}
                                                alt={`${form.companyName} logo`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{form.companyName || 'Untitled'}</h1>
                                        {form.category && (
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                {form.category} {form.subcategory && `› ${form.subcategory}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {form.isVerified && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                            <CheckCircleSolid className="h-4 w-4" />
                                            Verified
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${form.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        <span className={`h-2 w-2 rounded-full ${form.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                            }`}></span>
                                        {form.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* About */}
                                {form.about && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4">About</h2>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{form.about}</p>
                                    </div>
                                )}

                                {/* Website */}
                                {form.website && (
                                    <div className="mb-6">
                                        <a
                                            href={form.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                        >
                                            <GlobeAltIcon className="h-5 w-5" />
                                            {form.website}
                                        </a>
                                    </div>
                                )}

                                {/* Location */}
                                {(form.location?.city || form.location?.country) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                            <MapPinIcon className="h-5 w-5" />
                                            Location
                                        </h3>
                                        <p className="text-gray-700">
                                            {form.location.city}{form.location.city && form.location.country ? ', ' : ''}{form.location.country}
                                        </p>
                                    </div>
                                )}

                                {/* Contact */}
                                {(form.contact?.email || form.contact?.phone || form.contact?.address) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Contact</h3>
                                        <div className="space-y-1">
                                            {form.contact.email && <p>📧 {form.contact.email}</p>}
                                            {form.contact.phone && <p>📞 {form.contact.phone}</p>}
                                            {form.contact.address && <p>📍 {form.contact.address}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Social Links */}
                                {Object.values(form.social).some(Boolean) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                                        <div className="space-y-1">
                                            {form.social.facebook && <p>📘 {form.social.facebook}</p>}
                                            {form.social.twitter && <p>🐦 {form.social.twitter}</p>}
                                            {form.social.linkedin && <p>🔗 {form.social.linkedin}</p>}
                                            {form.social.instagram && <p>📷 {form.social.instagram}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Gallery */}
                                {form.gallery?.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold mb-4">Gallery</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {form.gallery.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-40 object-cover rounded-lg shadow-md"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>
                        </div>
                    </div>
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
                                <div className="p-2">
                                    {/* Basic Info Tab */}
                                    {activeTab === 0 && (
                                        <div className="space-y-5">
                                            {/* Company Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Company Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="e.g., Acme Corporation"
                                                    value={form.companyName}
                                                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                                                />
                                            </div>

                                            {/* Website */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="url"
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="https://example.com"
                                                        value={form.website}
                                                        onChange={e => setForm({ ...form, website: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Category and Subcategory */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                    <select
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        value={form.category}
                                                        onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })}
                                                    >
                                                        <option value="">Select a category</option>
                                                        {categoryData.map(c => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                                    {subCategories.length > 0 ? (
                                                        <select
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={form.subcategory}
                                                            onChange={e => setForm({ ...form, subcategory: e.target.value })}
                                                        >
                                                            <option value="">Select a subcategory</option>
                                                            {subCategories.map(sc => (
                                                                <option key={sc} value={sc}>{sc}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter subcategory"
                                                            value={form.subcategory}
                                                            onChange={e => setForm({ ...form, subcategory: e.target.value })}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* About */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                                                <textarea
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    placeholder="Tell us about the organisation..."
                                                    value={form.about || ''}
                                                    onChange={e => setForm({ ...form, about: e.target.value })}
                                                />
                                                <div className="mt-1 flex justify-between items-center">
                                                    <p className="text-xs text-gray-500">{charCounts.about}/500 characters</p>
                                                    {charCounts.about > 0 && (
                                                        <p className={`text-xs ${charCounts.about >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                                                            {charCounts.about >= 50 ? '✓ Good length' : `${50 - charCounts.about} more characters recommended`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Media Tab */}
                                    {activeTab === 1 && (
                                        <div className="space-y-6">
                                            {/* Logo */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Logo
                                                </label>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Upload your organisation's logo (square format recommended)
                                                </p>
                                                <ImagePicker
                                                    value={form.logoUrl}
                                                    onChange={(url) => setForm({ ...form, logoUrl: url })}
                                                    coverOnly={false}
                                                />
                                            </div>

                                            {/* Featured Image */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Featured Image
                                                </label>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Main image that represents your organisation (16:9 ratio recommended)
                                                </p>
                                                <ImagePicker
                                                    value={form.featuredImage}
                                                    onChange={(url) => setForm({ ...form, featuredImage: url })}
                                                    coverOnly={true}
                                                />
                                            </div>

                                            {/* Gallery */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Gallery Images
                                                </label>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Add multiple images to showcase your organisation's work, office, or team
                                                </p>
                                                <MultiImagePicker
                                                    value={form.gallery}
                                                    onChange={(urls) => setForm({ ...form, gallery: urls })}
                                                    maxItems={20}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Details Tab */}
                                    {activeTab === 2 && (
                                        <div className="space-y-6">
                                            {/* Status and Verification */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <BoltIcon className="h-5 w-5 text-gray-500" />
                                                    Status & Verification
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id="verified"
                                                                checked={form.isVerified}
                                                                onChange={e => setForm({ ...form, isVerified: e.target.checked })}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <label htmlFor="verified" className="ml-2 block text-sm text-gray-900">
                                                                Verified Organisation
                                                            </label>
                                                        </div>
                                                        <select
                                                            value={form.status}
                                                            onChange={e => setForm({ ...form, status: e.target.value })}
                                                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="active">🟢 Active</option>
                                                            <option value="inactive">🔴 Inactive</option>
                                                        </select>
                                                    </div>

                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <span className="text-blue-400 text-xl">ℹ️</span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <h3 className="text-sm font-medium text-blue-800">Status Information</h3>
                                                                <div className="mt-2 text-sm text-blue-700">
                                                                    <p>• Active organisations are visible to the public</p>
                                                                    <p>• Verified badge shows authenticity to users</p>
                                                                    <p>• Changes take effect immediately after saving</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Social Media Links */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <LinkIcon className="h-5 w-5 text-gray-500" />
                                                    Social Media Links
                                                </h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Facebook</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://facebook.com/yourpage"
                                                            value={form.social.facebook}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, facebook: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Twitter</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://twitter.com/yourhandle"
                                                            value={form.social.twitter}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, twitter: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://linkedin.com/company/yourcompany"
                                                            value={form.social.linkedin}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, linkedin: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Instagram</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://instagram.com/yourprofile"
                                                            value={form.social.instagram}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, instagram: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location Tab */}
                                    {activeTab === 3 && (
                                        <div className="space-y-6">
                                            {/* Location */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                                                    Location
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">City</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500">🏙️</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="e.g., San Francisco"
                                                                value={form.location?.city || ''}
                                                                onChange={e => setForm({
                                                                    ...form,
                                                                    location: { ...form.location, city: e.target.value }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500">🌍</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="e.g., United States"
                                                                value={form.location?.country || ''}
                                                                onChange={e => setForm({
                                                                    ...form,
                                                                    location: { ...form.location, country: e.target.value }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Location preview */}
                                                {(form.location?.city || form.location?.country) && (
                                                    <div className="mt-4 p-4 bg-white rounded-lg">
                                                        <div className="flex items-center text-gray-700">
                                                            <span className="text-2xl mr-3">📍</span>
                                                            <div>
                                                                <p className="font-medium">Current Location</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {form.location.city}{form.location.city && form.location.country ? ', ' : ''}{form.location.country}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Information */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                                                    Contact Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Email</label>
                                                        <input
                                                            type="email"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="contact@example.com"
                                                            value={form.contact.email}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                contact: { ...form.contact, email: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                                        <input
                                                            type="tel"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="+1 (555) 123-4567"
                                                            value={form.contact.phone}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                contact: { ...form.contact, phone: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Address</label>
                                                        <textarea
                                                            rows={3}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                            placeholder="Full address"
                                                            value={form.contact.address}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                contact: { ...form.contact, address: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Last updated info */}
                                            <div className="text-sm text-gray-500 border-t pt-4">
                                                <p>Last updated: {new Date().toLocaleString()}</p>
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
                                            disabled={saving || !hasChanges()}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    <span>Save Changes</span>
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
                                className={`flex flex-col items-center p-2 rounded-lg transition-colors relative min-w-[60px] ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs mt-1 truncate max-w-[60px]">{tab.name}</span>
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
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        Delete
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={saving || !hasChanges()}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        {saving ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircleIcon className="h-4 w-4" />
                                <span>Save</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}