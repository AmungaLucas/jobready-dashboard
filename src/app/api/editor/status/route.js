import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if editor document exists
        const editorDoc = await adminDb.collection('editors').doc(userId).get();

        if (!editorDoc.exists) {
            return NextResponse.json(
                { needsProfileUpdate: false, exists: false },
                { status: 200 }
            );
        }

        const editorData = editorDoc.data();

        // Check if profile is completed
        const needsProfileUpdate = !editorData.profileCompleted ||
            !editorData.bio ||
            !editorData.name ||
            (!editorData.socials?.twitter &&
                !editorData.socials?.instagram &&
                !editorData.socials?.website);

        return NextResponse.json({
            needsProfileUpdate,
            exists: true,
            profileCompleted: editorData.profileCompleted || false,
            hasBio: !!editorData.bio,
            hasName: !!editorData.name,
            hasSocial: !!(editorData.socials?.twitter || editorData.socials?.instagram || editorData.socials?.website)
        }, { status: 200 });

    } catch (error) {
        console.error('Error checking editor status:', error);
        return NextResponse.json(
            { error: 'Failed to check editor status' },
            { status: 500 }
        );
    }
}