import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

function generateSlug(name) {
    if (!name) return `editor-${Date.now()}`;
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
}

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

        // Get user data before updating
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // Update user role in Firestore
        await adminDb.collection('users').doc(userId).update({
            role: newRole,
            updatedAt: new Date().toISOString(),
        });

        // If new role is editor, create editor document
        if (newRole === 'editor') {
            // Check if editor document already exists
            const existingEditor = await adminDb
                .collection('editors')
                .where('userId', '==', userId)
                .get();

            if (existingEditor.empty) {
                const slug = generateSlug(userData?.name || 'editor');

                await adminDb.collection('editors').doc(userId).set({
                    slug,
                    name: userData?.name || '',
                    bio: '',
                    avatar: userData?.avatar || '',
                    userId: userId,
                    createdBy: uid, // The admin's UID
                    featured: false,
                    isActive: true,
                    profileCompleted: false,
                    socials: {
                        twitter: '',
                        instagram: '',
                        website: ''
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        // Optional: Update custom claims in Firebase Auth
        try {
            const { getAuth } = await import('firebase-admin/auth');
            const auth = getAuth();
            await auth.setCustomUserClaims(uid, { role: newRole });
        } catch (authError) {
            console.error('Error updating auth claims:', authError);
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