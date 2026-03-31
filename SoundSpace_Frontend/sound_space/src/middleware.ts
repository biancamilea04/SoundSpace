import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that do not require authentication
const publicRoutes = ['/landing', '/auth', '/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is explicitly public
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Retrieve the auth_token cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // User is not authenticated, redirect to the /landing page
        const redirectUrl = new URL('/landing', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // Proceed if authenticated
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (static files)
         * - icons (public images in public/icons)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons).*)',
    ],
};
