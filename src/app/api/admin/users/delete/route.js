import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const uid = searchParams.get('uid');

        if (!userId || !uid) {
            return NextResponse.json(
                { error: 'Missing user ID' },
                { status: 400 }
            );
        }

        // Delete user from Firestore
        await adminDb.collection('users').doc(userId).delete();

        // Optional: Delete from Firebase Auth
        try {
            const { getAuth } = await import('firebase-admin/auth');
            const auth = getAuth();
            await auth.deleteUser(uid);
        } catch (authError) {
            console.error('Error deleting from auth:', authError);
            // Continue even if auth deletion fails
        }

        return NextResponse.json(
            { success: true, message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}