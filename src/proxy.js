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

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('authToken')?.value;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';

  // --- 1. LOCALE & REDIRECTION LOGIC ---
  const getLocale = () => {
    const segment = pathname.split('/')[1];
    return locales.includes(segment) ? segment : defaultLocale;
  };

  const currentLocale = getLocale();
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If the pathname explicitly starts with /en, 301 redirect to clean version
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPathname = pathname.replace('/en', '') || '/';
    return NextResponse.redirect(new URL(newPathname, request.url), 301);
  }

  // Helper to check path regardless of locale
  const matchesPath = (path) => {
    // Check if it's the root path (missing locale)
    if (pathname === path || pathname.startsWith(`${path}/`)) return true;
    // Or if it has a locale prefix
    return locales.some(locale => 
      pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`)
    );
  };

  // --- 2. RATE LIMITING LOGIC ---
  const sensitivePaths = [
    '/register-business',
    '/register',
    '/api/auth',
  ];

  const isSensitive = sensitivePaths.some((path) => matchesPath(path) || pathname.startsWith(path));

  if (isSensitive) {
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
  }

  // --- 3. ROUTE PROTECTION LOGIC ---
  if (matchesPath('/dashboard')) {
    if (!authToken) {
      const loginPath = currentLocale === 'en' ? '/login' : `/${currentLocale}/login`;
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  if (matchesPath('/submit-listing')) {
    if (!authToken) {
      const loginPath = currentLocale === 'en' ? '/login' : `/${currentLocale}/login`;
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  // --- 4. SUCCESS & SECURITY HEADERS ---
  let response;
  
  // Create an exclusion check for API routes and static files
  const isExcluded = pathname.startsWith('/_next') || 
                     pathname.startsWith('/api') || 
                     pathname.includes('.'); // Detects file extensions like .xml, .svg, .jpg

  if (pathnameIsMissingLocale && !isExcluded) {
    // Secretly rewrite to /en under the hood for Next.js routing
    response = NextResponse.rewrite(
      new URL(`/${defaultLocale}${pathname}${request.nextUrl.search}`, request.url)
    );
  } else {
    response = NextResponse.next();
  }

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
