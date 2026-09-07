import { PageView, ProductItem, ProductCategoryDef, AdminTabType } from '../types';
import { slugify, getProductSlug, findProductBySlug, findCategoryBySlug } from './seo';

export interface UrlState {
  view: PageView;
  product: ProductItem | null;
  categorySlug: string;
  brand: string;
  power: string;
  searchQuery: string;
  stockOnly: boolean;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'name';
  isAdminOpen: boolean;
  adminTab: AdminTabType;
  inquireProduct: ProductItem | null;
  section?: string;
}

export interface PartialUrlState {
  view?: PageView;
  product?: ProductItem | string | null;
  categorySlug?: string;
  brand?: string;
  power?: string;
  searchQuery?: string;
  stockOnly?: boolean;
  sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'name';
  isAdminOpen?: boolean;
  adminTab?: AdminTabType;
  inquireProduct?: ProductItem | string | null;
  section?: string;
}

export const DEFAULT_ADMIN_PORTAL_KEY = 'nk-vault-9921-x';

/**
 * Parses URL search params, pathname, and hash into structured app state
 */
export function parseUrlState(
  searchString: string,
  hashString: string,
  products: ProductItem[],
  categories: ProductCategoryDef[]
): UrlState {
  const params = new URLSearchParams(searchString || (typeof window !== 'undefined' ? window.location.search : ''));
  const hash = (hashString || (typeof window !== 'undefined' ? window.location.hash : '')).replace(/^#/, '');
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';

  // 1. Unpredictable Admin Portal Access:
  // Strictly ignores /admin or ?admin=true to prevent discovery by scanners, bots & HTTP trackers.
  let activePortalKey = DEFAULT_ADMIN_PORTAL_KEY;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('nklaser_site_settings_v3') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.adminSecretKey && typeof parsed.adminSecretKey === 'string' && parsed.adminSecretKey.trim()) {
        activePortalKey = parsed.adminSecretKey.trim().toLowerCase();
      }
    }
  } catch (e) {}

  const vaultParam = params.get('vault') || params.get('portal_key') || params.get('secret_key');
  const isSecretPath = pathname === `/${activePortalKey}` || pathname.startsWith(`/${activePortalKey}/`);
  const isSecretParam = Boolean(vaultParam && (vaultParam.toLowerCase() === activePortalKey || vaultParam.toLowerCase() === DEFAULT_ADMIN_PORTAL_KEY));
  const isAdminOpen = isSecretPath || isSecretParam;

  const rawTab = params.get('tab') as AdminTabType;
  const validTabs: AdminTabType[] = ['dashboard', 'categories', 'products', 'filters', 'inquiries', 'reviews', 'settings', 'security'];
  const adminTab: AdminTabType = validTabs.includes(rawTab) ? rawTab : 'dashboard';

  // 2. Product selection (check /product/:slug pathname, or product/sku query params)
  let product: ProductItem | null = null;
  let isProductPath = false;

  if (pathname.startsWith('/product/')) {
    const pathSlug = pathname.replace('/product/', '').replace(/\/$/, '').trim();
    if (pathSlug) {
      isProductPath = true;
      product = findProductBySlug(pathSlug, products);
    }
  }

  const productParam = params.get('product') || params.get('sku') || params.get('p');
  if (!product && productParam && products.length > 0) {
    const target = decodeURIComponent(productParam).toLowerCase().trim();
    product = findProductBySlug(target, products);
  }

  // 3. Quick inquiry modal parameter
  const inquireParam = params.get('inquire');
  let inquireProduct: ProductItem | null = null;
  if (inquireParam && products.length > 0) {
    const target = decodeURIComponent(inquireParam).toLowerCase().trim();
    inquireProduct = findProductBySlug(target, products);
  }

  // 4. Store & Category parameters (check /category/:slug pathname, or cat query param)
  let categorySlug = 'all';
  let isCategoryPath = false;

  if (pathname.startsWith('/category/')) {
    const catSlug = pathname.replace('/category/', '').replace(/\/$/, '').trim();
    if (catSlug) {
      isCategoryPath = true;
      const matchedCat = findCategoryBySlug(catSlug, categories);
      categorySlug = matchedCat ? matchedCat.slug : catSlug;
    }
  }

  const catParam = params.get('cat') || params.get('category');
  if (catParam) {
    const decodedCat = decodeURIComponent(catParam).toLowerCase().trim();
    const matchedCat = findCategoryBySlug(decodedCat, categories);
    categorySlug = matchedCat ? matchedCat.slug : (decodedCat !== 'all' ? decodedCat : 'all');
  }

  const brandParam = params.get('brand');
  const brand = brandParam ? decodeURIComponent(brandParam).trim() : 'all';

  const powerParam = params.get('power');
  const power = powerParam ? decodeURIComponent(powerParam).trim() : 'all';

  const qParam = params.get('q') || params.get('search') || params.get('query');
  const searchQuery = qParam ? decodeURIComponent(qParam).trim() : '';

  const stockParam = params.get('stock');
  const stockOnly = stockParam === '1' || stockParam === 'true';

  const sortParam = params.get('sort');
  const validSorts = ['popular', 'price-asc', 'price-desc', 'name'];
  const sortBy: 'popular' | 'price-asc' | 'price-desc' | 'name' = 
    validSorts.includes(sortParam || '') ? (sortParam as any) : 'popular';

  // 5. Determine primary view
  const viewParam = params.get('view');
  let view: PageView = 'home';
  let parsedSection: string | undefined = hash || undefined;

  if (product || isProductPath || viewParam === 'product-detail') {
    view = 'product-detail';
  } else if (
    isCategoryPath ||
    pathname === '/store' ||
    pathname === '/catalog' ||
    viewParam === 'store' || 
    catParam || 
    brandParam || 
    powerParam || 
    qParam || 
    stockParam || 
    sortParam
  ) {
    view = 'store';
  } else if (pathname === '/reviews' || viewParam === 'reviews' || hash === 'reviews') {
    view = 'reviews';
  } else if (pathname === '/contact' || viewParam === 'contact' || hash === 'contact') {
    view = 'contact';
  } else if (pathname === '/services' || pathname.startsWith('/services/') || hash === 'services') {
    view = 'home';
    parsedSection = 'services';
  } else if (viewParam === 'home') {
    view = 'home';
  } else {
    view = 'home';
  }

  return {
    view,
    product,
    categorySlug,
    brand,
    power,
    searchQuery,
    stockOnly,
    sortBy,
    isAdminOpen,
    adminTab,
    inquireProduct,
    section: parsedSection
  };
}

/**
 * Builds a clean canonical URL string based on the provided state
 */
export function buildAppUrl(state: PartialUrlState): string {
  if (typeof window === 'undefined') return '/';

  // 1. Admin vault access
  if (state.isAdminOpen) {
    let currentKey = DEFAULT_ADMIN_PORTAL_KEY;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('nklaser_site_settings_v3') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.adminSecretKey && typeof parsed.adminSecretKey === 'string' && parsed.adminSecretKey.trim()) {
          currentKey = parsed.adminSecretKey.trim();
        }
      }
    } catch (e) {}

    const params = new URLSearchParams();
    params.set('vault', currentKey);
    if (state.adminTab && state.adminTab !== 'dashboard') {
      params.set('tab', state.adminTab);
    }
    return `/?${params.toString()}`;
  }

  const view = state.view || 'home';
  const hash = state.section ? `#${state.section.replace(/^#/, '')}` : '';

  // 2. Product Detail: clean /product/:slug
  if (view === 'product-detail' && state.product) {
    let slug = '';
    if (typeof state.product === 'string') {
      slug = slugify(state.product);
    } else {
      slug = getProductSlug(state.product);
    }
    const params = new URLSearchParams();
    if (state.inquireProduct) {
      const inqSku = typeof state.inquireProduct === 'string' ? state.inquireProduct : (state.inquireProduct.sku || state.inquireProduct.id);
      params.set('inquire', inqSku);
    }
    const qStr = params.toString();
    return `/product/${slug}${qStr ? `?${qStr}` : ''}${hash}`;
  }

  // 3. Store / Category: clean /category/:slug or /store
  if (view === 'store') {
    const hasSpecialFilters = (state.brand && state.brand !== 'all') ||
      (state.power && state.power !== 'all') ||
      (state.searchQuery && state.searchQuery.trim()) ||
      state.stockOnly ||
      (state.sortBy && state.sortBy !== 'popular') ||
      state.inquireProduct;

    // Clean category path when just browsing that category
    if (state.categorySlug && state.categorySlug !== 'all' && !hasSpecialFilters) {
      return `/category/${slugify(state.categorySlug)}${hash}`;
    }

    // Faceted search /store
    const params = new URLSearchParams();
    if (state.categorySlug && state.categorySlug !== 'all') {
      params.set('cat', state.categorySlug);
    }
    if (state.brand && state.brand !== 'all') {
      params.set('brand', state.brand);
    }
    if (state.power && state.power !== 'all') {
      params.set('power', state.power);
    }
    if (state.searchQuery && state.searchQuery.trim()) {
      params.set('q', state.searchQuery.trim());
    }
    if (state.stockOnly) {
      params.set('stock', '1');
    }
    if (state.sortBy && state.sortBy !== 'popular') {
      params.set('sort', state.sortBy);
    }
    if (state.inquireProduct) {
      const inqSku = typeof state.inquireProduct === 'string' ? state.inquireProduct : (state.inquireProduct.sku || state.inquireProduct.id);
      params.set('inquire', inqSku);
    }
    const qStr = params.toString();
    return `/store${qStr ? `?${qStr}` : ''}${hash}`;
  }

  // 4. Dedicated views
  if (view === 'reviews') {
    return `/reviews${hash}`;
  }
  if (view === 'contact') {
    return `/contact${hash}`;
  }

  // 5. Home
  return `/${hash}`;
}

/**
 * Updates the browser's URL using pushState or replaceState
 */
export function updateBrowserUrl(state: PartialUrlState, options: { pushHistory?: boolean } = {}): void {
  if (typeof window === 'undefined') return;

  const targetUrl = buildAppUrl(state);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (targetUrl === currentUrl) return;

  if (options.pushHistory) {
    window.history.pushState(null, '', targetUrl);
  } else {
    window.history.replaceState(null, '', targetUrl);
  }
}
