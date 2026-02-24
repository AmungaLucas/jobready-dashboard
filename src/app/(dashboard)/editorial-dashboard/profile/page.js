// app/dashboard/profile/page.jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    PencilIcon,
    CameraIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    BookmarkIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    Cog6ToothIcon,
    BellIcon,
    GlobeAltIcon,
    BuildingOfficeIcon,
    BriefcaseIcon,
    CakeIcon,
    IdentificationIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    PhotoIcon,
    PaperClipIcon,
    FlagIcon,
    ChevronLeftIcon,
} from '@heroicons/react/24/outline';

// Tab configuration with mobile-friendly names
const tabs = [
    { id: 'overview', name: 'Overview', mobileName: 'Info', icon: UserIcon },
    { id: 'activity', name: 'Activity', mobileName: 'Activity', icon: ClockIcon },
    { id: 'security', name: 'Security', mobileName: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', mobileName: 'Alerts', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', mobileName: 'Settings', icon: Cog6ToothIcon },
];

// Sample activity data
const getActivityData = (role) => {
    const activities = {
        admin: [
            { id: 1, type: 'user', action: 'Created new user account', target: 'John Doe', time: '5 minutes ago', icon: UserIcon, color: 'blue' },
            { id: 2, type: 'settings', action: 'Updated system settings', target: 'Security preferences', time: '1 hour ago', icon: Cog6ToothIcon, color: 'purple' },
            { id: 3, type: 'content', action: 'Approved content report', target: 'Spam comment', time: '3 hours ago', icon: FlagIcon, color: 'red' },
            { id: 4, type: 'user', action: 'Modified user permissions', target: 'Editor role', time: '1 day ago', icon: ShieldCheckIcon, color: 'green' },
        ],
        moderator: [
            { id: 1, type: 'report', action: 'Resolved user report', target: 'Inappropriate content', time: '10 minutes ago', icon: FlagIcon, color: 'red' },
            { id: 2, type: 'comment', action: 'Approved flagged comment', target: 'Post #1234', time: '30 minutes ago', icon: ChatBubbleLeftIcon, color: 'yellow' },
            { id: 3, type: 'user', action: 'Warned user', target: 'Spam behavior', time: '2 hours ago', icon: ExclamationCircleIcon, color: 'orange' },
            { id: 4, type: 'content', action: 'Deleted inappropriate post', target: 'NSFW content', time: '5 hours ago', icon: XCircleIcon, color: 'red' },
        ],
        editor: [
            { id: 1, type: 'article', action: 'Published new article', target: '10 Tips for Success', time: '15 minutes ago', icon: DocumentTextIcon, color: 'green' },
            { id: 2, type: 'comment', action: 'Replied to comment', target: 'Article discussion', time: '1 hour ago', icon: ChatBubbleLeftIcon, color: 'blue' },
            { id: 3, type: 'draft', action: 'Saved draft', target: 'Upcoming feature', time: '3 hours ago', icon: ClockIcon, color: 'gray' },
            { id: 4, type: 'media', action: 'Uploaded media', target: '5 new images', time: '1 day ago', icon: PhotoIcon, color: 'purple' },
        ],
    };
    return activities[role] || activities.admin;
};

// Sample saved items
const savedItems = [
    { id: 1, type: 'article', title: 'Getting Started with Dashboard', icon: DocumentTextIcon, savedAt: '2 days ago' },
    { id: 2, type: 'post', title: 'Community Guidelines Update', icon: ChatBubbleLeftIcon, savedAt: '1 week ago' },
    { id: 3, type: 'resource', title: 'API Documentation', icon: PaperClipIcon, savedAt: '2 weeks ago' },
];

export default function ProfilePage() {
    const { user, userRole = 'admin' } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        bio: 'Passionate professional with expertise in digital strategy and community management. Love creating engaging experiences.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.com',
        company: 'Tech Corp',
        position: user?.role,
        phone: '+1 (555) 123-4567',
        birthday: '1990-01-15',
        language: 'English (US)',
        timezone: 'PST (UTC-8)',
        social: {
            twitter: '@johndoe',
            linkedin: 'in/johndoe',
            github: 'johndoe',
        },
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const activities = getActivityData(userRole);

    // Role-based theme colors
    const themeColors = {
        admin: {
            primary: 'blue',
            gradient: 'from-blue-500 to-blue-600',
            light: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-200',
            ring: 'ring-blue-500',
            hover: 'hover:bg-blue-50',
        },
        moderator: {
            primary: 'purple',
            gradient: 'from-purple-500 to-purple-600',
            light: 'bg-purple-50',
            text: 'text-purple-600',
            border: 'border-purple-200',
            ring: 'ring-purple-500',
            hover: 'hover:bg-purple-50',
        },
        editor: {
            primary: 'green',
            gradient: 'from-green-500 to-green-600',
            light: 'bg-green-50',
            text: 'text-green-600',
            border: 'border-green-200',
            ring: 'ring-green-500',
            hover: 'hover:bg-green-50',
        },
    };

    const theme = themeColors[userRole] || themeColors.admin;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfileData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setShowSuccess(true);
        setIsEditing(false);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Close mobile menu when tab changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success Toast - Responsive positioning */}
            {showSuccess && (
                <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 animate-slide-down">
                    <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-3 sm:p-4 flex items-center gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-green-800">Profile updated successfully!</p>
                    </div>
                </div>
            )}

            {/* Profile Header - Responsive */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {/* Mobile Header with Back Button and Edit */}
                    <div className="flex items-center justify-between md:hidden mb-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
                        >
                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`p-2 rounded-lg ${theme.light} ${theme.text}`}
                            >
                                <PencilIcon className="h-5 w-5" />
                            </button>
                        ) : (
                            <div className="w-10" /> // Spacer for alignment
                        )}
                    </div>

                    {/* Main Profile Header Content */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            {/* Avatar - Responsive sizing */}
                            <div className="relative group self-center sm:self-auto">
                                <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-r ${theme.gradient} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold ring-4 ring-white shadow-lg`}>
                                    {user?.avatar ? (
                                        <Image
                                            src={user.avatar}
                                            alt={profileData.name}
                                            width={96}
                                            height={96}
                                            className="rounded-full object-cover h-full w-full"
                                        />
                                    ) : (
                                        getInitials(profileData.name)
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <CameraIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${theme.text}`} />
                                </button>
                            </div>

                            {/* User Info - Responsive text */}
                            <div className="text-center sm:text-left w-full">
                                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 mb-1">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                                        {profileData.name}
                                    </h1>
                                    <CheckBadgeIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.text} hidden sm:block`} />
                                </div>
                                <p className="text-sm sm:text-base text-gray-600 mb-2">
                                    {profileData.position} at {profileData.company}
                                </p>

                                {/* Contact Info - Responsive grid */}
                                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm justify-center sm:justify-start">
                                    <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-1 rounded-full sm:bg-transparent sm:p-0">
                                        <EnvelopeIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span className="truncate max-w-[120px] sm:max-w-none">{profileData.email}</span>
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-1 rounded-full sm:bg-transparent sm:p-0">
                                        <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span className="truncate max-w-[100px] sm:max-w-none">{profileData.location}</span>
                                    </span>
                                    <span className={`flex items-center gap-1 ${theme.text} bg-gray-50 px-2 py-1 rounded-full sm:bg-transparent sm:p-0`}>
                                        <ShieldCheckIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span className="capitalize">{userRole}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Hidden on mobile (shown in header) */}
                        <div className="hidden md:flex items-center gap-3">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition-colors shadow-sm text-sm`}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className={`inline-flex items-center gap-2 px-4 py-2 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                <span className="hidden sm:inline">Saving...</span>
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Edit Mode Actions */}
                    {isEditing && (
                        <div className="flex md:hidden gap-3 mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Tabs - Responsive */}
                    <div className="mt-6 md:mt-8 border-b border-gray-200">
                        {/* Desktop Tabs */}
                        <nav className="hidden md:flex gap-6 lg:gap-8 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive
                                            ? `border-${theme.primary}-600 text-${theme.primary}-600`
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Mobile Tabs - Scrollable */}
                        <div className="md:hidden relative">
                            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-shrink-0 snap-start flex flex-col items-center gap-1 py-3 px-4 border-b-2 font-medium text-xs transition-colors min-w-[70px] ${isActive
                                                ? `border-${theme.primary}-600 text-${theme.primary}-600`
                                                : 'border-transparent text-gray-500'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{tab.mobileName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Gradient fade indicators */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Responsive padding and spacing */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Left Column - Profile Info */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            {/* Bio */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">About</h2>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={profileData.bio}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                ) : (
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{profileData.bio}</p>
                                )}
                            </div>

                            {/* Contact Information - Responsive grid */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {[
                                        { icon: EnvelopeIcon, label: 'Email', name: 'email', type: 'email', value: profileData.email },
                                        { icon: PhoneIcon, label: 'Phone', name: 'phone', type: 'tel', value: profileData.phone },
                                        { icon: MapPinIcon, label: 'Location', name: 'location', type: 'text', value: profileData.location },
                                        { icon: GlobeAltIcon, label: 'Website', name: 'website', type: 'url', value: profileData.website, isLink: true },
                                    ].map((field) => (
                                        <div key={field.name} className="flex items-start gap-2 sm:gap-3">
                                            <field.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-sm text-gray-500">{field.label}</p>
                                                {isEditing ? (
                                                    <input
                                                        type={field.type}
                                                        name={field.name}
                                                        value={field.value}
                                                        onChange={handleInputChange}
                                                        className="mt-1 w-full p-1.5 sm:p-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                                                    />
                                                ) : field.isLink ? (
                                                    <a
                                                        href={field.value}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm sm:text-base text-blue-600 hover:underline truncate block"
                                                    >
                                                        {field.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm sm:text-base text-gray-900 truncate">{field.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Work Experience - Responsive */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Work & Education</h2>
                                <div className="space-y-3 sm:space-y-4">
                                    {[
                                        { icon: BuildingOfficeIcon, label: 'Company', name: 'company', value: profileData.company },
                                        { icon: BriefcaseIcon, label: 'Position', name: 'position', value: profileData.position },
                                        { icon: CakeIcon, label: 'Birthday', name: 'birthday', value: profileData.birthday, isDate: true },
                                    ].map((field) => (
                                        <div key={field.name} className="flex items-start gap-2 sm:gap-3">
                                            <field.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm text-gray-500">{field.label}</p>
                                                {isEditing ? (
                                                    <input
                                                        type={field.isDate ? 'date' : 'text'}
                                                        name={field.name}
                                                        value={field.value}
                                                        onChange={handleInputChange}
                                                        className="mt-1 w-full p-1.5 sm:p-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                                                    />
                                                ) : (
                                                    <p className="text-sm sm:text-base text-gray-900 truncate">
                                                        {field.isDate ? new Date(field.value).toLocaleDateString() : field.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Stats & Social */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Stats Cards - Responsive grid on mobile */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Stats</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
                                    {[
                                        { icon: DocumentTextIcon, label: 'Posts', value: '127', color: theme },
                                        { icon: HeartIcon, label: 'Likes', value: '1,234', color: 'green' },
                                        { icon: ChatBubbleLeftIcon, label: 'Comments', value: '892', color: 'blue' },
                                        { icon: UserIcon, label: 'Followers', value: '3,456', color: 'purple' },
                                    ].map((stat, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`p-1.5 sm:p-2 ${stat.color === theme ? theme.light : `bg-${stat.color}-50`} rounded-lg flex-shrink-0`}>
                                                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color === theme ? theme.text : `text-${stat.color}-600`}`} />
                                                </div>
                                                <span className="text-xs sm:text-sm text-gray-600 truncate">{stat.label}</span>
                                            </div>
                                            <span className="text-sm sm:text-base font-semibold text-gray-900 flex-shrink-0">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Social Links</h2>
                                <div className="space-y-3">
                                    {[
                                        { platform: 'twitter', icon: 'twitter', value: profileData.social.twitter, bg: 'bg-blue-100', color: 'text-blue-600' },
                                        { platform: 'linkedin', icon: 'linkedin', value: profileData.social.linkedin, bg: 'bg-blue-100', color: 'text-blue-600' },
                                        { platform: 'github', icon: 'github', value: profileData.social.github, bg: 'bg-gray-100', color: 'text-gray-600' },
                                    ].map((social) => (
                                        <div key={social.platform} className="flex items-center gap-2 sm:gap-3">
                                            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${social.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <svg className={`h-3 w-3 sm:h-4 sm:w-4 ${social.color}`} fill="currentColor" viewBox="0 0 24 24">
                                                    {social.platform === 'twitter' && (
                                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                    )}
                                                    {social.platform === 'linkedin' && (
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    )}
                                                    {social.platform === 'github' && (
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    )}
                                                </svg>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name={`social.${social.platform}`}
                                                    value={social.value}
                                                    onChange={handleInputChange}
                                                    className="flex-1 p-1.5 sm:p-2 border border-gray-300 rounded-lg text-xs sm:text-sm min-w-0"
                                                    placeholder={`${social.platform} handle`}
                                                />
                                            ) : (
                                                <span className="text-xs sm:text-sm text-gray-600 truncate">{social.value}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Saved Items - Hidden on small mobile, visible on sm+ */}
                            <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Saved Items</h2>
                                <div className="space-y-3">
                                    {savedItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.id} className="flex items-start gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className={`p-1.5 sm:p-2 ${theme.light} rounded-lg flex-shrink-0`}>
                                                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${theme.text}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-500">Saved {item.savedAt}</p>
                                                </div>
                                                <BookmarkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="mt-4 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    View all saved items
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            {/* Activity Feed */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
                                    <select className="w-full sm:w-auto text-xs sm:text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option>All Activity</option>
                                        <option>Posts</option>
                                        <option>Comments</option>
                                        <option>Moderation</option>
                                    </select>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    {activities.map((activity) => {
                                        const Icon = activity.icon;
                                        const colorClasses = {
                                            blue: 'bg-blue-50 text-blue-600',
                                            purple: 'bg-purple-50 text-purple-600',
                                            red: 'bg-red-50 text-red-600',
                                            green: 'bg-green-50 text-green-600',
                                            yellow: 'bg-yellow-50 text-yellow-600',
                                            orange: 'bg-orange-50 text-orange-600',
                                            gray: 'bg-gray-50 text-gray-600',
                                        };
                                        return (
                                            <div key={activity.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[activity.color]} flex-shrink-0`}>
                                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-gray-900">
                                                        {activity.action}{' '}
                                                        <span className="font-medium text-gray-900">{activity.target}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                                    <ArrowTrendingUpIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="mt-4 sm:mt-6 w-full text-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border-t border-gray-200">
                                    Load more activity
                                </button>
                            </div>
                        </div>

                        {/* Activity Stats */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Activity Stats</h2>
                                <div className="space-y-3 sm:space-y-4">
                                    {[
                                        { label: 'Posts this week', value: '12', percentage: 75 },
                                        { label: 'Comments this week', value: '48', percentage: 60 },
                                        { label: 'Engagement rate', value: '8.5%', percentage: 85 },
                                    ].map((stat, index) => (
                                        <div key={index}>
                                            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                                                <span className="text-gray-600">{stat.label}</span>
                                                <span className="font-medium text-gray-900">{stat.value}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                                <div
                                                    className={`bg-${theme.primary}-600 h-1.5 sm:h-2 rounded-full`}
                                                    style={{ width: `${stat.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Heatmap */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Activity Heatmap</h2>
                                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                                    {[...Array(35)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded-sm sm:rounded ${Math.random() > 0.7 ? `bg-${theme.primary}-200` : 'bg-gray-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center">Last 5 weeks activity</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                        {/* Password Change */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Change Password</h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <button className={`w-full sm:w-auto px-4 py-2 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition-colors text-sm`}>
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                                </div>
                                <span className={`self-start sm:self-center px-2 sm:px-3 py-1 ${theme.light} ${theme.text} text-xs sm:text-sm font-medium rounded-full`}>
                                    Disabled
                                </span>
                            </div>
                            <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                                Enable 2FA
                            </button>
                        </div>

                        {/* Active Sessions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Active Sessions</h2>
                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { current: true, device: 'Chrome on macOS', location: 'San Francisco, CA', status: 'Active now' },
                                    { current: false, device: 'Safari on iPhone', location: 'San Francisco, CA', time: '2 hours ago' },
                                ].map((session, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 sm:p-2 ${session.current ? 'bg-green-100' : 'bg-gray-100'} rounded-lg flex-shrink-0`}>
                                                <IdentificationIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${session.current ? 'text-green-600' : 'text-gray-600'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm sm:text-base text-gray-900">{session.device}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    {session.location} • {session.status || session.time}
                                                </p>
                                            </div>
                                        </div>
                                        {!session.current && (
                                            <button className="self-end sm:self-center text-xs sm:text-sm text-red-600 hover:text-red-700">
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Login History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Login Activity</h2>
                            <div className="space-y-2 sm:space-y-3">
                                {[
                                    { success: true, time: 'Today at 9:30 AM', device: 'Chrome • San Francisco, CA' },
                                    { success: true, time: 'Yesterday at 2:15 PM', device: 'Firefox • San Francisco, CA' },
                                    { success: false, time: '2 days ago at 11:45 PM', device: 'Failed attempt • Unknown location' },
                                ].map((login, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1">
                                        <div className="flex items-center gap-2">
                                            {login.success ? (
                                                <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <XCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                                            )}
                                            <span className="text-gray-600">{login.time}</span>
                                        </div>
                                        <span className="text-gray-900 ml-5 sm:ml-0">{login.device}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Notification Preferences</h2>
                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive updates via email', default: true },
                                    { title: 'Push Notifications', desc: 'Receive browser notifications', default: true },
                                    { title: 'Weekly Digest', desc: 'Receive weekly summary', default: false },
                                ].map((pref, index) => (
                                    <div key={index} className="flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm sm:text-base font-medium text-gray-900">{pref.title}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">{pref.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={pref.default} />
                                            <div className="w-9 sm:w-11 h-5 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Notification Types</h2>
                            <div className="space-y-3 sm:space-y-4">
                                {['Mentions', 'Comments on your posts', 'New followers', 'System updates'].map((type, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm sm:text-base text-gray-700">{type}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                                            <div className="w-9 sm:w-11 h-5 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Display Preferences</h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Language
                                    </label>
                                    <select className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Time Zone
                                    </label>
                                    <select className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option>Pacific Time (UTC-8)</option>
                                        <option>Mountain Time (UTC-7)</option>
                                        <option>Central Time (UTC-6)</option>
                                        <option>Eastern Time (UTC-5)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Date Format
                                    </label>
                                    <select className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option>MM/DD/YYYY</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Theme Preferences</h2>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                {['Light', 'Dark', 'System'].map((theme, index) => (
                                    <button
                                        key={theme}
                                        className={`p-2 sm:p-4 border-2 ${index === 0 ? 'border-blue-500' : 'border-transparent'} rounded-lg ${index === 0 ? 'bg-blue-50' : ''} hover:border-gray-300 transition-colors`}
                                    >
                                        <div className={`w-full h-12 sm:h-20 ${index === 0 ? 'bg-white' : index === 1 ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-lg mb-1 sm:mb-2`}></div>
                                        <p className={`text-xs sm:text-sm font-medium ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`}>{theme}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Privacy Settings</h2>
                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { title: 'Profile visibility', desc: 'Make your profile public', default: true },
                                    { title: 'Show online status', desc: 'Let others see when you\'re active', default: true },
                                    { title: 'Activity sharing', desc: 'Share your activity with followers', default: false },
                                ].map((privacy, index) => (
                                    <div key={index} className="flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm sm:text-base font-medium text-gray-900">{privacy.title}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">{privacy.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={privacy.default} />
                                            <div className="w-9 sm:w-11 h-5 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add custom scrollbar hiding for mobile tabs */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}