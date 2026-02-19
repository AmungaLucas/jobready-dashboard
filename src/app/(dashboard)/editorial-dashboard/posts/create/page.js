'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from '@heroicons/react/24/outline';
import TiptapEditor from '@/app/(dashboard)/components/TiptapEditor';


export default function CreatePostPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        tags: [],
        categoryIds: [],
        featuredImage: '',
        featured: false,
        status: 'draft',
        publishAt: '',
        seo: {
            metaTitle: '',
            metaDescription: '',
            canonicalUrl: ''
        }
    });

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
                metaTitle: title,
                metaDescription: formData.excerpt || title
            }
        });
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

    const handleCategoryChange = (categoryId) => {
        setFormData({
            ...formData,
            categoryIds: formData.categoryIds.includes(categoryId)
                ? formData.categoryIds.filter(id => id !== categoryId)
                : [...formData.categoryIds, categoryId]
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.excerpt.trim()) {
            newErrors.excerpt = 'Excerpt is required';
        } else if (formData.excerpt.length < 50) {
            newErrors.excerpt = 'Excerpt should be at least 50 characters';
        }

        if (!formData.content || formData.content.length < 100) {
            newErrors.content = 'Content should be at least 100 characters';
        }

        if (formData.categoryIds.length === 0) {
            newErrors.categories = 'Select at least one category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Post</h1>
                        <p className="text-sm text-gray-500 mt-1">Write and publish your content</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setPreview(!preview)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                    >
                        <EyeIcon className="h-4 w-4" />
                        {preview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Save Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <GlobeAltIcon className="h-4 w-4" />
                        Publish
                    </button>
                </div>
            </div>

            {preview ? (
                // Preview Mode
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-4">{formData.title || 'Untitled'}</h1>
                    {formData.featuredImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={formData.featuredImage}
                            alt={formData.title}
                            className="w-full h-96 object-cover rounded-lg mb-6"
                        />
                    )}
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
            ) : (
                // Edit Mode
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter post title"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Slug
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">/posts/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="url-friendly-title"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Auto-generated from title. You can customize it.
                                </p>
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Excerpt <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={handleExcerptChange}
                                    rows="3"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.excerpt ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Brief summary of your post (minimum 50 characters)"
                                />
                                <div className="flex justify-between mt-1">
                                    <p className={`text-xs ${formData.excerpt.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                                        {formData.excerpt.length} / 50 characters
                                    </p>
                                    {errors.excerpt && (
                                        <p className="text-sm text-red-600">{errors.excerpt}</p>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <TiptapEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    placeholder="Write your post content here..."
                                />
                                {errors.content && (
                                    <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                                )}
                                <p className="mt-2 text-xs text-gray-500">
                                    Supports Markdown, code blocks, images, and more.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Publish Settings */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                                    Publish Settings
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Schedule Publish
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.publishAt}
                                            onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="featured" className="text-sm text-gray-700">
                                            Feature this post
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FolderIcon className="h-5 w-5 text-gray-500" />
                                    Categories <span className="text-red-500">*</span>
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {categories.map((category) => (
                                        <label key={category.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.categoryIds.includes(category.id)}
                                                onChange={() => handleCategoryChange(category.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.categories && (
                                    <p className="mt-2 text-sm text-red-600">{errors.categories}</p>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-blue-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <PhotoIcon className="h-5 w-5 text-gray-500" />
                                    Featured Image
                                </h3>
                                <input
                                    type="url"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {formData.featuredImage && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={formData.featuredImage}
                                        alt="Featured"
                                        className="mt-3 w-full h-32 object-cover rounded-lg"
                                    />
                                )}
                            </div>

                            {/* SEO Settings */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                                    SEO Settings
                                </h3>
                                <div className="space-y-4">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="SEO title"
                                        />
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="SEO description"
                                        />
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://example.com/canonical-url"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}