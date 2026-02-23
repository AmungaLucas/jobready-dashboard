// app/api/media/upload/route.js
import { adminDb, getStorageBucket } from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file')
        const isCover = formData.get('isCover') === 'true'
        const width = parseInt(formData.get('width') || '0')
        const height = parseInt(formData.get('height') || '0')
        const sourceType = formData.get('sourceType') // 'post', 'job', 'organisation'
        const sourceId = formData.get('sourceId') // ID of the content item (if available)

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const bucket = getStorageBucket()
        if (!bucket) {
            return NextResponse.json({
                error: 'Storage bucket not configured'
            }, { status: 500 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Generate clean filename
        const timestamp = Date.now()
        const cleanName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_')
        const filename = `media/${timestamp}_${cleanName}.webp`

        const fileRef = bucket.file(filename)

        await fileRef.save(buffer, {
            metadata: {
                contentType: 'image/webp',
                metadata: {
                    originalName: file.name,
                    sourceType: sourceType || 'unknown',
                    sourceId: sourceId || ''
                }
            },
        })

        await fileRef.makePublic()
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

        // Create media document with usage tracking
        const mediaData = {
            name: file.name,
            storagePath: filename,
            url: publicUrl,
            size: buffer.length,
            width: width,
            height: height,
            contentType: 'image/webp',
            isCover: isCover,
            usedIn: [], // Array to track where this image is used
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            uploadedBy: request.headers.get('user-id') || null // If you have user auth
        }

        // If source info is provided, add to usedIn
        if (sourceType && sourceId) {
            mediaData.usedIn = [{
                type: sourceType,
                id: sourceId,
                usedAt: new Date()
            }]
            mediaData.usageCount = 1
        }

        const docRef = await adminDb.collection('media').add(mediaData)

        return NextResponse.json({
            success: true,
            id: docRef.id,
            url: publicUrl,
            mediaData: { id: docRef.id, ...mediaData }
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({
            error: 'Upload failed: ' + error.message
        }, { status: 500 })
    }
}