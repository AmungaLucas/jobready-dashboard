import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const postData = await request.json();

        // Validate required fields
        if (!postData.title || !postData.content || !postData.createdBy) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create post document
        const postRef = await adminDb.collection('posts').add({
            ...postData,
            createdAt: postData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            id: postRef.id,
            message: 'Post created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}