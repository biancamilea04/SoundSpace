import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token) {
        const response = NextResponse.redirect(new URL(`/profile?token=${token}`, request.url));
        
        response.cookies.set('auth_token', token, {
            httpOnly: false, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return response;
    }

    return NextResponse.redirect(new URL('/landing', request.url));
}
