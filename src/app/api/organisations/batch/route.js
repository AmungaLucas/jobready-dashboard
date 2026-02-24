// app/api/organisations/batch/route.js
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(request) {
    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
        }

        const { organisationIds } = await request.json();

        if (!organisationIds || !Array.isArray(organisationIds) || organisationIds.length === 0) {
            return NextResponse.json([])
        }

        // Fetch organisations from Firestore in batch
        const organisations = [];

        // Firestore batch get for better performance
        const orgRefs = organisationIds.map(id => adminDb.collection('organisations').doc(id));
        const snapshots = await adminDb.getAll(...orgRefs);

        snapshots.forEach((snapshot, index) => {
            if (snapshot.exists) {
                const orgData = snapshot.data();
                organisations.push({
                    id: organisationIds[index],
                    companyName: orgData.companyName || 'Unknown Organisation',
                    logoUrl: orgData.logoUrl || null
                });
            } else {
                // Fallback for missing organisations
                organisations.push({
                    id: organisationIds[index],
                    companyName: 'Unknown Organisation',
                    logoUrl: null
                });
            }
        });

        return NextResponse.json(organisations)

    } catch (error) {
        console.error('Error fetching organisations:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}