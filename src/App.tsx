import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/client/Navbar';
import { Hero } from './components/client/Hero';
import { SparesShopBanner } from './components/client/SparesShopBanner';
import { CategoryHub } from './components/client/CategoryHub';
import { FeaturedDiscovery } from './components/client/FeaturedDiscovery';
import { BrandsSection } from './components/client/BrandsSection';
import { ServiceShowcase } from './components/client/ServiceShowcase';
import { ReviewsSection } from './components/client/ReviewsSection';
import { ContactSection } from './components/client/ContactSection';
import { Footer } from './components/client/Footer';
import { InquiryModal } from './components/client/InquiryModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { StoreCatalogView } from './components/client/StoreCatalogView';
import { ProductDetailView } from './components/client/ProductDetailView';
import { SEOHead } from './components/common/SEOHead';
import { 
  ProductItem, 
  SiteSettings, 
  BrandItem, 
  ReviewItem, 
  InquiryRecord,
  ThemeMode, 
  PageView, 
  ProductCategoryDef,
  AdminTabType,
  FullAppConfigurationBackup
} from './types';
import { 
  loadSiteSettings, 
  saveSiteSettings, 
  loadProducts, 
  loadBrands, 
  loadReviews, 
  saveReviews,
  loadCategories,
  loadPowerRanges,
  loadInquiries,
  syncConfigurationWithServer
} from './lib/storage';
import {
  fetchPublicSettings,
  fetchPublicProducts,
  fetchPublicCategories,
  fetchPublicBrands,
  fetchPublicReviews,
  fetchPublicPowerRanges
} from './lib/api';
import { applyThemeToDocument, DEFAULT_PRIMARY_COLOR, DEFAULT_ACCENT_COLOR } from './utils/themeColors';
import { parseUrlState, updateBrowserUrl } from './utils/navigation';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(loadSiteSettings());
  const [categories, setCategories] = useState<ProductCategoryDef[]>(loadCategories());
  const [powerRanges, setPowerRanges] = useState<string[]>(loadPowerRanges());
  const [products, setProducts] = useState<ProductItem[]>(loadProducts());
  const [brands, setBrands] = useState<BrandItem[]>(loadBrands());
  const [reviews, setReviews] = useState<ReviewItem[]>(loadReviews());
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(loadInquiries());

  // Multi-page navigation state (defaults to home landing page)
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>('');
  const [storePower, setStorePower] = useState<string>('all');
  const [storeStockOnly, setStoreStockOnly] = useState<boolean>(false);
  const [storeSortBy, setStoreSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>('popular');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Modals & Admin
  const [inquiryModalItem, setInquiryModalItem] = useState<ProductItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTabType>('dashboard');

  // Apply URL state to local React state
  const applyParsedUrlState = useCallback((urlSearch: string, urlHash: string, productList: ProductItem[], catList: ProductCategoryDef[]) => {
    const parsed = parseUrlState(urlSearch, urlHash, productList, catList);
    setCurrentView(parsed.view);
    setSelectedProduct(parsed.product);
    setSelectedCategorySlug(parsed.categorySlug);
    setSelectedBrand(parsed.brand);
    setStorePower(parsed.power);
    setStoreSearchQuery(parsed.searchQuery);
    setStoreStockOnly(parsed.stockOnly);
    setStoreSortBy(parsed.sortBy);
    setIsAdminOpen(parsed.isAdminOpen);
    setAdminTab(parsed.adminTab);
    if (parsed.inquireProduct) {
      setInquiryModalItem(parsed.inquireProduct);
    }

    if (parsed.section && parsed.view === 'home') {
      setTimeout(() => {
        const el = document.getElementById(parsed.section!);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // Initialize and ensure standard white theme across document & multi-device sync
  useEffect(() => {
    applyThemeToDocument('light', DEFAULT_PRIMARY_COLOR, DEFAULT_ACCENT_COLOR);
    
    let lastKnownVersion = localStorage.getItem('nklaser_last_server_sync') || '';

    const applyConfigurationState = (config: FullAppConfigurationBackup) => {
      if (config.settings) setSettings(config.settings);
      if (config.categories && config.categories.length > 0) setCategories(config.categories);
      if (config.powerRanges && config.powerRanges.length > 0) setPowerRanges(config.powerRanges);
      if (config.products && config.products.length > 0) setProducts(config.products);
      if (config.brands && config.brands.length > 0) setBrands(config.brands);
      if (config.reviews && config.reviews.length > 0) setReviews(config.reviews);
      setInquiries(loadInquiries());
      applyParsedUrlState(window.location.search, window.location.hash, config.products || [], config.categories || []);
    };

    const refreshStateFromStorage = async () => {
      // First load instant cached state
      const s = loadSiteSettings();
      const c = loadCategories();
      const p = loadProducts();
      const b = loadBrands();
      const r = loadReviews();
      const pr = loadPowerRanges();
      const inqs = loadInquiries();
      setSettings(s);
      setCategories(c);
      setPowerRanges(pr);
      setProducts(p);
      setBrands(b);
      setReviews(r);
      setInquiries(inqs);

      // Async live fetch from backend API
      try {
        const [apiSettings, apiProducts, apiCats, apiBrands, apiPower, apiReviews] = await Promise.allSettled([
          fetchPublicSettings(),
          fetchPublicProducts(),
          fetchPublicCategories(),
          fetchPublicBrands(),
          fetchPublicPowerRanges(),
          fetchPublicReviews()
        ]);

        if (apiSettings.status === 'fulfilled' && apiSettings.value) setSettings(apiSettings.value);
        const resolvedProducts = (apiProducts.status === 'fulfilled' && apiProducts.value && apiProducts.value.length > 0) ? apiProducts.value : p;
        const resolvedCategories = (apiCats.status === 'fulfilled' && apiCats.value && apiCats.value.length > 0) ? apiCats.value : c;
        if (apiProducts.status === 'fulfilled' && apiProducts.value && apiProducts.value.length > 0) setProducts(apiProducts.value);
        if (apiCats.status === 'fulfilled' && apiCats.value && apiCats.value.length > 0) setCategories(apiCats.value);
        if (apiBrands.status === 'fulfilled' && apiBrands.value && apiBrands.value.length > 0) setBrands(apiBrands.value);
        if (apiPower.status === 'fulfilled' && apiPower.value && apiPower.value.length > 0) setPowerRanges(apiPower.value);
        if (apiReviews.status === 'fulfilled' && apiReviews.value && apiReviews.value.length > 0) setReviews(apiReviews.value);

        applyParsedUrlState(window.location.search, window.location.hash, resolvedProducts, resolvedCategories);
      } catch (err) {
        // Fallback gracefully on cached state
      }
    };

    // Immediate background sync with authoritative server configuration
    syncConfigurationWithServer().then((res) => {
      if (res.success && res.data) {
        if (res.lastPublishedAt) lastKnownVersion = res.lastPublishedAt;
        applyConfigurationState(res.data);
      }
    }).catch(() => {});

    // Poller for real-time live synchronization across all devices & browsers
    const checkLiveVersion = async () => {
      try {
        const res = await fetch(`/api/version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data && data.success && data.lastPublishedAt) {
          if (!lastKnownVersion || data.lastPublishedAt !== lastKnownVersion) {
            lastKnownVersion = data.lastPublishedAt;
            const syncRes = await syncConfigurationWithServer();
            if (syncRes.success && syncRes.data) {
              applyConfigurationState(syncRes.data);
            }
          }
        }
      } catch {
        // Silently ignore temporary network glitches
      }
    };

    // Auto-poll every 12 seconds when the user has the page open
    const livePollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkLiveVersion();
      }
    }, 12000);

    // Listen for tab focus/visibility to automatically pull latest published changes without manual refresh
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkLiveVersion();
      }
    };

    // Instant local custom event listener
    const handleConfigPublished = () => {
      checkLiveVersion();
    };

    // Cross-tab broadcast channel for instantaneous 0ms update across tabs in same browser
    let broadcast: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcast = new BroadcastChannel('nk_laser_realtime_sync');
        broadcast.onmessage = () => {
          checkLiveVersion();
        };
      }
    } catch {}

    // Cross-tab storage change synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('nk_laser_') || e.key.startsWith('nklaser_'))) {
        refreshStateFromStorage();
      }
    };

    // Real-time inquiries update listener
    const handleInquiriesUpdated = () => {
      setInquiries(loadInquiries());
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nk_laser_config_published', handleConfigPublished);
    window.addEventListener('nk_laser_inquiries_updated', handleInquiriesUpdated);

    return () => {
      clearInterval(livePollInterval);
      broadcast?.close();
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nk_laser_config_published', handleConfigPublished);
      window.removeEventListener('nk_laser_inquiries_updated', handleInquiriesUpdated);
    };
  }, []);

  // Synchronize on initial mount and when browser Back / Forward buttons are clicked (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply URL parameters immediately
    applyParsedUrlState(window.location.search, window.location.hash, products, categories);

    const handlePopState = () => {
      applyParsedUrlState(window.location.search, window.location.hash, products, categories);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [applyParsedUrlState, products, categories]);

  // Sync settings and state when updated in admin
  const handleSettingsUpdated = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    setCategories(loadCategories());
    setPowerRanges(loadPowerRanges());
    setProducts(loadProducts());
    setBrands(loadBrands());
    setReviews(loadReviews());
  };

  const handleToggleTheme = (_mode: ThemeMode) => {
    const updated = { ...settings, themeMode: 'light' as ThemeMode };
    setSettings(updated);
    saveSiteSettings(updated);
  };

  const handleAddReview = (newReview: ReviewItem) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    saveReviews(updated);
  };

  // Navigation handlers with clean URL updating
  const handleNavigatePage = (view: PageView, targetSection?: string) => {
    setCurrentView(view);
    if (view !== 'product-detail') {
      setSelectedProduct(null);
    }
    setIsAdminOpen(false);
    
    updateBrowserUrl({ 
      view, 
      section: targetSection, 
      isAdminOpen: false,
      product: view === 'product-detail' ? selectedProduct : null,
      categorySlug: view === 'store' ? selectedCategorySlug : undefined,
      brand: view === 'store' ? selectedBrand : undefined,
      power: view === 'store' ? storePower : undefined,
      searchQuery: view === 'store' ? storeSearchQuery : undefined,
      stockOnly: view === 'store' ? storeStockOnly : undefined,
      sortBy: view === 'store' ? storeSortBy : undefined
    }, { pushHistory: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'home' && targetSection) {
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleOpenStoreWithCategory = (categorySlug: string) => {
    setSelectedCategorySlug(categorySlug);
    setSelectedBrand('all');
    setStoreSearchQuery('');
    setStorePower('all');
    setSelectedProduct(null);
    setCurrentView('store');
    setIsAdminOpen(false);

    updateBrowserUrl({
      view: 'store',
      categorySlug,
      brand: 'all',
      searchQuery: '',
      power: 'all',
      stockOnly: storeStockOnly,
      sortBy: storeSortBy,
      isAdminOpen: false
    }, { pushHistory: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStoreWithBrand = (brandName: string) => {
    setSelectedCategorySlug('all');
    setSelectedBrand(brandName);
    setStoreSearchQuery('');
    setStorePower('all');
    setSelectedProduct(null);
    setCurrentView('store');
    setIsAdminOpen(false);

    updateBrowserUrl({
      view: 'store',
      categorySlug: 'all',
      brand: brandName,
      searchQuery: '',
      power: 'all',
      stockOnly: storeStockOnly,
      sortBy: storeSortBy,
      isAdminOpen: false
    }, { pushHistory: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStoreWithSubcategory = (subcategoryName: string) => {
    setSelectedCategorySlug('all');
    setSelectedBrand('all');
    setStoreSearchQuery(subcategoryName);
    setStorePower('all');
    setSelectedProduct(null);
    setCurrentView('store');
    setIsAdminOpen(false);

    updateBrowserUrl({
      view: 'store',
      categorySlug: 'all',
      brand: 'all',
      searchQuery: subcategoryName,
      power: 'all',
      stockOnly: storeStockOnly,
      sortBy: storeSortBy,
      isAdminOpen: false
    }, { pushHistory: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    setIsAdminOpen(false);

    updateBrowserUrl({
      view: 'product-detail',
      product,
      isAdminOpen: false
    }, { pushHistory: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedProduct(null);
    setCurrentView('store');
    setIsAdminOpen(false);

    updateBrowserUrl({
      view: 'store',
      categorySlug: selectedCategorySlug,
      brand: selectedBrand,
      power: storePower,
      searchQuery: storeSearchQuery,
      stockOnly: storeStockOnly,
      sortBy: storeSortBy,
      isAdminOpen: false
    }, { pushHistory: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFromHome = (query: string) => {
    setSelectedCategorySlug('all');
    setSelectedBrand('all');
    setStoreSearchQuery(query);
    setStorePower('all');
    setSelectedProduct(null);
    setCurrentView('store');
    setIsAdminOpen(false);

    updateBrowserUrl({
      view: 'store',
      categorySlug: 'all',
      brand: 'all',
      searchQuery: query,
      power: 'all',
      stockOnly: storeStockOnly,
      sortBy: storeSortBy,
      isAdminOpen: false
    }, { pushHistory: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = (tab: AdminTabType = 'dashboard') => {
    setIsAdminOpen(true);
    setAdminTab(tab);

    updateBrowserUrl({
      isAdminOpen: true,
      adminTab: tab,
      view: currentView,
      product: selectedProduct,
      categorySlug: selectedCategorySlug,
      brand: selectedBrand,
      power: storePower,
      searchQuery: storeSearchQuery,
      stockOnly: storeStockOnly,
      sortBy: storeSortBy
    }, { pushHistory: true });
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);

    updateBrowserUrl({
      isAdminOpen: false,
      view: currentView,
      product: selectedProduct,
      categorySlug: selectedCategorySlug,
      brand: selectedBrand,
      power: storePower,
      searchQuery: storeSearchQuery,
      stockOnly: storeStockOnly,
      sortBy: storeSortBy
    }, { pushHistory: true });
  };

  const handleAdminTabChange = (tab: AdminTabType) => {
    setAdminTab(tab);
    updateBrowserUrl({
      isAdminOpen: true,
      adminTab: tab,
      view: currentView,
      product: selectedProduct,
      categorySlug: selectedCategorySlug,
      brand: selectedBrand,
      power: storePower,
      searchQuery: storeSearchQuery,
      stockOnly: storeStockOnly,
      sortBy: storeSortBy
    }, { pushHistory: false });
  };

  const selectedCategory = categories.find(c => c.slug === selectedCategorySlug) || null;

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 selection:bg-amber-500 selection:text-zinc-950 flex flex-col justify-between bg-zinc-50 text-zinc-900">
      
      {/* Dynamic SEO Head with React Helmet for Search Engine Visibility */}
      <SEOHead
        currentView={currentView}
        selectedProduct={selectedProduct}
        selectedCategory={selectedCategory}
        selectedCategorySlug={selectedCategorySlug}
        selectedBrand={selectedBrand}
        storeSearchQuery={storeSearchQuery}
        storePower={storePower}
        isAdminOpen={isAdminOpen}
        settings={settings}
      />

      {/* Sticky Navigation Bar */}
      <Navbar
        settings={settings}
        categories={categories}
        currentView={currentView}
        onNavigatePage={handleNavigatePage}
        onOpenAdmin={() => handleOpenAdmin('dashboard')}
        onOpenQuoteTool={() => handleNavigatePage('store')}
        onToggleTheme={handleToggleTheme}
        onOpenStoreWithCategory={handleOpenStoreWithCategory}
        onOpenStoreWithBrand={handleOpenStoreWithBrand}
        onSearchStore={(query) => {
          setSelectedCategorySlug('all');
          setSelectedBrand('all');
          setStoreSearchQuery(query);
          setSelectedProduct(null);
          setCurrentView('store');
          setIsAdminOpen(false);
          updateBrowserUrl({
            view: 'store',
            categorySlug: 'all',
            brand: 'all',
            searchQuery: query,
            power: 'all',
            isAdminOpen: false
          }, { pushHistory: true });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Router / View Controller */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME PAGE (Direct Live Landing Page for NK Laser Spares) */}
        {currentView === 'home' && (
          <div className="flex flex-col">
            {/* 01 - Hero Section */}
            <Hero
              settings={settings}
              onExploreShop={() => handleNavigatePage('store')}
              onExploreBrands={() => handleNavigatePage('store')}
            />

            {/* 02 - Introduction Strip */}
            <SparesShopBanner
              settings={settings}
            />

            {/* 03 - Core Product Categories (Asymmetric) */}
            <CategoryHub
              settings={settings}
              categories={categories}
              onOpenStoreWithCategory={handleOpenStoreWithCategory}
              onNavigatePage={handleNavigatePage}
            />

            {/* 04 - Featured Product Discovery */}
            <FeaturedDiscovery
              products={products}
              settings={settings}
              inquiries={inquiries}
              onSearch={handleSearchFromHome}
              onProductClick={handleSelectProduct}
            />

            {/* 05 - Brand / Technology Strip */}
            <BrandsSection 
              settings={settings}
              brands={brands}
              onOpenBrand={handleOpenStoreWithBrand}
            />

            {/* 06 & 08 - Why NKL & How To Source */}
            <ServiceShowcase 
              settings={settings}
            />
          </div>
        )}

        {/* VIEW 2: DEDICATED E-COMMERCE SPARES STORE */}
        {currentView === 'store' && (
          <StoreCatalogView
            products={products}
            settings={settings}
            categories={categories}
            powerRanges={powerRanges}
            selectedCategorySlug={selectedCategorySlug}
            selectedBrand={selectedBrand}
            initialSearchQuery={storeSearchQuery}
            initialPower={storePower}
            initialStockOnly={storeStockOnly}
            initialSortBy={storeSortBy}
            onSelectCategory={(slug) => {
              setSelectedCategorySlug(slug);
            }}
            onSelectBrand={(brand) => {
              setSelectedBrand(brand);
            }}
            onSelectProduct={handleSelectProduct}
            onOpenQuickInquiry={(product) => setInquiryModalItem(product)}
          />
        )}

        {/* VIEW 3: DEDICATED PRODUCT DETAILS PAGE */}
        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            allProducts={products}
            settings={settings}
            categories={categories}
            onBackToCatalog={handleBackToCatalog}
            onSelectProduct={handleSelectProduct}
            onOpenCategory={handleOpenStoreWithCategory}
            onOpenBrand={handleOpenStoreWithBrand}
          />
        )}

        {/* VIEW 4: CLIENT REVIEWS PAGE */}
        {currentView === 'reviews' && (
          <div className="py-4 sm:py-6">
            <ReviewsSection
              reviews={reviews}
              themeMode={settings.themeMode}
              settings={settings}
              onAddReview={handleAddReview}
            />
          </div>
        )}

        {/* VIEW 5: DEDICATED CONTACT & INQUIRY PAGE */}
        {currentView === 'contact' && (
          <div className="py-4 sm:py-6">
            <ContactSection settings={settings} />
          </div>
        )}
      </main>

      {/* Persistent Footer with Bottom Admin Panel Link */}
      <Footer
        settings={settings}
        categories={categories}
        brands={brands}
        onOpenAdmin={() => handleOpenAdmin('dashboard')}
        onOpenQuoteTool={() => handleNavigatePage('store')}
        onOpenCategory={handleOpenStoreWithCategory}
        onOpenBrand={handleOpenStoreWithBrand}
        onOpenSubcategory={handleOpenStoreWithSubcategory}
        onNavigatePage={handleNavigatePage}
      />

      {/* Product Quick Inquiry Modal */}
      {inquiryModalItem && (
        <InquiryModal
          item={inquiryModalItem}
          settings={settings}
          onClose={() => setInquiryModalItem(null)}
        />
      )}

      {/* Protected Admin Control Panel */}
      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          initialTab={adminTab}
          onTabChange={handleAdminTabChange}
          onClose={handleCloseAdmin}
          onSettingsUpdated={handleSettingsUpdated}
          onProductsUpdated={(newProds) => {
            setProducts(newProds);
          }}
          onCategoriesUpdated={(newCats) => {
            setCategories(newCats);
          }}
          onInquiriesUpdated={(newInqs) => {
            setInquiries(newInqs);
          }}
          onReviewsUpdated={(newRevs) => {
            setReviews(newRevs);
          }}
        />
      )}

    </div>
  );
}

