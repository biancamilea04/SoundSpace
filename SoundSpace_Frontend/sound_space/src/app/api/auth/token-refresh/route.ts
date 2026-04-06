import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
        return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    let data: { accessToken: string; refreshToken: string };

    try {
        const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!backendRes.ok) {
            return NextResponse.json({ error: 'Refresh rejected' }, { status: 401 });
        }

        data = await backendRes.json();
    } catch {
        return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ ok: true });

    response.cookies.set('access_token', data.accessToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60,
    });

    response.cookies.set('refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}
