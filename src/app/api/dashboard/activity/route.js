// app/api/dashboard/activity/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const days = parseInt(searchParams.get('days')) || 7;

        // Calculate date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch activity data
        let postsQuery = adminDb.collection('posts')
            .where('status', '==', 'published')
            .where('publishedAt', '>=', startDate)
            .orderBy('publishedAt', 'desc');

        if (userId) {
            postsQuery = postsQuery.where('createdBy.userId', '==', userId);
        }

        const postsSnapshot = await postsQuery.get();

        // Group activity by day
        const activity = {};
        const now = new Date();

        // Initialize all days in range
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            activity[dateStr] = {
                views: 0,
                comments: 0,
                likes: 0,
                posts: 0
            };
        }

        // Fill in actual data
        postsSnapshot.docs.forEach(doc => {
            const post = doc.data();
            if (post.publishedAt) {
                const publishedDate = post.publishedAt.toDate ?
                    post.publishedAt.toDate() :
                    new Date(post.publishedAt);

                const dateStr = publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                if (activity[dateStr]) {
                    activity[dateStr].views += post.stats?.views || 0;
                    activity[dateStr].comments += post.stats?.comments || 0;
                    activity[dateStr].likes += post.stats?.likes || 0;
                    activity[dateStr].posts += 1;
                }
            }
        });

        // Format for chart display
        const activityData = Object.entries(activity).map(([date, data]) => ({
            date,
            ...data
        })).reverse();

        return NextResponse.json(activityData);
    } catch (error) {
        console.error('Error fetching activity data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity data' },
            { status: 500 }
        );
    }
}