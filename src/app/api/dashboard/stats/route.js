// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const timeRange = searchParams.get('timeRange') || 'today'; // today, week, month

        // Calculate date ranges
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - 7);

        const startOfMonth = new Date(now);
        startOfMonth.setMonth(startOfMonth.getMonth() - 1);

        // Fetch all posts
        let postsQuery = adminDb.collection('posts');

        // If userId is provided, filter by creator
        if (userId) {
            postsQuery = postsQuery.where('createdBy.userId', '==', userId);
        }

        const postsSnapshot = await postsQuery.get();
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate stats
        const stats = {
            viewsToday: 0,
            viewsYesterday: 0,
            viewsThisWeek: 0,
            viewsThisMonth: 0,
            engagementRate: 0,
            previousEngagement: 0,
            draftPosts: 0,
            publishedPosts: 0,
            archivedPosts: 0,
            totalComments: 0,
            totalShares: 0,
            avgReadTime: 0,
            totalViews: 0
        };

        let totalReadTime = 0;
        let postsWithReadTime = 0;

        posts.forEach(post => {
            // Count by status
            if (post.status === 'draft') stats.draftPosts++;
            if (post.status === 'published') stats.publishedPosts++;
            if (post.status === 'archived') stats.archivedPosts++;

            // Calculate views by time periods
            if (post.views) {
                stats.totalViews += post.views;

                // Check if post was viewed today/yesterday (simplified - in production you'd have view timestamps)
                if (post.publishedAt) {
                    const publishedDate = post.publishedAt.toDate ? post.publishedAt.toDate() : new Date(post.publishedAt);

                    if (publishedDate >= startOfDay) {
                        stats.viewsToday += post.views || 0;
                    } else if (publishedDate >= startOfYesterday && publishedDate < startOfDay) {
                        stats.viewsYesterday += post.views || 0;
                    }

                    if (publishedDate >= startOfWeek) {
                        stats.viewsThisWeek += post.views || 0;
                    }

                    if (publishedDate >= startOfMonth) {
                        stats.viewsThisMonth += post.views || 0;
                    }
                }
            }

            // Count comments
            if (post.stats?.comments) {
                stats.totalComments += post.stats.comments;
            }

            // Count shares
            if (post.stats?.shares) {
                stats.totalShares += post.stats.shares;
            }

            // Calculate average read time
            if (post.settings?.estimatedReadTime) {
                totalReadTime += post.settings.estimatedReadTime;
                postsWithReadTime++;
            }
        });

        // Calculate average read time
        stats.avgReadTime = postsWithReadTime > 0
            ? Math.round((totalReadTime / postsWithReadTime) * 10) / 10
            : 0;

        // Calculate engagement rate (comments + shares per view)
        if (stats.totalViews > 0) {
            const totalEngagement = stats.totalComments + stats.totalShares;
            stats.engagementRate = Math.round((totalEngagement / stats.totalViews) * 100 * 10) / 10;

            // Previous period engagement (simplified - using same calculation)
            stats.previousEngagement = stats.engagementRate * 0.85; // Placeholder
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}