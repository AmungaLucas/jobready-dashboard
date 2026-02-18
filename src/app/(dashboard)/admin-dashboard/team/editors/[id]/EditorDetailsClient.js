'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    StarIcon as StarOutline,
    UserIcon,
    CalendarIcon,
    DocumentTextIcon,
    BriefcaseIcon,
    EyeIcon,
    HeartIcon,
    ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function EditorDetailsClient({ data }) {
    const router = useRouter();
    const [editor, setEditor] = useState(data.editor);
    const [activeTab, setActiveTab] = useState('posts');
    const [updating, setUpdating] = useState(false);

    const handleToggleFeatured = async () => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/editors/${editor.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ featured: !editor.featured }),
            });

            if (response.ok) {
                setEditor({ ...editor, featured: !editor.featured });
            }
        } catch (error) {
            console.error('Error updating editor:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleActive = async () => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/editors/${editor.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !editor.isActive }),
            });

            if (response.ok) {
                setEditor({ ...editor, isActive: !editor.isActive });
            }
        } catch (error) {
            console.error('Error updating editor:', error);
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="px-4 sm:px-6 py-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
                ← Back to Team
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-green-600 shadow-lg">
                                {editor.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={editor.avatar}
                                        alt={editor.name}
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : (
                                    editor.name?.charAt(0) || 'E'
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {editor.name || data.user?.name}
                                </h1>
                                <p className="text-green-100 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    Editor • Joined {formatDate(editor.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleToggleFeatured}
                                disabled={updating}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${editor.featured
                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {editor.featured ? (
                                    <StarSolid className="h-4 w-4" />
                                ) : (
                                    <StarOutline className="h-4 w-4" />
                                )}
                                {editor.featured ? 'Featured' : 'Set Featured'}
                            </button>

                            <button
                                onClick={handleToggleActive}
                                disabled={updating}
                                className={`px-4 py-2 rounded-lg font-medium ${editor.isActive
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {editor.isActive ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 border-b">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{data.stats.totalPosts}</div>
                        <div className="text-xs text-gray-500">Total Posts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{data.stats.publishedPosts}</div>
                        <div className="text-xs text-gray-500">Published</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{data.stats.draftPosts}</div>
                        <div className="text-xs text-gray-500">Drafts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{data.stats.totalJobs}</div>
                        <div className="text-xs text-gray-500">Jobs Posted</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{data.stats.totalViews}</div>
                        <div className="text-xs text-gray-500">Total Views</div>
                    </div>
                </div>

                {/* Bio Section */}
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-600 whitespace-pre-wrap">
                        {editor.bio || 'No bio provided yet.'}
                    </p>

                    {/* Social Links */}
                    {editor.socials && (
                        <div className="mt-4 flex gap-4">
                            {editor.socials.twitter && (
                                <a
                                    href={editor.socials.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-600"
                                >
                                    Twitter
                                </a>
                            )}
                            {editor.socials.instagram && (
                                <a
                                    href={editor.socials.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 hover:text-pink-800"
                                >
                                    Instagram
                                </a>
                            )}
                            {editor.socials.website && (
                                <a
                                    href={editor.socials.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Website
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'posts'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Posts ({data.posts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'jobs'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Jobs ({data.jobs.length})
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'posts' && (
                        <div className="space-y-4">
                            {data.posts.map((post) => (
                                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900">{post.title}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${post.status === 'published'
                                            ? 'bg-green-100 text-green-800'
                                            : post.status === 'draft'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {formatDate(post.createdAt)}
                                    </p>
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <EyeIcon className="h-3 w-3" /> {post.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HeartIcon className="h-3 w-3" /> {post.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ChatBubbleLeftIcon className="h-3 w-3" /> {post.comments}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {data.posts.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No posts yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="space-y-4">
                            {data.jobs.map((job) => (
                                <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${job.status === 'published'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {formatDate(job.createdAt)}
                                    </p>
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <EyeIcon className="h-3 w-3" /> {job.views}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {data.jobs.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No jobs posted yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}