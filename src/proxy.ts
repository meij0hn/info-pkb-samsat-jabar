import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============ CORS CONFIGURATION ============
// Restrict API access to specific origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    // Add your production domain here:
    // 'https://yourdomain.com',
];

// Check if origin is allowed
function isAllowedOrigin(origin: string | null): boolean {
    if (!origin) return true; // Allow requests without origin (same-origin, curl, etc.)
    return allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed));
}

export function proxy(request: NextRequest) {
    const origin = request.headers.get('origin');
    const response = NextResponse.next();

    // Only apply CORS headers to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {

        // Check origin
        if (origin && !isAllowedOrigin(origin)) {
            return new NextResponse(
                JSON.stringify({ error: 'Origin not allowed' }),
                {
                    status: 403,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Set CORS headers for allowed origins
        if (origin && isAllowedOrigin(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        }

        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': origin || '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }
    }

    return response;
}

// Only run middleware on API routes
export const config = {
    matcher: '/api/:path*',
};
