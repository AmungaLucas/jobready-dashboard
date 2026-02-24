// app/api/categories/batch/route.js
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(request) {
    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
        }

        const { categoryIds } = await request.json();

        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
            return NextResponse.json([])
        }

        // Fetch categories from Firestore in batch
        const categories = [];

        // Firestore batch get for better performance
        const categoryRefs = categoryIds.map(id => adminDb.collection('categories').doc(id));
        const snapshots = await adminDb.getAll(...categoryRefs);

        snapshots.forEach((snapshot, index) => {
            if (snapshot.exists) {
                const catData = snapshot.data();
                categories.push({
                    id: categoryIds[index],
                    name: catData.name || 'Unknown Category',
                    slug: catData.slug || ''
                });
            } else {
                // Fallback for missing categories
                categories.push({
                    id: categoryIds[index],
                    name: 'Unknown Category',
                    slug: ''
                });
            }
        });

        return NextResponse.json(categories)

    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}