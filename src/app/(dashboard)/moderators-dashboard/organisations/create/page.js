"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ModeratorsCreateOrganisation() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        companyName: '',
        logoUrl: '',
        featuredImage: '',
        website: '',
        category: '',
        subcategory: '',
        about: '',
        location: { city: '', country: '' },
        status: 'active',
        isVerified: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.companyName.trim()) return alert('Company name required');
        setSaving(true);
        try {
            const res = await fetch('/api/organisations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                router.push('/moderators-dashboard/organisations');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create organisation');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to create organisation');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Create Organisation</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Company Name</label>
                    <input className="w-full px-3 py-2 border rounded" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Logo URL</label>
                        <input className="w-full px-3 py-2 border rounded" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Featured Image</label>
                        <input className="w-full px-3 py-2 border rounded" value={form.featuredImage} onChange={e => setForm({ ...form, featuredImage: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Website</label>
                    <input className="w-full px-3 py-2 border rounded" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <input className="w-full px-3 py-2 border rounded" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Subcategory</label>
                        <input className="w-full px-3 py-2 border rounded" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">About</label>
                    <textarea className="w-full px-3 py-2 border rounded" rows="4" value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">City</label>
                        <input className="w-full px-3 py-2 border rounded" value={form.location.city} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Country</label>
                        <input className="w-full px-3 py-2 border rounded" value={form.location.country} onChange={e => setForm({ ...form, location: { ...form.location, country: e.target.value } })} />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.isVerified} onChange={e => setForm({ ...form, isVerified: e.target.checked })} />
                        <span className="text-sm">Verified</span>
                    </label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 border rounded">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded">Cancel</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Create Organisation'}</button>
                </div>
            </form>
        </div>
    );
}
