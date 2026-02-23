// app/(dashboard)/components/ImagePicker.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import {
    PhotoIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    ComputerDesktopIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import MediaLibrary from './MediaLibrary';

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

export default function ImagePicker({
    value,
    onChange,
    label,
    className = '',
    coverOnly = false,
    description = '',
}) {
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMethod, setUploadMethod] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(value);

    // Library feedback states
    const [librarySelecting, setLibrarySelecting] = useState(false);
    const [librarySelectedToast, setLibrarySelectedToast] = useState(false);

    const fileInputRef = useRef(null);

    // Update preview when value changes
    useEffect(() => {
        setPreviewUrl(value);
    }, [value]);

    const handleDeviceUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
        setUploading(true);
        setUploadProgress(0);

        try {
            // Process image
            const { blob, width, height } = await processImage(file);

            // Create form data
            const formData = new FormData();
            formData.append('file', blob, file.name);
            formData.append('width', width);
            formData.append('height', height);
            if (coverOnly) {
                formData.append('isCover', 'true');
            }

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            // Upload to API
            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setUploadProgress(100);

            // Update with actual URL from server
            setTimeout(() => {
                onChange(data.url);
                setPreviewUrl(data.url);
                setUploading(false);
                setUploadProgress(0);
                setUploadMethod(null);
                URL.revokeObjectURL(localPreview);
            }, 500);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
            setUploading(false);
            setUploadProgress(0);
            setPreviewUrl(value);
            URL.revokeObjectURL(localPreview);
        }
    };

    const handleLibrarySelect = (selectedMedia) => {
        // If user cancels or selects nothing
        if (!selectedMedia || selectedMedia.length === 0) {
            setShowMediaLibrary(false);
            setUploadMethod(null);
            return;
        }

        const selectedUrl = selectedMedia[0]?.url || '';

        // Immediate preview update
        setPreviewUrl(selectedUrl);

        // Visual feedback
        setLibrarySelecting(true);

        // Update parent immediately
        onChange(selectedUrl);

        // Close modal
        setShowMediaLibrary(false);
        setUploadMethod(null);

        // Finish feedback
        setTimeout(() => {
            setLibrarySelecting(false);
            setLibrarySelectedToast(true);
            setTimeout(() => setLibrarySelectedToast(false), 1400);
        }, 450);
    };

    const handleRemove = () => {
        onChange('');
        setPreviewUrl('');
    };

    // If uploading from device, show progress
    if (uploading) {
        return (
            <div className={className}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>
                )}
                <div className="border-2 border-blue-500 border-dashed rounded-lg p-6 bg-blue-50">
                    <div className="text-center">
                        {previewUrl ? (
                            <div className="relative mb-4">
                                <img
                                    src={previewUrl}
                                    alt="Uploading preview"
                                    className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-blue-300"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                    <ArrowUpTrayIcon className="h-8 w-8 text-white animate-bounce" />
                                </div>
                            </div>
                        ) : (
                            <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-blue-500 animate-bounce" />
                        )}
                        <p className="mt-2 text-sm font-medium text-blue-600">Uploading...</p>
                        <div className="mt-4 max-w-xs mx-auto">
                            <div className="w-full bg-blue-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-blue-500">{uploadProgress}% complete</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentSelectedUrl = previewUrl || value || '';

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            {description && <p className="text-xs text-gray-500 mb-3">{description}</p>}

            <div className="space-y-3">
                {previewUrl ? (
                    // Image Preview with Actions
                    <div className="relative group">
                        <img
                            src={previewUrl}
                            alt="Selected"
                            className="w-full h-40 object-cover rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => {
                                console.error('Image failed to load:', previewUrl);
                                e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                            }}
                        />

                        {/* Library selecting overlay */}
                        {librarySelecting && (
                            <div className="absolute inset-0 bg-black/45 rounded-lg flex items-center justify-center">
                                <div className="bg-white/95 rounded-lg px-4 py-3 shadow-md flex items-center gap-2">
                                    <PhotoIcon className="h-5 w-5 text-purple-600 animate-pulse" />
                                    <span className="text-sm font-medium text-gray-800">
                                        Selecting from library...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setUploadMethod('library');
                                    setShowMediaLibrary(true);
                                }}
                                className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-1"
                            >
                                <PhotoIcon className="h-4 w-4" />
                                Change
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-1"
                            >
                                <XMarkIcon className="h-4 w-4" />
                                Remove
                            </button>
                        </div>

                        {/* Cover Badge */}
                        {coverOnly && (
                            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircleSolid className="h-3 w-3" />
                                Cover Image
                            </span>
                        )}

                        {/* Selected Badge */}
                        {value && value === previewUrl && (
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircleIcon className="h-3 w-3" />
                                Selected
                            </span>
                        )}

                        {/* Toast feedback after library selection */}
                        {librarySelectedToast && (
                            <div className="absolute bottom-2 left-2 right-2">
                                <div className="bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Selected from library
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Upload Options
                    <div className="space-y-3">
                        {!uploadMethod ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadMethod('device');
                                        fileInputRef.current?.click();
                                    }}
                                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <ComputerDesktopIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                                    <p className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                                        Upload from Device
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Select from computer</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadMethod('library');
                                        setShowMediaLibrary(true);
                                    }}
                                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                >
                                    <PhotoIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-purple-500" />
                                    <p className="mt-2 text-sm font-medium text-gray-700 group-hover:text-purple-600">
                                        Choose from Library
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Browse existing media</p>
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">
                                    {uploadMethod === 'device'
                                        ? 'Select a file from your device'
                                        : 'Browse media library'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setUploadMethod(null)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    ← Go back to options
                                </button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleDeviceUpload}
                            className="hidden"
                        />
                    </div>
                )}
            </div>

            {/* Media Library Modal */}
            <MediaLibrary
                isOpen={showMediaLibrary}
                onClose={() => {
                    setShowMediaLibrary(false);
                    setUploadMethod(null);
                }}
                onSelect={handleLibrarySelect}
                multiple={false}
                selectedImages={currentSelectedUrl ? [{ url: currentSelectedUrl, id: 'current' }] : []}
            />
        </div>
    );
}