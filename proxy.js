import { NextResponse } from 'next/server';

export async function GET(request) {
  return handleProxy(request);
}

export async function POST(request) {
  return handleProxy(request);
}

export async function PUT(request) {
  return handleProxy(request);
}

export async function DELETE(request) {
  return handleProxy(request);
}

async function handleProxy(request) {
  try {
    // Dynamically import Firebase Admin
    const { adminAuth } = await import('@/lib/firebaseAdmin');

    const session = request.cookies.get('session')?.value || '';
    const pathname = request.nextUrl.pathname.replace('/api/proxy', ''); // Adjust based on your route structure

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

    // Verify the session token
    const decodedClaims = await verifySession(session, adminAuth);
    const userRole = decodedClaims.role;

    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      console.error(`Role mismatch: User with role ${userRole} tried to access ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Proxy request to backend service or API if needed
    const proxyResponse = await proxyRequest(request, session);

    // Return the proxied response
    return proxyResponse;

  } catch (error) {
    // No valid session or role mismatch
    console.error('Session verification failed or user unauthorized:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

async function verifySession(session, adminAuth) {
  if (!session) {
    throw new Error('No session');
  }

  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    console.error('Session verification failed:', error);
    throw new Error('Invalid session');
  }
}

async function proxyRequest(request, session) {
  const proxyUrl = 'https://your-proxy-service.com/api';  // Replace with your actual proxy URL

  const headers = {
    ...Object.fromEntries(request.headers),  // Forward original headers
    'Authorization': `Bearer ${session}`,
  };

  // Clone the request to get body if needed
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.json();
    } catch (e) {
      // No body or invalid JSON
    }
  }

  const proxyRes = await fetch(proxyUrl + request.nextUrl.pathname.replace('/api/proxy', ''), {
    method: request.method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseBody = await proxyRes.json();
  return NextResponse.json(responseBody, { status: proxyRes.status });
}