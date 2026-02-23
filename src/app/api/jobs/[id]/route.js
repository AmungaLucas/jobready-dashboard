import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET(request, { params }) {
    try {
        const { id } = params || {}
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
        }

        const doc = await adminDb.collection('jobs').doc(id).get()
        if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        return NextResponse.json({ id: doc.id, ...doc.data() })
    } catch (error) {
        console.error('Error fetching job:', error)
        return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params || {}
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        await adminDb.collection('jobs').doc(id).delete()
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting job:', error)
        return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params || {}
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        const body = await request.json()
        const updated = { ...body, updatedAt: new Date().toISOString() }

        await adminDb.collection('jobs').doc(id).set(updated, { merge: true })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating job:', error)
        return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
    }
}
