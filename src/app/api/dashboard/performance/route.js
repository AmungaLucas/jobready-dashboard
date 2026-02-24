// app/api/dashboard/performance/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Default targets (could be stored in settings)
        const targets = {
            dailyViews: 1000,
            weeklyViews: 5000,
            monthlyViews: 20000,
            engagement: 20,
            comments: 50,
            shares: 30
        };

        // Calculate date ranges
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const startOfMonth = new Date(now);
        startOfMonth.setMonth(startOfMonth.getMonth() - 1);

        // Fetch posts
        let postsQuery = adminDb.collection('posts');

        if (userId) {
            postsQuery = postsQuery.where('createdBy.userId', '==', userId);
        }

        const postsSnapshot = await postsQuery.get();
        const posts = postsSnapshot.docs.map(doc => doc.data());

        // Calculate current performance
        let dailyViews = 0;
        let weeklyViews = 0;
        let monthlyViews = 0;
        let totalEngagement = 0;
        let totalComments = 0;
        let totalShares = 0;
        let totalViews = 0;

        posts.forEach(post => {
            if (post.views) {
                totalViews += post.views;

                if (post.publishedAt) {
                    const publishedDate = post.publishedAt.toDate ? post.publishedAt.toDate() : new Date(post.publishedAt);

                    if (publishedDate >= startOfDay) {
                        dailyViews += post.views || 0;
                    }

                    if (publishedDate >= startOfWeek) {
                        weeklyViews += post.views || 0;
                    }

                    if (publishedDate >= startOfMonth) {
                        monthlyViews += post.views || 0;
                    }
                }
            }

            if (post.stats?.comments) {
                totalComments += post.stats.comments;
            }

            if (post.stats?.shares) {
                totalShares += post.stats.shares;
            }
        });

        totalEngagement = totalComments + totalShares;

        // Calculate engagement rate
        const engagement = totalViews > 0
            ? Math.round((totalEngagement / totalViews) * 100 * 10) / 10
            : 0;

        // Get top performing posts
        const topPostsQuery = await adminDb.collection('posts')
            .where('status', '==', 'published')
            .orderBy('views', 'desc')
            .limit(5)
            .get();

        const topPosts = topPostsQuery.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            views: doc.data().views || 0,
            engagement: doc.data().stats?.comments || 0
        }));

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivityQuery = await adminDb.collection('posts')
            .where('status', '==', 'published')
            .where('publishedAt', '>=', sevenDaysAgo)
            .orderBy('publishedAt', 'desc')
            .get();

        const activityByDay = {};
        recentActivityQuery.docs.forEach(doc => {
            const post = doc.data();
            if (post.publishedAt) {
                const date = post.publishedAt.toDate ?
                    post.publishedAt.toDate().toLocaleDateString() :
                    new Date(post.publishedAt).toLocaleDateString();

                if (!activityByDay[date]) {
                    activityByDay[date] = {
                        views: 0,
                        comments: 0,
                        posts: 0
                    };
                }

                activityByDay[date].views += post.views || 0;
                activityByDay[date].comments += post.stats?.comments || 0;
                activityByDay[date].posts += 1;
            }
        });

        const performance = {
            dailyViews,
            dailyViewsTarget: targets.dailyViews,
            weeklyViews,
            weeklyViewsTarget: targets.weeklyViews,
            monthlyViews,
            monthlyViewsTarget: targets.monthlyViews,
            engagement,
            engagementTarget: targets.engagement,
            totalComments,
            commentsTarget: targets.comments,
            totalShares,
            sharesTarget: targets.shares,
            topPosts,
            activityByDay: Object.entries(activityByDay).map(([date, data]) => ({
                date,
                ...data
            }))
        };

        return NextResponse.json(performance);
    } catch (error) {
        console.error('Error fetching performance data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch performance data' },
            { status: 500 }
        );
    }
}