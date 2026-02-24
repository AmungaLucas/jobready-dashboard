// app/api/posts/route.js
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET(request) {
    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
        }

        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '10', 10)
        const startAfter = url.searchParams.get('startAfter')

        // Get all filter parameters
        const search = url.searchParams.get('search')
        const status = url.searchParams.get('status')
        const category = url.searchParams.get('category')
        const dateStart = url.searchParams.get('dateStart')
        const dateEnd = url.searchParams.get('dateEnd')
        const sortBy = url.searchParams.get('sort') || 'newest'
        const createdBy = url.searchParams.get('createdBy') // For "My Posts" filter (userId)

        // Start building the query
        let query = adminDb.collection('posts')

        // Apply createdBy filter for "My Posts" - using createdBy.userId field
        if (createdBy) {
            query = query.where('createdBy.userId', '==', createdBy)
        }

        // Apply status filter
        if (status && status !== 'all') {
            query = query.where('status', '==', status)
        }

        // Note: category is an array field (categoryIds), so we can't do simple equality
        // We'll handle category filtering after fetching

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                query = query.orderBy('createdAt', 'desc')
                break
            case 'oldest':
                query = query.orderBy('createdAt', 'asc')
                break
            case 'title_asc':
                query = query.orderBy('title', 'asc')
                break
            case 'title_desc':
                query = query.orderBy('title', 'desc')
                break
            case 'views':
                query = query.orderBy('views', 'desc')
                break
            case 'comments':
                query = query.orderBy('stats.comments', 'desc')
                break
            default:
                query = query.orderBy('createdAt', 'desc')
        }

        // Apply pagination
        if (startAfter) {
            const startDoc = await adminDb.collection('posts').doc(startAfter).get()
            if (startDoc.exists) {
                query = query.startAfter(startDoc)
            }
        }

        // Apply limit (fetch one extra to check if there are more)
        query = query.limit(limit + 1)

        // Execute query
        const snapshot = await query.get()
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Check if there are more results
        const hasMore = docs.length > limit
        const pageDocs = hasMore ? docs.slice(0, limit) : docs
        const lastId = pageDocs.length ? pageDocs[pageDocs.length - 1].id : null

        // Apply filters that can't be done in Firestore query
        let filteredDocs = pageDocs

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase()
            filteredDocs = filteredDocs.filter(post =>
                post.title?.toLowerCase().includes(searchLower) ||
                post.content?.toLowerCase().includes(searchLower) ||
                post.excerpt?.toLowerCase().includes(searchLower)
            )
        }

        // Apply category filter (since categoryIds is an array)
        if (category && category !== 'all') {
            filteredDocs = filteredDocs.filter(post =>
                post.categoryIds && post.categoryIds.includes(category)
            )
        }

        // Apply date range filters
        if (dateStart) {
            const startDate = new Date(dateStart)
            filteredDocs = filteredDocs.filter(post => {
                const postDate = new Date(post.publishedAt || post.createdAt)
                return postDate >= startDate
            })
        }

        if (dateEnd) {
            const endDate = new Date(dateEnd)
            filteredDocs = filteredDocs.filter(post => {
                const postDate = new Date(post.publishedAt || post.createdAt)
                return postDate <= endDate
            })
        }

        // Calculate stats with all filters applied
        let statsQuery = adminDb.collection('posts')

        if (createdBy) {
            statsQuery = statsQuery.where('createdBy.userId', '==', createdBy)
        }

        const statsSnapshot = await statsQuery.get()
        const allPosts = statsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Apply the same filters to stats
        let filteredAllPosts = allPosts

        if (search) {
            const searchLower = search.toLowerCase()
            filteredAllPosts = filteredAllPosts.filter(post =>
                post.title?.toLowerCase().includes(searchLower) ||
                post.content?.toLowerCase().includes(searchLower)
            )
        }

        if (category && category !== 'all') {
            filteredAllPosts = filteredAllPosts.filter(post =>
                post.categoryIds && post.categoryIds.includes(category)
            )
        }

        if (dateStart) {
            const startDate = new Date(dateStart)
            filteredAllPosts = filteredAllPosts.filter(post => {
                const postDate = new Date(post.publishedAt || post.createdAt)
                return postDate >= startDate
            })
        }

        if (dateEnd) {
            const endDate = new Date(dateEnd)
            filteredAllPosts = filteredAllPosts.filter(post => {
                const postDate = new Date(post.publishedAt || post.createdAt)
                return postDate <= endDate
            })
        }

        // Calculate stats
        const stats = {
            total: filteredAllPosts.length,
            published: filteredAllPosts.filter(p => p.status === 'published').length,
            drafts: filteredAllPosts.filter(p => p.status === 'draft').length,
            archived: filteredAllPosts.filter(p => p.status === 'archived').length,
            views: filteredAllPosts.reduce((sum, p) => sum + (p.views || 0), 0),
            comments: filteredAllPosts.reduce((sum, p) => sum + (p.stats?.comments || 0), 0)
        }

        return NextResponse.json({
            posts: filteredDocs,
            lastId,
            hasMore,
            stats
        })

    } catch (error) {
        console.error('Error fetching posts:', error)
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}