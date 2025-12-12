/**
 * Next.js Middleware for Tenant Resolution
 *
 * This middleware runs on every request and resolves the tenant
 * based on the domain/hostname.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We can't import from @/ in middleware, so we inline the tenant domains
// This should be kept in sync with config/tenants/index.ts
const TENANT_DOMAINS: Record<string, { tenantId: string; storeId: number }> = {
  // Store 1 - El-Etihad
  'ettihad.shopleez.com': { tenantId: 'store1', storeId: 1 },
  'store1.shopleez.com': { tenantId: 'store1', storeId: 1 },
  'localhost:3000': { tenantId: 'store1', storeId: 1 },
  'localhost:3001': { tenantId: 'store1', storeId: 1 },
  'localhost:8080': { tenantId: 'store1', storeId: 1 },

  // Store 20 - Alam El-Gomla
  'alamelgomla.shopleez.com': { tenantId: 'store20', storeId: 20 },
  'store20.shopleez.com': { tenantId: 'store20', storeId: 20 },
  'localhost:3002': { tenantId: 'store20', storeId: 20 },

  // Store 22 - Shakaleta
  'shakaleta.shopleez.com': { tenantId: 'store22', storeId: 22 },
  'store22.shopleez.com': { tenantId: 'store22', storeId: 22 },
  'localhost:3003': { tenantId: 'store22', storeId: 22 },

  // Store 23 - Ezzat
  'ezzat.shopleez.com': { tenantId: 'store23', storeId: 23 },
  'store23.shopleez.com': { tenantId: 'store23', storeId: 23 },
  'localhost:3004': { tenantId: 'store23', storeId: 23 },
};

// Default tenant for unknown domains
const DEFAULT_TENANT = { tenantId: 'store1', storeId: 1 };

export function middleware(request: NextRequest) {
  // Get the hostname from the request
  const host = request.headers.get('host') || '';
  const normalizedHost = host.toLowerCase();

  // Resolve tenant from domain
  let tenant = TENANT_DOMAINS[normalizedHost];

  // Try without port if not found
  if (!tenant) {
    const hostWithoutPort = normalizedHost.split(':')[0];
    tenant = Object.entries(TENANT_DOMAINS).find(
      ([domain]) => domain.split(':')[0] === hostWithoutPort
    )?.[1] || DEFAULT_TENANT;
  }

  // Clone the response
  const response = NextResponse.next();

  // Add tenant info to headers (accessible in server components)
  response.headers.set('x-tenant-id', tenant.tenantId);
  response.headers.set('x-store-id', tenant.storeId.toString());

  // Also set cookies for client-side access
  response.cookies.set('tenant-id', tenant.tenantId, {
    path: '/',
    sameSite: 'lax',
  });
  response.cookies.set('store-id', tenant.storeId.toString(), {
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|tenants/).*)',
  ],
};
