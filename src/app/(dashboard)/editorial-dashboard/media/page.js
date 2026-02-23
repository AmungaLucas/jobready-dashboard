// app/(dashboard)/media/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    PhotoIcon,
    ArrowUpTrayIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    TrashIcon,
    CloudArrowDownIcon,
    DocumentDuplicateIcon,
    EyeIcon,
    ComputerDesktopIcon,
    CloudIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Bars3Icon,
    Squares2X2Icon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// Image processing function
const MAX_WIDTH = 1200;
const QUALITY = 0.75;

async function processImage(file) {
    const imageBitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / imageBitmap.width);
    const width = Math.round(imageBitmap.width * scale);
    const height = Math.round(imageBitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/webp', QUALITY);
    });

    return { blob, width, height };
}

export default function MediaPage() {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [showUploader, setShowUploader] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [uploadMethod, setUploadMethod] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [gridColumns, setGridColumns] = useState(5);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const modalRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchMedia();

        // Handle responsive grid columns
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setGridColumns(2); // Mobile
            } else if (window.innerWidth < 768) {
                setGridColumns(3); // Small tablet
            } else if (window.innerWidth < 1024) {
                setGridColumns(4); // Tablet
            } else {
                setGridColumns(5); // Desktop
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle escape key for modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                if (previewItem) setPreviewItem(null);
                if (deleteConfirm) setDeleteConfirm(null);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                if (isMobileFiltersOpen) setIsMobileFiltersOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [previewItem, deleteConfirm, isMobileMenuOpen, isMobileFiltersOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (previewItem || deleteConfirm || isMobileMenuOpen || isMobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [previewItem, deleteConfirm, isMobileMenuOpen, isMobileFiltersOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/media');
            if (response.ok) {
                const data = await response.json();
                setMediaItems(data);
            }
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        await uploadFiles(files);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            await uploadFiles(files);
        }
    };

    const uploadFiles = async (files) => {
        setUploading(true);
        setUploadQueue(files.map(f => ({ name: f.name, status: 'pending', progress: 0 })));

        let completed = 0;
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            setUploadQueue(prev => prev.map((item, idx) =>
                idx === i ? { ...item, status: 'uploading', progress: 0 } : item
            ));

            try {
                const { blob, width, height } = await processImage(file);

                const formData = new FormData();
                formData.append('file', blob, file.name);
                formData.append('width', width);
                formData.append('height', height);

                // Simulate progress
                const progressInterval = setInterval(() => {
                    setUploadQueue(prev => prev.map((item, idx) =>
                        idx === i ? { ...item, progress: Math.min(item.progress + 10, 90) } : item
                    ));
                }, 200);

                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                });

                clearInterval(progressInterval);

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                setUploadQueue(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'complete', progress: 100 } : item
                ));

                completed++;
                setUploadProgress((completed / total) * 100);

            } catch (error) {
                console.error('Upload error:', error);
                setUploadQueue(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'error', progress: 0 } : item
                ));
            }
        }

        // Refresh media list after all uploads
        setTimeout(() => {
            setUploading(false);
            setUploadQueue([]);
            setUploadProgress(0);
            setUploadMethod(null);
            fetchMedia();
        }, 1000);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/media/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMediaItems(mediaItems.filter(item => item.id !== id));
                setSelectedItems(selectedItems.filter(itemId => itemId !== id));
                setDeleteConfirm(null);
                if (previewItem?.id === id) {
                    setPreviewItem(null);
                }
            }
        } catch (error) {
            console.error('Error deleting media:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Delete ${selectedItems.length} selected items?`)) {
            for (const id of selectedItems) {
                await handleDelete(id);
            }
            setSelectedItems([]);
        }
    };

    const handleCopyUrl = async (url, e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === filteredAndSortedMedia.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredAndSortedMedia.map(item => item.id));
        }
    };

    const handleSelect = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleViewPreview = (media, e) => {
        e.stopPropagation();
        setPreviewItem(media);
        setIsMobileMenuOpen(false);
        setIsMobileFiltersOpen(false);
    };

    const handleNavigatePreview = (direction) => {
        if (!previewItem) return;

        const currentIndex = filteredAndSortedMedia.findIndex(item => item.id === previewItem.id);
        let newIndex;

        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : filteredAndSortedMedia.length - 1;
        } else {
            newIndex = currentIndex < filteredAndSortedMedia.length - 1 ? currentIndex + 1 : 0;
        }

        setPreviewItem(filteredAndSortedMedia[newIndex]);
    };

    const handleDownload = async (url, filename, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || url.split('/').pop() || 'image.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilter('all');
        setSortBy('newest');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
        setIsMobileFiltersOpen(false);
    };

    // Filter and sort media
    const filteredAndSortedMedia = mediaItems
        .filter(item => {
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id?.toLowerCase().includes(searchTerm.toLowerCase());

            if (filter === 'covers') return matchesSearch && item.isCover;
            if (filter === 'recent') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const itemDate = item.createdAt?.toDate?.() || new Date(item.createdAt);
                return matchesSearch && itemDate > sevenDaysAgo;
            }
            return matchesSearch;
        })
        .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);

            if (sortBy === 'newest') return dateB - dateA;
            if (sortBy === 'oldest') return dateA - dateB;
            if (sortBy === 'name') return a.name?.localeCompare(b.name || '');
            return 0;
        });

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown';
        const d = date.toDate?.() || new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString();
    };

    // Get filter display name
    const getFilterDisplayName = () => {
        if (filter === 'all') return 'All Media';
        if (filter === 'covers') return 'Cover Images';
        if (filter === 'recent') return 'Last 7 Days';
        return 'All Media';
    };

    // Get sort display name
    const getSortDisplayName = () => {
        if (sortBy === 'newest') return 'Newest First';
        if (sortBy === 'oldest') return 'Oldest First';
        if (sortBy === 'name') return 'Name A-Z';
        return 'Newest First';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Media Library</h1>
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 relative"
                    >
                        <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-600" />
                        {(filter !== 'all' || sortBy !== 'newest' || searchTerm || selectedItems.length > 0) && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>
                </div>

                {/* Mobile Search Bar */}
                <div className="px-4 pb-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search media..."
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

                        {/* Upload Section */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Upload</label>
                            <button
                                onClick={() => {
                                    setUploadMethod('device');
                                    fileInputRef.current?.click();
                                    setIsMobileFiltersOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowUpTrayIcon className="h-5 w-5" />
                                Upload from Device
                            </button>
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                PNG, JPG, GIF, WebP up to 10MB
                            </p>
                        </div>

                        {/* Active Filters Summary */}
                        {(filter !== 'all' || sortBy !== 'newest' || searchTerm) && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600 mb-2">Active filters:</p>
                                <div className="flex flex-wrap gap-2">
                                    {filter !== 'all' && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {getFilterDisplayName()}
                                        </span>
                                    )}
                                    {sortBy !== 'newest' && (
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
                        {selectedItems.length > 0 && (
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Quick Actions ({selectedItems.length} selected)
                                </label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            handleSelectAll();
                                        }}
                                        className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                                    >
                                        {selectedItems.length === filteredAndSortedMedia.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleBulkDelete();
                                            setIsMobileFiltersOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm transition-colors"
                                    >
                                        Delete Selected ({selectedItems.length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Filter Section */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    All Media
                                </button>
                                <button
                                    onClick={() => setFilter('covers')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${filter === 'covers' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Cover Images
                                </button>
                                <button
                                    onClick={() => setFilter('recent')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${filter === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Last 7 Days
                                </button>
                            </div>
                        </div>

                        {/* Sort Section */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Sort by</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSortBy('newest')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'newest' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Newest First
                                </button>
                                <button
                                    onClick={() => setSortBy('oldest')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'oldest' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Oldest First
                                </button>
                                <button
                                    onClick={() => setSortBy('name')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Name A-Z
                                </button>
                            </div>
                        </div>

                        {/* View Mode Section */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">View Mode</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    List
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Desktop Header */}
                <div className="hidden lg:block mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage all your images in one place. {mediaItems.length} total items
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upload Section - Responsive */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ArrowUpTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            Upload Media
                        </h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        {!uploadMethod ? (
                            // Upload Method Selection - Responsive
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => {
                                        setUploadMethod('device');
                                        fileInputRef.current?.click();
                                    }}
                                    className="group relative bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 hover:border-blue-500 hover:bg-blue-50 transition-all"
                                >
                                    <ComputerDesktopIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                                        Upload from Device
                                    </p>
                                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                        Select images from your computer
                                    </p>
                                    <p className="mt-2 text-xs text-gray-400">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                </button>
                            </div>
                        ) : uploadMethod === 'device' && uploading ? (
                            // Upload Progress - Responsive
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        Uploading {uploadQueue.length} file{uploadQueue.length !== 1 ? 's' : ''}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {Math.round(uploadProgress)}%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>

                                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                                    {uploadQueue.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {file.status === 'pending' && (
                                                    <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                {file.status === 'uploading' && (
                                                    <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 animate-spin flex-shrink-0" />
                                                )}
                                                {file.status === 'complete' && (
                                                    <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                                )}
                                                {file.status === 'error' && (
                                                    <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                                                )}
                                                <span className="text-gray-700 truncate max-w-[150px] sm:max-w-xs">
                                                    {file.name}
                                                </span>
                                            </div>
                                            {file.status === 'uploading' && (
                                                <span className="text-gray-500 ml-2">{file.progress}%</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        setUploading(false);
                                        setUploadQueue([]);
                                        setUploadMethod(null);
                                    }}
                                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : uploadMethod === 'device' ? (
                            // Drag & Drop Zone - Responsive
                            <div
                                ref={dropZoneRef}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${dragActive
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <PhotoIcon className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'
                                    }`} />

                                <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">
                                    {dragActive ? 'Drop to upload' : 'Drag and drop your images here'}
                                </p>

                                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                    or{' '}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        browse files
                                    </button>
                                </p>

                                <p className="mt-3 sm:mt-4 text-xs text-gray-400">
                                    Supported formats: PNG, JPG, GIF, WebP (up to 10MB each)
                                </p>

                                <button
                                    onClick={() => setUploadMethod(null)}
                                    className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Desktop Toolbar - Hidden on mobile */}
                <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex flex-col gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search media..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                        {/* Filters */}
                        <div className="flex gap-2">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="all">All Media</option>
                                <option value="covers">Cover Images</option>
                                <option value="recent">Last 7 Days</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Name A-Z</option>
                            </select>

                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                            >
                                {viewMode === 'grid' ? (
                                    <Bars3Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                    <Squares2X2Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                            </button>

                            {(searchTerm || filter !== 'all' || sortBy !== 'newest') && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm text-gray-600">
                                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    {selectedItems.length === filteredAndSortedMedia.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile filter indicators */}
                <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 mb-2">
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full"
                    >
                        <AdjustmentsHorizontalIcon className="h-3 w-3" />
                        Menu
                        {(filter !== 'all' || sortBy !== 'newest' || searchTerm || selectedItems.length > 0) && (
                            <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                    </button>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {getFilterDisplayName()}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {getSortDisplayName()}
                    </span>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap"
                    >
                        {viewMode === 'grid' ? 'Grid' : 'List'}
                    </button>
                </div>

                {/* Media Grid/List - Responsive */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                            <ArrowPathIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 animate-spin mb-3 sm:mb-4" />
                            <p className="text-sm sm:text-base text-gray-500">Loading media...</p>
                        </div>
                    ) : filteredAndSortedMedia.length > 0 ? (
                        viewMode === 'grid' ? (
                            // Grid View - Responsive
                            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4`}>
                                {filteredAndSortedMedia.map((media) => (
                                    <div
                                        key={media.id}
                                        className={`group relative rounded-lg overflow-hidden border-2 transition-all ${selectedItems.includes(media.id)
                                            ? 'border-blue-500 shadow-lg'
                                            : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        {/* Image Container */}
                                        <div
                                            className="aspect-square bg-gray-100 cursor-pointer"
                                            onClick={() => handleSelect(media.id)}
                                        >
                                            <img
                                                src={media.url}
                                                alt={media.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400?text=Error';
                                                }}
                                            />
                                        </div>

                                        {/* Badges - Responsive */}
                                        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex gap-1">
                                            {media.isCover && (
                                                <span className="bg-yellow-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                                                    Cover
                                                </span>
                                            )}
                                        </div>

                                        {/* Selection Indicator - Responsive */}
                                        {selectedItems.includes(media.id) && (
                                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                                                <CheckCircleSolid className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500 bg-white rounded-full shadow-sm" />
                                            </div>
                                        )}

                                        {/* Actions Overlay - Hide on very small screens, show on hover */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform z-10 hidden sm:block">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button
                                                    onClick={(e) => handleCopyUrl(media.url, e)}
                                                    className="p-1 sm:p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700 transition-colors"
                                                    title="Copy URL"
                                                >
                                                    <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleViewPreview(media, e)}
                                                    className="p-1 sm:p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700 transition-colors"
                                                    title="Preview"
                                                >
                                                    <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDownload(media.url, media.name, e)}
                                                    className="p-1 sm:p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700 transition-colors"
                                                    title="Download"
                                                >
                                                    <CloudArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirm(media);
                                                    }}
                                                    className="p-1 sm:p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile quick actions - visible on tap */}
                                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 flex justify-center gap-2 sm:hidden">
                                            <button
                                                onClick={(e) => handleViewPreview(media, e)}
                                                className="p-1 bg-white/90 rounded-lg"
                                            >
                                                <EyeIcon className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDownload(media.url, media.name, e)}
                                                className="p-1 bg-white/90 rounded-lg"
                                            >
                                                <CloudArrowDownIcon className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Copied Indicator */}
                                        {copiedUrl === media.url && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                    Copied!
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // List View - Responsive with horizontal scroll on mobile
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.length === filteredAndSortedMedia.length && filteredAndSortedMedia.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Preview
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Dimensions
                                                </th>
                                                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Size
                                                </th>
                                                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Uploaded
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredAndSortedMedia.map((media) => (
                                                <tr key={media.id} className="hover:bg-gray-50">
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(media.id)}
                                                            onChange={() => handleSelect(media.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => handleViewPreview(media, e)}
                                                            className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                                                        >
                                                            <img
                                                                src={media.url}
                                                                alt={media.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/400?text=Error';
                                                                }}
                                                            />
                                                        </button>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 max-w-[120px] sm:max-w-xs">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                            {media.name}
                                                            {media.isCover && (
                                                                <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    Cover
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px] sm:max-w-xs">
                                                            {media.url}
                                                        </div>
                                                    </td>
                                                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                                        {media.width} x {media.height}
                                                    </td>
                                                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                                        {formatFileSize(media.size)}
                                                    </td>
                                                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                                        {media.contentType?.split('/')[1]?.toUpperCase() || 'Image'}
                                                    </td>
                                                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                                            <span className="hidden lg:inline">{formatDate(media.createdAt)}</span>
                                                            <span className="lg:hidden">{formatDate(media.createdAt).split(' ')[0]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                            <button
                                                                onClick={(e) => handleCopyUrl(media.url, e)}
                                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                                title="Copy URL"
                                                            >
                                                                <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleViewPreview(media, e)}
                                                                className="text-purple-600 hover:text-purple-900 p-1"
                                                                title="Preview"
                                                            >
                                                                <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDownload(media.url, media.name, e)}
                                                                className="text-green-600 hover:text-green-900 p-1"
                                                                title="Download"
                                                            >
                                                                <CloudArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteConfirm(media);
                                                                }}
                                                                className="text-red-600 hover:text-red-900 p-1"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    ) : (
                        // Empty State - Responsive
                        <div className="text-center py-8 sm:py-12">
                            <PhotoIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No media found</h3>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms' : 'Get started by uploading your first image'}
                            </p>
                            <div className="mt-4 sm:mt-6">
                                <button
                                    onClick={() => {
                                        setUploadMethod('device');
                                        fileInputRef.current?.click();
                                    }}
                                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <ArrowUpTrayIcon className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Upload from Device
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pagination/Stats - Responsive */}
                    {filteredAndSortedMedia.length > 0 && (
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-500">
                                Showing {filteredAndSortedMedia.length} of {mediaItems.length} items
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Preview Modal - Responsive */}
            {previewItem && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
                        onClick={() => setPreviewItem(null)}
                    />

                    {/* Modal container */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                            <div className="relative w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl">
                                {/* Close button */}
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="absolute -top-8 sm:-top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
                                >
                                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                                </button>

                                {/* Navigation buttons - responsive */}
                                {filteredAndSortedMedia.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => handleNavigatePreview('prev')}
                                            className="absolute left-1 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 sm:p-1.5 lg:p-2 backdrop-blur-sm transition-all z-10"
                                        >
                                            <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        </button>
                                        <button
                                            onClick={() => handleNavigatePreview('next')}
                                            className="absolute right-1 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 sm:p-1.5 lg:p-2 backdrop-blur-sm transition-all z-10"
                                        >
                                            <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        </button>
                                    </>
                                )}

                                {/* Image container */}
                                <div className="bg-black/20 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden">
                                    <div className="relative flex flex-col max-h-[90vh]">
                                        {/* Image */}
                                        <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4">
                                            <img
                                                src={previewItem.url}
                                                alt={previewItem.name}
                                                className="max-w-full max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh] object-contain rounded-lg"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/800?text=Error';
                                                }}
                                            />
                                        </div>

                                        {/* Image details - responsive */}
                                        <div className="bg-white rounded-b-xl sm:rounded-b-2xl p-3 sm:p-4 lg:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 truncate">
                                                        {previewItem.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium hidden sm:inline">Dimensions:</span>
                                                            <span>{previewItem.width} x {previewItem.height}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium hidden sm:inline">Size:</span>
                                                            <span>{formatFileSize(previewItem.size)}</span>
                                                        </div>
                                                        <div className="hidden lg:flex items-center gap-1">
                                                            <span className="font-medium">Type:</span>
                                                            <span>{previewItem.contentType?.split('/')[1]?.toUpperCase() || 'Image'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                                            <span>{formatDate(previewItem.createdAt)}</span>
                                                        </div>
                                                        {previewItem.isCover && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Cover
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action buttons - responsive */}
                                                <div className="flex gap-1 sm:gap-2">
                                                    <button
                                                        onClick={(e) => handleCopyUrl(previewItem.url, e)}
                                                        className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="Copy URL"
                                                    >
                                                        <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDownload(previewItem.url, previewItem.name, e)}
                                                        className="p-1.5 sm:p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Download"
                                                    >
                                                        <CloudArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteConfirm(previewItem);
                                                        }}
                                                        className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copied indicator */}
                    {copiedUrl === previewItem.url && (
                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200]">
                            <div className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg text-sm sm:text-base font-medium">
                                URL Copied!
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal - Responsive */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[150] overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setDeleteConfirm(null)}
                    />

                    {/* Modal container */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                            <div className="relative transform overflow-hidden rounded-xl sm:rounded-2xl bg-white text-left shadow-xl transition-all sm:max-w-lg w-full">
                                <div className="bg-white px-3 sm:px-4 pb-3 sm:pb-4 pt-4 sm:pt-5">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
                                            <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <h3 className="text-sm sm:text-base font-semibold leading-6 text-gray-900">
                                                Delete Media
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                                                </p>
                                            </div>
                                            {deleteConfirm.isCover && (
                                                <div className="mt-2 rounded-lg bg-yellow-50 p-2">
                                                    <p className="text-xs text-yellow-700">
                                                        ⚠️ This image is marked as a cover image. Deleting it may affect posts that use it.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 flex flex-col-reverse sm:flex-row sm:flex-row-reverse gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(deleteConfirm.id)}
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm(null)}
                                        className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}