// file: src/app/api/categories/[id]/edit/route.js

import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// Helper function to verify authentication
async function verifyAuth(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded;
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

// GET - Fetch a single category for editing
export async function GET(request, { params }) {
    try {
        // Await the params promise
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const includeCounts = searchParams.get('includeCounts') === 'true';

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        // Fetch the category
        const docRef = adminDb.collection('categories').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        const data = doc.data();

        // Include post count if requested
        if (includeCounts) {
            const postsSnapshot = await adminDb.collection('posts')
                .where('categoryIds', 'array-contains', id)
                .get();
            const postCount = postsSnapshot.size;
            return NextResponse.json({ id: doc.id, ...data, postCount });
        }

        return NextResponse.json({ id: doc.id, ...data });

    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

// PUT - Update a category
export async function PUT(request, { params }) {
    try {
        // Await the params promise
        const { id } = await params;

        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const data = await request.json();

        // Check if category exists
        const categoryRef = adminDb.collection('categories').doc(id);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Validate required fields
        if (!data.name?.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        if (!data.slug?.trim()) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Validate slug format
        if (!/^[a-z0-9-]+$/.test(data.slug)) {
            return NextResponse.json(
                { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
                { status: 400 }
            );
        }

        // Check slug uniqueness (if slug is being changed)
        const existingSlugQuery = await adminDb.collection('categories')
            .where('slug', '==', data.slug)
            .get();

        if (!existingSlugQuery.empty) {
            // Make sure the found document is not the current one
            const slugExists = existingSlugQuery.docs.some(doc => doc.id !== id);
            if (slugExists) {
                return NextResponse.json(
                    { error: 'A category with this slug already exists' },
                    { status: 409 }
                );
            }
        }

        // Prepare update data - remove client-controlled fields, set server-side values
        const updateData = {
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            parentId: data.parentId || null,
            icon: data.icon || '',
            color: data.color || '#3B82F6',
            image: data.image || '',
            featured: data.featured || false,
            status: data.status || 'active',
            seo: {
                metaTitle: data.seo?.metaTitle || data.name,
                metaDescription: data.seo?.metaDescription || data.description || '',
                canonicalUrl: data.seo?.canonicalUrl || ''
            },
            updatedAt: new Date().toISOString(),
            updatedBy: {
                userId: user.uid,
                name: user.name || user.email || '',
                avatar: user.picture || ''
            }
        };

        await categoryRef.update(updateData);

        const updatedDoc = await categoryRef.get();

        return NextResponse.json({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// PATCH - Partial update (e.g., for draft saves)
export async function PATCH(request, { params }) {
    try {
        // Await the params promise
        const { id } = await params;

        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const data = await request.json();

        // Check if category exists
        const categoryRef = adminDb.collection('categories').doc(id);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // If slug is being updated, check uniqueness
        if (data.slug) {
            const existingSlugQuery = await adminDb.collection('categories')
                .where('slug', '==', data.slug)
                .get();

            if (!existingSlugQuery.empty) {
                const slugExists = existingSlugQuery.docs.some(doc => doc.id !== id);
                if (slugExists) {
                    return NextResponse.json(
                        { error: 'A category with this slug already exists' },
                        { status: 409 }
                    );
                }
            }
        }

        // Prepare update data with server-side user info
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
            updatedBy: {
                userId: user.uid,
                name: user.name || user.email || '',
                avatar: user.picture || ''
            }
        };

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.createdBy;

        await categoryRef.update(updateData);

        const updatedDoc = await categoryRef.get();

        return NextResponse.json({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a category (soft delete by default)
export async function DELETE(request, { params }) {
    try {
        // Await the params promise
        const { id } = await params;

        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const hardDelete = searchParams.get('hardDelete') === 'true';

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const categoryRef = adminDb.collection('categories').doc(id);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        if (hardDelete) {
            // Permanently delete the category
            await categoryRef.delete();

            // Also remove this category from all posts
            const postsSnapshot = await adminDb.collection('posts')
                .where('categoryIds', 'array-contains', id)
                .get();

            const batch = adminDb.batch();
            postsSnapshot.forEach(doc => {
                const postData = doc.data();
                const updatedCategoryIds = (postData.categoryIds || []).filter(catId => catId !== id);
                batch.update(doc.ref, { categoryIds: updatedCategoryIds });
            });

            await batch.commit();

            return NextResponse.json({
                message: 'Category permanently deleted',
                id
            });
        } else {
            // Soft delete
            await categoryRef.update({
                isDeleted: true,
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedBy: {
                    userId: user.uid,
                    name: user.name || user.email || '',
                    avatar: user.picture || ''
                }
            });

            return NextResponse.json({
                message: 'Category soft deleted',
                id
            });
        }

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}