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

        let query = adminDb.collection('jobs').orderBy('createdAt', 'desc').limit(limit + 1)

        if (startAfter) {
            const startDoc = await adminDb.collection('jobs').doc(startAfter).get()
            if (startDoc.exists) query = query.startAfter(startDoc)
        }

        const snapshot = await query.get()
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const hasMore = docs.length > limit
        const pageDocs = hasMore ? docs.slice(0, limit) : docs
        const lastId = pageDocs.length ? pageDocs[pageDocs.length - 1].id : null

        return NextResponse.json({ jobs: pageDocs, lastId, hasMore })
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}
