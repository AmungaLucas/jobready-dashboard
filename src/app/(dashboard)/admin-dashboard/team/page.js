import React from 'react'
import { adminDb } from '../../../../lib/firebaseAdmin'
import TeamsClient from './TeamsClient'

const TeamPage = async () => {
    try {
        const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get()
        const users = []
        snapshot.forEach((doc) => {
            const d = doc.data() || {}
            const avatar = d.avatar || d.avater || ''
            const createdAt = d.createdAt ? (typeof d.createdAt.toDate === 'function' ? d.createdAt.toDate().toISOString() : String(d.createdAt)) : ''
            const lastLogin = d.lastLogin ? (typeof d.lastLogin.toDate === 'function' ? d.lastLogin.toDate().toISOString() : String(d.lastLogin)) : ''

            users.push({
                id: doc.id,
                uid: d.uid || '',
                email: d.email || '',
                name: d.name || '',
                role: d.role || '',
                avatar,
                createdAt,
                lastLogin,
            })
        })

        const groups = {
            admins: users.filter((u) => u.role === 'admin'),
            editors: users.filter((u) => u.role === 'editor'),
            moderators: users.filter((u) => u.role === 'moderator'),
        }

        const counts = {
            admins: groups.admins.length,
            editors: groups.editors.length,
            moderators: groups.moderators.length,
        }

        return (
            <div className="px-2 sm:px-0">
                <h1 className="text-xl sm:text-2xl font-semibold mb-6">Team</h1>
                <TeamsClient counts={counts} groups={groups} />
            </div>
        )
    } catch (error) {
        console.error('Error loading team page:', error)
        return (
            <div className="px-2 sm:px-0">
                <h1 className="text-xl sm:text-2xl font-semibold mb-6">Team</h1>
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">Error loading team.</p>
                </div>
            </div>
        )
    }
}

export default TeamPage