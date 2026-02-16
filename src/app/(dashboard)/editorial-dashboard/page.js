'use client';

import { ProtectedRoute } from '@/routes/ProtectedRoute';

export default function EditorialDashboard() {
  return (
    <ProtectedRoute allowedRoles={['editor', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Editorial Dashboard</h1>
            <p className="text-gray-500">
              Manage content, track performance, and publish faster.
            </p>
          </div>

          {/* Primary CTA */}
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow">
            + New Post
          </button>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Views */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Views Today</p>
            <h2 className="text-3xl font-bold mt-2">1,234</h2>
            <p className="text-green-600 text-sm mt-1">↑ 12% from yesterday</p>
          </div>

          {/* Engagement */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Engagement Rate</p>
            <h2 className="text-3xl font-bold mt-2">12.5%</h2>
            <p className="text-green-600 text-sm mt-1">↑ 2.3% this week</p>
          </div>

          {/* Drafts */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Draft Posts</p>
            <h2 className="text-3xl font-bold mt-2">8</h2>
            <p className="text-gray-500 text-sm mt-1">Awaiting review</p>
          </div>

        </div>

        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================= LEFT SIDE — RECENT POSTS ================= */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-6">Recent Posts</h3>

            <div className="space-y-5">

              {/* Post Item */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-semibold">Getting Started with Next.js</p>
                  <p className="text-sm text-gray-500">Published 2 hours ago</p>
                </div>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  Published
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-semibold">Firebase Authentication Guide</p>
                  <p className="text-sm text-gray-500">Last edited yesterday</p>
                </div>
                <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  Draft
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Role-Based Access Control</p>
                  <p className="text-sm text-gray-500">Waiting approval</p>
                </div>
                <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Review
                </span>
              </div>

            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-5">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Create New Post
                </button>

                <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  Upload Media
                </button>

                <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                  Schedule Content
                </button>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-5">Content Performance</h3>

              {/* Views Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span>Daily Views</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: '45%' }}
                  />
                </div>
              </div>

              {/* Engagement */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Engagement</span>
                  <span className="font-semibold">12.5%</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: '12.5%' }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}
