// file: src/app/api/categories/route.js

import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeCounts = searchParams.get('includeCounts') === 'true';

        // Fetch categories from Firestore
        let query = adminDb.collection('categories');

        // You can add ordering if needed
        query = query.orderBy('name', 'asc');

        const snapshot = await query.get();

        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        // Get post counts if requested
        let categories = [];

        if (includeCounts) {
            // Get all posts to count per category
            const postsSnapshot = await adminDb.collection('posts').get();
            const postCounts = {};

            postsSnapshot.forEach(doc => {
                const post = doc.data();
                if (post.categoryIds && Array.isArray(post.categoryIds)) {
                    post.categoryIds.forEach(catId => {
                        postCounts[catId] = (postCounts[catId] || 0) + 1;
                    });
                }
            });

            categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                postCount: postCounts[doc.id] || 0
            }));
        } else {
            categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        // Create slug from name
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if category with same slug exists
        const existingQuery = await adminDb.collection('categories')
            .where('slug', '==', slug)
            .get();

        if (!existingQuery.empty) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }

        // Prepare category data
        const categoryData = {
            name: data.name,
            slug: slug,
            description: data.description || '',
            parentId: data.parentId || null,
            featured: data.featured || false,
            status: data.status || 'active',
            seo: {
                metaTitle: data.seo?.metaTitle || data.name,
                metaDescription: data.seo?.metaDescription || data.description || '',
                canonicalUrl: data.seo?.canonicalUrl || ''
            },
            createdBy: data.createdBy || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false
        };

        // Add optional fields if provided
        if (data.icon) categoryData.icon = data.icon;
        if (data.color) categoryData.color = data.color;
        if (data.image) categoryData.image = data.image;

        // Save to Firestore
        const docRef = await adminDb.collection('categories').add(categoryData);

        return NextResponse.json({
            id: docRef.id,
            ...categoryData
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

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

        // Update data
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        // Remove fields that shouldn't be updated directly
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

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
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
                updatedAt: new Date().toISOString()
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