// app/(dashboard)/posts/create/page.jsx (updated)
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TiptapEditor from '@/app/(dashboard)/components/TiptapEditor';

import {
    CalendarIcon,
    TagIcon,
    FolderIcon,
    PhotoIcon,
    DocumentTextIcon,
    EyeIcon,
    ArrowLeftIcon,
    GlobeAltIcon,
    DocumentDuplicateIcon,
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
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import ImagePicker from '@/app/(dashboard)/components/ImagePicker';
import MultiImagePicker from '@/app/(dashboard)/components/MultiImagePicker';

export default function CreatePostPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // Changed from activeSection
    const [completedTabs, setCompletedTabs] = useState({});
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');

    // Enhanced form data with more fields
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        tags: [],
        categoryIds: [],
        featuredImage: '',
        gallery: [],
        featured: false,
        status: 'draft',
        publishAt: '',
        seo: {
            metaTitle: '',
            metaDescription: '',
            canonicalUrl: ''
        },
        settings: {
            allowComments: true,
            showAuthor: true,
            showRelatedPosts: true,
            estimatedReadTime: 0
        }
    });

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});
    const [charCounts, setCharCounts] = useState({
        title: 0,
        excerpt: 0,
        content: 0
    });
    const [showSeoPreview, setShowSeoPreview] = useState(false);

    // Tab configuration (matching the pattern from Jobs and Organisations)
    const tabs = [
        {
            id: 'write',
            name: 'Write',
            icon: PencilSquareIcon,
            description: 'Title, excerpt, and content',
            fields: ['title', 'excerpt', 'content'],
            isComplete: () => {
                return (
                    formData.title?.length >= 10 &&
                    formData.excerpt?.length >= 50 &&
                    formData.content?.length >= 100
                );
            }
        },
        {
            id: 'media',
            name: 'Media',
            icon: PhotoIcon,
            description: 'Featured image and gallery',
            fields: ['featuredImage', 'gallery'],
            isComplete: () => {
                return true; // Optional
            }
        },
        {
            id: 'settings',
            name: 'Settings',
            icon: BoltIcon,
            description: 'Categories, tags, and publish settings',
            fields: ['categoryIds', 'tags', 'status'],
            isComplete: () => {
                return formData.categoryIds.length > 0;
            }
        },
        {
            id: 'seo',
            name: 'SEO',
            icon: ChartBarIcon,
            description: 'Search engine optimization',
            fields: ['seo'],
            isComplete: () => {
                return true; // Optional
            }
        }
    ];

    // Fetch categories from Firestore on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Update character counts and completed tabs
    useEffect(() => {
        setCharCounts({
            title: formData.title.length,
            excerpt: formData.excerpt.length,
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

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Generate slug from title
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
            seo: {
                ...formData.seo,
                metaTitle: title || formData.seo.metaTitle,
                metaDescription: formData.excerpt || title || formData.seo.metaDescription
            }
        });

        // Calculate estimated read time
        const wordCount = title.split(' ').length + (formData.content?.split(' ').length || 0);
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        setFormData(prev => ({
            ...prev,
            settings: { ...prev.settings, estimatedReadTime: readTime }
        }));
    };

    const handleContentChange = (content) => {
        setFormData({ ...formData, content });

        // Update estimated read time
        const wordCount = formData.title.split(' ').length + content.split(' ').length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        setFormData(prev => ({
            ...prev,
            settings: { ...prev.settings, estimatedReadTime: readTime }
        }));
    };

    const handleExcerptChange = (e) => {
        const excerpt = e.target.value;
        setFormData({
            ...formData,
            excerpt,
            seo: {
                ...formData.seo,
                metaDescription: excerpt || formData.seo.metaDescription
            }
        });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
                });
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleCategorySelect = (categoryId) => {
        setFormData({
            ...formData,
            categoryIds: formData.categoryIds.includes(categoryId)
                ? formData.categoryIds.filter(id => id !== categoryId)
                : [...formData.categoryIds, categoryId]
        });
    };

    const validateTab = (tabIndex) => {
        const tab = tabs[tabIndex];
        const newErrors = { ...errors };

        if (tab.id === 'write') {
            if (!formData.title.trim()) {
                newErrors.title = 'Title is required';
            } else if (formData.title.length < 10) {
                newErrors.title = 'Title should be at least 10 characters';
            } else {
                delete newErrors.title;
            }

            if (!formData.excerpt.trim()) {
                newErrors.excerpt = 'Excerpt is required';
            } else if (formData.excerpt.length < 50) {
                newErrors.excerpt = 'Excerpt should be at least 50 characters';
            } else {
                delete newErrors.excerpt;
            }

            if (!formData.content || formData.content.length < 100) {
                newErrors.content = 'Content should be at least 100 characters';
            } else {
                delete newErrors.content;
            }
        }

        if (tab.id === 'settings') {
            if (formData.categoryIds.length === 0) {
                newErrors.categories = 'Select at least one category';
            } else {
                delete newErrors.categories;
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
            const postData = {
                ...formData,
                createdBy: {
                    userId: user.uid,
                    name: user.name || user.email,
                    avatar: user.avatar
                },
                stats: {
                    views: 0,
                    likes: 0,
                    comments: 0,
                    updatedAt: new Date().toISOString()
                },
                isDeleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...(formData.status === 'published' && { publishedAt: new Date().toISOString() })
            };

            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                router.push('/editorial-dashboard');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        setFormData({ ...formData, status: 'draft' });
        await handleSubmit(new Event('submit'));
    };

    // Get selected category names
    const getSelectedCategoryNames = () => {
        return categories
            .filter(cat => formData.categoryIds.includes(cat.id))
            .map(cat => cat.name)
            .join(', ');
    };

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
        cat.description?.toLowerCase().includes(categorySearch.toLowerCase())
    );


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



    // SEO Preview Component
    const SeoPreview = () => (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
                <ChartBarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Google Search Preview</span>
            </div>
            <div className="max-w-md">
                <div className="text-sm text-green-700 truncate">
                    {formData.seo.canonicalUrl || 'https://yoursite.com/posts/' + (formData.slug || 'post-url')}
                </div>
                <div className="text-lg text-blue-700 font-medium hover:underline cursor-pointer truncate">
                    {formData.seo.metaTitle || formData.title || 'Post Title'}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                    {formData.seo.metaDescription || formData.excerpt || 'Post description will appear here...'}
                </div>
            </div>
        </div>
    );

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
                                    Create New Post
                                </h1>
                                <p className="text-sm text-gray-500 mt-1 break-words">
                                    {preview ? 'Preview your post' : tabs[activeTab].description}
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
                                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
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
                    // Enhanced Preview Mode
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <EyeIcon className="h-5 w-5 text-gray-500" />
                                <h2 className="font-semibold text-gray-700">Preview Mode</h2>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8">
                            <article className="prose prose-lg max-w-none">
                                <h1 className="text-3xl sm:text-4xl font-bold mb-6">{formData.title || 'Untitled'}</h1>

                                {formData.featuredImage && (
                                    <div className="relative h-64 sm:h-96 w-full mb-8 rounded-xl overflow-hidden shadow-lg">
                                        <img
                                            src={formData.featuredImage}
                                            alt={formData.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-4 border-b flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="h-4 w-4" />
                                        {user?.name || 'Author'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ClockIcon className="h-4 w-4" />
                                        {new Date().toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <SparklesIcon className="h-4 w-4" />
                                        {formData.settings.estimatedReadTime} min read
                                    </span>
                                    {formData.categoryIds.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <FolderIcon className="h-4 w-4" />
                                            {getSelectedCategoryNames()}
                                        </span>
                                    )}
                                </div>

                                <div className="text-gray-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content yet...</p>' }}
                                />

                                {/* Gallery */}
                                {formData.gallery?.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold mb-4">Gallery</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {formData.gallery.map((img, index) => (
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

                                {/* Tags */}
                                {formData.tags.length > 0 && (
                                    <div className="mt-8 pt-4 border-t">
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Tabs Navigation - Matching Jobs and Organisations */}
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
                                    {/* Write Tab */}
                                    {activeTab === 0 && (
                                        <div className="space-y-2">
                                            {/* Title */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Post Title <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={handleTitleChange}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="e.g., 10 Tips for Better Writing"
                                                />
                                                {errors.title ? (
                                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                                ) : (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {charCounts.title}/10 characters minimum
                                                    </p>
                                                )}
                                            </div>

                                            {/* Slug */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    URL Slug
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg whitespace-nowrap">
                                                        /posts/
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={formData.slug}
                                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="url-friendly-title"
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                                    <BoltIcon className="h-3 w-3" />
                                                    Auto-generated from title. Customize if needed.
                                                </p>
                                            </div>

                                            {/* Excerpt */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Excerpt <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={formData.excerpt}
                                                    onChange={handleExcerptChange}
                                                    rows="4"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.excerpt ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Write a compelling summary of your post (minimum 50 characters)..."
                                                />
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className={`text-sm flex items-center gap-1 ${charCounts.excerpt >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <CheckCircleIcon className={`h-4 w-4 ${charCounts.excerpt >= 50 ? 'text-green-500' : 'text-gray-400'}`} />
                                                        {charCounts.excerpt} / 50 characters
                                                    </div>
                                                    {errors.excerpt && (
                                                        <p className="text-sm text-red-600">{errors.excerpt}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Content <span className="text-red-500">*</span>
                                                </label>
                                                <TiptapEditor
                                                    content={formData.content}
                                                    onChange={handleContentChange}
                                                    placeholder="Start writing your amazing content here..."
                                                />
                                                {errors.content ? (
                                                    <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                                                ) : (
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        {charCounts.content}/100 characters minimum
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Media Tab */}
                                    {activeTab === 1 && (
                                        <div className="space-y-6">
                                            {/* Featured Image */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Featured Image
                                                </label>
                                                <ImagePicker
                                                    value={formData.featuredImage}
                                                    onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                                                />
                                            </div>

                                            {/* Gallery */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Gallery Images
                                                </label>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Add multiple images to enhance your post
                                                </p>
                                                <MultiImagePicker
                                                    value={formData.gallery}
                                                    onChange={(urls) => setFormData({ ...formData, gallery: urls })}
                                                    maxItems={10}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Settings Tab */}
                                    {activeTab === 2 && (
                                        <div className="space-y-6">
                                            {/* Publish Settings */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                                                    Publish Settings
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                                                        <select
                                                            value={formData.status}
                                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="draft">📝 Draft</option>
                                                            <option value="published">🌍 Published</option>
                                                            <option value="archived">📦 Archived</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Schedule Publish</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={formData.publishAt}
                                                            onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.featured}
                                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">✨ Feature this post</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Categories */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <FolderIcon className="h-5 w-5 text-gray-500" />
                                                    Categories {errors.categories && <span className="text-red-500 text-xs">*</span>}
                                                </h3>
                                                <div className="relative">
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={categorySearch}
                                                                onChange={(e) => setCategorySearch(e.target.value)}
                                                                onFocus={() => setShowCategoryDropdown(true)}
                                                                placeholder="Search categories..."
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <Link
                                                            href="/editorial-dashboard/categories/create"
                                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium flex items-center gap-2 whitespace-nowrap"
                                                        >
                                                            <PlusIcon className="h-4 w-4" />
                                                            New Category
                                                        </Link>
                                                    </div>

                                                    {showCategoryDropdown && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setShowCategoryDropdown(false)}
                                                            />
                                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                {loadingCategories ? (
                                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                                        Loading categories...
                                                                    </div>
                                                                ) : filteredCategories.length > 0 ? (
                                                                    filteredCategories.map((category) => (
                                                                        <label
                                                                            key={category.id}
                                                                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={formData.categoryIds.includes(category.id)}
                                                                                onChange={() => handleCategorySelect(category.id)}
                                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                            />
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-700">
                                                                                    {category.name}
                                                                                </p>
                                                                                {category.description && (
                                                                                    <p className="text-xs text-gray-500 truncate">
                                                                                        {category.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            {category.postCount > 0 && (
                                                                                <span className="text-xs text-gray-400">
                                                                                    {category.postCount} posts
                                                                                </span>
                                                                            )}
                                                                        </label>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-4 py-6 text-center">
                                                                        <p className="text-sm text-gray-500 mb-2">
                                                                            No categories found
                                                                        </p>
                                                                        <Link
                                                                            href="/editorial-dashboard/categories/create"
                                                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                                                                        >
                                                                            <PlusIcon className="h-4 w-4" />
                                                                            Create a new category
                                                                        </Link>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Selected Categories */}
                                                {formData.categoryIds.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-xs font-medium text-gray-500 mb-2">
                                                            Selected Categories ({formData.categoryIds.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {categories
                                                                .filter(cat => formData.categoryIds.includes(cat.id))
                                                                .map(cat => (
                                                                    <span
                                                                        key={cat.id}
                                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                                                                    >
                                                                        {cat.name}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCategorySelect(cat.id)}
                                                                            className="hover:text-teal-900"
                                                                        >
                                                                            <XMarkIcon className="h-3 w-3" />
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {errors.categories && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                        <XMarkIcon className="h-4 w-4" />
                                                        {errors.categories}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Tags */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <TagIcon className="h-5 w-5 text-gray-500" />
                                                    Tags
                                                </h3>
                                                <div className="mb-3">
                                                    <input
                                                        type="text"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        placeholder="Type and press Enter to add tags"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                                                        >
                                                            #{tag}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTag(tag)}
                                                                className="hover:text-blue-900"
                                                            >
                                                                <XMarkIcon className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    {formData.tags.length === 0 && (
                                                        <p className="text-sm text-gray-500">No tags added yet</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Additional Settings */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                                    <BoltIcon className="h-5 w-5 text-gray-500" />
                                                    Additional Settings
                                                </h3>
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.settings.allowComments}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                settings: { ...formData.settings, allowComments: e.target.checked }
                                                            })}
                                                            className="rounded border-gray-300 text-blue-600"
                                                        />
                                                        <span className="text-sm text-gray-700">Allow comments</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.settings.showAuthor}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                settings: { ...formData.settings, showAuthor: e.target.checked }
                                                            })}
                                                            className="rounded border-gray-300 text-blue-600"
                                                        />
                                                        <span className="text-sm text-gray-700">Show author information</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.settings.showRelatedPosts}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                settings: { ...formData.settings, showRelatedPosts: e.target.checked }
                                                            })}
                                                            className="rounded border-gray-300 text-blue-600"
                                                        />
                                                        <span className="text-sm text-gray-700">Show related posts</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* SEO Tab */}
                                    {activeTab === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Meta Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.seo.metaTitle}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        seo: { ...formData.seo, metaTitle: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="SEO optimized title"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formData.seo.metaTitle.length}/60 characters
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Meta Description
                                                </label>
                                                <textarea
                                                    value={formData.seo.metaDescription}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        seo: { ...formData.seo, metaDescription: e.target.value }
                                                    })}
                                                    rows="3"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    placeholder="Meta description for search engines"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formData.seo.metaDescription.length}/160 characters
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Canonical URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.seo.canonicalUrl}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        seo: { ...formData.seo, canonicalUrl: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="https://example.com/canonical-url"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowSeoPreview(!showSeoPreview)}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                                {showSeoPreview ? 'Hide' : 'Show'} Google Preview
                                            </button>
                                            {showSeoPreview && <SeoPreview />}
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
                                                    <GlobeAltIcon className="h-4 w-4" />
                                                    <span>Create Post</span>
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
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
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