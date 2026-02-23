// file: src/app/(dashboard)/editorial-dashboard/categories/page.js

'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FolderIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    StarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon,
    DocumentDuplicateIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    AdjustmentsHorizontalIcon,
    Bars3Icon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function CategoriesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        draft: 0,
        archived: 0,
        featured: 0,
    });

    const searchInputRef = useRef(null);

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Update stats when categories change
    useEffect(() => {
        calculateStats();
    }, [categories]);

    // Handle escape key for modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isMobileFiltersOpen) {
                setIsMobileFiltersOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isMobileFiltersOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isMobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileFiltersOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/categories?includeCounts=true');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const total = categories.length;
        const active = categories.filter(c => c.status === 'active' && !c.isDeleted).length;
        const draft = categories.filter(c => c.status === 'draft' && !c.isDeleted).length;
        const archived = categories.filter(c => c.status === 'archived' || c.isDeleted).length;
        const featured = categories.filter(c => c.featured && !c.isDeleted).length;

        setStats({ total, active, draft, archived, featured });
    };

    // Filter and sort categories
    const filteredCategories = categories
        .filter(cat => {
            // Apply search filter
            const matchesSearch =
                cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.slug?.toLowerCase().includes(searchTerm.toLowerCase());

            // Apply status filter
            const matchesStatus =
                statusFilter === 'all' ? true :
                    statusFilter === 'deleted' ? cat.isDeleted :
                        cat.status === statusFilter && !cat.isDeleted;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            // Apply sorting
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
                case 'posts':
                    comparison = (a.postCount || 0) - (b.postCount || 0);
                    break;
                case 'created':
                    comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                    break;
                case 'status':
                    comparison = (a.status || '').localeCompare(b.status || '');
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Build category tree for hierarchical display
    const buildCategoryTree = (categories) => {
        const categoryMap = {};
        const roots = [];

        // First pass: create map
        categories.forEach(cat => {
            categoryMap[cat.id] = { ...cat, children: [] };
        });

        // Second pass: build tree
        categories.forEach(cat => {
            if (cat.parentId && categoryMap[cat.parentId]) {
                categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
            } else if (!cat.isDeleted) {
                roots.push(categoryMap[cat.id]);
            }
        });

        return roots;
    };

    const categoryTree = buildCategoryTree(filteredCategories);

    const handleSelectAll = () => {
        if (selectedCategories.length === filteredCategories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(filteredCategories.map(c => c.id));
        }
    };

    const handleSelectCategory = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleBulkDeleteClick = () => {
        setShowBulkDeleteModal(true);
    };

    const handleDelete = async (hardDelete = false) => {
        const ids = categoryToDelete ? [categoryToDelete.id] : selectedCategories;

        setDeleting(true);
        try {
            const deletePromises = ids.map(id =>
                fetch(`/api/categories?id=${id}&hardDelete=${hardDelete}`, {
                    method: 'DELETE',
                })
            );

            await Promise.all(deletePromises);

            // Refresh categories
            await fetchCategories();

            // Clear selection
            setSelectedCategories([]);
            setShowDeleteModal(false);
            setShowBulkDeleteModal(false);
            setCategoryToDelete(null);
        } catch (error) {
            console.error('Error deleting categories:', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleStatusChange = async (categoryId, newStatus) => {
        try {
            const response = await fetch(`/api/categories?id=${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                await fetchCategories();
            }
        } catch (error) {
            console.error('Error updating category status:', error);
        }
    };

    const handleFeaturedToggle = async (categoryId, currentFeatured) => {
        try {
            const response = await fetch(`/api/categories?id=${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ featured: !currentFeatured }),
            });

            if (response.ok) {
                await fetchCategories();
            }
        } catch (error) {
            console.error('Error toggling featured:', error);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
        setIsMobileFiltersOpen(false);
    };

    // Get filter display name
    const getFilterDisplayName = () => {
        if (statusFilter === 'all') return 'All Categories';
        if (statusFilter === 'active') return 'Active';
        if (statusFilter === 'draft') return 'Draft';
        if (statusFilter === 'archived') return 'Archived';
        if (statusFilter === 'deleted') return 'Deleted';
        return 'All Categories';
    };

    // Get sort display name
    const getSortDisplayName = () => {
        if (sortBy === 'name') return `Name (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`;
        if (sortBy === 'posts') return `Posts (${sortOrder === 'asc' ? 'Low to High' : 'High to Low'})`;
        if (sortBy === 'created') return `Date (${sortOrder === 'asc' ? 'Oldest' : 'Newest'})`;
        if (sortBy === 'status') return `Status (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`;
        return 'Name A-Z';
    };

    // Status badge component
    const StatusBadge = ({ status, isDeleted }) => {
        if (isDeleted) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    Deleted
                </span>
            );
        }

        const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active', icon: CheckCircleIcon },
            draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft', icon: DocumentDuplicateIcon },
            archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Archived', icon: EyeSlashIcon },
        };

        const config = statusConfig[status] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </span>
        );
    };

    // Category row component for tree view
    const CategoryRow = ({ category, depth = 0 }) => (
        <>
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={category.isDeleted}
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div style={{ marginLeft: `${depth * 20}px` }} className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                            >
                                {category.icon ? (
                                    <span>{category.icon}</span>
                                ) : (
                                    <FolderIcon className="h-4 w-4" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                    {category.name}
                                    {category.featured && (
                                        <StarIconSolid className="h-4 w-4 text-yellow-400 inline ml-2 flex-shrink-0" />
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                    /{category.slug}
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={category.status} isDeleted={category.isDeleted} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {category.parentId ? (
                        <span className="flex items-center gap-1">
                            <ChevronDownIcon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">
                                {categories.find(c => c.id === category.parentId)?.name || 'Unknown'}
                            </span>
                        </span>
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.postCount || 0} posts
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                        {!category.isDeleted && (
                            <>
                                <button
                                    onClick={() => handleFeaturedToggle(category.id, category.featured)}
                                    className={`p-1 rounded-lg hover:bg-gray-100 ${category.featured ? 'text-yellow-500' : 'text-gray-400'
                                        }`}
                                    title={category.featured ? 'Remove featured' : 'Mark as featured'}
                                >
                                    <StarIcon className="h-4 w-4" />
                                </button>
                                <Link
                                    href={`/editorial-dashboard/categories/${category.id}/edit`}
                                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
                                    title="Edit category"
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                </Link>
                            </>
                        )}
                        <button
                            onClick={() => handleDeleteClick(category)}
                            className="p-1 rounded-lg hover:bg-gray-100 text-red-600"
                            title={category.isDeleted ? 'Permanently delete' : 'Move to trash'}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </td>
            </tr>
            {category.children?.map(child => (
                <CategoryRow key={child.id} category={child} depth={depth + 1} />
            ))}
        </>
    );

    // Delete Confirmation Modal
    const DeleteModal = ({ show, onClose, onConfirm, count = 1, hardDelete = false }) => {
        if (!show) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                    <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-semibold text-gray-900">
                                        {hardDelete ? 'Permanently Delete Category' : 'Delete Category'}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {hardDelete
                                                ? `Are you sure you want to permanently delete ${count} ${count === 1 ? 'category' : 'categories'}? This action cannot be undone.`
                                                : `Are you sure you want to delete ${count} ${count === 1 ? 'category' : 'categories'}? You can restore them from the archive later.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                            <button
                                type="button"
                                onClick={() => onConfirm(hardDelete)}
                                disabled={deleting}
                                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {deleting ? (
                                    <>
                                        <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    hardDelete ? 'Permanently Delete' : 'Delete'
                                )}
                            </button>
                            {!hardDelete && (
                                <button
                                    type="button"
                                    onClick={() => onConfirm(true)}
                                    disabled={deleting}
                                    className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    Permanently Delete
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={deleting}
                                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Categories</h1>
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 relative"
                    >
                        <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-600" />
                        {(statusFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc' || searchTerm || selectedCategories.length > 0) && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>
                </div>

                {/* Mobile Search Bar */}
                <div className="px-4 pb-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters & Actions Modal */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileFiltersOpen(false)} />
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto z-50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <button onClick={() => setIsMobileFiltersOpen(false)}>
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Create Category Button */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Actions</label>
                            <Link
                                href="/editorial-dashboard/categories/create"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => setIsMobileFiltersOpen(false)}
                            >
                                <PlusIcon className="h-5 w-5" />
                                New Category
                            </Link>
                        </div>

                        {/* Active Filters Summary */}
                        {(statusFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc' || searchTerm) && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600 mb-2">Active filters:</p>
                                <div className="flex flex-wrap gap-2">
                                    {statusFilter !== 'all' && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {getFilterDisplayName()}
                                        </span>
                                    )}
                                    {(sortBy !== 'name' || sortOrder !== 'asc') && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {getSortDisplayName()}
                                        </span>
                                    )}
                                    {searchTerm && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            Search: "{searchTerm}"
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        {selectedCategories.length > 0 && (
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Quick Actions ({selectedCategories.length} selected)
                                </label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            handleSelectAll();
                                        }}
                                        className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                                    >
                                        {selectedCategories.length === filteredCategories.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleBulkDeleteClick();
                                            setIsMobileFiltersOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm transition-colors"
                                    >
                                        Delete Selected ({selectedCategories.length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Filter Section */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Status</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    All Categories
                                </button>
                                <button
                                    onClick={() => setStatusFilter('active')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${statusFilter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setStatusFilter('draft')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${statusFilter === 'draft' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Draft
                                </button>
                                <button
                                    onClick={() => setStatusFilter('archived')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${statusFilter === 'archived' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Archived
                                </button>
                                <button
                                    onClick={() => setStatusFilter('deleted')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${statusFilter === 'deleted' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Deleted
                                </button>
                            </div>
                        </div>

                        {/* Sort Section */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Sort by</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setSortBy('name');
                                        setSortOrder('asc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'name' && sortOrder === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Name (A-Z)
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('name');
                                        setSortOrder('desc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'name' && sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Name (Z-A)
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('posts');
                                        setSortOrder('desc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'posts' && sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Most Posts
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('posts');
                                        setSortOrder('asc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'posts' && sortOrder === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Least Posts
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('created');
                                        setSortOrder('desc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'created' && sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Newest First
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('created');
                                        setSortOrder('asc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'created' && sortOrder === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Oldest First
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('status');
                                        setSortOrder('asc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'status' && sortOrder === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Status (A-Z)
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('status');
                                        setSortOrder('desc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'status' && sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Status (Z-A)
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                            <button
                                onClick={clearFilters}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteModal
                show={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);
                }}
                onConfirm={handleDelete}
                count={1}
                hardDelete={categoryToDelete?.isDeleted}
            />

            <DeleteModal
                show={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={handleDelete}
                count={selectedCategories.length}
                hardDelete={false}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Desktop Header */}
                <div className="hidden lg:block mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Categories
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Organize your content with categories
                            </p>
                        </div>

                        <Link
                            href="/editorial-dashboard/categories/create"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium gap-2 shadow-sm whitespace-nowrap"
                        >
                            <PlusIcon className="h-5 w-5" />
                            New Category
                        </Link>
                    </div>
                </div>

                {/* Mobile Stats Cards - Simplified */}
                <div className="lg:hidden grid grid-cols-5 gap-2 mb-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-base font-semibold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-green-600">Active</p>
                        <p className="text-base font-semibold text-gray-900">{stats.active}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-yellow-600">Draft</p>
                        <p className="text-base font-semibold text-gray-900">{stats.draft}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-gray-500">Archived</p>
                        <p className="text-base font-semibold text-gray-900">{stats.archived}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-yellow-500">Featured</p>
                        <p className="text-base font-semibold text-gray-900">{stats.featured}</p>
                    </div>
                </div>

                {/* Desktop Stats Cards */}
                <div className="hidden lg:grid grid-cols-5 gap-3 mt-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-yellow-600">Draft</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Archived</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.archived}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-yellow-500">Featured</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.featured}</p>
                    </div>
                </div>

                {/* Desktop Filters and Search */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search categories..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="sm:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                    <option value="deleted">Deleted</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="sm:w-48">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="posts">Sort by Posts</option>
                                    <option value="created">Sort by Date</option>
                                    <option value="status">Sort by Status</option>
                                </select>
                            </div>

                            {/* Sort Order */}
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                            >
                                {sortOrder === 'asc' ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )}
                                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            </button>

                            {/* Refresh */}
                            <button
                                onClick={fetchCategories}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                                Refresh
                            </button>
                        </div>

                        {/* Bulk Actions */}
                        {selectedCategories.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {selectedCategories.length} categories selected
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleBulkDeleteClick}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 text-sm"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile filter indicators */}
                <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 mb-4">
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap"
                    >
                        <AdjustmentsHorizontalIcon className="h-3 w-3" />
                        Menu
                        {(statusFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc' || searchTerm || selectedCategories.length > 0) && (
                            <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                    </button>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {getFilterDisplayName()}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {getSortDisplayName()}
                    </span>
                    {selectedCategories.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                            {selectedCategories.length} selected
                        </span>
                    )}
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderIcon className="h-12 w-12 mx-auto text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating a new category'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <div className="mt-6">
                                    <Link
                                        href="/editorial-dashboard/categories/create"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium gap-2"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        New Category
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.length === filteredCategories.length}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Parent
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Posts
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categoryTree.map(category => (
                                        <CategoryRow key={category.id} category={category} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}