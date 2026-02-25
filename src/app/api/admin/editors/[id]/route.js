import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        // Dynamically import Firebase Admin only when needed
        const { adminDb } = await import('@/lib/firebaseAdmin');

        // Check if adminDb is available (prevents client-side execution)
        if (!adminDb) {
            console.error('Firebase Admin is not initialized or running on client side');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const { id } = params;

        // Get editor details
        const editorDoc = await adminDb.collection('editors').doc(id).get();

        if (!editorDoc.exists) {
            return NextResponse.json(
                { error: 'Editor not found' },
                { status: 404 }
            );
        }

        const editorData = editorDoc.data();

        // Get user details
        const userDoc = await adminDb.collection('users').doc(id).get();
        const userData = userDoc.data();

        // Get posts by this editor
        const postsSnapshot = await adminDb
            .collection('posts')
            .where('createdBy.userId', '==', id)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const posts = [];
        postsSnapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        // Get jobs by this editor
        const jobsSnapshot = await adminDb
            .collection('jobs')
            .where('createdBy', '==', id)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const jobs = [];
        jobsSnapshot.forEach(doc => {
            jobs.push({ id: doc.id, ...doc.data() });
        });

        // Get stats
        const allPostsSnapshot = await adminDb
            .collection('posts')
            .where('createdBy.userId', '==', id)
            .get();

        const allJobsSnapshot = await adminDb
            .collection('jobs')
            .where('createdBy', '==', id)
            .get();

        const stats = {
            totalPosts: allPostsSnapshot.size,
            publishedPosts: allPostsSnapshot.docs.filter(doc => doc.data().status === 'published').length,
            draftPosts: allPostsSnapshot.docs.filter(doc => doc.data().status === 'draft').length,
            totalJobs: allJobsSnapshot.size,
            totalViews: allPostsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().stats?.views || 0), 0),
        };

        return NextResponse.json({
            editor: editorData,
            user: userData,
            posts,
            jobs,
            stats
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching editor details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch editor details' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        // Dynamically import Firebase Admin only when needed
        const { adminDb } = await import('@/lib/firebaseAdmin');

        // Check if adminDb is available
        if (!adminDb) {
            console.error('Firebase Admin is not initialized or running on client side');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const { id } = params;
        const { featured, isActive } = await request.json();

        const updates = {};
        if (featured !== undefined) updates.featured = featured;
        if (isActive !== undefined) updates.isActive = isActive;
        updates.updatedAt = new Date().toISOString();

        await adminDb.collection('editors').doc(id).update(updates);

        return NextResponse.json(
            { success: true, message: 'Editor updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating editor:', error);
        return NextResponse.json(
            { error: 'Failed to update editor' },
            { status: 500 }
        );
    }
}