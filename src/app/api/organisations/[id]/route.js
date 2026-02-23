import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request, { params }) {
    try {
        // In Next.js 15+, params is a Promise that needs to be awaited
        const { id } = await params;

        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const docRef = adminDb.collection('organisations').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return new Response(JSON.stringify({ error: 'Organisation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ id: doc.id, ...doc.data() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching organisation:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch organisation' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();

        // Check if document exists
        const docRef = adminDb.collection('organisations').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return new Response(JSON.stringify({ error: 'Organisation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update the document
        await docRef.set({
            ...body,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        const updated = await docRef.get();

        return new Response(JSON.stringify({ id: updated.id, ...updated.data() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating organisation:', error);
        return new Response(JSON.stringify({ error: 'Failed to update organisation' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const docRef = adminDb.collection('organisations').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return new Response(JSON.stringify({ error: 'Organisation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await docRef.delete();

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting organisation:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete organisation' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}