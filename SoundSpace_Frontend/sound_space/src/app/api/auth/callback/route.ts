import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token        = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');

    if (token) {
        const response = NextResponse.redirect(new URL('/profile', request.url));

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

    return NextResponse.redirect(new URL('/landing', request.url));
}

