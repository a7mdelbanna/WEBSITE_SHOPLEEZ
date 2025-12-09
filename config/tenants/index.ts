/**
 * Tenant Configuration Loader
 *
 * This module handles tenant resolution by domain and provides
 * access to tenant configurations.
 */

import type { TenantConfig } from '@/types/tenant';
import { store1Config } from './store1';
import { store20Config } from './store20';
import { store22Config } from './store22';
import { store23Config } from './store23';

// All tenant configurations
export const tenants: Record<string, TenantConfig> = {
  store1: store1Config,
  store20: store20Config,
  store22: store22Config,
  store23: store23Config,
};

// Build domain to tenant mapping
const domainMap: Record<string, string> = {};
Object.values(tenants).forEach((tenant) => {
  tenant.domains.forEach((domain) => {
    // Normalize domain (lowercase, no trailing slash)
    const normalizedDomain = domain.toLowerCase().replace(/\/$/, '');
    domainMap[normalizedDomain] = tenant.id;
  });
});

/**
 * Get tenant configuration by domain
 */
export function getTenantByDomain(domain: string): TenantConfig | null {
  // Normalize the input domain
  const normalizedDomain = domain.toLowerCase().replace(/\/$/, '');

  // Try exact match first
  const tenantId = domainMap[normalizedDomain];
  if (tenantId) {
    return tenants[tenantId];
  }

  // Try without port for development
  const domainWithoutPort = normalizedDomain.split(':')[0];
  const tenantIdWithoutPort = Object.entries(domainMap).find(
    ([d]) => d.split(':')[0] === domainWithoutPort
  )?.[1];

  if (tenantIdWithoutPort) {
    return tenants[tenantIdWithoutPort];
  }

  return null;
}

/**
 * Get tenant configuration by ID
 */
export function getTenantById(id: string): TenantConfig | null {
  return tenants[id] || null;
}

/**
 * Get tenant configuration by store ID (numeric)
 */
export function getTenantByStoreId(storeId: number): TenantConfig | null {
  return Object.values(tenants).find((t) => t.storeId === storeId) || null;
}

/**
 * Get the default tenant (store1)
 */
export function getDefaultTenant(): TenantConfig {
  return store1Config;
}

/**
 * Get all tenant IDs
 */
export function getAllTenantIds(): string[] {
  return Object.keys(tenants);
}

/**
 * Check if a domain belongs to a known tenant
 */
export function isValidTenantDomain(domain: string): boolean {
  return getTenantByDomain(domain) !== null;
}

// Re-export individual configs for direct access if needed
export { store1Config, store20Config, store22Config, store23Config };
