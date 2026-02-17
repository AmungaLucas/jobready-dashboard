import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { userId, uid, newRole } = await request.json();

        if (!userId || !uid || !newRole) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles = ['admin', 'editor', 'moderator', 'user'];
        if (!validRoles.includes(newRole)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        // Update user role in Firestore
        await adminDb.collection('users').doc(userId).update({
            role: newRole,
            updatedAt: new Date().toISOString(),
        });

        // Optional: Update custom claims in Firebase Auth
        // This requires the Firebase Admin SDK with proper permissions
        try {
            const { getAuth } = await import('firebase-admin/auth');
            const auth = getAuth();
            await auth.setCustomUserClaims(uid, { role: newRole });
        } catch (authError) {
            console.error('Error updating auth claims:', authError);
            // Continue even if auth claims fail - Firestore is our source of truth
        }

        return NextResponse.json(
            { success: true, message: 'Role updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Failed to update user role' },
            { status: 500 }
        );
    }
}