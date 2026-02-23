import React from 'react'
import Link from 'next/link'
import { adminDb } from '@/lib/firebaseAdmin'
import {
    ArrowLeft,
    Calendar,
    User,
    Clock,
    Eye,
    MessageCircle,
    Share2,
    Edit,
    Trash2,
    CheckCircle,
    Archive,
    Tag,
    Folder,
    Printer,
    Heart,
    Twitter,
    Facebook,
    Linkedin,
    Link2
} from 'lucide-react'

const Page = async ({ params }) => {
    // Await the params Promise
    const { id } = await params

    let post = null

    try {
        if (adminDb && id) {
            const doc = await adminDb.collection('posts').doc(id).get()
            if (doc.exists) post = { id: doc.id, ...doc.data() }
        }
    } catch (err) {
        console.error('Failed to load post:', err)
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
                    <Link
                        href="/editorial-dashboard/posts"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Posts
                    </Link>

                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
                            <Archive className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
                        <p className="text-gray-500 mb-6">The post you're looking for doesn't exist or has been removed.</p>
                        <Link
                            href="/editorial-dashboard/posts"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Posts
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Format dates
    const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null
    const createdDate = new Date(post.createdAt || post.updatedAt || Date.now())
    const readingTime = post.content ? Math.ceil(post.content.replace(/<[^>]*>/g, '').split(' ').length / 200) : 1

    // Safely get author name (handles both string and object formats)
    const getAuthorName = () => {
        if (post.authorName) return post.authorName
        if (typeof post.createdBy === 'object' && post.createdBy !== null) {
            return post.createdBy.name || 'Unknown Author'
        }
        if (typeof post.createdBy === 'string') return post.createdBy
        return 'Unknown Author'
    }

    // Get status badge
    const getStatusBadge = () => {
        switch (post.status) {
            case 'published':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Published
                    </span>
                )
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Draft
                    </span>
                )
            case 'archived':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <Archive className="w-3.5 h-3.5" />
                        Archived
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {post.status || 'Draft'}
                    </span>
                )
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header with Actions */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-4 sm:px-6 py-3 max-w-5xl mx-auto">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/editorial-dashboard/posts"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to Posts</span>
                            <span className="sm:hidden">Back</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/editorial-dashboard/posts/${id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit Post</span>
                            </Link>
                            <button
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                onClick={async () => {
                                    'use server'
                                    // Handle delete
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">
                {/* Post Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    {/* Featured Image Placeholder (if exists) */}
                    {post.featuredImage && (
                        <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                    )}

                    <div className="p-5 sm:p-8">
                        {/* Title and Status */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                {post.title || 'Untitled Post'}
                            </h1>
                            {getStatusBadge()}
                        </div>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                <span>{getAuthorName()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{publishedDate?.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) || createdDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{readingTime} min read</span>
                            </div>
                            {post.category && (
                                <div className="flex items-center gap-1.5">
                                    <Folder className="w-4 h-4" />
                                    <span>{post.category}</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <Tag className="w-4 h-4 text-gray-400" />
                                {post.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Excerpt/Description */}
                        {post.excerpt && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800 italic">
                                    {post.excerpt}
                                </p>
                            </div>
                        )}

                        {/* Stats Bar */}
                        <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">{post.views || 0}</span>
                                <span className="text-xs text-gray-400 hidden sm:inline">views</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">{post.comments || 0}</span>
                                <span className="text-xs text-gray-400 hidden sm:inline">comments</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm font-medium">{post.likes || 0}</span>
                                <span className="text-xs text-gray-400 hidden sm:inline">likes</span>
                            </div>
                            <div className="flex-1" />
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 sm:p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
                        <div
                            className="prose prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-img:rounded-lg"
                            dangerouslySetInnerHTML={{
                                __html: post.content || '<p class="text-gray-400 italic">No content available for this post.</p>'
                            }}
                        />
                    </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* SEO Preview Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO Preview</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Meta Title</p>
                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                    {post.seoTitle || post.title || 'Untitled Post'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Meta Description</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {post.seoDescription || post.excerpt || 'No meta description provided.'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">URL Slug</p>
                                <p className="text-sm text-blue-600 bg-gray-50 p-2 rounded font-mono">
                                    /blog/{post.slug || id}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Post Settings Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Post Settings</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Published</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {post.publishedAt ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Featured</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {post.featured ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Allow Comments</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {post.allowComments !== false ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {post.publishedAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Published Date</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(post.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Last Updated</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Actions */}
                <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Share this post:</span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Twitter className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-800 transition-colors">
                            <Facebook className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-700 transition-colors">
                            <Linkedin className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Link2 className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                </div>

                {/* Navigation between posts */}
                <div className="mt-6 flex justify-between">
                    {post.previousPost && (
                        <Link
                            href={`/editorial-dashboard/posts/${post.previousPost.id}`}
                            className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Previous Post
                        </Link>
                    )}
                    {post.nextPost && (
                        <Link
                            href={`/editorial-dashboard/posts/${post.nextPost.id}`}
                            className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 ml-auto"
                        >
                            Next Post
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page