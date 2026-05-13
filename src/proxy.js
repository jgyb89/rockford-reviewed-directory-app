import { NextResponse } from 'next/server';

/**
 * Next.js Edge Logic (proxy.js)
 * Consolidated handling for:
 * 1. Locale Redirection
 * 2. Rate Limiting (IP-based)
 * 3. Route Protection (Dashboard & Submit Listing)
 * 4. Security Headers
 */

// Basic in-memory rate limiter for Edge Functions
const rateLimitMap = new Map();

const locales = ['en', 'es'];
const defaultLocale = 'en';

// --- HELPERS ---

/**
 * Helper to check path regardless of locale
 */
function matchesPath(pathname, path) {
  if (pathname === path || pathname.startsWith(`${path}/`)) return true;
  return locales.some(locale => 
    pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`)
  );
}

/**
 * Get the current locale from the pathname
 */
function getLocale(pathname) {
  const segment = pathname.split('/')[1];
  return locales.includes(segment) ? segment : defaultLocale;
}

/**
 * 1. Rate Limiting Logic
 */
function applyRateLimit(ip, pathname) {
  const sensitivePaths = ['/register-business', '/register', '/api/auth'];
  const isSensitive = sensitivePaths.some((path) => matchesPath(pathname, path) || pathname.startsWith(path));

  if (!isSensitive) return null;

  const limit = 10;
  const windowMs = 60 * 1000;
  const now = Date.now();
  const userUsage = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userUsage.lastReset > windowMs) {
    userUsage.count = 1;
    userUsage.lastReset = now;
  } else {
    userUsage.count++;
  }

  rateLimitMap.set(ip, userUsage);

  if (userUsage.count > limit) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'Content-Type': 'text/plain', 'Retry-After': '60' },
    });
  }
  return null;
}

/**
 * 2. Authentication / Protected Route Logic
 */
function handleAuthRedirects(request, pathname, authToken) {
  const protectedPaths = ['/dashboard', '/submit-listing'];
  const isProtected = protectedPaths.some(path => matchesPath(pathname, path));

  if (isProtected && !authToken) {
    const currentLocale = getLocale(pathname);
    const loginPath = currentLocale === 'en' ? '/login' : `/${currentLocale}/login`;
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  return null;
}

/**
 * Main Middleware Export
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('authToken')?.value;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';

  // A. Check Rate Limiting
  const rateLimitResponse = applyRateLimit(ip, pathname);
  if (rateLimitResponse) return rateLimitResponse;

  // B. Check Auth Redirects
  const authResponse = handleAuthRedirects(request, pathname, authToken);
  if (authResponse) return authResponse;

  // C. Handle Locale Logic & Header Injection
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPathname = pathname.replace('/en', '') || '/';
    return NextResponse.redirect(new URL(newPathname, request.url), 301);
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  const isExcluded = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  let response;
  if (pathnameIsMissingLocale && !isExcluded) {
    response = NextResponse.rewrite(
      new URL(`/${defaultLocale}${pathname}${request.nextUrl.search}`, request.url),
      { request: { headers: requestHeaders } }
    );
  } else {
    response = NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // D. Add Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const proxy = middleware;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
