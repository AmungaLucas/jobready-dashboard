import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request) {
    try {
        const { userId, name, bio, socials } = await request.json();

        // Get the user's UID from the session (you'll need to implement auth check)
        const headersList = headers();
        // Add your auth verification here

        if (!userId || !name || !bio) {
            return NextResponse.json(
                { error: 'Name and bio are required' },
                { status: 400 }
            );
        }

        // Check if at least one social link is provided
        const hasSocial = socials?.twitter || socials?.instagram || socials?.website;
        if (!hasSocial) {
            return NextResponse.json(
                { error: 'At least one social link is required' },
                { status: 400 }
            );
        }

        // Update editor document
        await adminDb.collection('editors').doc(userId).update({
            name,
            bio,
            socials: {
                twitter: socials?.twitter || '',
                instagram: socials?.instagram || '',
                website: socials?.website || '',
            },
            profileCompleted: true,
            updatedAt: new Date().toISOString(),
        });

        // Also update the user's name in users collection if changed
        await adminDb.collection('users').doc(userId).update({
            name,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json(
            { success: true, message: 'Profile updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating editor profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}