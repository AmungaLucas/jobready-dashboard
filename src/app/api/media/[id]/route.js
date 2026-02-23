// app/api/media/[id]/route.js
import { adminDb, getStorageBucket } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true'; // Force delete even if used

        if (!id) {
            return NextResponse.json(
                { error: 'Media ID is required' },
                { status: 400 }
            );
        }

        const db = adminDb;

        // Get the media document
        const mediaDoc = await db.collection('media').doc(id).get();

        if (!mediaDoc.exists) {
            return NextResponse.json(
                { error: 'Media not found' },
                { status: 404 }
            );
        }

        const mediaData = mediaDoc.data();

        // Check if media is being used anywhere
        if (mediaData.usageCount > 0 && !force) {
            // Find all content items using this media
            const usedInDetails = [];

            for (const usage of mediaData.usedIn || []) {
                const contentDoc = await db.collection(usage.type + 's')
                    .doc(usage.id)
                    .get();

                if (contentDoc.exists) {
                    usedInDetails.push({
                        type: usage.type,
                        id: usage.id,
                        title: contentDoc.data().title ||
                            contentDoc.data().companyName ||
                            'Unknown'
                    });
                }
            }

            return NextResponse.json({
                error: 'Media is being used',
                usageCount: mediaData.usageCount,
                usedIn: usedInDetails,
                message: 'This image is currently used in content. Delete the content first or use force delete.'
            }, { status: 409 }); // 409 Conflict
        }

        // Delete from Storage if path exists
        if (mediaData?.storagePath) {
            const bucket = getStorageBucket();
            if (bucket) {
                const file = bucket.file(mediaData.storagePath);
                await file.delete().catch(err => {
                    console.error('Error deleting file from storage:', err);
                });
            }
        }

        // Delete the document from Firestore
        await db.collection('media').doc(id).delete();

        return NextResponse.json({
            success: true,
            message: 'Media deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json(
            { error: 'Failed to delete media: ' + error.message },
            { status: 500 }
        );
    }
}

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Media ID is required' },
                { status: 400 }
            );
        }

        const db = adminDb;
        const mediaDoc = await db.collection('media').doc(id).get();

        if (!mediaDoc.exists) {
            return NextResponse.json(
                { error: 'Media not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: mediaDoc.id,
            ...mediaDoc.data()
        });

    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json(
            { error: 'Failed to fetch media' },
            { status: 500 }
        );
    }
}