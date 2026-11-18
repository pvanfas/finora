import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';

const neonMiddleware = auth.middleware({ loginUrl: '/login' });

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, auth API endpoints, static assets, and files with extensions
  if (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    /\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|woff|woff2|ttf|eot)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const res = await neonMiddleware(request);

  // For API endpoints, return JSON 401 Unauthorized instead of redirecting to login page HTML
  if (pathname.startsWith('/api/') && (res.status === 307 || res.status === 302 || res.headers.has('location'))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return res;
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Static asset files with extensions (.png, .ico, .svg, etc.)
     */
    '/((?!_next/static|_next/image|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
