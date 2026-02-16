import { NextResponse } from 'next/server';
import { adminAuth } from './src/lib/firebaseAdmin';

export async function middleware(request) {
  const session = request.cookies.get('session')?.value || '';
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/unauthorized'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Define role-based paths
  const rolePaths = {
    '/admin-dashboard': ['admin'],
    '/editorial-dashboard': ['editor', 'admin'],
    '/moderators-dashboard': ['moderator', 'admin'],
  };

  // Check if the path requires specific roles
  const requiredRoles = Object.entries(rolePaths).find(([path]) => 
    pathname.startsWith(path)
  )?.[1];

  if (!requiredRoles) {
    return NextResponse.next();
  }

  try {
    // Verify the session token
    const decodedClaims = await verifySession(session);
    const userRole = decodedClaims.role;

    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // No valid session, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

async function verifySession(session) {
  if (!session) {
    throw new Error('No session');
  }
  
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    throw new Error('Invalid session');
  }
}

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/editorial-dashboard/:path*',
    '/moderators-dashboard/:path*',
    '/',
  ],
};