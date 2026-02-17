'use client'

import { useState } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function UserActions({ id, uid, role }) {
    const [isEditing, setIsEditing] = useState(false)
    const [selectedRole, setSelectedRole] = useState(role || 'user')
    const [isLoading, setIsLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const roles = [
        { value: 'admin', label: 'Admin', color: 'purple' },
        { value: 'editor', label: 'Editor', color: 'green' },
        { value: 'moderator', label: 'Moderator', color: 'blue' },
        { value: 'user', label: 'User', color: 'gray' },
    ]

    const handleRoleUpdate = async () => {
        if (selectedRole === role) {
            setIsEditing(false)
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/users/updateRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: id,
                    uid: uid,
                    newRole: selectedRole,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update role')
            }

            // Refresh the page or update local state
            window.location.reload()
        } catch (error) {
            console.error('Error updating role:', error)
            alert('Failed to update role. Please try again.')
        } finally {
            setIsLoading(false)
            setIsEditing(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/users/delete?userId=${id}&uid=${uid}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete user')
            }

            // Refresh the page or update local state
            window.location.reload()
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Failed to delete user. Please try again.')
        } finally {
            setIsLoading(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    >
                        {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleRoleUpdate}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                        className="text-gray-600 hover:text-gray-800 text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit role"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete user"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}