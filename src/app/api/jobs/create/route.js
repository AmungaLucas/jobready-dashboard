import { adminDb, getStorageBucket } from '@/lib/firebaseAdmin';
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

        // Handle large featuredImage payloads: upload to Storage and replace with URL
        const processedJobData = { ...jobData };

        if (processedJobData.featuredImage && typeof processedJobData.featuredImage === 'string') {
            const imgStr = processedJobData.featuredImage;
            const isDataUrl = imgStr.startsWith('data:');
            const sizeThreshold = 900_000; // ~0.9MB heuristic for large payloads
            const tooLarge = imgStr.length > sizeThreshold;

            if (isDataUrl || tooLarge) {
                try {
                    let base64 = imgStr;
                    let contentType = 'image/jpeg';

                    if (isDataUrl) {
                        const m = imgStr.match(/^data:(image\/[^;]+);base64,(.*)$/);
                        if (m) {
                            contentType = m[1];
                            base64 = m[2];
                        } else {
                            // fallback: strip prefix if present
                            base64 = imgStr.split(',')[1] || imgStr;
                        }
                    } else {
                        // not a data URL: try to strip common prefixes
                        base64 = imgStr.replace(/^data:.*;base64,/, '');
                    }

                    const buffer = Buffer.from(base64, 'base64');

                    const bucket = getStorageBucket();
                    if (bucket) {
                        const filename = `jobs/featured_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
                        const fileRef = bucket.file(filename);

                        await fileRef.save(buffer, {
                            metadata: { contentType },
                        });

                        // make public and replace field with URL
                        await fileRef.makePublic();
                        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
                        processedJobData.featuredImage = publicUrl;
                        processedJobData.featuredImageStoragePath = filename;
                    } else {
                        // if no bucket available, drop large field to avoid Firestore error
                        delete processedJobData.featuredImage;
                    }
                } catch (err) {
                    console.error('Failed to upload featuredImage to storage:', err);
                    delete processedJobData.featuredImage;
                }
            }
        }

        // Create job document
        const jobRef = await adminDb.collection('jobs').add({
            ...processedJobData,
            createdAt: processedJobData.createdAt || new Date().toISOString(),
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