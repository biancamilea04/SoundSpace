import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

const resolveProfileRedirectPath = async (token: string): Promise<string> => {
    if (!BACKEND_URL) {
        return '/';
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return '/';
        }

        const data = (await response.json()) as { displayName?: unknown };
        const displayName =
            typeof data.displayName === 'string' ? data.displayName.trim() : '';

        if (!displayName) {
            return '/';
        }

        return `/profile/${encodeURIComponent(displayName)}`;
    } catch {
        return '/';
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token        = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');

    // No token means Spotify auth was cancelled or failed (access_denied, unauthenticated, etc.)
    if (!token) {
        const landingUrl = new URL('/landing', request.url);
        landingUrl.searchParams.set('error', 'spotify_cancelled');
        return NextResponse.redirect(landingUrl);
    }

    const redirectPath = await resolveProfileRedirectPath(token);
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('access_token', token, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60,
    });

    if (refreshToken) {
        response.cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
    }

    return response;
}
