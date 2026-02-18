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

        const editorDoc = await adminDb.collection('editors').doc(userId).get();

        if (!editorDoc.exists) {
            return NextResponse.json(
                { error: 'Editor not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(editorDoc.data(), { status: 200 });
    } catch (error) {
        console.error('Error fetching editor profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}