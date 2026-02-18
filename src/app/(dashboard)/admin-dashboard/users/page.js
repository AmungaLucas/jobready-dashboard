import React from 'react'
import { adminDb } from '../../../../lib/firebaseAdmin'
import UserActions from './_components/UserActions'
import UserTooltip from './_components/UserTooltip'

const UsersPage = async () => {
    async function getUsers() {
        try {
            const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get()
            const users = []
            snapshot.forEach((doc) => {
                const d = doc.data() || {}
                const createdAt = d.createdAt ? (typeof d.createdAt.toDate === 'function' ? d.createdAt.toDate().toISOString() : String(d.createdAt)) : ''
                const lastLogin = d.lastLogin ? (typeof d.lastLogin.toDate === 'function' ? d.lastLogin.toDate().toISOString() : String(d.lastLogin)) : ''
                const avatar = d.avatar || d.avater || ''

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
            return users
        } catch (error) {
            console.error('Error fetching users from Firestore:', error)
            return []
        }
    }

    const users = await getUsers()

    return (
        <div className="px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-xl sm:text-2xl font-semibold">Users</h1>
                <div className="text-sm text-gray-500">
                    Total: <span className="font-medium">{users.length}</span> users
                </div>
            </div>

            {users.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">No users found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Desktop Table View - Hidden on mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Info
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="shrink-0 h-10 w-10">
                                                    {u.avatar ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={u.avatar}
                                                            alt={u.name || 'avatar'}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                            {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {u.name || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{u.email || '—'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    u.role === 'editor' ? 'bg-green-100 text-green-800' :
                                                        u.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {u.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <UserTooltip
                                                uid={u.uid}
                                                createdAt={u.createdAt}
                                                lastLogin={u.lastLogin}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <UserActions id={u.id} uid={u.uid} role={u.role} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View - Visible only on mobile */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {users.map((u) => (
                            <div key={u.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="shrink-0">
                                            {u.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={u.avatar}
                                                    alt={u.name || 'avatar'}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{u.name || '—'}</div>
                                            <div className="text-sm text-gray-500 break-all">{u.email || '—'}</div>
                                        </div>
                                    </div>
                                    <UserTooltip
                                        uid={u.uid}
                                        createdAt={u.createdAt}
                                        lastLogin={u.lastLogin}
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                u.role === 'editor' ? 'bg-green-100 text-green-800' :
                                                    u.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {u.role || 'user'}
                                        </span>
                                    </div>
                                    <UserActions id={u.id} uid={u.uid} role={u.role} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersPage