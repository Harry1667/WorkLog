import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns null if authorized, or a 401 NextResponse if not.
 * Browser requests (same-origin) are allowed without a token.
 * External CLI requests must send: Authorization: Bearer <LOG_API_KEY>
 */
export function checkAuth(req: NextRequest): NextResponse | null {
  const fetchSite = req.headers.get('sec-fetch-site');
  // Same-origin browser requests are always allowed
  if (fetchSite === 'same-origin' || fetchSite === 'none') return null;

  const apiKey = process.env.LOG_API_KEY;
  if (!apiKey) {
    // No key configured — deny external requests to avoid accidental open access
    return NextResponse.json({ error: 'Server not configured for external access' }, { status: 500 });
  }

  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
