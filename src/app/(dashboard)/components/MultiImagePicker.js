// app/(dashboard)/components/MediaLibrary.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    PhotoIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    ClockIcon,
    ComputerDesktopIcon,
    CloudArrowUpIcon
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
    defaultView = 'library'
}) {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [selected, setSelected] = useState([]);
    const [view, setView] = useState(defaultView);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [dragActive, setDragActive] = useState(false);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    useEffect(() => {
        if (isOpen && view === 'library') {
            fetchMedia();
        }
    }, [isOpen, view]);

    useEffect(() => {
        if (!Array.isArray(selectedImages)) return;
        setSelected(prev => {
            if (prev.length !== selectedImages.length) return selectedImages;
            const same = prev.every((p, i) => p && selectedImages[i] && p.id === selectedImages[i].id);
            return same ? prev : selectedImages;
        });
    }, [selectedImages]);

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

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        await uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        setUploading(true);
        setUploadQueue(files.map(f => ({
            name: f.name,
            status: 'pending',
            progress: 0,
            size: f.size
        })));

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
            setView('library');
            fetchMedia();

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }, 1000);
    };

    const handleSelect = (media) => {
        if (multiple) {
            setSelected(prev => {
                const isSelected = prev.some(item => item.id === media.id);
                if (isSelected) {
                    return prev.filter(item => item.id !== media.id);
                } else {
                    return [...prev, media];
                }
            });
        } else {
            setSelected([media]);
            onSelect([media]);
            onClose();
        }
    };

    const handleConfirm = () => {
        if (multiple) {
            onSelect(selected);
        }
        onClose();
    };

    const filteredMedia = mediaItems.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'covers' && item.isCover);
        return matchesSearch && matchesFilter;
    });

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

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
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 px-6">
                        <nav className="flex -mb-px space-x-8">
                            <button
                                onClick={() => setView('library')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${view === 'library'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FolderIcon className="h-5 w-5" />
                                Library
                            </button>
                            <button
                                onClick={() => setView('upload')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${view === 'upload'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <ArrowUpTrayIcon className="h-5 w-5" />
                                Upload New
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {view === 'upload' ? (
                            <div className="space-y-6">
                                {uploading ? (
                                    // Upload Progress
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                Uploading {uploadQueue.length} file{uploadQueue.length !== 1 ? 's' : ''}
                                            </h4>
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

                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {uploadQueue.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        {file.status === 'pending' && (
                                                            <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        )}
                                                        {file.status === 'uploading' && (
                                                            <ArrowUpTrayIcon className="h-4 w-4 text-blue-500 animate-pulse flex-shrink-0" />
                                                        )}
                                                        {file.status === 'complete' && (
                                                            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                        )}
                                                        {file.status === 'error' && (
                                                            <XMarkIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                        )}
                                                        <span className="text-gray-700 truncate" title={file.name}>
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <span className="text-xs text-gray-400">
                                                            {formatFileSize(file.size)}
                                                        </span>
                                                        {file.status === 'uploading' && (
                                                            <span className="text-gray-500 text-xs">{file.progress}%</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    // Upload Area
                                    <div
                                        ref={dropZoneRef}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="media-upload"
                                        />

                                        <CloudArrowUpIcon className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'
                                            }`} />

                                        <p className="mt-4 text-lg font-medium text-gray-900">
                                            {dragActive ? 'Drop to upload' : 'Drag and drop your images here'}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            or{' '}
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none"
                                            >
                                                browse files
                                            </button>
                                        </p>

                                        <p className="mt-4 text-xs text-gray-400">
                                            PNG, JPG, GIF, WebP up to 10MB each (optimized to WebP)
                                        </p>
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
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                                            const isSelected = selected.some(item => item.id === media.id);
                                            return (
                                                <div
                                                    key={media.id}
                                                    onClick={() => handleSelect(media)}
                                                    className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isSelected
                                                        ? 'border-blue-500 shadow-lg'
                                                        : 'border-transparent hover:border-gray-300'
                                                        }`}
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
                                                            <CheckCircleSolid className="h-6 w-6 text-blue-500 bg-white rounded-full shadow-sm" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                                        <p className="text-white text-xs truncate">{media.name}</p>
                                                        <p className="text-white/80 text-xs">
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
                                            onClick={() => setView('upload')}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                                        >
                                            <ArrowUpTrayIcon className="h-4 w-4" />
                                            Upload your first image
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {multiple && view === 'library' && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {selected.length} item{selected.length !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Select {selected.length > 0 && `(${selected.length})`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}