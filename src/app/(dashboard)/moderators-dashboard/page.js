'use client';

import { ProtectedRoute } from '@/routes/ProtectedRoute';

export default function ModeratorsDashboard() {
  return (
    <ProtectedRoute allowedRoles={['moderator', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Moderator Dashboard</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Reports */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Reports</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">Spam comment detected</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Reported by: John Doe</p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    Reject
                  </button>
                  <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
                    Ignore
                  </button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">Inappropriate content</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Reported by: Jane Smith</p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    Reject
                  </button>
                  <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
                    Ignore
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Comments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Comments</h3>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-sm font-medium">"Great article! Very helpful..."</p>
                <p className="text-xs text-gray-500 mt-1">
                  By: user123 • 5 minutes ago
                </p>
                <div className="flex space-x-2 mt-2">
                  <button className="text-xs text-green-600 hover:text-green-700">Approve</button>
                  <button className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                </div>
              </div>
              
              <div className="border-b pb-3">
                <p className="text-sm font-medium">"Check out my website for more..."</p>
                <p className="text-xs text-gray-500 mt-1">
                  By: spambot • 15 minutes ago
                </p>
                <div className="flex space-x-2 mt-2">
                  <button className="text-xs text-green-600 hover:text-green-700">Approve</button>
                  <button className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}