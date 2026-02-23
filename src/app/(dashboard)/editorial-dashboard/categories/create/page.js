// file: src/app/(dashboard)/editorial-dashboard/categories/create/page.js

'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    FolderIcon,
    TagIcon,
    PhotoIcon,
    DocumentTextIcon,
    GlobeAltIcon,
    CheckCircleIcon,
    XMarkIcon,
    SparklesIcon,
    ArrowPathIcon,
    BoltIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function CreateCategoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        icon: '',
        color: '#3B82F6',
        image: '',
        featured: false,
        status: 'active',
        seo: {
            metaTitle: '',
            metaDescription: '',
            canonicalUrl: ''
        }
    });

    const [errors, setErrors] = useState({});
    const [charCounts, setCharCounts] = useState({
        name: 0,
        description: 0
    });

    // Predefined colors for category
    const colorOptions = [
        { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
        { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
        { value: '#10B981', label: 'Green', class: 'bg-green-500' },
        { value: '#F59E0B', label: 'Yellow', class: 'bg-yellow-500' },
        { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
        { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
        { value: '#6366F1', label: 'Indigo', class: 'bg-indigo-500' },
        { value: '#14B8A6', label: 'Teal', class: 'bg-teal-500' },
        { value: '#F97316', label: 'Orange', class: 'bg-orange-500' },
        { value: '#6B7280', label: 'Gray', class: 'bg-gray-500' },
    ];

    // Fetch parent categories on mount
    useEffect(() => {
        fetchParentCategories();
    }, []);

    // Generate slug from name
    useEffect(() => {
        if (formData.name && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: generateSlug(prev.name),
                seo: {
                    ...prev.seo,
                    metaTitle: prev.seo.metaTitle || prev.name,
                    metaDescription: prev.seo.metaDescription || prev.description
                }
            }));
        }
    }, [formData.name]);

    // Update character counts
    useEffect(() => {
        setCharCounts({
            name: formData.name.length,
            description: formData.description.length
        });
    }, [formData.name, formData.description]);

    const fetchParentCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                // Filter out categories that might be deleted
                setCategories(data.filter(cat => !cat.isDeleted));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Generate slug from name
    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Category name should be at least 3 characters';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug is required';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = document.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setSaving(true);
        try {
            const categoryData = {
                ...formData,
                createdBy: {
                    userId: user.uid,
                    name: user.name || user.email,
                    avatar: user.avatar
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isDeleted: false,
                postCount: 0
            };

            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });

            if (response.ok) {
                const data = await response.json();
                // Show success message or redirect
                router.push('/editorial-dashboard/categories');
            } else {
                const data = await response.json();
                if (response.status === 409) {
                    setErrors({ ...errors, slug: 'A category with this slug already exists' });
                } else {
                    alert(data.error || 'Failed to create category');
                }
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        setFormData({ ...formData, status: 'draft' });
        await handleSubmit(new Event('submit'));
    };

    // Preview Component
    const CategoryPreview = () => (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                    <h2 className="font-semibold text-gray-700">Category Preview</h2>
                </div>
            </div>
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                    {/* Color Preview */}
                    <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl"
                        style={{ backgroundColor: formData.color }}
                    >
                        {formData.icon ? (
                            <span className="text-2xl">{formData.icon}</span>
                        ) : (
                            <FolderIcon className="h-8 w-8" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                            {formData.name || 'Category Name'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Slug: /{formData.slug || 'category-slug'}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formData.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {formData.status === 'active' ? '● Active' : '○ Draft'}
                        {formData.featured && (
                            <span className="ml-2 text-yellow-600">✨ Featured</span>
                        )}
                    </span>
                </div>

                {/* Description */}
                {formData.description && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                        <p className="text-gray-600">{formData.description}</p>
                    </div>
                )}

                {/* Parent Category */}
                {formData.parentId && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Parent Category</h3>
                        <div className="flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                                {categories.find(c => c.id === formData.parentId)?.name || 'Unknown'}
                            </span>
                        </div>
                    </div>
                )}

                {/* SEO Preview */}
                <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">SEO Preview</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-green-700 truncate">
                            {formData.seo.canonicalUrl || 'https://yoursite.com/categories/' + (formData.slug || 'category-slug')}
                        </div>
                        <div className="text-lg text-blue-700 font-medium hover:underline cursor-pointer truncate">
                            {formData.seo.metaTitle || formData.name || 'Category Title'}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                            {formData.seo.metaDescription || formData.description || 'Category description will appear here...'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
                                    Create New Category
                                </h1>
                                <p className="text-sm text-gray-500 mt-1 break-words">
                                    Organize your content with categories
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
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-4 w-4" />
                                        <span>Create Category</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {preview ? (
                    <CategoryPreview />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FolderIcon className="h-5 w-5 text-blue-600" />
                                    Basic Information
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Category Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="e.g., Technology, News, Tutorials"
                                    />
                                    {errors.name ? (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <XMarkIcon className="h-4 w-4" />
                                            {errors.name}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                                            <CheckCircleIcon className={`h-4 w-4 ${charCounts.name >= 3 ? 'text-green-500' : 'text-gray-400'}`} />
                                            {charCounts.name}/3 characters minimum
                                        </p>
                                    )}
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg whitespace-nowrap">
                                            /categories/
                                        </span>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            placeholder="technology-news"
                                        />
                                    </div>
                                    {errors.slug && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <XMarkIcon className="h-4 w-4" />
                                            {errors.slug}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Auto-generated from name. Use only lowercase letters, numbers, and hyphens.
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="Describe what this category is about..."
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        {charCounts.description} characters
                                    </p>
                                </div>

                                {/* Parent Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parent Category (Optional)
                                    </label>
                                    <select
                                        value={formData.parentId}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">None (Top Level Category)</option>
                                        {loadingCategories ? (
                                            <option disabled>Loading categories...</option>
                                        ) : (
                                            categories
                                                .filter(cat => cat.status === 'active')
                                                .map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))
                                        )}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Make this a subcategory of an existing category
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Appearance Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5 text-purple-600" />
                                    Appearance
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Icon */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Icon (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="e.g., 📱, 💻, 🎨 (emoji or single character)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        maxLength="2"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        An emoji or character to represent the category
                                    </p>
                                </div>

                                {/* Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color
                                    </label>
                                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: color.value })}
                                                className={`w-8 h-8 rounded-full ${color.class} hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                                                    }`}
                                                title={color.label}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full"
                                            style={{ backgroundColor: formData.color }}
                                        />
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="h-8 w-16"
                                        />
                                        <span className="text-sm text-gray-500">Custom color</span>
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://example.com/category-image.jpg"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        A cover image for the category
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <BoltIcon className="h-5 w-5 text-orange-600" />
                                    Settings
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="active">🟢 Active</option>
                                        <option value="draft">⚪ Draft</option>
                                        <option value="archived">📦 Archived</option>
                                    </select>
                                </div>

                                {/* Featured */}
                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <SparklesIcon className="h-4 w-4 text-yellow-500" />
                                        Feature this category
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500 ml-8">
                                    Featured categories appear prominently in navigation and listings
                                </p>
                            </div>
                        </div>

                        {/* SEO Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <GlobeAltIcon className="h-5 w-5 text-green-600" />
                                    SEO Settings
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
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
                                        placeholder="SEO optimized title (defaults to category name)"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="Meta description for search engines (defaults to category description)"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://example.com/canonical-url"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="lg:hidden flex flex-col gap-2 pb-4">
                            <button
                                type="button"
                                onClick={() => setPreview(!preview)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                            >
                                <EyeIcon className="h-5 w-5" />
                                {preview ? 'Edit' : 'Preview'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <DocumentDuplicateIcon className="h-5 w-5" />
                                Save Draft
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Create Category
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}