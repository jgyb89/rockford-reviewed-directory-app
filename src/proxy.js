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
  // Check if it's the root path (missing locale)
  if (pathname === path || pathname.startsWith(`${path}/`)) return true;
  // Or if it has a locale prefix
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
  const sensitivePaths = [
    '/register-business',
    '/register',
    '/api/auth',
  ];

  const isSensitive = sensitivePaths.some((path) => matchesPath(pathname, path) || pathname.startsWith(path));

  if (!isSensitive) return null;

  const limit = 10; // Max requests per minute
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
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '60',
      },
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
 * 3. Locale / Internationalization Rewrite Logic
 */
function handleLocaleRouting(request, pathname) {
  // If the pathname explicitly starts with /en, 301 redirect to clean version
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPathname = pathname.replace('/en', '') || '/';
    return NextResponse.redirect(new URL(newPathname, request.url), 301);
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Create an exclusion check for API routes and static files
  const isExcluded = pathname.startsWith('/_next') || 
                     pathname.startsWith('/api') || 
                     pathname.includes('.'); // Detects file extensions like .xml, .svg, .jpg

  if (pathnameIsMissingLocale && !isExcluded) {
    // Secretly rewrite to /en under the hood for Next.js routing
    return NextResponse.rewrite(
      new URL(`/${defaultLocale}${pathname}${request.nextUrl.search}`, request.url)
    );
  }

  return NextResponse.next();
}

/**
 * Main Middleware Export
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('authToken')?.value;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';

  // 1. Apply Rate Limiting
  const rateLimitResponse = applyRateLimit(ip, pathname);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Handle Protected Route Redirects
  const authResponse = handleAuthRedirects(request, pathname, authToken);
  if (authResponse) return authResponse;

  // 3. Handle Locale Routing & Rewrites
  const response = handleLocaleRouting(request, pathname);

  // 4. Add Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

// Export as 'proxy' to satisfy specific framework conventions if necessary
export const proxy = middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
