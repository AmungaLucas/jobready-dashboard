// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch all dashboard data in parallel
        const [
            postsSnapshot,
            recentPostsSnapshot
        ] = await Promise.all([
            adminDb.collection('posts').get(),
            adminDb.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get()
        ]);

        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const recentPosts = recentPostsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate stats
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const stats = {
            viewsToday: 0,
            viewsYesterday: 0,
            engagementRate: 0,
            previousEngagement: 0,
            draftPosts: 0,
            publishedPosts: 0,
            archivedPosts: 0,
            totalComments: 0,
            totalLikes: 0,
            totalShares: 0,
            avgReadTime: 0,
            totalViews: 0
        };

        let totalReadTime = 0;
        let postsWithReadTime = 0;
        let totalEngagement = 0;

        posts.forEach(post => {
            // Count by status
            if (post.status === 'draft') stats.draftPosts++;
            if (post.status === 'published') stats.publishedPosts++;
            if (post.status === 'archived') stats.archivedPosts++;

            // Get values from stats object
            const postViews = post.stats?.views || 0;
            const postComments = post.stats?.comments || 0;
            const postLikes = post.stats?.likes || 0;

            // Views
            if (postViews > 0) {
                stats.totalViews += postViews;

                if (post.publishedAt) {
                    const publishedDate = post.publishedAt.toDate ? post.publishedAt.toDate() : new Date(post.publishedAt);

                    if (publishedDate >= startOfDay) {
                        stats.viewsToday += postViews;
                    } else if (publishedDate >= startOfYesterday && publishedDate < startOfDay) {
                        stats.viewsYesterday += postViews;
                    }
                }
            }

            // Engagement
            stats.totalComments += postComments;
            stats.totalLikes += postLikes;
            totalEngagement += postComments + postLikes;

            // Read time
            if (post.settings?.estimatedReadTime) {
                totalReadTime += post.settings.estimatedReadTime;
                postsWithReadTime++;
            }
        });

        // Calculate averages
        stats.avgReadTime = postsWithReadTime > 0
            ? Math.round((totalReadTime / postsWithReadTime) * 10) / 10
            : 0;

        if (stats.totalViews > 0) {
            stats.engagementRate = Math.round((totalEngagement / stats.totalViews) * 100 * 10) / 10;
            stats.previousEngagement = stats.engagementRate * 0.85; // Placeholder
        }

        return NextResponse.json({
            stats,
            recentPosts,
            performance: {
                dailyViews: stats.viewsToday,
                dailyViewsTarget: 1000,
                engagement: stats.engagementRate,
                engagementTarget: 20
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}