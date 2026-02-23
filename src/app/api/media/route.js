// app/api/media/route.js
import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const mediaSnapshot = await adminDb
            .collection('media')
            .orderBy('createdAt', 'desc')
            .get();

        const media = mediaSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
        }));

        return NextResponse.json(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json(
            { error: 'Failed to fetch media' },
            { status: 500 }
        );
    }
}