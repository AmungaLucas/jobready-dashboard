import { adminDb } from '@/lib/firebaseAdmin';
import EditorDetailsClient from './EditorDetailsClient';

async function getEditorDetails(id) {
    try {
        // Ensure id is a non-empty string
        id = typeof id === 'string' ? id.trim() : String(id || '').trim();
        if (!id) {
            console.error('No ID provided');
            return null;
        }

        // Get editor details
        const editorDoc = await adminDb.collection('editors').doc(id).get();

        if (!editorDoc.exists) {
            console.error('Editor document not found for ID:', id);
            return null;
        }

        const editorData = { id: editorDoc.id, ...editorDoc.data() };

        // Get user details
        const userDoc = await adminDb.collection('users').doc(id).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // Get posts by this editor
        let posts = [];
        try {
            const postsSnapshot = await adminDb
                .collection('posts')
                .where('createdBy.userId', '==', id)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            postsSnapshot.forEach(doc => {
                const data = doc.data();
                posts.push({
                    id: doc.id,
                    title: data.title || 'Untitled',
                    status: data.status || 'draft',
                    createdAt: data.createdAt || '',
                    views: data.stats?.views || 0,
                    likes: data.stats?.likes || 0,
                    comments: data.stats?.comments || 0,
                });
            });
        } catch (postError) {
            console.error('Error fetching posts:', postError);
            // If posts collection doesn't exist or other error, continue with empty posts
        }

        // Get jobs by this editor
        let jobs = [];
        try {
            const jobsSnapshot = await adminDb
                .collection('jobs')
                .where('createdBy', '==', id)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            jobsSnapshot.forEach(doc => {
                const data = doc.data();
                jobs.push({
                    id: doc.id,
                    title: data.title || 'Untitled',
                    status: data.status || 'draft',
                    createdAt: data.createdAt || '',
                    views: data.views || 0,
                });
            });
        } catch (jobError) {
            console.error('Error fetching jobs:', jobError);
        }

        // Get stats
        let totalPosts = 0;
        let publishedPosts = 0;
        let draftPosts = 0;
        let totalViews = 0;

        try {
            const allPostsSnapshot = await adminDb
                .collection('posts')
                .where('createdBy.userId', '==', id)
                .get();

            totalPosts = allPostsSnapshot.size;
            publishedPosts = allPostsSnapshot.docs.filter(doc => doc.data().status === 'published').length;
            draftPosts = allPostsSnapshot.docs.filter(doc => doc.data().status === 'draft').length;
            totalViews = allPostsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().stats?.views || 0), 0);
        } catch (statsError) {
            console.error('Error fetching stats:', statsError);
        }

        let totalJobs = 0;
        try {
            const allJobsSnapshot = await adminDb
                .collection('jobs')
                .where('createdBy', '==', id)
                .get();
            totalJobs = allJobsSnapshot.size;
        } catch (jobsError) {
            console.error('Error fetching jobs count:', jobsError);
        }

        const stats = {
            totalPosts,
            publishedPosts,
            draftPosts,
            totalJobs,
            totalViews,
        };

        return {
            editor: editorData,
            user: userData,
            posts,
            jobs,
            stats
        };
    } catch (error) {
        console.error('Error in getEditorDetails:', error);
        return null;
    }
}

export default async function EditorDetailsPage({ params }) {
    // In Next.js App Router, `params` can be a Promise — await it and coerce the id
    const resolvedParams = await params;
    let id = resolvedParams?.id;
    id = typeof id === 'string' ? id.trim() : String(id || '').trim();

    console.log('EditorDetailsPage - ID:', id);

    if (!id) {
        return (
            <div className="px-4 sm:px-6 py-8">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Editor ID</h2>
                    <p className="text-gray-500">No editor ID provided.</p>
                    <a
                        href="/admin-dashboard/team"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Team
                    </a>
                </div>
            </div>
        );
    }

    const data = await getEditorDetails(id);

    if (!data) {
        return (
            <div className="px-4 sm:px-6 py-8">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Editor Not Found</h2>
                    <p className="text-gray-500">The editor you're looking for doesn't exist or has been removed.</p>
                    <a
                        href="/admin-dashboard/team"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Team
                    </a>
                </div>
            </div>
        );
    }

    return <EditorDetailsClient data={data} />;
}