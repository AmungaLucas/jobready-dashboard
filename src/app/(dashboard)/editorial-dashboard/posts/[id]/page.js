import React from 'react'
import Link from 'next/link'
import { adminDb } from '@/lib/firebaseAdmin'

const Page = async ({ params }) => {
    const { id } = params || {}
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
            <div className="px-4 py-8 max-w-4xl mx-auto">
                <Link href="/editorial-dashboard/posts" className="text-blue-600">← Back</Link>
                <div className="mt-6 bg-white p-6 rounded shadow">Post not found.</div>
            </div>
        )
    }

    return (
        <div className="px-4 py-8 max-w-4xl mx-auto">
            <Link href="/editorial-dashboard/posts" className="text-blue-600">← Back</Link>

            <article className="mt-6 bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <div className="text-sm text-gray-500 mt-2">
                    <span>{post.authorName || post.createdBy}</span>
                    <span className="mx-2">•</span>
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt || post.updatedAt || Date.now()).toLocaleDateString()}</span>
                </div>

                <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: post.content || '<p class="text-gray-500">No content</p>' }} />
            </article>
        </div>
    )
}

export default Page
