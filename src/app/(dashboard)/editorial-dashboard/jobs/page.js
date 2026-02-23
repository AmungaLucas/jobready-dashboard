'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export default function JobsPage() {
    const LIMIT = 10
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(false)
    const [lastId, setLastId] = useState(null)
    const pageStack = useRef([null])

    const fetchPage = async (startAfter = null) => {
        setLoading(true)
        setError(null)
        try {
            const url = new URL(window.location.href)
            url.pathname = '/api/jobs'
            url.searchParams.set('limit', String(LIMIT))
            if (startAfter) url.searchParams.set('startAfter', startAfter)

            const res = await fetch(url.toString())
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch')

            setJobs(data.jobs || [])
            setLastId(data.lastId || null)
            setHasMore(Boolean(data.hasMore))
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPage(null)
    }, [])

    const handleNext = async () => {
        if (!hasMore) return
        pageStack.current.push(lastId)
        await fetchPage(lastId)
    }

    const handlePrevious = async () => {
        if (pageStack.current.length <= 1) return
        pageStack.current.pop()
        const startAfter = pageStack.current[pageStack.current.length - 1]
        await fetchPage(startAfter)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this job?')) return
        try {
            const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            // refresh
            fetchPage(pageStack.current[pageStack.current.length - 1])
        } catch (err) {
            alert('Failed to delete')
        }
    }

    const handleEditTitle = async (job) => {
        const newTitle = prompt('Edit title', job.title || '')
        if (newTitle === null) return
        try {
            const res = await fetch(`/api/jobs/${job.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            })
            if (!res.ok) throw new Error('Update failed')
            fetchPage(pageStack.current[pageStack.current.length - 1])
        } catch (err) {
            alert('Failed to update')
        }
    }

    return (
        <div className="px-4 py-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Jobs</h1>
                <Link href="/(dashboard)/editorial-dashboard/jobs/create" className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">
                    Create Job
                </Link>
            </div>

            {loading && <div className="p-4">Loading…</div>}
            {error && <div className="p-4 text-red-600">{error}</div>}

            {!loading && jobs.length === 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-gray-600">No jobs found.</p>
                </div>
            )}

            <div className="grid gap-4">
                {jobs.map(job => (
                    <div key={job.id} className="p-4 bg-white rounded-lg shadow hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold">{job.title || 'Untitled'}</h2>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span>{job.organisation || job.companyName || ''}</span>
                                    <span className="capitalize">{job.status || 'draft'}</span>
                                    <span>{job.datePosted ? new Date(job.datePosted).toLocaleDateString() : new Date(job.createdAt || job.updatedAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                                {job.content && (
                                    <p className="text-sm text-gray-600 mt-2">{String(job.content).replace(/<[^>]*>/g, '').slice(0, 240)}{String(job.content).length > 240 ? '…' : ''}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                                <Link href={`/editorial-dashboard/jobs/${job.id}`} className="text-sm text-blue-600">View</Link>
                                <button onClick={() => handleEditTitle(job)} className="text-sm text-yellow-600 text-left">Edit</button>
                                <button onClick={() => handleDelete(job.id)} className="text-sm text-red-600 text-left">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mt-6">
                <button onClick={handlePrevious} disabled={pageStack.current.length <= 1} className="px-3 py-2 bg-white border rounded disabled:opacity-50">Previous</button>
                <div className="text-sm text-gray-600">{hasMore ? 'More pages available' : 'End of results'}</div>
                <button onClick={handleNext} disabled={!hasMore} className="px-3 py-2 bg-white border rounded disabled:opacity-50">Next</button>
            </div>
        </div>
    )
}