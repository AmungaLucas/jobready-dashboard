// app/api/jobs/route.js
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
        const type = url.searchParams.get('type')
        const location = url.searchParams.get('location')
        const salaryMin = url.searchParams.get('salaryMin')
        const salaryMax = url.searchParams.get('salaryMax')
        const experience = url.searchParams.get('experience')
        const dateStart = url.searchParams.get('dateStart')
        const dateEnd = url.searchParams.get('dateEnd')
        const sortBy = url.searchParams.get('sort') || 'newest'
        const createdBy = url.searchParams.get('createdBy') // For "My Jobs" filter

        // Start building the query
        let query = adminDb.collection('jobs')

        // Apply createdBy filter for "My Jobs"
        if (createdBy) {
            query = query.where('createdBy', '==', createdBy)
        }

        // Apply status filter
        if (status && status !== 'all') {
            query = query.where('status', '==', status)
        }

        // Apply job type filter
        if (type && type !== 'all') {
            query = query.where('jobType', '==', type)
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                query = query.orderBy('createdAt', 'desc')
                break
            case 'oldest':
                query = query.orderBy('createdAt', 'asc')
                break
            case 'salary_high':
                query = query.orderBy('salary.max', 'desc')
                break
            case 'salary_low':
                query = query.orderBy('salary.min', 'asc')
                break
            case 'applications':
                query = query.orderBy('applications', 'desc')
                break
            case 'views':
                query = query.orderBy('views', 'desc')
                break
            case 'deadline':
                query = query.orderBy('applicationDeadline', 'asc')
                break
            default:
                query = query.orderBy('createdAt', 'desc')
        }

        // Apply pagination
        if (startAfter) {
            const startDoc = await adminDb.collection('jobs').doc(startAfter).get()
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

        // Apply search filter (client-side filtering for text search)
        if (search) {
            const searchLower = search.toLowerCase()
            filteredDocs = filteredDocs.filter(job =>
                job.title?.toLowerCase().includes(searchLower) ||
                job.organisation?.toLowerCase().includes(searchLower) ||
                job.companyName?.toLowerCase().includes(searchLower) ||
                job.content?.toLowerCase().includes(searchLower)
            )
        }

        // Apply location filter
        if (location && location !== 'all') {
            const locationLower = location.toLowerCase()
            filteredDocs = filteredDocs.filter(job =>
                job.location?.city?.toLowerCase().includes(locationLower) ||
                job.location?.country?.toLowerCase().includes(locationLower) ||
                job.location?.toLowerCase().includes(locationLower)
            )
        }

        // Apply salary filters
        if (salaryMin) {
            const min = parseInt(salaryMin)
            filteredDocs = filteredDocs.filter(job =>
                (job.salary?.max || 0) >= min
            )
        }

        if (salaryMax) {
            const max = parseInt(salaryMax)
            filteredDocs = filteredDocs.filter(job =>
                (job.salary?.min || 0) <= max
            )
        }

        // Apply experience filter
        if (experience && experience !== 'all') {
            filteredDocs = filteredDocs.filter(job =>
                job.experience?.level === experience
            )
        }

        // Apply date range filters
        if (dateStart) {
            const startDate = new Date(dateStart)
            filteredDocs = filteredDocs.filter(job => {
                const jobDate = new Date(job.datePosted || job.createdAt)
                return jobDate >= startDate
            })
        }

        if (dateEnd) {
            const endDate = new Date(dateEnd)
            filteredDocs = filteredDocs.filter(job => {
                const jobDate = new Date(job.datePosted || job.createdAt)
                return jobDate <= endDate
            })
        }

        // Calculate stats with all filters applied
        let statsQuery = adminDb.collection('jobs')

        if (createdBy) {
            statsQuery = statsQuery.where('createdBy', '==', createdBy)
        }

        const statsSnapshot = await statsQuery.get()
        const allJobs = statsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Apply the same filters to stats
        let filteredAllJobs = allJobs

        if (search) {
            const searchLower = search.toLowerCase()
            filteredAllJobs = filteredAllJobs.filter(job =>
                job.title?.toLowerCase().includes(searchLower) ||
                job.organisation?.toLowerCase().includes(searchLower) ||
                job.companyName?.toLowerCase().includes(searchLower)
            )
        }

        if (location && location !== 'all') {
            const locationLower = location.toLowerCase()
            filteredAllJobs = filteredAllJobs.filter(job =>
                job.location?.city?.toLowerCase().includes(locationLower) ||
                job.location?.country?.toLowerCase().includes(locationLower)
            )
        }

        // Calculate stats
        const stats = {
            total: filteredAllJobs.length,
            active: filteredAllJobs.filter(j => j.status === 'active').length,
            draft: filteredAllJobs.filter(j => j.status === 'draft').length,
            filled: filteredAllJobs.filter(j => j.status === 'filled').length,
            expired: filteredAllJobs.filter(j => j.status === 'expired').length,
            views: filteredAllJobs.reduce((sum, j) => sum + (j.views || 0), 0),
            applications: filteredAllJobs.reduce((sum, j) => sum + (j.applications || 0), 0)
        }

        return NextResponse.json({
            jobs: filteredDocs,
            lastId,
            hasMore,
            stats
        })

    } catch (error) {
        console.error('Error fetching jobs:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}