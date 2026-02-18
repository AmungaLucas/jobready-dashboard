import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Fetch editor document
        const editorDoc = await adminDb.collection('editors').doc(userId).get();
        if (!editorDoc.exists) {
            return NextResponse.json({ error: 'Editor not found' }, { status: 404 });
        }
        const editorData = { id: editorDoc.id, ...editorDoc.data() };

        // Fetch user document (optional)
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        return NextResponse.json({ editor: editorData, user: userData }, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/editor/profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
