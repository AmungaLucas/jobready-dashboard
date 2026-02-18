import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Total editors
        const editorsSnapshot = await adminDb.collection('editors').get();
        const totalEditors = editorsSnapshot.size;

        // Profiles completed
        const completedSnapshot = await adminDb.collection('editors')
            .where('profileCompleted', '==', true)
            .get();
        const profilesCompleted = completedSnapshot.size;
        const profilesPending = Math.max(0, totalEditors - profilesCompleted);

        // Recent profile completions (most recent 5)
        const recentCompleted = [];
        try {
            const recentSnapshot = await adminDb.collection('editors')
                .where('profileCompleted', '==', true)
                .orderBy('updatedAt', 'desc')
                .limit(5)
                .get();

            recentSnapshot.forEach(doc => {
                recentCompleted.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            // Some installations may store updatedAt differently; ignore if ordering fails
            console.error('Could not fetch recentCompleted:', e);
        }

        // Top editors by recent posts (aggregate from recent posts to avoid full collection scan)
        const topEditors = [];
        try {
            const postsSnapshot = await adminDb.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(1000)
                .get();

            const counts = {};
            postsSnapshot.forEach(doc => {
                const data = doc.data();
                const uid = data?.createdBy?.userId;
                if (!uid) return;
                counts[uid] = (counts[uid] || 0) + 1;
            });

            const sorted = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            for (const [userId, postCount] of sorted) {
                // Try to fetch user name if available
                let name = null;
                try {
                    const userDoc = await adminDb.collection('users').doc(userId).get();
                    if (userDoc.exists) name = userDoc.data().name || null;
                } catch (e) {
                    // ignore
                }
                topEditors.push({ userId, name, postCount });
            }
        } catch (e) {
            console.error('Could not compute topEditors:', e);
        }

        const stats = {
            totalEditors,
            profilesCompleted,
            profilesPending,
            recentCompleted,
            topEditors,
        };

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error('Error fetching editorial stats:', error);
        return NextResponse.json({ error: 'Failed to fetch editorial stats' }, { status: 500 });
    }
}
