// app/(dashboard)/organisations/create/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    UserIcon,
    LinkIcon,
    ArrowPathIcon,
    BoltIcon,
    CalendarIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function OrganisationCreatePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
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
        createdBy: {
            userId: user.uid,
            name: user.name || user.email,
            avatar: user.avatar
        },
        about: '',
        location: {
            city: '',
            country: '',
            address: '',
            postalCode: ''
        },
        social: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
        },
        contact: {
            email: '',
            phone: '',
            contactPerson: ''
        },
        status: 'active',
        isVerified: false,
        founded: '',
        employees: '',
        industry: ''
    });

    const [subCategories, setSubCategories] = useState([]);
    const [errors, setErrors] = useState({});
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
                return form.companyName?.trim().length >= 3 && form.category;
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
            description: 'Additional information and social links',
            fields: ['founded', 'employees', 'industry', 'social', 'contact'],
            isComplete: () => {
                return true; // Optional
            }
        },
        {
            id: 'location',
            name: 'Location',
            icon: MapPinIcon,
            description: 'Where is the organisation based?',
            fields: ['location'],
            isComplete: () => {
                return true; // Optional
            }
        },
        {
            id: 'settings',
            name: 'Settings',
            icon: BoltIcon,
            description: 'Status and verification',
            fields: ['status', 'isVerified'],
            isComplete: () => {
                return true; // Optional
            }
        }
    ];

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

    const validateTab = (tabIndex) => {
        const tab = tabs[tabIndex];
        const newErrors = { ...errors };

        if (tab.id === 'basic') {
            if (!form.companyName.trim()) {
                newErrors.companyName = 'Company name is required';
            } else if (form.companyName.length < 3) {
                newErrors.companyName = 'Company name must be at least 3 characters';
            } else {
                delete newErrors.companyName;
            }

            if (!form.category) {
                newErrors.category = 'Category is required';
            } else {
                delete newErrors.category;
            }

            if (form.about && form.about.length > 500) {
                newErrors.about = 'About text cannot exceed 500 characters';
            } else {
                delete newErrors.about;
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
        let isValid = true;
        tabs.forEach((_, index) => {
            if (!validateTab(index)) {
                isValid = false;
            }
        });

        if (!isValid) {
            // Find first tab with errors
            const firstInvalidTab = tabs.findIndex((_, index) => !validateTab(index));
            setActiveTab(firstInvalidTab);

            // Scroll to error
            const firstError = document.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/organisations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    gallery: form.gallery || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            });

            if (res.ok) {
                router.push('/admin-dashboard/organisations');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create organisation');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to create organisation');
        } finally {
            setSaving(false);
        }
    };

    // Track media usage after successful creation
    const trackMediaUsage = async (organisationId) => {
        const mediaUrls = [
            form.logoUrl,
            form.featuredImage,
            ...(form.gallery || [])
        ].filter(Boolean);

        for (const url of mediaUrls) {
            const response = await fetch(`/api/media/find-by-url?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const { id } = await response.json();
                if (id) {
                    await fetch('/api/media/usage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mediaId: id,
                            sourceType: 'organisation',
                            sourceId: organisationId,
                            action: 'add'
                        })
                    });
                }
            }
        }
    };

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
                                    Create New Organisation
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
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm whitespace-nowrap"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

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
                                    {form.logoUrl ? (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                            <img
                                                src={form.logoUrl}
                                                alt={`${form.companyName} logo`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                                            <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{form.companyName || 'Organisation Name'}</h1>
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
                                            <CheckBadgeIcon className="h-4 w-4" />
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
                                    {form.founded && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                            <CalendarIcon className="h-4 w-4" />
                                            Founded {form.founded}
                                        </span>
                                    )}
                                    {form.employees && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                            <UserIcon className="h-4 w-4" />
                                            {form.employees} employees
                                        </span>
                                    )}
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

                                {/* Industry */}
                                {form.industry && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Industry</h3>
                                        <p className="text-gray-700">{form.industry}</p>
                                    </div>
                                )}

                                {/* Location */}
                                {(form.location?.city || form.location?.country || form.location?.address) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                            <MapPinIcon className="h-5 w-5" />
                                            Location
                                        </h3>
                                        {form.location.address && <p className="text-gray-700">{form.location.address}</p>}
                                        <p className="text-gray-700">
                                            {form.location.city}{form.location.city && form.location.country ? ', ' : ''}{form.location.country}
                                            {form.location.postalCode && ` ${form.location.postalCode}`}
                                        </p>
                                    </div>
                                )}

                                {/* Contact */}
                                {(form.contact?.email || form.contact?.phone || form.contact?.contactPerson) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Contact</h3>
                                        <div className="space-y-1">
                                            {form.contact.contactPerson && <p>👤 {form.contact.contactPerson}</p>}
                                            {form.contact.email && <p>📧 {form.contact.email}</p>}
                                            {form.contact.phone && <p>📞 {form.contact.phone}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Social Links */}
                                {Object.values(form.social).some(Boolean) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                                        <div className="space-y-1">
                                            {form.social.linkedin && <p>🔗 LinkedIn: {form.social.linkedin}</p>}
                                            {form.social.twitter && <p>🐦 Twitter: {form.social.twitter}</p>}
                                            {form.social.facebook && <p>📘 Facebook: {form.social.facebook}</p>}
                                            {form.social.instagram && <p>📷 Instagram: {form.social.instagram}</p>}
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
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="e.g., Acme Corporation"
                                                    value={form.companyName}
                                                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                                                />
                                                {errors.companyName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                                                )}
                                            </div>

                                            {/* Website */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                                <div className="relative rounded-lg">
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
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                            }`}
                                                        value={form.category}
                                                        onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })}
                                                    >
                                                        <option value="">Select a category</option>
                                                        {categoryData.map(c => (
                                                            <option key={c.name} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    {errors.category && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                                    )}
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
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.about ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Tell us about the organisation..."
                                                    value={form.about || ''}
                                                    onChange={e => setForm({ ...form, about: e.target.value })}
                                                />
                                                <div className="mt-1 flex justify-between items-center">
                                                    <p className="text-xs text-gray-500">{charCounts.about}/500 characters</p>
                                                    {errors.about && (
                                                        <p className="text-xs text-red-600">{errors.about}</p>
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
                                                    value={form.gallery || []}
                                                    onChange={(urls) => setForm({ ...form, gallery: urls })}
                                                    maxItems={20}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Details Tab */}
                                    {activeTab === 2 && (
                                        <div className="space-y-6">
                                            {/* Organisation Details */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                                                    Organisation Details
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Founded Year
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1800"
                                                            max={new Date().getFullYear()}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., 2010"
                                                            value={form.founded}
                                                            onChange={e => setForm({ ...form, founded: e.target.value })}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Number of Employees
                                                        </label>
                                                        <select
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={form.employees}
                                                            onChange={e => setForm({ ...form, employees: e.target.value })}
                                                        >
                                                            <option value="">Select range</option>
                                                            <option value="1-10">1-10 employees</option>
                                                            <option value="11-50">11-50 employees</option>
                                                            <option value="51-200">51-200 employees</option>
                                                            <option value="201-500">201-500 employees</option>
                                                            <option value="501-1000">501-1000 employees</option>
                                                            <option value="1000+">1000+ employees</option>
                                                        </select>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Industry
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., Technology, Healthcare, Education"
                                                            value={form.industry}
                                                            onChange={e => setForm({ ...form, industry: e.target.value })}
                                                        />
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
                                                        <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://linkedin.com/company/..."
                                                            value={form.social.linkedin}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, linkedin: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Twitter</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://twitter.com/..."
                                                            value={form.social.twitter}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, twitter: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Facebook</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://facebook.com/..."
                                                            value={form.social.facebook}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, facebook: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Instagram</label>
                                                        <input
                                                            type="url"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="https://instagram.com/..."
                                                            value={form.social.instagram}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                social: { ...form.social, instagram: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <UserIcon className="h-5 w-5 text-gray-500" />
                                                    Contact Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Contact Person</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="John Doe"
                                                            value={form.contact.contactPerson}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                contact: { ...form.contact, contactPerson: e.target.value }
                                                            })}
                                                        />
                                                    </div>
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
                                                            placeholder="+1 234 567 890"
                                                            value={form.contact.phone}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                contact: { ...form.contact, phone: e.target.value }
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
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                                                    Location Information
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-xs text-gray-500 mb-1">Address</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Street address"
                                                            value={form.location.address}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                location: { ...form.location, address: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">City</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., San Francisco"
                                                            value={form.location.city}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                location: { ...form.location, city: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., United States"
                                                            value={form.location.country}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                location: { ...form.location, country: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., 94105"
                                                            value={form.location.postalCode}
                                                            onChange={e => setForm({
                                                                ...form,
                                                                location: { ...form.location, postalCode: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Location preview */}
                                                {(form.location.city || form.location.country) && (
                                                    <div className="mt-4 p-4 bg-white rounded-lg">
                                                        <div className="flex items-center text-gray-700">
                                                            <span className="text-2xl mr-3">📍</span>
                                                            <div>
                                                                <p className="font-medium">Location Preview</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {form.location.address && `${form.location.address}, `}
                                                                    {form.location.city}{form.location.city && form.location.country ? ', ' : ''}{form.location.country}
                                                                    {form.location.postalCode && ` ${form.location.postalCode}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Settings Tab */}
                                    {activeTab === 4 && (
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <BoltIcon className="h-5 w-5 text-gray-500" />
                                                    Organisation Settings
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-lg">
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
                                                        <div className="flex-1">
                                                            <select
                                                                value={form.status}
                                                                onChange={e => setForm({ ...form, status: e.target.value })}
                                                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="active">🟢 Active</option>
                                                                <option value="inactive">🔴 Inactive</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <h3 className="text-sm font-medium text-blue-800">Status Information</h3>
                                                                <div className="mt-2 text-sm text-blue-700">
                                                                    <p>• Active organisations are visible to the public</p>
                                                                    <p>• Verified badge shows authenticity to users</p>
                                                                    <p>• You can change these settings anytime</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Preview Card */}
                                                    {form.companyName && (
                                                        <div className="border border-gray-200 rounded-lg p-4">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                                                            <div className="flex items-center gap-3">
                                                                {form.logoUrl ? (
                                                                    <img src={form.logoUrl} alt={form.companyName} className="w-12 h-12 rounded-lg object-cover" />
                                                                ) : (
                                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                        <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{form.companyName}</span>
                                                                        {form.isVerified && (
                                                                            <CheckBadgeIcon className="h-4 w-4 text-blue-500" />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm text-gray-500">
                                                                        {form.location?.city || 'Location not set'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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
                                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                    <span>Creating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    <span>Create Organisation</span>
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
                        onClick={() => router.back()}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        {saving ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircleIcon className="h-4 w-4" />
                                <span>Create</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}