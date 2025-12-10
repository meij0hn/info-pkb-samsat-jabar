import { NextResponse } from 'next/server';

// ============ RATE LIMITING ============
// In-memory store for rate limiting (resets on server restart)
// For production, consider using Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // Max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    // Clean up expired records
    if (record && now > record.resetTime) {
        rateLimitStore.delete(ip);
    }

    const currentRecord = rateLimitStore.get(ip);

    if (!currentRecord) {
        // First request from this IP
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
    }

    if (currentRecord.count >= RATE_LIMIT_MAX) {
        // Rate limit exceeded
        return { allowed: false, remaining: 0, resetIn: currentRecord.resetTime - now };
    }

    // Increment count
    currentRecord.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX - currentRecord.count, resetIn: currentRecord.resetTime - now };
}

// ============ INPUT VALIDATION ============

function validatePlate(plate: string): { valid: boolean; sanitized: string; error?: string } {
    // Remove extra whitespace and convert to uppercase
    const sanitized = plate.trim().toUpperCase().replace(/\s+/g, ' ');

    if (sanitized.length < 2 || sanitized.length > 12) {
        return { valid: false, sanitized, error: 'Plat nomor harus 2-12 karakter' };
    }

    return { valid: true, sanitized };
}

function validateColorCode(color: string): boolean {
    // Valid color codes: 1-5
    return /^[1-5]$/.test(color);
}

// ============ TURNSTILE VERIFICATION ============
async function verifyTurnstileToken(token: string, ip: string): Promise<{ success: boolean; error?: string }> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        return { success: false, error: 'Konfigurasi keamanan tidak lengkap' };
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);
        formData.append('remoteip', ip);

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const result = await response.json();

        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: 'Verifikasi keamanan gagal. Silakan refresh halaman.' };
        }
    } catch {
        return { success: false, error: 'Gagal memverifikasi keamanan' };
    }
}

// ============ MAIN HANDLER ============
export async function GET(request: Request) {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Check rate limit
    const rateLimit = getRateLimitInfo(ip);
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil(rateLimit.resetIn / 1000)} detik.` },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString()
                }
            }
        );
    }

    const { searchParams } = new URL(request.url);
    const plate = searchParams.get('plate');
    const colorCode = searchParams.get('color') || '1';
    const turnstileToken = searchParams.get('cf-turnstile-response');

    // Verify Turnstile token
    if (!turnstileToken) {
        return NextResponse.json({ error: 'Verifikasi keamanan diperlukan' }, { status: 400 });
    }

    const turnstileVerification = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileVerification.success) {
        return NextResponse.json({ error: turnstileVerification.error }, { status: 403 });
    }

    // Validate plate
    if (!plate) {
        return NextResponse.json({ error: 'Plat nomor wajib diisi' }, { status: 400 });
    }

    const plateValidation = validatePlate(plate);
    if (!plateValidation.valid) {
        return NextResponse.json({ error: plateValidation.error }, { status: 400 });
    }

    // Validate color code
    if (!validateColorCode(colorCode)) {
        return NextResponse.json({ error: 'Kode warna tidak valid (1-5)' }, { status: 400 });
    }

    const targetUrl = new URL('https://sambara-v2.bapenda.jabarprov.go.id/api/renew-sambara/v2/get-info-pkb');
    targetUrl.searchParams.append('no_polisi', plateValidation.sanitized);
    targetUrl.searchParams.append('kd_plat', colorCode);

    try {
        const response = await fetch(targetUrl.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': process.env.SAMSAT_API_AUTH || '',
                'Referer': 'https://sambara-v2.bapenda.jabarprov.go.id/',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            // Don't expose internal API details - just return generic error
            return NextResponse.json(
                { error: 'Gagal mengambil data dari Bapenda. Silakan coba lagi.' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch {
        // Don't expose internal error details
        return NextResponse.json({ error: 'Terjadi kesalahan server. Silakan coba lagi.' }, { status: 500 });
    }
}
