import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch total users
    const usersSnapshot = await adminDb.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Fetch active users (logged in within last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const activeUsersSnapshot = await adminDb.collection('users')
      .where('lastLogin', '>=', oneDayAgo)
      .get();
    const activeUsers = activeUsersSnapshot.size;

    // Fetch recent activity (you'll need to have an activity collection)
    const recentActivity = [
      { action: 'New user registered', time: '5 minutes ago', details: 'john@example.com' },
      { action: 'Post published', time: '1 hour ago', details: 'Getting Started with Next.js' },
      { action: 'Comment reported', time: '2 hours ago', details: 'Spam detected in comments' },
      { action: 'User role updated', time: '3 hours ago', details: 'editor@example.com promoted to admin' },
    ];

    const stats = {
      totalUsers,
      activeUsers,
      totalPosts: 150, // Replace with actual count
      totalComments: 450, // Replace with actual count
      recentActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}