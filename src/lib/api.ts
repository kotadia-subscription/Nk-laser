/**
 * NK Laser Frontend API Client
 * Connects React storefront and secure Admin Console to the Node.js Express backend.
 */

import { 
  ProductItem, 
  ProductCategoryDef, 
  BrandItem, 
  ReviewItem, 
  InquiryRecord, 
  SiteSettings 
} from '../types';

const ADMIN_TOKEN_KEY = 'nk_laser_admin_jwt';

// =========================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// Enforces HttpOnly, SameSite=Strict cookies without leaking tokens to JS/localStorage
// =========================================================================

// In-memory session token fallback for iframe contexts where third-party cookies may be partitioned
let memorySessionToken: string | null = null;

export function getAdminToken(): string | null {
  return memorySessionToken;
}

export function setAdminToken(token: string | null): void {
  memorySessionToken = token;
  // Purge any legacy auth tokens or flags from client storage to prevent XSS exposure
  try {
    sessionStorage.removeItem('nk_laser_admin_jwt');
    sessionStorage.removeItem('nk_laser_admin_auth_token');
    sessionStorage.removeItem('nk_laser_admin_auth');
    sessionStorage.removeItem('nk_laser_admin_session');
    localStorage.removeItem('nk_laser_admin_jwt');
    localStorage.removeItem('nk_laser_admin_auth_token');
    localStorage.removeItem('nk_laser_admin_password_hash');
    localStorage.removeItem('nklaser_admin_password');
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (memorySessionToken) {
    headers['Authorization'] = `Bearer ${memorySessionToken}`;
  }
  return headers;
}

// =========================================================================
// 1. PUBLIC STOREFRONT API (Client-facing, read-only or rate-safe)
// =========================================================================

export async function fetchPublicSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.settings || null;
  } catch (err) {
    console.warn('API: Could not load live settings from server, using local fallback:', err);
    return null;
  }
}

export async function fetchPublicProducts(params?: {
  category?: string;
  brand?: string;
  power?: string;
  search?: string;
  inStock?: boolean;
  sort?: string;
}): Promise<ProductItem[] | null> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.brand && params.brand !== 'all') query.set('brand', params.brand);
    if (params?.power && params.power !== 'all') query.set('power', params.power);
    if (params?.search) query.set('search', params.search);
    if (params?.inStock) query.set('inStock', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.products) ? data.products : null;
  } catch (err) {
    console.warn('API: Could not load live products from server, using local fallback:', err);
    return null;
  }
}

export async function fetchPublicProduct(idOrSku: string): Promise<{ product: ProductItem; related: ProductItem[] } | null> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(idOrSku)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API: Could not load product detail from server:', err);
    return null;
  }
}

export async function fetchPublicCategories(): Promise<ProductCategoryDef[] | null> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.categories) ? data.categories : null;
  } catch (err) {
    console.warn('API: Could not load live categories from server:', err);
    return null;
  }
}

export async function fetchPublicBrands(): Promise<BrandItem[] | null> {
  try {
    const res = await fetch('/api/brands');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.brands) ? data.brands : null;
  } catch (err) {
    console.warn('API: Could not load live brands from server:', err);
    return null;
  }
}

export async function fetchPublicPowerRanges(): Promise<string[] | null> {
  try {
    const res = await fetch('/api/power-ranges');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.powerRanges) ? data.powerRanges : null;
  } catch (err) {
    console.warn('API: Could not load live power ranges:', err);
    return null;
  }
}

export async function fetchPublicReviews(): Promise<ReviewItem[] | null> {
  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.reviews) ? data.reviews : null;
  } catch (err) {
    console.warn('API: Could not load live reviews:', err);
    return null;
  }
}

export async function submitCustomerInquiry(inquiryData: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productOrService: string;
  message?: string;
  quantity?: number;
  material?: string;
  thickness?: string;
  source?: string;
}): Promise<{ success: boolean; message: string; inquiryId?: string }> {
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to submit inquiry' };
    }
    return { success: true, message: data.message || 'Inquiry submitted successfully', inquiryId: data.inquiryId };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error occurred while submitting inquiry' };
  }
}

export async function submitCustomerReview(reviewData: {
  clientName: string;
  companyName?: string;
  location?: string;
  rating: number;
  comment: string;
  projectType?: string;
}): Promise<{ success: boolean; message: string; review?: ReviewItem }> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to submit review' };
    }
    return { success: true, message: data.message || 'Review submitted successfully', review: data.review };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error occurred' };
  }
}

// =========================================================================
// 2. ADMIN AUTHENTICATION API (Secure verification & session tokens)
// =========================================================================

export async function adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.token) {
        setAdminToken(data.token);
      }
      return { success: true };
    }
    return { success: false, error: data.error || 'Invalid credentials' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to authentication server' };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/verify', {
      credentials: 'include',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache, no-store'
      }
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.authenticated);
  } catch (e) {
    return false;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders()
    });
  } catch (e) {
    // Ignore network errors on logout
  }
  setAdminToken(null);
}

export async function adminChangePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to update password' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}

// =========================================================================
// 3. PROTECTED ADMIN API (Enforced on backend via HttpOnly cookies)
// =========================================================================

async function adminFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers || {})
    }
  });
}

export async function fetchAdminInquiries(): Promise<InquiryRecord[]> {
  try {
    const res = await adminFetch('/api/admin/inquiries');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.inquiries) ? data.inquiries : [];
  } catch (err) {
    console.error('API: Failed to fetch confidential admin inquiries:', err);
    return [];
  }
}

export async function updateAdminInquiryStatus(id: string, status: InquiryRecord['status'], notes?: string): Promise<boolean> {
  try {
    const res = await adminFetch(`/api/admin/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function deleteAdminInquiry(id: string): Promise<boolean> {
  try {
    const res = await adminFetch(`/api/admin/inquiries/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function createAdminProduct(product: ProductItem): Promise<ProductItem | null> {
  try {
    const res = await adminFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.product || null;
  } catch (e) {
    console.error('API: Error creating product on server:', e);
    return null;
  }
}

export async function updateAdminProduct(id: string, product: Partial<ProductItem>): Promise<ProductItem | null> {
  try {
    const res = await adminFetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.product || null;
  } catch (e) {
    console.error('API: Error updating product on server:', e);
    return null;
  }
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  try {
    const res = await adminFetch(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function createAdminCategory(category: ProductCategoryDef): Promise<ProductCategoryDef | null> {
  try {
    const res = await adminFetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.category || null;
  } catch (e) {
    return null;
  }
}

export async function updateAdminCategory(id: string, category: Partial<ProductCategoryDef>): Promise<ProductCategoryDef | null> {
  try {
    const res = await adminFetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.category || null;
  } catch (e) {
    return null;
  }
}

export async function deleteAdminCategory(id: string): Promise<boolean> {
  try {
    const res = await adminFetch(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function saveAdminBrands(brands: BrandItem[]): Promise<boolean> {
  try {
    const res = await adminFetch('/api/admin/brands', {
      method: 'POST',
      body: JSON.stringify({ brands })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function saveAdminPowerRanges(powerRanges: string[]): Promise<boolean> {
  try {
    const res = await adminFetch('/api/admin/power-ranges', {
      method: 'POST',
      body: JSON.stringify({ powerRanges })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function saveAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
  try {
    const res = await adminFetch('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.settings || null;
  } catch (e) {
    console.error('API: Error saving settings on server:', e);
    return null;
  }
}

export async function publishAdminCatalog(payload: {
  settings?: SiteSettings;
  products?: ProductItem[];
  categories?: ProductCategoryDef[];
  brands?: BrandItem[];
  powerRanges?: string[];
  reviews?: ReviewItem[];
}): Promise<{ success: boolean; publishedAt?: string; message?: string }> {
  try {
    const res = await adminFetch('/api/admin/publish', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, publishedAt: data.publishedAt, message: data.message };
    }
    return { success: false, message: data.error || 'Failed to publish to server' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Publish network error' };
  }
}

export async function restoreAdminBackup(backup: any): Promise<{ success: boolean; message: string }> {
  try {
    const res = await adminFetch('/api/admin/restore', {
      method: 'POST',
      body: JSON.stringify({ backup })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, message: data.error || 'Failed to restore backup' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Backup restore error' };
  }
}

export async function addAdminReview(reviewData: Partial<ReviewItem>): Promise<{ success: boolean; message: string; review?: ReviewItem; reviews?: ReviewItem[] }> {
  try {
    const res = await adminFetch('/api/admin/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to add review' };
    }
    return { success: true, message: data.message || 'Review added successfully', review: data.review, reviews: data.reviews };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error while adding review' };
  }
}

export async function updateAdminReview(id: string, reviewData: Partial<ReviewItem>): Promise<{ success: boolean; message: string; review?: ReviewItem; reviews?: ReviewItem[] }> {
  try {
    const res = await adminFetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to update review' };
    }
    return { success: true, message: data.message || 'Review updated successfully', review: data.review, reviews: data.reviews };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error while updating review' };
  }
}

export async function deleteAdminReview(id: string): Promise<{ success: boolean; message: string; reviews?: ReviewItem[] }> {
  try {
    const res = await adminFetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to delete review' };
    }
    return { success: true, message: data.message || 'Review deleted successfully', reviews: data.reviews };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error while deleting review' };
  }
}

/**
 * Modular entity export from server (Products, Categories, Reviews, Settings, All)
 */
export async function exportAdminEntity(
  entity: 'products' | 'categories' | 'reviews' | 'settings' | 'all',
  format: 'json' | 'csv' = 'json'
): Promise<{ success: boolean; data?: any; rawText?: string; error?: string }> {
  try {
    const url = `/api/admin/export/${entity}?format=${format}`;
    const res = await adminFetch(url);
    if (!res.ok) {
      return { success: false, error: `Failed to export ${entity} (Status: ${res.status})` };
    }
    if (format === 'csv') {
      const rawText = await res.text();
      return { success: true, rawText };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during export' };
  }
}

/**
 * Modular entity import to server (Products, Categories, Reviews, Settings)
 */
export async function importAdminEntity(
  entity: 'products' | 'categories' | 'reviews' | 'settings',
  payload: any,
  mode: 'merge' | 'replace' = 'merge'
): Promise<{ success: boolean; message?: string; count?: number; items?: any; error?: string }> {
  try {
    const res = await adminFetch(`/api/admin/import/${entity}`, {
      method: 'POST',
      body: JSON.stringify({ data: payload, mode })
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || `Failed to import ${entity}` };
    }
    return {
      success: true,
      message: result.message,
      count: result.count,
      items: result.items
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during import' };
  }
}


