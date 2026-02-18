"use client"

import { useState } from 'react'
import UserTooltip from '../users/_components/UserTooltip'

export default function TeamsClient({ counts, groups }) {
    const tabs = ['admins', 'editors', 'moderators']
    const [active, setActive] = useState('admins')

    const tabLabels = {
        admins: 'Admins',
        editors: 'Editors',
        moderators: 'Moderators'
    }

    const tabColors = {
        admins: 'purple',
        editors: 'green',
        moderators: 'blue'
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tabs.map((tab) => (
                    <div
                        key={tab}
                        className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setActive(tab)}
                    >
                        <div className={`text-sm font-medium text-${tabColors[tab]}-600 mb-1`}>
                            {tabLabels[tab]}
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {counts[tab]}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            team members
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex min-w-max sm:min-w-0">
                    {tabs.map((t) => (
                        <button
                            key={t}
                            onClick={() => setActive(t)}
                            className={`
                                px-4 sm:px-6 py-3 text-sm font-medium transition-colors relative
                                ${active === t
                                    ? `text-${tabColors[t]}-600 border-b-2 border-${tabColors[t]}-600`
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tabLabels[t]}
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full 
                                ${active === t
                                    ? `bg-${tabColors[t]}-100 text-${tabColors[t]}-800`
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {counts[t]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Team Members List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {(groups[active] || []).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No users in this role.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {groups[active].map((u) => (
                            <div key={u.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        {/* Avatar */}
                                        <div className="shrink-0">
                                            {u.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={u.avatar}
                                                    alt={u.name || 'avatar'}
                                                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-gray-200"
                                                />
                                            ) : (
                                                <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-linear-to-r from-${tabColors[active]}-500 to-${tabColors[active]}-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md`}>
                                                    {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                    {u.name || '—'}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                                    ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        u.role === 'editor' ? 'bg-green-100 text-green-800' :
                                                            u.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'}`}
                                                >
                                                    {u.role || 'user'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate mt-1">
                                                {u.email || '—'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions and Tooltip */}
                                    <div className="flex items-center gap-3 ml-0 sm:ml-4">
                                        <UserTooltip
                                            uid={u.uid}
                                            createdAt={u.createdAt}
                                            lastLogin={u.lastLogin}
                                        />
                                        {active === 'editors' ? (
                                            <a
                                                href={`/admin-dashboard/team/editors/${u.id}`}
                                                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                View Profile
                                            </a>
                                        ) : (
                                            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                View
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}