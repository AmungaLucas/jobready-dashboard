"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ModeratorsOrganisationsPage() {
    const [orgs, setOrgs] = useState([]);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const res = await fetch('/api/organisations');
                if (res.ok) {
                    const data = await res.json();
                    setOrgs(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrgs();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Organisations</h1>
                <Link href="/moderators-dashboard/organisations/create" className="px-4 py-2 bg-gray-100 rounded">Add Organisation</Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {orgs.map(o => (
                    <div key={o.id} className="p-4 border rounded flex items-center justify-between">
                        <div>
                            <div className="font-semibold">{o.companyName}</div>
                            <div className="text-sm text-gray-500">{o.website || o.location?.city}</div>
                        </div>
                        <div className="text-sm text-gray-600">{o.status}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
