import { NextRequest, NextResponse } from 'next/server';

// Set in .env.local (dev) / Vercel env (prod) — e.g. "keremtatar.com".
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

// Hosts that should be treated as the apex site, not a restaurant subdomain.
const APEX_HOSTS = new Set([ROOT_DOMAIN, `www.${ROOT_DOMAIN}`, 'localhost:3000', '127.0.0.1:3000']);

export function proxy(req: NextRequest) {
    const host = req.headers.get('host') || '';
    const { pathname } = req.nextUrl;

    if (APEX_HOSTS.has(host)) {
        return NextResponse.next();
    }

    // Local dev: any-slug.localhost:3000. Prod: any-slug.<ROOT_DOMAIN>.
    const suffix = host.endsWith(`.${ROOT_DOMAIN}`) ? `.${ROOT_DOMAIN}` : null;
    if (!suffix) {
        return NextResponse.next();
    }

    const slug = host.slice(0, -suffix.length);
    if (!slug || slug === 'www') {
        return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = `/sites/${slug}${pathname}`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ['/((?!_next|api|favicon.ico).*)'],
};
