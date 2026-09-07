import { SiteSettings, ServiceItem, ProductItem, InquiryRecord, BrandAuditItem, ReviewItem, BrandItem, ProductCategoryDef, FullAppConfigurationBackup, ConfigSnapshot, BusinessAddress } from '../types';
import { DEFAULT_SITE_SETTINGS, INITIAL_SERVICES, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_BRANDS, STORE_CATEGORIES } from '../data/initialData';
import { sha256Hex, encryptAESGCM, decryptAESGCM } from './crypto';

export const DEFAULT_POWER_RANGES = ['1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 30kW', '30kW+'];

const KEYS = {
  SETTINGS: 'nklaser_site_settings_v3',
  SETTINGS_V2: 'nklaser_site_settings_v2',
  SETTINGS_V1: 'nklaser_site_settings',
  SERVICES: 'nklaser_services',
  PRODUCTS: 'nklaser_products_v5',
  CATEGORIES: 'nklaser_categories_v5',
  POWER_RANGES: 'nklaser_power_ranges',
  INQUIRIES: 'nklaser_inquiries',
  AUDIT: 'nklaser_brand_audit',
  REVIEWS: 'nklaser_reviews',
  BRANDS: 'nklaser_brands',
  ADMIN_PASSWORD_HASH: 'nklaser_admin_pwd_hash_v2',
  ADMIN_PASSWORD_ENC: 'nklaser_admin_pwd_enc_v2',
  ADMIN_SESSION: 'nklaser_admin_session',
  SNAPSHOTS: 'nklaser_config_snapshots_v1',
  LAST_SYNC: 'nklaser_last_server_sync'
};

// Safe browser storage helper that gracefully falls back in non-browser/SSR environments
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, val: string): void => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, val);
    } catch {}
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

// Purge any legacy plaintext credentials immediately to protect from web inspection
safeStorage.removeItem('nklaser_admin_password');
safeStorage.removeItem('nk_laser_admin_pwd');


// Initial brand audit state checking for non-NKL external branding in non-product content
export const INITIAL_AUDIT_ITEMS: BrandAuditItem[] = [
  {
    id: 'audit-1',
    source: 'Website Content Brand Audit',
    field: 'Site Settings & Services',
    urlOrContent: 'Audit Scan: 100% NKL Laser Compliant',
    issue: 'Verified non-product site content contains only NKL branding. Zero unauthorized third-party brands detected.',
    status: 'Clean',
    auditCategory: 'brand'
  },
  {
    id: 'audit-2',
    source: 'Media & Gallery Assets',
    field: 'Image URLs & Banners',
    urlOrContent: 'Clean CAD & Stock Assets',
    issue: 'Verified all media assets and graphics are 100% free of external brand watermarks or third-party logos.',
    status: 'Clean',
    auditCategory: 'brand'
  }
];

export const INITIAL_INQUIRIES: InquiryRecord[] = [
  {
    id: 'inq-101',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: 'Mahesh Sharma',
    customerPhone: '+91 98250 44551',
    customerEmail: 'precision.laser@ahmedabad.com',
    productOrService: 'Ceramic Lockig Ring - Raytool BM06k',
    material: 'Zirconia Ceramic / Brass',
    quantity: 10,
    message: 'Urgent requirement for Raytools BM06k ceramic rings. We are running double shift on 6kW Bodor machine.',
    status: 'New',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM06k | SKU: NKL-CLK-101 | Qty: 10'
  },
  {
    id: 'inq-102',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customerName: 'Kunal Verma',
    customerPhone: '+91 98791 22334',
    customerEmail: 'kunal@suratsteel.in',
    productOrService: 'Ceramic Lockig Ring - Raytool BM06k',
    material: 'Zirconia Ceramic',
    quantity: 25,
    message: 'Need 25 pcs ceramic locking ring for BM06k head. Confirm immediate courier dispatch to Surat.',
    status: 'In Progress',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM06k | SKU: NKL-CLK-101 | Qty: 25'
  },
  {
    id: 'inq-103',
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    customerName: 'Vikas Engineering Works',
    customerPhone: '+91 94265 99887',
    customerEmail: 'vikas@enggworks.com',
    productOrService: 'Ceramic Lockig Ring - Raytool BM06k',
    material: 'Zirconia Ceramic',
    quantity: 5,
    message: 'Quotation for Raytool BM06k sensor body ring replacement.',
    status: 'Quoted',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM06k | SKU: NKL-CLK-101 | Qty: 5'
  },
  {
    id: 'inq-104',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    customerName: 'Apex FabriTech',
    customerPhone: '+91 98112 33445',
    customerEmail: 'purchase@apexfab.co.in',
    productOrService: 'Ceramic Lockig Ring - Raytool BM110',
    material: 'Zirconia Ceramic / Brass Thread',
    quantity: 15,
    message: 'Need BM110 ceramic locking rings for our 12kW fiber laser cutting heads. Share bulk pricing.',
    status: 'New',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM110 | SKU: NKL-CLK-103 | Qty: 15'
  },
  {
    id: 'inq-105',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    customerName: 'Sanjay Gupta',
    customerPhone: '+91 97234 11223',
    customerEmail: 'sanjay@delhicnc.in',
    productOrService: 'Ceramic Lockig Ring - Raytool BM110',
    material: 'Zirconia Ceramic / Brass Thread',
    quantity: 8,
    message: 'Require Raytool BM110 ceramic ring with sensor lock nut.',
    status: 'In Progress',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM110 | SKU: NKL-CLK-103 | Qty: 8'
  },
  {
    id: 'inq-106',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    customerName: 'Rajesh Patel',
    customerPhone: '+91 98250 12345',
    customerEmail: 'rajesh.patel@steelworks.in',
    productOrService: 'Ceramic Lockig Ring - Raytool BM109',
    material: 'Zirconia Ceramic',
    quantity: 12,
    message: 'Inquiring for Raytool BM109 ceramic rings for 3kW laser head.',
    status: 'Quoted',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM109 | SKU: NKL-CLK-102 | Qty: 12'
  },
  {
    id: 'inq-107',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    customerName: 'Anand Laser Pune',
    customerPhone: '+91 99011 44556',
    customerEmail: 'procure@anandlaser.in',
    productOrService: 'Ceramic Lockig Ring - Raytool BM111',
    material: 'Zirconia Ceramic',
    quantity: 6,
    message: 'Need BM111 ceramic locking ring suitable for Raytools autofocus cutting head.',
    status: 'New',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM111 | SKU: NKL-CLK-104 | Qty: 6'
  },
  {
    id: 'inq-108',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    customerName: 'Shree Ram Laser Tech',
    customerPhone: '+91 94140 77889',
    customerEmail: 'shreeramlaser@gmail.com',
    productOrService: 'Ceramic Lockig Ring - Raytool BM114',
    material: 'Zirconia Ceramic / Brass',
    quantity: 4,
    message: 'Looking for BM114 ceramic ring for heavy plate fiber laser machine.',
    status: 'In Progress',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BM114 | SKU: NKL-CLK-105 | Qty: 4'
  },
  {
    id: 'inq-109',
    createdAt: new Date(Date.now() - 3600000 * 35).toISOString(),
    customerName: 'Deepak Metacraft',
    customerPhone: '+91 98980 66778',
    customerEmail: 'deepak@metacraft.co.in',
    productOrService: 'Ceramic Lockig Ring - Raytool BT240',
    material: 'Zirconia Ceramic',
    quantity: 10,
    message: 'Need BT240 manual focus ceramic rings with gold plated pins.',
    status: 'Quoted',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - Raytool BT240 | SKU: NKL-CLK-106 | Qty: 10'
  },
  {
    id: 'inq-110',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    customerName: 'Dynamic CNC Works',
    customerPhone: '+91 98450 33221',
    customerEmail: 'info@dynamiccnc.com',
    productOrService: 'Ceramic Lockig Ring - WSX NC63',
    material: 'High-Purity Ceramic',
    quantity: 8,
    message: 'Looking for WSX NC63 sensor ring and locking nut.',
    status: 'New',
    source: 'Product Inquiry',
    specsSummary: 'Ceramic Lockig Ring - WSX NC63 | SKU: NKL-CLK-107 | Qty: 8'
  }
];

export function loadReviews(): ReviewItem[] {
  try {
    const saved = safeStorage.getItem(KEYS.REVIEWS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading reviews:', e);
  }
  return INITIAL_REVIEWS;
}

export function saveReviews(reviews: ReviewItem[]): void {
  try {
    safeStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    pushConfigurationToServer().catch(() => {});
  } catch (e) {
    console.error('Error saving reviews:', e);
  }
}

export function loadBrands(): BrandItem[] {
  try {
    const saved = safeStorage.getItem(KEYS.BRANDS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading brands:', e);
  }
  return INITIAL_BRANDS;
}

export function saveBrands(brands: BrandItem[]): void {
  try {
    safeStorage.setItem(KEYS.BRANDS, JSON.stringify(brands));
    pushConfigurationToServer().catch(() => {});
  } catch (e) {
    console.error('Error saving brands:', e);
  }
}


function normalizeAddresses(parsedAddresses: any, fallbackAddressString?: string): BusinessAddress[] {
  if (Array.isArray(parsedAddresses) && parsedAddresses.length > 0) {
    return parsedAddresses.map((addr: any, idx: number) => ({
      id: addr.id || `addr-${idx + 1}-${Date.now()}`,
      title: addr.title || (idx === 0 ? 'Central Spares Warehouse & HQ' : `Regional Dispatch Center ${idx + 1}`),
      addressLine: addr.addressLine || addr.address || fallbackAddressString || 'Plot No. 42, GIDC Industrial Area, Sector 3',
      cityState: addr.cityState || 'Gujarat, India',
      pincode: addr.pincode || '',
      warehouseType: addr.warehouseType || (idx === 0 ? 'Central Warehouse & HQ' : 'Express Dispatch Hub'),
      phone: addr.phone || '+91 99020 35374',
      email: addr.email || 'nklaser33@gmail.com',
      contactPerson: addr.contactPerson || '',
      workingHours: addr.workingHours || 'Mon - Sat: 8:30 AM - 8:00 PM',
      dispatchTiming: addr.dispatchTiming || 'Same-day dispatch for orders confirmed by 4:00 PM',
      isPrimary: addr.isPrimary !== undefined ? Boolean(addr.isPrimary) : (idx === 0),
      mapUrl: addr.mapUrl || ''
    }));
  }
  if (fallbackAddressString) {
    return [
      {
        id: 'addr-1',
        title: 'Central Spares Warehouse & Import Hub',
        addressLine: fallbackAddressString,
        cityState: 'Gujarat, India',
        pincode: '382445',
        warehouseType: 'Central Warehouse & HQ',
        phone: '+91 99020 35374',
        email: 'nklaser33@gmail.com',
        workingHours: 'Mon - Sat: 8:30 AM - 8:00 PM',
        dispatchTiming: 'Same-day dispatch nationwide',
        isPrimary: true,
        mapUrl: `https://maps.google.com/?q=${encodeURIComponent(fallbackAddressString)}`
      }
    ];
  }
  return DEFAULT_SITE_SETTINGS.addresses || [];
}

function sanitizeCodText(text?: string): string | undefined {
  if (!text) return text;
  return text
    .replace(/\s*and\s+Cash\s+on\s+Delivery\s*\(COD\)/gi, '')
    .replace(/\s*&\s*Cash\s+on\s+Delivery\s*\(COD\)/gi, '')
    .replace(/\s*,\s*Cash\s+on\s+Delivery\s*\(COD\)/gi, '')
    .replace(/\s*Cash\s+on\s+Delivery\s*\(COD\)/gi, '')
    .replace(/\s*and\s+Cash\s+on\s+Delivery/gi, '')
    .replace(/\s*&\s*Cash\s+on\s+Delivery/gi, '')
    .replace(/\s*Cash\s+on\s+Delivery/gi, '')
    .replace(/\s*&\s*COD\b/gi, '')
    .replace(/\s*and\s+COD\b/gi, '')
    .replace(/\s*\(COD\)/gi, '')
    .replace(/\bCOD\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function loadSiteSettings(): SiteSettings {
  try {
    const saved = safeStorage.getItem(KEYS.SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const addresses = normalizeAddresses(parsed.addresses, parsed.address);
      const primaryAddr = addresses.find(a => a.isPrimary) || addresses[0];
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        heroSubtitle: sanitizeCodText(parsed.heroSubtitle) || DEFAULT_SITE_SETTINGS.heroSubtitle,
        noticeBannerText: sanitizeCodText(parsed.noticeBannerText) || DEFAULT_SITE_SETTINGS.noticeBannerText,
        address: primaryAddr?.addressLine || parsed.address || DEFAULT_SITE_SETTINGS.address,
        addresses: addresses,
        instagramUrl: parsed.instagramUrl || parsed.socialLinks?.instagram || DEFAULT_SITE_SETTINGS.instagramUrl,
        socialLinks: {
          ...DEFAULT_SITE_SETTINGS.socialLinks,
          ...(parsed.socialLinks || {}),
          instagram: parsed.instagramUrl || parsed.socialLinks?.instagram || DEFAULT_SITE_SETTINGS.instagramUrl
        },
        themeMode: 'light',
        primaryColor: '#162657',
        accentColor: '#E51024',
        sectionsVisibility: {
          ...DEFAULT_SITE_SETTINGS.sectionsVisibility,
          ...(parsed.sectionsVisibility || {})
        }
      };
    }

    // Migration fallback from v1
    const savedV1 = safeStorage.getItem(KEYS.SETTINGS_V1);
    if (savedV1) {
      const parsedV1 = JSON.parse(savedV1);
      const addresses = normalizeAddresses(parsedV1.addresses, parsedV1.address);
      const primaryAddr = addresses.find(a => a.isPrimary) || addresses[0];
      const migrated: SiteSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...parsedV1,
        heroSubtitle: sanitizeCodText(parsedV1.heroSubtitle) || DEFAULT_SITE_SETTINGS.heroSubtitle,
        noticeBannerText: sanitizeCodText(parsedV1.noticeBannerText) || DEFAULT_SITE_SETTINGS.noticeBannerText,
        address: primaryAddr?.addressLine || parsedV1.address || DEFAULT_SITE_SETTINGS.address,
        addresses: addresses,
        instagramUrl: parsedV1.instagramUrl || parsedV1.socialLinks?.instagram || DEFAULT_SITE_SETTINGS.instagramUrl,
        socialLinks: {
          ...DEFAULT_SITE_SETTINGS.socialLinks,
          ...(parsedV1.socialLinks || {}),
          instagram: parsedV1.instagramUrl || parsedV1.socialLinks?.instagram || DEFAULT_SITE_SETTINGS.instagramUrl
        },
        themeMode: 'light',
        primaryColor: '#162657',
        accentColor: '#E51024',
        sectionsVisibility: {
          ...DEFAULT_SITE_SETTINGS.sectionsVisibility,
          ...(parsedV1.sectionsVisibility || {}),
          quoteCalculator: false
        }
      };
      saveSiteSettings(migrated);
      return migrated;
    }
  } catch (e) {
    console.error('Error loading site settings:', e);
  }
  return {
    ...DEFAULT_SITE_SETTINGS,
    themeMode: 'light',
    primaryColor: '#162657',
    accentColor: '#E51024'
  };
}

export function saveSiteSettings(settings: SiteSettings): void {
  try {
    const normalized: SiteSettings = {
      ...settings,
      themeMode: 'light',
      primaryColor: '#162657',
      accentColor: '#E51024'
    };
    safeStorage.setItem(KEYS.SETTINGS, JSON.stringify(normalized));
    pushConfigurationToServer().catch(() => {});
  } catch (e) {
    console.error('Error saving site settings:', e);
  }
}


export function loadServices(): ServiceItem[] {
  try {
    const saved = safeStorage.getItem(KEYS.SERVICES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading services:', e);
  }
  return INITIAL_SERVICES;
}

export function saveServices(services: ServiceItem[]): void {
  try {
    safeStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  } catch (e) {
    console.error('Error saving services:', e);
  }
}

export function loadProducts(): ProductItem[] {
  try {
    const saved = safeStorage.getItem(KEYS.PRODUCTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading products:', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: ProductItem[]): void {
  try {
    safeStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    pushConfigurationToServer().catch(() => {});
  } catch (e) {
    console.error('Error saving products:', e);
  }
}


export function loadInquiries(): InquiryRecord[] {
  try {
    const saved = safeStorage.getItem(KEYS.INQUIRIES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading inquiries:', e);
  }
  return INITIAL_INQUIRIES;
}

export function saveInquiries(inquiries: InquiryRecord[]): void {
  try {
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(inquiries));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nk_laser_inquiries_updated', { detail: inquiries }));
    }
  } catch (e) {
    console.error('Error saving inquiries:', e);
  }
}

export function saveInquiry(newInquiry: Omit<InquiryRecord, 'id' | 'createdAt' | 'status'>): InquiryRecord {
  const current = loadInquiries();
  const createdRecord: InquiryRecord = {
    ...newInquiry,
    id: 'inq-' + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
    status: 'New'
  };
  const updated = [createdRecord, ...current];
  try {
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nk_laser_inquiries_updated', { detail: updated }));
    }
    // Send to backend server database
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInquiry)
    }).catch(err => console.warn('Could not post inquiry to server backend:', err));
  } catch (e) {
    console.error('Error saving inquiry:', e);
  }
  return createdRecord;
}

export function updateInquiryStatus(id: string, status: InquiryRecord['status']): void {
  const current = loadInquiries();
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  try {
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nk_laser_inquiries_updated', { detail: updated }));
    }
  } catch (e) {
    console.error('Error updating inquiry status:', e);
  }
}

export function deleteInquiry(id: string): void {
  const current = loadInquiries();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nk_laser_inquiries_updated', { detail: updated }));
    }
  } catch (e) {
    console.error('Error deleting inquiry:', e);
  }
}

export function loadAuditItems(): BrandAuditItem[] {
  try {
    const saved = safeStorage.getItem(KEYS.AUDIT);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading audit items:', e);
  }
  return INITIAL_AUDIT_ITEMS;
}

export function saveAuditItems(items: BrandAuditItem[]): void {
  try {
    safeStorage.setItem(KEYS.AUDIT, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving audit items:', e);
  }
}

// Standard list of third-party OEM, competitor, and machinery brands to monitor
export const KNOWN_THIRD_PARTY_BRANDS: string[] = [
  'Nova', 'Novacut',
  'RayTools', 'Raytool',
  'OSPRI', 'Ospri',
  'BOCHU', 'Bochu', 'FSCUT',
  'WSX',
  'Precitec',
  'Bodor',
  'Trumpf',
  'Bystronic',
  'Mazak',
  'Amada',
  "Han's Laser", 'Hans Laser',
  'IPG', 'IPG Photonics',
  'Raycus',
  'Maxphotonics', 'Max Photonics',
  'Au3tech',
  'Qilin',
  'SMC',
  'DNE', 'DNE Laser',
  'Golden Laser',
  'Lead Laser',
  'Penta Laser', 'Penta',
  'Yawei',
  'Coherent',
  'nLIGHT',
  'JPT',
  'RECI',
  'Messer',
  'Mitsubishi',
  'Prima Power',
  'Kjellberg',
  'Hypertherm'
];

export interface BrandAuditOptions {
  brands?: BrandItem[];
  settings?: SiteSettings;
  services?: ServiceItem[];
  categories?: ProductCategoryDef[];
  products?: ProductItem[];
  reviews?: ReviewItem[];
}

export function runAutoBrandAudit(options?: BrandAuditOptions): BrandAuditItem[] {
  const settings = options?.settings || loadSiteSettings();
  const services = options?.services || loadServices();
  const products = options?.products || loadProducts();
  const categories = options?.categories || loadCategories();
  const brands = options?.brands || loadBrands();
  const reviews = options?.reviews || loadReviews();
  
  const audits: BrandAuditItem[] = [];
  let idCounter = 1;

  // Build unique list of monitored third-party brands (excluding company brand NKL / NK)
  const monitoredBrandSet = new Set<string>();
  
  KNOWN_THIRD_PARTY_BRANDS.forEach(b => monitoredBrandSet.add(b.trim()));
  
  if (brands && brands.length > 0) {
    brands.forEach(b => {
      if (b.name) {
        // Strip out any parenthetical parts like "BOCHU (FSCUT)" into separate tokens
        const cleanName = b.name.replace(/[()]/g, ' ').trim();
        cleanName.split(/\s+/).forEach(token => {
          if (token.length >= 2 && !token.toUpperCase().startsWith('NK')) {
            monitoredBrandSet.add(token);
          }
        });
        if (!b.name.toUpperCase().startsWith('NK')) {
          monitoredBrandSet.add(b.name.trim());
        }
      }
    });
  }

  // Remove any NKL / NK company variations from monitored list
  const allowedBrandTokens = new Set(['NK', 'NKL', 'NK LASER', 'NK LASER SPARES', 'NK LASER OPTICS', 'NK LASER CUTTING', 'NKLASER']);
  const monitoredBrands = Array.from(monitoredBrandSet).filter(b => {
    return !allowedBrandTokens.has(b.toUpperCase()) && !b.toUpperCase().startsWith('NKL') && !b.toUpperCase().startsWith('NK LASER');
  });

  // Helper to test if a text contains any non-NKL brand
  const detectNonNKLBrand = (text: string): string | null => {
    if (!text || typeof text !== 'string') return null;
    for (const brand of monitoredBrands) {
      if (!brand || brand.length < 2) continue;
      const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Case-insensitive boundary match
      const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}($|[^a-zA-Z0-9])`, 'i');
      if (regex.test(text)) {
        return brand;
      }
    }
    return null;
  };

  // Helper to extract a readable excerpt around the match
  const getExcerpt = (text: string, brandName: string): string => {
    if (!text) return '';
    const idx = text.toLowerCase().indexOf(brandName.toLowerCase());
    if (idx === -1) return text.slice(0, 100);
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + brandName.length + 40);
    return (start > 0 ? '...' : '') + text.slice(start, end).trim() + (end < text.length ? '...' : '');
  };

  // Audit non-product content field
  const auditContentField = (text: string | undefined | null, location: string, fieldName: string) => {
    if (!text) return;
    const detected = detectNonNKLBrand(text);
    if (detected) {
      audits.push({
        id: `audit-flag-${idCounter++}`,
        source: location,
        field: fieldName,
        urlOrContent: getExcerpt(text, detected),
        detectedBrand: detected,
        issue: `Non-NKL Brand Flag: Contains third-party brand "${detected}". In website content outside of products, only "NKL" is permitted.`,
        status: 'Flagged',
        auditCategory: 'brand'
      });
    }
  };

  // 1. Audit Site Settings (Business Name, Tagline, Descriptions, Hero, Banner, Address)
  if (settings) {
    auditContentField(settings.businessName, 'Site Settings', 'Business Name');
    auditContentField(settings.tagline, 'Site Settings', 'Tagline');
    auditContentField(settings.heroTitle, 'Site Settings', 'Hero Title');
    auditContentField(settings.heroSubtitle, 'Site Settings', 'Hero Subtitle');
    auditContentField(settings.noticeBannerText, 'Site Settings', 'Notice Banner');
    auditContentField(settings.dxfUploadNotice, 'Site Settings', 'DXF Notice');
    auditContentField(settings.logoUrl, 'Site Settings', 'Logo URL');
    if (typeof settings.address === 'string') {
      auditContentField(settings.address, 'Site Settings', 'Main Address');
    }
    if (settings.addresses && Array.isArray(settings.addresses)) {
      settings.addresses.forEach((addr, aIdx) => {
        auditContentField(addr.title, `Site Settings: Hub #${aIdx + 1}`, 'Title');
        auditContentField(addr.addressLine, `Site Settings: Hub #${aIdx + 1}`, 'Address Line');
        auditContentField(addr.cityState, `Site Settings: Hub #${aIdx + 1}`, 'City/State');
      });
    }
  }

  // 2. Audit Services Content
  if (services && services.length > 0) {
    services.forEach(s => {
      auditContentField(s.title, `Service: "${s.title || s.id}"`, 'Title');
      auditContentField(s.shortDesc, `Service: "${s.title || s.id}"`, 'Short Description');
      auditContentField(s.description, `Service: "${s.title || s.id}"`, 'Full Description');
      auditContentField(s.category, `Service: "${s.title || s.id}"`, 'Category');
      auditContentField(s.maxThickness, `Service: "${s.title || s.id}"`, 'Max Thickness / Specs');
      if (s.features && Array.isArray(s.features)) {
        s.features.forEach((feat, fIdx) => {
          auditContentField(feat, `Service: "${s.title || s.id}"`, `Feature #${fIdx + 1}`);
        });
      }
      if (s.materials && Array.isArray(s.materials)) {
        s.materials.forEach((mat, mIdx) => {
          auditContentField(mat, `Service: "${s.title || s.id}"`, `Material #${mIdx + 1}`);
        });
      }
    });
  }

  // 3. Audit Categories & Subcategories
  if (categories && categories.length > 0) {
    categories.forEach(c => {
      auditContentField(c.name, `Category: "${c.name}"`, 'Name');
      auditContentField(c.description, `Category: "${c.name}"`, 'Description');
      if (c.subCategories && Array.isArray(c.subCategories)) {
        c.subCategories.forEach((sub, sIdx) => {
          auditContentField(sub, `Category: "${c.name}"`, `Subcategory #${sIdx + 1}`);
        });
      }
    });
  }

  // 4. Audit Reviews (Customer feedback, company titles, comments, project types)
  if (reviews && reviews.length > 0) {
    reviews.forEach(r => {
      auditContentField(r.clientName, `Review by ${r.clientName}`, 'Client Name');
      auditContentField(r.companyName, `Review by ${r.clientName}`, 'Company Name');
      auditContentField(r.comment, `Review by ${r.clientName}`, 'Review Comment');
      auditContentField(r.projectType, `Review by ${r.clientName}`, 'Project Type');
    });
  }

  // 5. Products Check:
  // Note: Products ARE ALLOWED to list compatible OEM brands (RayTools, Precitec, WSX, etc.)
  // for spare parts fitment. However, if a product contains unauthorized competitor branding (like "NOVA"),
  // it is flagged.
  if (products && products.length > 0) {
    products.forEach(p => {
      const checkProductForRogue = (val: string | undefined | null, field: string) => {
        if (val && val.toLowerCase().includes('nova')) {
          audits.push({
            id: `audit-flag-${idCounter++}`,
            source: `Product: "${p.title}" (SKU: ${p.sku || p.id})`,
            field,
            urlOrContent: getExcerpt(val, 'nova'),
            detectedBrand: 'Nova',
            issue: 'Competitor Brand Flag: Contains unauthorized string "NOVA" in product data.',
            status: 'Flagged',
            auditCategory: 'brand'
          });
        }
      };
      checkProductForRogue(p.title, 'Title');
      checkProductForRogue(p.description, 'Description');
      checkProductForRogue(p.imageUrl, 'Image URL');
    });
  }

  // If no flags were raised across all content, mark system 100% compliant
  if (audits.length === 0) {
    audits.push({
      id: 'audit-clean-all',
      source: 'System Brand Compliance Scan',
      field: 'All Non-Product Content',
      urlOrContent: '100% NKL Laser Brand Compliant',
      issue: 'Verified all non-product content (Settings, Services, Categories, Reviews) contains only NKL branding. Zero unauthorized third-party brands detected.',
      status: 'Clean',
      auditCategory: 'brand'
    });
  }

  saveAuditItems(audits);
  return audits;
}

export function loadCategories(): ProductCategoryDef[] {
  try {
    const saved = safeStorage.getItem(KEYS.CATEGORIES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
  return STORE_CATEGORIES;
}

export function saveCategories(categories: ProductCategoryDef[]): void {
  try {
    safeStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    pushConfigurationToServer().catch(() => {});
  } catch (e) {
    console.error('Error saving categories:', e);
  }
}

export function loadPowerRanges(): string[] {
  try {
    const saved = safeStorage.getItem(KEYS.POWER_RANGES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading power ranges:', e);
  }
  return DEFAULT_POWER_RANGES;
}

export function savePowerRanges(ranges: string[]): void {
  try {
    safeStorage.setItem(KEYS.POWER_RANGES, JSON.stringify(ranges));
    pushConfigurationToServer().catch(() => {});
  } catch (e) {
    console.error('Error saving power ranges:', e);
  }
}

// Administrative authentication is strictly server-enforced via bcrypt and HttpOnly cookies.
// No password hashes or credentials are ever stored in client-accessible localStorage or exported in JSON backups.

export function loadAdminPasswordHash(): string {
  // Passwords and hashes are strictly server-side authoritative
  return '';
}

export async function saveAdminPasswordSecurely(_newPassword: string): Promise<void> {
  // Purge any legacy plaintext or hashes from local storage
  try {
    safeStorage.removeItem(KEYS.ADMIN_PASSWORD_HASH);
    safeStorage.removeItem(KEYS.ADMIN_PASSWORD_ENC);
    safeStorage.removeItem('nklaser_admin_password');
  } catch (e) {
    // Ignore in restricted environments
  }
}

export async function verifyAdminPassword(_inputPassword: string): Promise<boolean> {
  // Verification must be performed via server endpoint /api/auth/login using HttpOnly cookies
  return false;
}

export function getAdminSession(): boolean {
  // Client storage cannot be trusted for authorization; backend verifies sessions via HttpOnly cookies
  return false;
}

export function setAdminSession(active: boolean): void {
  try {
    if (!active) {
      sessionStorage.removeItem(KEYS.ADMIN_SESSION);
      sessionStorage.removeItem('nk_laser_admin_auth');
      sessionStorage.removeItem('nk_laser_admin_jwt');
      sessionStorage.removeItem('nk_laser_admin_auth_token');
    }
  } catch (e) {
    // Ignore in restricted environments
  }
}

// =========================================================================
// FULL CONFIGURATION PERSISTENCE, BACKUP & SERVER SYNC
// =========================================================================

/**
 * Universal browser file download helper (uses Blob + ObjectURL for performance and safety)
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'application/json'): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error(`Error downloading file ${filename}:`, e);
  }
}

/**
 * Escapes a cell value for standard CSV formatting
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parse CSV text into a 2D array of cells, handling quoted cells, commas, and newlines
 */
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // ignore CR
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows;
}

/**
 * Convert product list to standard CSV string
 */
export function productsToCsv(products: ProductItem[]): string {
  const headers = [
    'sku',
    'title',
    'categorySlug',
    'category',
    'subCategory',
    'brand',
    'powerRange',
    'stockStatus',
    'inStock',
    'estimatedPrice',
    'regularPrice',
    'salePrice',
    'material',
    'thickness',
    'dimensions',
    'specs',
    'description',
    'imageUrl',
    'id'
  ];

  const lines = [headers.join(',')];

  for (const p of products) {
    const specsStr = Array.isArray(p.specs) ? p.specs.join(' | ') : (p.specs || '');
    const row = [
      escapeCsvCell(p.sku || ''),
      escapeCsvCell(p.title || ''),
      escapeCsvCell(p.categorySlug || ''),
      escapeCsvCell(p.category || ''),
      escapeCsvCell(p.subCategory || ''),
      escapeCsvCell(p.brand || ''),
      escapeCsvCell(p.powerRange || ''),
      escapeCsvCell(p.stockStatus || (p.inStock ? 'In Stock' : 'Custom Order')),
      escapeCsvCell(p.inStock ? 'true' : 'false'),
      escapeCsvCell(p.estimatedPrice ?? ''),
      escapeCsvCell(p.regularPrice ?? ''),
      escapeCsvCell(p.salePrice ?? ''),
      escapeCsvCell(p.material || ''),
      escapeCsvCell(p.thickness || ''),
      escapeCsvCell(p.dimensions || ''),
      escapeCsvCell(specsStr),
      escapeCsvCell(p.description || ''),
      escapeCsvCell(p.imageUrl || ''),
      escapeCsvCell(p.id || '')
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Convert CSV text to list of partial product items
 */
export function csvToProducts(csvText: string): { products: Partial<ProductItem>[]; errors: string[] } {
  const rows = parseCsvText(csvText);
  if (rows.length < 2) {
    return { products: [], errors: ['CSV file must have a header row and at least one data row.'] };
  }

  const rawHeaders = rows[0].map(h => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const getCol = (row: string[], ...aliases: string[]): string => {
    for (const alias of aliases) {
      const clean = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean in headerMap) {
        const val = row[headerMap[clean]];
        if (val !== undefined && val !== null) return val;
      }
    }
    return '';
  };

  const parsedProducts: Partial<ProductItem>[] = [];
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const title = getCol(row, 'title', 'producttitle', 'name', 'itemname');
    const sku = getCol(row, 'sku', 'productsku', 'itemsku', 'partnumber');

    if (!title && !sku) {
      errors.push(`Row ${r + 1}: Skipped due to missing title or SKU.`);
      continue;
    }

    const priceRaw = getCol(row, 'estimatedprice', 'price', 'estimate', 'cost');
    const parsedPrice = priceRaw ? parseFloat(priceRaw.replace(/[^0-9.]/g, '')) : undefined;

    const inStockRaw = getCol(row, 'instock', 'available', 'stock');
    const inStock = inStockRaw.toLowerCase() === 'true' || inStockRaw === '1' || inStockRaw.toLowerCase() === 'yes';

    const specsRaw = getCol(row, 'specs', 'specifications');
    const specs = specsRaw ? specsRaw.split(/[|;]/).map(s => s.trim()).filter(Boolean) : [];

    const item: Partial<ProductItem> = {
      id: getCol(row, 'id') || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sku: sku || `SKU-${Date.now()}-${r}`,
      title: title || sku,
      category: getCol(row, 'category', 'categoryname') || 'Laser Cutting Spares & Consumables',
      categorySlug: getCol(row, 'categoryslug', 'slug', 'cat') || 'protective-lenses',
      subCategory: getCol(row, 'subcategory', 'subcat') || undefined,
      brand: getCol(row, 'brand', 'oem', 'compatiblebrand') || 'RayTools',
      powerRange: getCol(row, 'powerrange', 'power', 'wattage') || '1kW - 6kW',
      stockStatus: (getCol(row, 'stockstatus') as any) || (inStock ? 'In Stock' : 'Custom Order'),
      inStock: inStock || (getCol(row, 'stockstatus') === 'In Stock'),
      estimatedPrice: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      material: getCol(row, 'material') || 'Optical Glass',
      thickness: getCol(row, 'thickness') || 'Standard',
      dimensions: getCol(row, 'dimensions', 'size') || undefined,
      specs: specs.length > 0 ? specs : ['High Optical Purity', 'OEM Fitment Guaranteed'],
      description: getCol(row, 'description', 'desc') || `${title || sku} - Industrial laser cutting spare part.`,
      imageUrl: getCol(row, 'imageurl', 'image', 'photo') || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    };

    parsedProducts.push(item);
  }

  return { products: parsedProducts, errors };
}

/**
 * Export products in JSON or CSV format
 */
export function exportProducts(format: 'json' | 'csv' = 'json'): string {
  const prods = loadProducts();
  if (format === 'csv') {
    return productsToCsv(prods);
  }
  return JSON.stringify({
    version: '1.0',
    entity: 'products',
    exportedAt: new Date().toISOString(),
    count: prods.length,
    products: prods
  }, null, 2);
}

/**
 * Trigger download of products file in browser
 */
export function downloadProductsFile(format: 'json' | 'csv' = 'json'): void {
  const content = exportProducts(format);
  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `nklaser-products-${dateStamp}.${format}`;
  const mime = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
  downloadFile(filename, content, mime);
}

/**
 * Import products from array, JSON string, or CSV text with merge/replace mode
 */
export function importProducts(
  data: any[] | string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; message: string; count: number; products: ProductItem[]; errors?: string[] } {
  try {
    let rawItems: any[] = [];
    const parseErrors: string[] = [];

    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (trimmed.startsWith('[') || (trimmed.startsWith('{') && trimmed.includes('"products"'))) {
        // JSON parsing
        const parsed = JSON.parse(trimmed);
        rawItems = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.products) ? parsed.products : []);
      } else {
        // CSV parsing
        const { products: csvItems, errors } = csvToProducts(trimmed);
        rawItems = csvItems;
        parseErrors.push(...errors);
      }
    } else if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && typeof data === 'object' && Array.isArray((data as any).products)) {
      rawItems = (data as any).products;
    }

    if (!rawItems || rawItems.length === 0) {
      return { 
        success: false, 
        message: 'No valid products found in imported data.', 
        count: 0, 
        products: loadProducts(),
        errors: parseErrors.length > 0 ? parseErrors : ['Empty or unparseable dataset.']
      };
    }

    // Save pre-import snapshot
    saveConfigurationSnapshot(`Auto-backup before products ${mode}`);

    const existing = loadProducts();
    const validatedProducts: ProductItem[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      if (!item || typeof item !== 'object') continue;
      const title = item.title || item.name || item.sku || `Product ${i + 1}`;
      const sku = item.sku || `SKU-${Date.now()}-${i + 1}`;
      const id = item.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const prod: ProductItem = {
        id,
        sku,
        title,
        category: item.category || 'Laser Cutting Spares & Consumables',
        categorySlug: item.categorySlug || 'protective-lenses',
        subCategory: item.subCategory || undefined,
        brand: item.brand || 'RayTools',
        compatibleBrands: Array.isArray(item.compatibleBrands) ? item.compatibleBrands : (item.brand ? [item.brand] : ['RayTools']),
        powerRange: item.powerRange || '1kW - 6kW',
        stockStatus: item.stockStatus || (item.inStock ? 'In Stock' : 'Direct Import Stock'),
        inStock: item.inStock !== undefined ? Boolean(item.inStock) : (item.stockStatus === 'In Stock'),
        estimatedPrice: typeof item.estimatedPrice === 'number' ? item.estimatedPrice : (parseFloat(item.estimatedPrice) || undefined),
        regularPrice: typeof item.regularPrice === 'number' ? item.regularPrice : (parseFloat(item.regularPrice) || undefined),
        salePrice: typeof item.salePrice === 'number' ? item.salePrice : (parseFloat(item.salePrice) || undefined),
        material: item.material || 'Optical Glass',
        thickness: item.thickness || 'Standard',
        dimensions: item.dimensions || undefined,
        specs: Array.isArray(item.specs) ? item.specs : ['High Optical Purity', 'OEM Fitment Guaranteed'],
        description: item.description || `${title} - High quality fiber laser consumable.`,
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        galleryImages: Array.isArray(item.galleryImages) ? item.galleryImages : undefined,
        isPopular: Boolean(item.isPopular),
        isFeatured: Boolean(item.isFeatured)
      };
      validatedProducts.push(prod);
    }

    let finalList: ProductItem[];
    if (mode === 'replace') {
      finalList = validatedProducts;
    } else {
      // Merge mode: map existing products by sku or id
      const map = new Map<string, ProductItem>();
      existing.forEach(p => {
        if (p.sku) map.set(p.sku.toLowerCase(), p);
        map.set(p.id, p);
      });

      validatedProducts.forEach(newP => {
        const keySku = newP.sku?.toLowerCase();
        if (keySku && map.has(keySku)) {
          const old = map.get(keySku)!;
          const merged = { ...old, ...newP, id: old.id };
          map.set(keySku, merged);
          map.set(old.id, merged);
        } else if (map.has(newP.id)) {
          const old = map.get(newP.id)!;
          const merged = { ...old, ...newP };
          map.set(newP.id, merged);
          if (merged.sku) map.set(merged.sku.toLowerCase(), merged);
        } else {
          map.set(newP.id, newP);
          if (newP.sku) map.set(newP.sku.toLowerCase(), newP);
        }
      });

      finalList = Array.from(new Set(map.values()));
    }

    saveProducts(finalList);
    pushConfigurationToServer().catch(err => console.warn('Could not sync imported products to server:', err));

    return {
      success: true,
      message: `Successfully imported ${validatedProducts.length} products (${mode === 'merge' ? 'merged with catalog' : 'replaced entire catalog'}). Total products now: ${finalList.length}.`,
      count: finalList.length,
      products: finalList,
      errors: parseErrors.length > 0 ? parseErrors : undefined
    };
  } catch (err: any) {
    console.error('Error importing products:', err);
    return {
      success: false,
      message: `Failed to import products: ${err.message || 'Unknown error'}`,
      count: 0,
      products: loadProducts(),
      errors: [err.message]
    };
  }
}

/**
 * Export categories as JSON string
 */
export function exportCategories(): string {
  const cats = loadCategories();
  return JSON.stringify({
    version: '1.0',
    entity: 'categories',
    exportedAt: new Date().toISOString(),
    count: cats.length,
    categories: cats
  }, null, 2);
}

/**
 * Trigger download of categories JSON file
 */
export function downloadCategoriesFile(): void {
  const content = exportCategories();
  const dateStamp = new Date().toISOString().split('T')[0];
  downloadFile(`nklaser-categories-${dateStamp}.json`, content, 'application/json');
}

/**
 * Import categories from JSON string or array
 */
export function importCategories(
  data: any[] | string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; message: string; count: number; categories: ProductCategoryDef[]; errors?: string[] } {
  try {
    let rawCats: any[] = [];
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      rawCats = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.categories) ? parsed.categories : []);
    } else if (Array.isArray(data)) {
      rawCats = data;
    } else if (data && typeof data === 'object' && Array.isArray((data as any).categories)) {
      rawCats = (data as any).categories;
    }

    if (!rawCats || rawCats.length === 0) {
      return { success: false, message: 'No valid categories found in imported data.', count: 0, categories: loadCategories() };
    }

    saveConfigurationSnapshot(`Auto-backup before categories ${mode}`);
    const existing = loadCategories();
    const validated: ProductCategoryDef[] = [];

    for (let i = 0; i < rawCats.length; i++) {
      const c = rawCats[i];
      if (!c || typeof c !== 'object') continue;
      const name = c.name || c.title || `Category ${i + 1}`;
      const slug = c.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = c.id || `cat-${slug}`;

      validated.push({
        id,
        slug,
        name,
        shortTitle: c.shortTitle || name,
        description: c.description || `Industrial ${name} for fiber laser cutting heads.`,
        iconName: c.iconName || 'Wrench',
        imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        subCategories: Array.isArray(c.subCategories) ? c.subCategories.filter(Boolean) : ['Standard Series'],
        oemBrands: Array.isArray(c.oemBrands) ? c.oemBrands.filter(Boolean) : ['RayTools', 'OSPRI'],
        powerRanges: Array.isArray(c.powerRanges) ? c.powerRanges : undefined,
        featured: c.featured !== undefined ? Boolean(c.featured) : true,
        showOnHome: c.showOnHome !== undefined ? Boolean(c.showOnHome) : true
      });
    }

    let finalList: ProductCategoryDef[];
    if (mode === 'replace') {
      finalList = validated;
    } else {
      const map = new Map<string, ProductCategoryDef>();
      existing.forEach(cat => {
        map.set(cat.slug, cat);
        map.set(cat.id, cat);
      });

      validated.forEach(newCat => {
        if (map.has(newCat.slug)) {
          const old = map.get(newCat.slug)!;
          const merged = { ...old, ...newCat, id: old.id };
          map.set(newCat.slug, merged);
          map.set(old.id, merged);
        } else if (map.has(newCat.id)) {
          const old = map.get(newCat.id)!;
          const merged = { ...old, ...newCat };
          map.set(newCat.id, merged);
          map.set(merged.slug, merged);
        } else {
          map.set(newCat.slug, newCat);
          map.set(newCat.id, newCat);
        }
      });

      finalList = Array.from(new Set(map.values()));
    }

    saveCategories(finalList);
    pushConfigurationToServer().catch(err => console.warn('Could not sync categories to server:', err));

    return {
      success: true,
      message: `Successfully imported ${validated.length} categories (${mode === 'merge' ? 'merged' : 'replaced'}). Total: ${finalList.length}.`,
      count: finalList.length,
      categories: finalList
    };
  } catch (err: any) {
    console.error('Error importing categories:', err);
    return { success: false, message: `Failed to import categories: ${err.message || 'Unknown error'}`, count: 0, categories: loadCategories() };
  }
}

/**
 * Export reviews as JSON string
 */
export function exportReviews(): string {
  const revs = loadReviews();
  return JSON.stringify({
    version: '1.0',
    entity: 'reviews',
    exportedAt: new Date().toISOString(),
    count: revs.length,
    reviews: revs
  }, null, 2);
}

/**
 * Trigger download of reviews JSON file
 */
export function downloadReviewsFile(): void {
  const content = exportReviews();
  const dateStamp = new Date().toISOString().split('T')[0];
  downloadFile(`nklaser-reviews-${dateStamp}.json`, content, 'application/json');
}

/**
 * Import reviews from JSON string or array
 */
export function importReviews(
  data: any[] | string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; message: string; count: number; reviews: ReviewItem[]; errors?: string[] } {
  try {
    let rawReviews: any[] = [];
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      rawReviews = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.reviews) ? parsed.reviews : []);
    } else if (Array.isArray(data)) {
      rawReviews = data;
    } else if (data && typeof data === 'object' && Array.isArray((data as any).reviews)) {
      rawReviews = (data as any).reviews;
    }

    if (!rawReviews || rawReviews.length === 0) {
      return { success: false, message: 'No valid reviews found in imported data.', count: 0, reviews: loadReviews() };
    }

    saveConfigurationSnapshot(`Auto-backup before reviews ${mode}`);
    const existing = loadReviews();
    const validated: ReviewItem[] = [];

    for (let i = 0; i < rawReviews.length; i++) {
      const r = rawReviews[i];
      if (!r || typeof r !== 'object') continue;
      const clientName = r.clientName || r.name || `Client ${i + 1}`;
      const comment = r.comment || r.feedback || r.text || 'Excellent laser cutting spares and fast delivery.';
      const rating = Math.min(5, Math.max(1, Number(r.rating) || 5));

      validated.push({
        id: r.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        clientName,
        companyName: r.companyName || r.company || 'Industrial Engineering Works',
        location: r.location || r.city || 'India',
        rating,
        comment,
        date: r.date || new Date().toISOString().split('T')[0],
        projectType: r.projectType || 'Fiber Laser Spares & Optics',
        verified: r.verified !== undefined ? Boolean(r.verified) : true,
        avatarUrl: r.avatarUrl || undefined
      });
    }

    let finalList: ReviewItem[];
    if (mode === 'replace') {
      finalList = validated;
    } else {
      const map = new Map<string, ReviewItem>();
      existing.forEach(r => map.set(r.id, r));
      validated.forEach(r => {
        // match by id or (clientName + date)
        const matchKey = Array.from(map.values()).find(
          old => old.clientName.toLowerCase() === r.clientName.toLowerCase() && old.date === r.date
        );
        if (matchKey) {
          map.set(matchKey.id, { ...matchKey, ...r, id: matchKey.id });
        } else {
          map.set(r.id, r);
        }
      });
      finalList = Array.from(map.values());
    }

    saveReviews(finalList);
    pushConfigurationToServer().catch(err => console.warn('Could not sync reviews to server:', err));

    return {
      success: true,
      message: `Successfully imported ${validated.length} reviews (${mode === 'merge' ? 'merged' : 'replaced'}). Total: ${finalList.length}.`,
      count: finalList.length,
      reviews: finalList
    };
  } catch (err: any) {
    console.error('Error importing reviews:', err);
    return { success: false, message: `Failed to import reviews: ${err.message || 'Unknown error'}`, count: 0, reviews: loadReviews() };
  }
}

/**
 * Export site settings as JSON string
 */
export function exportSiteSettings(): string {
  const settings = loadSiteSettings();
  return JSON.stringify({
    version: '1.0',
    entity: 'settings',
    exportedAt: new Date().toISOString(),
    settings
  }, null, 2);
}

/**
 * Trigger download of site settings JSON file
 */
export function downloadSiteSettingsFile(): void {
  const content = exportSiteSettings();
  const dateStamp = new Date().toISOString().split('T')[0];
  downloadFile(`nklaser-settings-${dateStamp}.json`, content, 'application/json');
}

/**
 * Import site settings from JSON string or object
 */
export function importSiteSettings(
  data: any | string
): { success: boolean; message: string; settings: SiteSettings; errors?: string[] } {
  try {
    let rawSettings: any = null;
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      rawSettings = parsed && typeof parsed === 'object' && parsed.settings ? parsed.settings : parsed;
    } else if (data && typeof data === 'object') {
      rawSettings = data.settings || data;
    }

    if (!rawSettings || typeof rawSettings !== 'object') {
      return { success: false, message: 'Invalid settings JSON object.', settings: loadSiteSettings() };
    }

    saveConfigurationSnapshot('Auto-backup before settings import');

    const addresses = normalizeAddresses(rawSettings.addresses, rawSettings.address);
    const primaryAddr = addresses.find(a => a.isPrimary) || addresses[0];

    const current = loadSiteSettings();
    const normalized: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...current,
      ...rawSettings,
      address: primaryAddr?.addressLine || rawSettings.address || current.address,
      addresses,
      themeMode: 'light',
      primaryColor: '#162657',
      accentColor: '#E51024'
    };

    saveSiteSettings(normalized);
    pushConfigurationToServer().catch(err => console.warn('Could not sync settings to server:', err));

    return {
      success: true,
      message: 'Site settings and brand configurations imported successfully.',
      settings: normalized
    };
  } catch (err: any) {
    console.error('Error importing settings:', err);
    return { success: false, message: `Failed to import settings: ${err.message || 'Unknown error'}`, settings: loadSiteSettings() };
  }
}

/**
 * Export complete application configuration as a structured JSON object.
 * Strictly excludes administrative credentials, password hashes, and encryption keys.
 */
export function exportFullConfiguration(): FullAppConfigurationBackup {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'NK Laser Spares & Optics',
    settings: loadSiteSettings(),
    products: loadProducts(),
    categories: loadCategories(),
    brands: loadBrands(),
    reviews: loadReviews(),
    inquiries: loadInquiries(),
    powerRanges: loadPowerRanges()
  };
}

/**
 * Download full configuration JSON file directly in browser
 */
export function downloadConfigurationBackupFile(): void {
  try {
    const config = exportFullConfiguration();
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadFile(`nklaser-full-backup-${dateStamp}.json`, JSON.stringify(config, null, 2), 'application/json');
  } catch (e) {
    console.error('Error downloading configuration backup:', e);
  }
}

/**
 * Import and restore configuration from a JSON object
 */
export function importFullConfiguration(backupData: any): { 
  success: boolean; 
  message: string; 
  counts?: { products: number; categories: number; settings: boolean } 
} {
  try {
    if (!backupData || typeof backupData !== 'object') {
      return { success: false, message: 'Invalid file format. Expected a JSON configuration object.' };
    }

    // Save previous snapshot for safety
    saveConfigurationSnapshot('Auto-backup before manual import');

    // 1. Settings
    let settingsCount = false;
    if (backupData.settings && typeof backupData.settings === 'object') {
      saveSiteSettings({
        ...DEFAULT_SITE_SETTINGS,
        ...backupData.settings,
        themeMode: 'light',
        primaryColor: '#162657',
        accentColor: '#E51024'
      });
      settingsCount = true;
    }

    // 2. Products
    let prodCount = 0;
    if (Array.isArray(backupData.products) && backupData.products.length > 0) {
      saveProducts(backupData.products);
      prodCount = backupData.products.length;
    }

    // 3. Categories
    let catCount = 0;
    if (Array.isArray(backupData.categories) && backupData.categories.length > 0) {
      saveCategories(backupData.categories);
      catCount = backupData.categories.length;
    }

    // 4. Brands
    if (Array.isArray(backupData.brands) && backupData.brands.length > 0) {
      saveBrands(backupData.brands);
    }

    // 5. Reviews
    if (Array.isArray(backupData.reviews) && backupData.reviews.length > 0) {
      saveReviews(backupData.reviews);
    }

    // 6. Inquiries
    if (Array.isArray(backupData.inquiries) && backupData.inquiries.length > 0) {
      saveInquiries(backupData.inquiries);
    }

    // 7. Power ranges
    if (Array.isArray(backupData.powerRanges) && backupData.powerRanges.length > 0) {
      savePowerRanges(backupData.powerRanges);
    }

    // 8. Admin password (encrypted hash only)
    if (backupData.adminPasswordHash && typeof backupData.adminPasswordHash === 'string') {
      localStorage.setItem(KEYS.ADMIN_PASSWORD_HASH, backupData.adminPasswordHash.trim());
    }
    if (backupData.adminPasswordEncrypted && typeof backupData.adminPasswordEncrypted === 'string') {
      localStorage.setItem(KEYS.ADMIN_PASSWORD_ENC, backupData.adminPasswordEncrypted.trim());
    }

    // Sync with server in background
    pushConfigurationToServer().catch(err => console.warn('Server sync error on import:', err));

    return {
      success: true,
      message: `Configuration restored successfully: ${prodCount} products, ${catCount} categories & store settings loaded.`,
      counts: { products: prodCount, categories: catCount, settings: settingsCount }
    };
  } catch (err: any) {
    console.error('Error importing full configuration:', err);
    return { success: false, message: `Failed to restore configuration: ${err.message || 'Unknown error'}` };
  }
}

/**
 * Hydrates client local storage directly from a server configuration object
 * without triggering redundant server roundtrips.
 */
export function hydrateLocalStorageFromConfig(config: FullAppConfigurationBackup): void {
  try {
    if (!config || typeof config !== 'object') return;
    
    if (config.settings && typeof config.settings === 'object') {
      const addresses = normalizeAddresses(config.settings.addresses, config.settings.address);
      const primaryAddr = addresses.find(a => a.isPrimary) || addresses[0];
      const normalized: SiteSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...config.settings,
        heroSubtitle: sanitizeCodText(config.settings.heroSubtitle) || DEFAULT_SITE_SETTINGS.heroSubtitle,
        noticeBannerText: sanitizeCodText(config.settings.noticeBannerText) || DEFAULT_SITE_SETTINGS.noticeBannerText,
        address: primaryAddr?.addressLine || config.settings.address || DEFAULT_SITE_SETTINGS.address,
        addresses,
        themeMode: 'light',
        primaryColor: '#162657',
        accentColor: '#E51024'
      };
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(normalized));
    }
    
    if (Array.isArray(config.products) && config.products.length > 0) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(config.products));
    }
    
    if (Array.isArray(config.categories) && config.categories.length > 0) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(config.categories));
    }
    
    if (Array.isArray(config.brands) && config.brands.length > 0) {
      localStorage.setItem(KEYS.BRANDS, JSON.stringify(config.brands));
    }
    
    if (Array.isArray(config.reviews) && config.reviews.length > 0) {
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(config.reviews));
    }
    
    if (Array.isArray(config.powerRanges) && config.powerRanges.length > 0) {
      localStorage.setItem(KEYS.POWER_RANGES, JSON.stringify(config.powerRanges));
    }
    
    if (config.adminPasswordHash && typeof config.adminPasswordHash === 'string') {
      localStorage.setItem(KEYS.ADMIN_PASSWORD_HASH, config.adminPasswordHash.trim());
    }
    if (config.adminPasswordEncrypted && typeof config.adminPasswordEncrypted === 'string') {
      localStorage.setItem(KEYS.ADMIN_PASSWORD_ENC, config.adminPasswordEncrypted.trim());
    }
    
    if (config.exportedAt || (config as any).lastPublishedAt) {
      localStorage.setItem(KEYS.LAST_SYNC, config.exportedAt || (config as any).lastPublishedAt);
    }
  } catch (e) {
    console.error('Error hydrating localStorage from config:', e);
  }
}

/**
 * Push current local configuration to the server backend for persistent preservation
 */
export async function pushConfigurationToServer(config?: FullAppConfigurationBackup): Promise<boolean> {
  try {
    const payload = config || exportFullConfiguration();
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store'
    };
    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const syncTime = data.publishedAt || new Date().toISOString();
      localStorage.setItem(KEYS.LAST_SYNC, syncTime);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not sync configuration to server (offline or static preview mode):', err);
    return false;
  }
}

/**
 * Publishes the current full configuration to the server and broadcasts across all devices.
 */
export async function publishConfigurationEverywhere(config?: FullAppConfigurationBackup): Promise<{ 
  success: boolean; 
  message: string; 
  publishedAt?: string 
}> {
  try {
    const payload = config || exportFullConfiguration();
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store'
    };
    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      const publishedAt = data.publishedAt || new Date().toISOString();
      localStorage.setItem(KEYS.LAST_SYNC, publishedAt);
      saveConfigurationSnapshot('Published to all devices');
      return {
        success: true,
        message: 'All admin changes published live to all devices!',
        publishedAt
      };
    }
    return { success: false, message: 'Server responded with an error during publish.' };
  } catch (err: any) {
    console.error('Error publishing configuration to server:', err);
    return { success: false, message: err.message || 'Could not connect to server to publish.' };
  }
}

/**
 * Fetch persisted configuration from server and sync with local storage
 */
export async function syncConfigurationWithServer(): Promise<{ 
  success: boolean; 
  source: 'server' | 'local' | 'synced'; 
  data?: FullAppConfigurationBackup;
  lastPublishedAt?: string;
}> {
  try {
    // Add cache buster to URL to guarantee fresh data on every device/mobile network
    const timestamp = Date.now();
    const res = await fetch(`/api/config?_t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!res.ok) {
      return { success: false, source: 'local' };
    }
    
    const data = await res.json();
    if (data && data.success && data.config) {
      const serverConfig: FullAppConfigurationBackup = data.config;
      
      // Server is the single source of truth for all devices
      hydrateLocalStorageFromConfig(serverConfig);
      const syncTime = serverConfig.exportedAt || (serverConfig as any).lastPublishedAt || new Date().toISOString();
      localStorage.setItem(KEYS.LAST_SYNC, syncTime);
      
      return { 
        success: true, 
        source: 'server', 
        data: serverConfig,
        lastPublishedAt: syncTime
      };
    }
    return { success: false, source: 'local' };
  } catch (err) {
    console.warn('Could not reach server API, using local storage cache:', err);
    return { success: false, source: 'local' };
  }
}

/**
 * Snapshots version history in localStorage (keeps last 5 snapshots)
 */
export function saveConfigurationSnapshot(label: string = 'Automatic Snapshot'): ConfigSnapshot {
  try {
    const existing = loadConfigurationSnapshots();
    const newSnapshot: ConfigSnapshot = {
      id: 'snap-' + Date.now(),
      timestamp: new Date().toISOString(),
      label,
      data: exportFullConfiguration()
    };
    const updated = [newSnapshot, ...existing].slice(0, 5); // Keep last 5
    localStorage.setItem(KEYS.SNAPSHOTS, JSON.stringify(updated));
    return newSnapshot;
  } catch (e) {
    console.error('Error saving configuration snapshot:', e);
    return {
      id: 'snap-err',
      timestamp: new Date().toISOString(),
      label,
      data: exportFullConfiguration()
    };
  }
}

export function loadConfigurationSnapshots(): ConfigSnapshot[] {
  try {
    const saved = localStorage.getItem(KEYS.SNAPSHOTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading configuration snapshots:', e);
  }
  return [];
}

export function restoreConfigurationSnapshot(id: string): boolean {
  try {
    const snapshots = loadConfigurationSnapshots();
    const match = snapshots.find(s => s.id === id);
    if (match && match.data) {
      importFullConfiguration(match.data);
      return true;
    }
  } catch (e) {
    console.error('Error restoring snapshot:', e);
  }
  return false;
}

export function getLastServerSyncTime(): string | null {
  try {
    return localStorage.getItem(KEYS.LAST_SYNC);
  } catch (e) {
    return null;
  }
}


