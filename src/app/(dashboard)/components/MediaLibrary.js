// components/MediaLibrary.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    PhotoIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    TrashIcon,
    CloudArrowDownIcon,
    DocumentDuplicateIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

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

export default function MediaLibrary({
    isOpen,
    onClose,
    onSelect,
    multiple = false,
    selectedImages = [],
}) {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selected, setSelected] = useState([]);
    const [view, setView] = useState('library');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fileInputRef = useRef(null);

    // Reset selected when modal opens with new selectedImages
    useEffect(() => {
        if (isOpen) {
            // Initialize selected based on selectedImages prop
            setSelected(selectedImages || []);
        }
    }, [isOpen, selectedImages]);

    useEffect(() => {
        if (isOpen && view === 'library') {
            fetchMedia();
        }
    }, [isOpen, view]);

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
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const { blob, width, height } = await processImage(file);

                const formData = new FormData();
                formData.append('file', blob, file.name);
                formData.append('width', width);
                formData.append('height', height);

                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');

                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            } catch (error) {
                console.error('Upload error:', error);
            }
        }

        setUploading(false);
        setUploadProgress(0);
        setView('library');
        fetchMedia();

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSelect = (media, e) => {
        if (e) e.stopPropagation();

        if (multiple) {
            setSelected((prev) => {
                const isSelected = prev.some((item) => item.id === media.id);
                return isSelected
                    ? prev.filter((item) => item.id !== media.id)
                    : [...prev, media];
            });
        } else {
            // For single select, we want to immediately select this item
            setSelected([media]);
            // And then call onSelect and close
            onSelect([media]);
            onClose();
        }
    };

    const handleCopyUrl = (url, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const handleViewFullSize = (url, e) => {
        e.stopPropagation();
        window.open(url, '_blank');
    };

    const handleDownload = (url, e) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();

        try {
            const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });

            if (response.ok) {
                setMediaItems((prev) => prev.filter((item) => item.id !== id));
                setSelected((prev) => prev.filter((item) => item.id !== id));
                setDeleteConfirm(null);
            }
        } catch (error) {
            console.error('Error deleting media:', error);
        }
    };

    const handleConfirm = () => {
        if (selected.length > 0) {
            onSelect(selected);
        }
        onClose();
    };

    const filteredMedia = mediaItems.filter((item) => {
        const matchesSearch =
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesFilter = filter === 'all' || (filter === 'covers' && item.isCover);
        return matchesSearch && matchesFilter;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PhotoIcon className="h-6 w-6 text-white" />
                                <h3 className="text-lg font-semibold text-white">Media Library</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors"
                                type="button"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 px-6">
                        <nav className="flex -mb-px space-x-8">
                            <button
                                type="button"
                                onClick={() => setView('library')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${view === 'library'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FolderIcon className="inline-block h-5 w-5 mr-2" />
                                Library
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('upload')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${view === 'upload'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <ArrowUpTrayIcon className="inline-block h-5 w-5 mr-2" />
                                Upload New
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {view === 'upload' ? (
                            <div className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="media-upload"
                                    />
                                    <label htmlFor="media-upload" className="cursor-pointer block">
                                        <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" />
                                        <p className="mt-4 text-lg font-medium text-gray-900">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            PNG, JPG, GIF up to 10MB (optimized to WebP)
                                        </p>
                                    </label>
                                </div>

                                {uploading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Uploading...</span>
                                            <span className="text-gray-500">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search media..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Media</option>
                                        <option value="covers">Cover Images Only</option>
                                    </select>
                                </div>

                                {/* Media Grid */}
                                {loading ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="bg-gray-200 rounded-lg h-32"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredMedia.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1">
                                        {filteredMedia.map((media) => {
                                            const isSelected = selected.some((item) => item.id === media.id);

                                            return (
                                                <div
                                                    key={media.id}
                                                    className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${isSelected
                                                        ? 'border-blue-500 shadow-lg'
                                                        : 'border-transparent hover:border-gray-300'
                                                        }`}
                                                    onClick={(e) => handleSelect(media, e)}
                                                >
                                                    <div className="aspect-square bg-gray-100">
                                                        <img
                                                            src={media.url}
                                                            alt={media.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {media.isCover && (
                                                        <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                                            Cover
                                                        </span>
                                                    )}

                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2">
                                                            <CheckCircleSolid className="h-6 w-6 text-blue-500 bg-white rounded-full" />
                                                        </div>
                                                    )}

                                                    {/* Action Buttons Overlay */}
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleCopyUrl(media.url, e)}
                                                                className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700"
                                                                title="Copy URL"
                                                            >
                                                                <DocumentDuplicateIcon className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleViewFullSize(media.url, e)}
                                                                className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700"
                                                                title="View full size"
                                                            >
                                                                <EyeIcon className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleDownload(media.url, e)}
                                                                className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700"
                                                                title="Download"
                                                            >
                                                                <CloudArrowDownIcon className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteConfirm(media);
                                                                }}
                                                                className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 text-white"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Copied Indicator */}
                                                    {copiedUrl === media.url && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                                                                Copied!
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Image Info */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        <p className="truncate">{media.name}</p>
                                                        <p>
                                                            {media.width} x {media.height}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-gray-500">No media found</p>
                                        <button
                                            type="button"
                                            onClick={() => setView('upload')}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Upload your first image
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer - only show for multiple selection */}
                    {multiple && view === 'library' && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {selected.length} item{selected.length !== 1 ? 's' : ''} selected
                            </span>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={selected.length === 0}
                                    className={`px-4 py-2 rounded-lg text-white ${selected.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    Select {selected.length > 0 ? `(${selected.length})` : ''}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 z-[60] overflow-y-auto">
                            {/* Delete confirmation modal content - keep as is */}
                            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                                <div
                                    className="fixed inset-0 transition-opacity"
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>

                                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <TrashIcon className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                    Delete Media
                                                </h3>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Are you sure you want to delete "{deleteConfirm.name}"? This action
                                                        cannot be undone.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(deleteConfirm.id, e)}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirm(null)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}