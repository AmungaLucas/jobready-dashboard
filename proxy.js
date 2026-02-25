import { NextResponse } from 'next/server';
import { adminAuth } from './src/lib/firebaseAdmin';

export async function proxy(request) {
  const session = request.cookies.get('session')?.value || '';
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/unauthorized'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Define role-based paths with more granularity
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
      console.error(`Role mismatch: User with role ${userRole} tried to access ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Proxy request to backend service or API if needed
    const proxyResponse = await proxyRequest(request);

    // Return the proxied response
    return proxyResponse;

  } catch (error) {
    // No valid session or role mismatch
    console.error('Session verification failed or user unauthorized:', error);
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
    console.error('Session verification failed:', error);
    throw new Error('Invalid session');
  }
}

async function proxyRequest(request) {
  const proxyUrl = 'https://your-proxy-service.com/api';  // Replace with your actual proxy URL

  const headers = {
    ...request.headers,  // Forward original headers
    'Authorization': `Bearer ${request.cookies.get('session')?.value}`,
  };

  const proxyRes = await fetch(proxyUrl, {
    method: 'GET',  // or POST/PUT based on your needs
    headers,
    // If the method is POST, you may need to forward body content as well
  });

  const responseBody = await proxyRes.json();
  return NextResponse.json(responseBody);  // Send the response from the proxy
}

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/editorial-dashboard/:path*',
    '/moderators-dashboard/:path*',
    '/',
  ],
};