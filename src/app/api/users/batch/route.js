// app/api/users/batch/route.js
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(request) {
    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
        }

        const { userIds } = await request.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json([])
        }

        // Fetch users from Firestore in batch
        const users = [];

        // Firestore batch get for better performance
        const userRefs = userIds.map(id => adminDb.collection('users').doc(id));
        const snapshots = await adminDb.getAll(...userRefs);

        snapshots.forEach(async (snapshot, index) => {
            if (snapshot.exists) {
                const userData = snapshot.data();
                users.push({
                    uid: userIds[index],
                    name: userData.name || userData.displayName || userData.email || 'Unknown User',
                    email: userData.email
                });
            } else {
                // Check editors collection as fallback
                const editorRef = adminDb.collection('editors').where('userId', '==', userIds[index]);
                const editorSnapshot = await editorRef.get();

                if (!editorSnapshot.empty) {
                    const editorData = editorSnapshot.docs[0].data();
                    users.push({
                        uid: userIds[index],
                        name: editorData.name || 'Unknown User',
                        email: null
                    });
                } else {
                    // Fallback for missing users
                    users.push({
                        uid: userIds[index],
                        name: 'Unknown User',
                        email: null
                    });
                }
            }
        });

        return NextResponse.json(users)

    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}