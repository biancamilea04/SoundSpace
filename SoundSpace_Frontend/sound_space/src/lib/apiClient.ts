import { getAccessTokenCookie, refreshAccessToken } from '@/services/auth/authService';

type FetchInput  = Parameters<typeof fetch>[0];
type FetchInit   = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> };

export async function apiFetch(input: FetchInput, init: FetchInit = {}): Promise<Response> {
    const token = getAccessTokenCookie();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let response = await fetch(input, { ...init, headers });

    if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (!newToken) {
            if (typeof window !== 'undefined') {
                window.location.href = '/landing';
            }
            return response;
        }

        const retryHeaders: Record<string, string> = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(input, { ...init, headers: retryHeaders });
    }

    return response;
}
