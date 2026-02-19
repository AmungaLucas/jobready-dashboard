import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const jobData = await request.json();

        // Validate required fields
        if (!jobData.title || !jobData.content || !jobData.createdBy) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create job document
        const jobRef = await adminDb.collection('jobs').add({
            ...jobData,
            createdAt: jobData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            id: jobRef.id,
            message: 'Job created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json(
            { error: 'Failed to create job' },
            { status: 500 }
        );
    }
}