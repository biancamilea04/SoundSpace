import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/landing', '/auth', '/login'];

const TOKEN = 'access_token';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    const token = request.cookies.get(TOKEN)?.value;

    if (!token) {
        const redirectUrl = new URL('/landing', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons).*)',
    ],
};
