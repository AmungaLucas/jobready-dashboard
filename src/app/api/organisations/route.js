import { adminDb } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('organisations').get();
        const orgs = [];
        snapshot.forEach(doc => {
            orgs.push({ id: doc.id, ...doc.data() });
        });
        return new Response(JSON.stringify(orgs), { status: 200 });
    } catch (error) {
        console.error('Error fetching organisations:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch organisations' }), { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        // Basic validation
        if (!body.companyName) {
            return new Response(JSON.stringify({ error: 'companyName is required' }), { status: 400 });
        }

        const data = {
            companyName: body.companyName || '',
            logoUrl: body.logoUrl || '',
            featuredImage: body.featuredImage || '',
            website: body.website || '',
            category: body.category || '',
            subcategory: body.subcategory || '',
            about: body.about || '',
            location: body.location || {},
            status: body.status || 'active',
            isVerified: !!body.isVerified,
            createdAt: new Date().toISOString()
        };

        const docRef = await adminDb.collection('organisations').add(data);
        return new Response(JSON.stringify({ id: docRef.id, ...data }), { status: 201 });
    } catch (error) {
        console.error('Error creating organisation:', error);
        return new Response(JSON.stringify({ error: 'Failed to create organisation' }), { status: 500 });
    }
}
