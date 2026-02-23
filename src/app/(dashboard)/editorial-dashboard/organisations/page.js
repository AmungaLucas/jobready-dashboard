"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PlusIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    GlobeAltIcon,
    MapPinIcon,
    CalendarIcon,
    UserIcon,
    LinkIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function EditorialOrganisationsPage() {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [selectedOrgs, setSelectedOrgs] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Preview modal state
    const [previewOrg, setPreviewOrg] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        orgId: null,
        orgName: '',
        isBulk: false,
        count: 0
    });

    // Toast notification state
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const searchInputRef = useRef(null);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const res = await fetch('/api/organisations');
                if (res.ok) {
                    const data = await res.json();
                    setOrgs(data);
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to load organisations', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

    // Handle escape key for modals
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                if (isPreviewOpen) setIsPreviewOpen(false);
                if (deleteModal.isOpen) setDeleteModal({ ...deleteModal, isOpen: false });
                if (isMobileFiltersOpen) setIsMobileFiltersOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isPreviewOpen, deleteModal.isOpen, isMobileFiltersOpen]);

    // Prevent body scroll when modals are open
    useEffect(() => {
        if (isPreviewOpen || deleteModal.isOpen || isMobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isPreviewOpen, deleteModal.isOpen, isMobileFiltersOpen]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Filter and sort organisations
    const filteredOrgs = orgs
        .filter(org => {
            if (filter !== 'all' && org.status !== filter) return false;
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return (
                    org.companyName?.toLowerCase().includes(search) ||
                    org.category?.toLowerCase().includes(search) ||
                    org.subcategory?.toLowerCase().includes(search) ||
                    org.location?.city?.toLowerCase().includes(search) ||
                    org.location?.country?.toLowerCase().includes(search) ||
                    org.about?.toLowerCase().includes(search)
                );
            }
            return true;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = (a.companyName || '').localeCompare(b.companyName || '');
                    break;
                case 'date':
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

    const handleDelete = async (orgId, orgName, isBulk = false) => {
        if (isBulk) {
            setDeleteModal({
                isOpen: true,
                orgId: null,
                orgName: '',
                isBulk: true,
                count: selectedOrgs.length
            });
        } else {
            setDeleteModal({
                isOpen: true,
                orgId,
                orgName,
                isBulk: false,
                count: 0
            });
        }
    };

    const confirmDelete = async () => {
        try {
            if (deleteModal.isBulk) {
                // Bulk delete
                await Promise.all(selectedOrgs.map(id =>
                    fetch(`/api/organisations/${id}`, { method: 'DELETE' })
                ));
                setOrgs(prev => prev.filter(org => !selectedOrgs.includes(org.id)));
                setSelectedOrgs([]);
                showToast(`Successfully deleted ${deleteModal.count} organisations`, 'success');
            } else {
                // Single delete
                const res = await fetch(`/api/organisations/${deleteModal.orgId}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setOrgs(prev => prev.filter(org => org.id !== deleteModal.orgId));
                    showToast(`Successfully deleted ${deleteModal.orgName}`, 'success');
                } else {
                    throw new Error('Failed to delete');
                }
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to delete organisation(s)', 'error');
        } finally {
            setDeleteModal({ isOpen: false, orgId: null, orgName: '', isBulk: false, count: 0 });
        }
    };

    const handlePreview = (org) => {
        setPreviewOrg(org);
        setIsPreviewOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
            case 'inactive':
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
        }
    };

    const getStats = () => {
        return {
            total: orgs.length,
            active: orgs.filter(o => o.status === 'active').length,
            inactive: orgs.filter(o => o.status === 'inactive').length,
            verified: orgs.filter(o => o.isVerified).length,
        };
    };

    const stats = getStats();

    const handleSelectAll = () => {
        if (selectedOrgs.length === filteredOrgs.length) {
            setSelectedOrgs([]);
        } else {
            setSelectedOrgs(filteredOrgs.map(o => o.id));
        }
    };

    const handleSelectOrg = (orgId) => {
        setSelectedOrgs(prev =>
            prev.includes(orgId)
                ? prev.filter(id => id !== orgId)
                : [...prev, orgId]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        setSelectedOrgs([]);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
        setIsMobileFiltersOpen(false);
    };

    const getFilterDisplayName = () => {
        if (filter === 'all') return 'All Organisations';
        if (filter === 'active') return 'Active';
        if (filter === 'inactive') return 'Inactive';
        return 'All Organisations';
    };

    const getSortDisplayName = () => {
        if (sortBy === 'name') return `Name (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`;
        if (sortBy === 'date') return `Date (${sortOrder === 'asc' ? 'Oldest' : 'Newest'})`;
        if (sortBy === 'status') return `Status (${sortOrder === 'asc' ? 'Active first' : 'Inactive first'})`;
        return 'Name A-Z';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-4 text-gray-600">Loading organisations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-50 animate-slide-down">
                    <div className={`rounded-lg shadow-lg px-4 py-3 ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {toast.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && previewOrg && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Overlay - reduced opacity */}
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsPreviewOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-50"></div>
                        </div>

                        {/* Modal Content */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
                            {/* Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center sticky top-0 z-20">
                                <div className="flex items-center gap-2">
                                    <EyeIcon className="h-5 w-5 text-white" />
                                    <h3 className="text-lg font-semibold text-white">Organisation Preview</h3>
                                </div>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto bg-white">
                                {/* Featured Image */}
                                {previewOrg.featuredImage && (
                                    <div className="relative h-48 w-full mb-6 rounded-xl overflow-hidden shadow-md">
                                        <img
                                            src={previewOrg.featuredImage}
                                            alt={previewOrg.companyName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                    </div>
                                )}

                                {/* Logo and Title */}
                                <div className="flex items-start gap-4 mb-6">
                                    {previewOrg.logoUrl ? (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0 shadow-sm">
                                            <img
                                                src={previewOrg.logoUrl}
                                                alt={`${previewOrg.companyName} logo`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                                            <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-2xl font-bold text-gray-900">{previewOrg.companyName}</h2>
                                            {previewOrg.isVerified && (
                                                <CheckBadgeIcon className="h-5 w-5 text-blue-500" />
                                            )}
                                        </div>
                                        {previewOrg.category && (
                                            <span className="inline-flex items-center mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                {previewOrg.category} {previewOrg.subcategory && `› ${previewOrg.subcategory}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {getStatusBadge(previewOrg.status)}
                                    {previewOrg.founded && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                            <CalendarIcon className="h-4 w-4" />
                                            Founded {previewOrg.founded}
                                        </span>
                                    )}
                                    {previewOrg.employees && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                            <UserIcon className="h-4 w-4" />
                                            {previewOrg.employees} employees
                                        </span>
                                    )}
                                </div>

                                {/* About - Using dangerouslySetInnerHTML */}
                                {previewOrg.about && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
                                            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                                            About
                                        </h3>
                                        <div
                                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100"
                                            dangerouslySetInnerHTML={{ __html: previewOrg.about }}
                                        />
                                    </div>
                                )}

                                {/* Website */}
                                {previewOrg.website && (
                                    <div className="mb-4">
                                        <a
                                            href={previewOrg.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            <GlobeAltIcon className="h-5 w-5" />
                                            {previewOrg.website}
                                        </a>
                                    </div>
                                )}

                                {/* Industry */}
                                {previewOrg.industry && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Industry</h3>
                                        <p className="text-gray-900 font-medium">{previewOrg.industry}</p>
                                    </div>
                                )}

                                {/* Location */}
                                {(previewOrg.location?.city || previewOrg.location?.country || previewOrg.location?.address) && (
                                    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                                            <MapPinIcon className="h-4 w-4" />
                                            Location
                                        </h3>
                                        {previewOrg.location.address && (
                                            <p className="text-gray-900">{previewOrg.location.address}</p>
                                        )}
                                        <p className="text-gray-900">
                                            {previewOrg.location.city}{previewOrg.location.city && previewOrg.location.country ? ', ' : ''}{previewOrg.location.country}
                                            {previewOrg.location.postalCode && ` ${previewOrg.location.postalCode}`}
                                        </p>
                                    </div>
                                )}

                                {/* Contact */}
                                {(previewOrg.contact?.email || previewOrg.contact?.phone || previewOrg.contact?.contactPerson) && (
                                    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <h3 className="text-sm font-medium text-gray-600 mb-2">Contact</h3>
                                        <div className="space-y-2">
                                            {previewOrg.contact.contactPerson && (
                                                <p className="flex items-center gap-2 text-gray-900">
                                                    <UserIcon className="h-4 w-4 text-gray-500" />
                                                    {previewOrg.contact.contactPerson}
                                                </p>
                                            )}
                                            {previewOrg.contact.email && (
                                                <p className="flex items-center gap-2 text-gray-900">
                                                    <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                                                    <a href={`mailto:${previewOrg.contact.email}`} className="text-blue-600 hover:text-blue-700">
                                                        {previewOrg.contact.email}
                                                    </a>
                                                </p>
                                            )}
                                            {previewOrg.contact.phone && (
                                                <p className="flex items-center gap-2 text-gray-900">
                                                    <PhoneIcon className="h-4 w-4 text-gray-500" />
                                                    <a href={`tel:${previewOrg.contact.phone}`} className="text-blue-600 hover:text-blue-700">
                                                        {previewOrg.contact.phone}
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Social Links */}
                                {previewOrg.social && Object.values(previewOrg.social).some(Boolean) && (
                                    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <h3 className="text-sm font-medium text-gray-600 mb-2">Social Media</h3>
                                        <div className="space-y-2">
                                            {previewOrg.social.linkedin && (
                                                <a href={previewOrg.social.linkedin} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                    LinkedIn
                                                </a>
                                            )}
                                            {previewOrg.social.twitter && (
                                                <a href={previewOrg.social.twitter} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.78-12.166c0-.213 0-.425-.015-.636.96-.69 1.8-1.56 2.46-2.548l-.047-.02z" />
                                                    </svg>
                                                    Twitter
                                                </a>
                                            )}
                                            {previewOrg.social.facebook && (
                                                <a href={previewOrg.social.facebook} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                    </svg>
                                                    Facebook
                                                </a>
                                            )}
                                            {previewOrg.social.instagram && (
                                                <a href={previewOrg.social.instagram} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                                                    </svg>
                                                    Instagram
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Gallery */}
                                {previewOrg.gallery?.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-600 mb-2">Gallery</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {previewOrg.gallery.slice(0, 6).map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                            {previewOrg.gallery.length > 6 && (
                                                <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 border border-gray-200">
                                                    +{previewOrg.gallery.length - 6} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 z-20">
                                <button
                                    type="button"
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                                >
                                    Close
                                </button>
                                <Link
                                    href={`/editorial-dashboard/organisations/${previewOrg.id}/edit`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors"
                                    onClick={() => setIsPreviewOpen(false)}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                    Edit Organisation
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>
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
                                            {deleteModal.isBulk ? 'Delete Organisations' : 'Delete Organisation'}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {deleteModal.isBulk
                                                    ? `Are you sure you want to delete ${deleteModal.count} organisations? This action cannot be undone.`
                                                    : `Are you sure you want to delete "${deleteModal.orgName}"? This action cannot be undone.`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Organisations</h1>
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 relative"
                    >
                        <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-600" />
                        {(filter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc' || searchTerm || selectedOrgs.length > 0) && (
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
                            placeholder="Search organisations..."
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

                        {/* Create Organisation Button */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Actions</label>
                            <Link
                                href="/editorial-dashboard/organisations/create"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => setIsMobileFiltersOpen(false)}
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add Organisation
                            </Link>
                        </div>

                        {/* Active Filters Summary */}
                        {(filter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc' || searchTerm) && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600 mb-2">Active filters:</p>
                                <div className="flex flex-wrap gap-2">
                                    {filter !== 'all' && (
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
                        {selectedOrgs.length > 0 && (
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Quick Actions ({selectedOrgs.length} selected)
                                </label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            handleSelectAll();
                                        }}
                                        className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                                    >
                                        {selectedOrgs.length === filteredOrgs.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMobileFiltersOpen(false);
                                            handleDelete(null, '', true);
                                        }}
                                        className="w-full text-left px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm transition-colors"
                                    >
                                        Delete Selected ({selectedOrgs.length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Filter Section */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Status</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    All Organisations
                                </button>
                                <button
                                    onClick={() => setFilter('active')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${filter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setFilter('inactive')}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${filter === 'inactive' ? 'bg-gray-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Inactive
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
                                        setSortBy('date');
                                        setSortOrder('desc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'date' && sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Newest First
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('date');
                                        setSortOrder('asc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'date' && sortOrder === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
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
                                    Status (Active first)
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('status');
                                        setSortOrder('desc');
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'status' && sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                >
                                    Status (Inactive first)
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Desktop Header */}
                <div className="hidden lg:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Organisations</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage and monitor all organisations in the directory
                        </p>
                    </div>
                    <Link
                        href="/editorial-dashboard/organisations/create"
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Organisation
                    </Link>
                </div>

                {/* Desktop Stats Cards */}
                <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Organisations</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
                                <XCircleIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                <CheckBadgeIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Verified</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.verified}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Stats Cards - Simplified */}
                <div className="lg:hidden grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-base font-semibold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-green-600">Active</p>
                        <p className="text-base font-semibold text-gray-900">{stats.active}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-gray-600">Inactive</p>
                        <p className="text-base font-semibold text-gray-900">{stats.inactive}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-center">
                        <p className="text-xs text-purple-600">Verified</p>
                        <p className="text-base font-semibold text-gray-900">{stats.verified}</p>
                    </div>
                </div>

                {/* Desktop Filters and Search */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, category, location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('active')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter('inactive')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'inactive'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Inactive
                            </button>
                        </div>

                        {/* Sort dropdown */}
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newSortOrder);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="status-asc">Status (Active first)</option>
                            <option value="status-desc">Status (Inactive first)</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedOrgs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {selectedOrgs.length} organisations selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    {selectedOrgs.length === filteredOrgs.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <button
                                    onClick={() => handleDelete(null, '', true)}
                                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete Selected ({selectedOrgs.length})
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile filter indicators */}
                <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 mb-4">
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap"
                    >
                        <AdjustmentsHorizontalIcon className="h-3 w-3" />
                        Menu
                        {(filter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc' || searchTerm || selectedOrgs.length > 0) && (
                            <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                    </button>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {getFilterDisplayName()}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {getSortDisplayName()}
                    </span>
                    {selectedOrgs.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                            {selectedOrgs.length} selected
                        </span>
                    )}
                </div>

                {/* Organisations Grid/List */}
                {filteredOrgs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No organisations found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filter !== 'all'
                                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                                : 'Get started by creating a new organisation.'}
                        </p>
                        {!searchTerm && filter === 'all' && (
                            <div className="mt-6">
                                <Link
                                    href="/editorial-dashboard/organisations/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                    Add Organisation
                                </Link>
                            </div>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrgs.map((org) => (
                            <div
                                key={org.id}
                                className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all ${selectedOrgs.includes(org.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                    }`}
                            >
                                {/* Selection checkbox for mobile/list view */}
                                <div className="absolute top-3 left-3 z-10 lg:hidden">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrgs.includes(org.id)}
                                        onChange={() => handleSelectOrg(org.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Featured Image */}
                                <div className="relative h-48 bg-gray-100">
                                    {org.featuredImage ? (
                                        <img
                                            src={org.featuredImage}
                                            alt={org.companyName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
                                            <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Status Badge Overlay */}
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(org.status)}
                                    </div>

                                    {/* Verified Badge */}
                                    {org.isVerified && (
                                        <div className="absolute top-3 left-3 hidden lg:block">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <CheckBadgeIcon className="w-3 h-3 mr-1" />
                                                Verified
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    {/* Logo and Company Name */}
                                    <div className="flex items-start mb-3">
                                        {org.logoUrl ? (
                                            <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                <img
                                                    src={org.logoUrl}
                                                    alt={org.companyName}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/40?text=Logo';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-lg">
                                                    {org.companyName?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="ml-3 flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {org.companyName}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <MapPinIcon className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" />
                                                <span className="truncate">
                                                    {org.location?.city}{org.location?.city && org.location?.country ? ', ' : ''}{org.location?.country}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category and Subcategory */}
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {org.category && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {org.category}
                                            </span>
                                        )}
                                        {org.subcategory && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {org.subcategory}
                                            </span>
                                        )}
                                    </div>

                                    {/* About Preview */}
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {org.about || 'No description provided.'}
                                    </p>

                                    {/* Website */}
                                    {org.website && (
                                        <div className="mb-4">
                                            <a
                                                href={org.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center truncate"
                                            >
                                                <GlobeAltIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                                                <span className="truncate">{org.website.replace(/^https?:\/\//, '')}</span>
                                            </a>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="text-xs text-gray-500">
                                            Added {new Date(org.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handlePreview(org)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                                title="Preview"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <Link
                                                href={`/editorial-dashboard/organisations/${org.id}/edit`}
                                                className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(org.id, org.companyName)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrgs.length === filteredOrgs.length}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrgs.map((org) => (
                                        <tr key={org.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrgs.includes(org.id)}
                                                    onChange={() => handleSelectOrg(org.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {org.logoUrl ? (
                                                            <img className="h-10 w-10 rounded-lg object-cover" src={org.logoUrl} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                <span className="text-blue-600 font-semibold">{org.companyName?.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{org.companyName}</div>
                                                        <div className="text-sm text-gray-500">{org.website}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(org.status)}
                                                    {org.isVerified && (
                                                        <CheckBadgeIcon className="h-4 w-4 text-blue-500" title="Verified" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {org.location?.city}, {org.location?.country}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {org.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handlePreview(org)}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Preview"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    <Link
                                                        href={`/editorial-dashboard/organisations/${org.id}/edit`}
                                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(org.id, org.companyName)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}