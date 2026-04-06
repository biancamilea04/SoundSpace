import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export async function POST() {
    try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error('[Logout Proxy] Backend logout failed:', e);
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set('access_token', '', {
        path: '/',
        maxAge: 0,
    });

    response.cookies.set('refresh_token', '', {
        path: '/',
        maxAge: 0,
    });

    return response;
}
