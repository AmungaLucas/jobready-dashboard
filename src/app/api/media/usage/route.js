// app/api/media/usage/route.js
import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { mediaId, sourceType, sourceId, action } = await request.json();

        if (!mediaId || !sourceType || !sourceId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = adminDb;
        const mediaRef = db.collection('media').doc(mediaId);

        const mediaDoc = await mediaRef.get();
        if (!mediaDoc.exists) {
            return NextResponse.json(
                { error: 'Media not found' },
                { status: 404 }
            );
        }

        const mediaData = mediaDoc.data();
        let usedIn = mediaData.usedIn || [];
        let usageCount = mediaData.usageCount || 0;

        if (action === 'add') {
            // Check if already tracked
            const existing = usedIn.find(u => u.type === sourceType && u.id === sourceId);
            if (!existing) {
                usedIn.push({
                    type: sourceType,
                    id: sourceId,
                    usedAt: new Date()
                });
                usageCount++;
            }
        } else if (action === 'remove') {
            usedIn = usedIn.filter(u => !(u.type === sourceType && u.id === sourceId));
            usageCount = Math.max(0, usageCount - 1);
        }

        await mediaRef.update({
            usedIn,
            usageCount,
            updatedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            usageCount
        });

    } catch (error) {
        console.error('Error updating media usage:', error);
        return NextResponse.json(
            { error: 'Failed to update media usage' },
            { status: 500 }
        );
    }
}