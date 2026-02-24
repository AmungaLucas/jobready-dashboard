// app/api/dashboard/summary/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch all required data in parallel
        const [
            postsSnapshot,
            usersSnapshot,
            commentsSnapshot
        ] = await Promise.all([
            adminDb.collection('posts').get(),
            adminDb.collection('users').limit(10).get(),
            adminDb.collection('comments').where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).get()
        ]);

        const posts = postsSnapshot.docs.map(doc => doc.data());

        // Calculate summary metrics
        const summary = {
            totalPosts: posts.length,
            publishedPosts: posts.filter(p => p.status === 'published').length,
            draftPosts: posts.filter(p => p.status === 'draft').length,
            archivedPosts: posts.filter(p => p.status === 'archived').length,
            totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
            totalComments: posts.reduce((sum, p) => sum + (p.stats?.comments || 0), 0),
            totalShares: posts.reduce((sum, p) => sum + (p.stats?.shares || 0), 0),
            recentComments: commentsSnapshot.size,
            recentUsers: usersSnapshot.size,
            categories: {},
            authors: {}
        };

        // Calculate category distribution
        posts.forEach(post => {
            if (post.categoryIds) {
                post.categoryIds.forEach(catId => {
                    summary.categories[catId] = (summary.categories[catId] || 0) + 1;
                });
            }

            if (post.createdBy?.userId) {
                const authorId = post.createdBy.userId;
                if (!summary.authors[authorId]) {
                    summary.authors[authorId] = {
                        name: post.createdBy.name || 'Unknown',
                        count: 0,
                        views: 0
                    };
                }
                summary.authors[authorId].count++;
                summary.authors[authorId].views += post.views || 0;
            }
        });

        // Get top categories
        summary.topCategories = Object.entries(summary.categories)
            .map(([id, count]) => ({ id, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Get top authors
        summary.topAuthors = Object.entries(summary.authors)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error fetching summary data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch summary data' },
            { status: 500 }
        );
    }
}