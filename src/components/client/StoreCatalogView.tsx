import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Send, 
  Eye, 
  Check, 
  X, 
  Truck, 
  ShieldCheck, 
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Phone,
  Tag,
  ChevronsUpDown,
  RotateCcw,
  Share2
} from 'lucide-react';
import { ProductItem, SiteSettings, ProductCategoryDef } from '../../types';
import { STORE_CATEGORIES } from '../../data/categoriesData';
import { ShareCatalogModal } from './ShareCatalogModal';

interface StoreCatalogViewProps {
  products: ProductItem[];
  settings: SiteSettings;
  categories?: ProductCategoryDef[];
  powerRanges?: string[] | null;
  selectedCategorySlug?: string;
  selectedBrand?: string;
  initialSearchQuery?: string;
  initialPower?: string;
  initialStockOnly?: boolean;
  initialSortBy?: 'popular' | 'price-asc' | 'price-desc' | 'name';
  onSelectCategory: (slug: string) => void;
  onSelectBrand?: (brand: string) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenQuickInquiry: (product: ProductItem) => void;
}

export function StoreCatalogView({
  products,
  settings,
  categories,
  powerRanges,
  selectedCategorySlug = 'all',
  selectedBrand: selectedBrandProp = 'all',
  initialSearchQuery = '',
  initialPower = 'all',
  initialStockOnly = false,
  initialSortBy = 'popular',
  onSelectCategory,
  onSelectBrand,
  onSelectProduct,
  onOpenQuickInquiry
}: StoreCatalogViewProps) {
  const availableCategories = useMemo(() => {
    return categories && categories.length > 0 ? categories : STORE_CATEGORIES;
  }, [categories]);

  const availablePowerRanges = useMemo(() => {
    return powerRanges && powerRanges.length > 0 
      ? ['all', ...powerRanges] 
      : ['all', '1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 30kW', '30kW+'];
  }, [powerRanges]);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(selectedBrandProp || 'all');
  const [selectedPower, setSelectedPower] = useState<string>(initialPower || 'all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(initialStockOnly || false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>(initialSortBy || 'popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Accordion Expand / Collapse states for each filter group
  const [expandedSections, setExpandedSections] = useState<{
    categories: boolean;
    brands: boolean;
    power: boolean;
    availability: boolean;
    help: boolean;
  }>({
    categories: true,
    brands: true,
    power: true,
    availability: true,
    help: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const allExpanded = Object.values(expandedSections).every(Boolean);

  const toggleAllSections = () => {
    const nextVal = !allExpanded;
    setExpandedSections({
      categories: nextVal,
      brands: nextVal,
      power: nextVal,
      availability: nextVal,
      help: nextVal,
    });
  };

  // Synchronize state when selectedBrand prop changes
  useEffect(() => {
    if (selectedBrandProp !== undefined) {
      setSelectedBrand(selectedBrandProp);
    }
  }, [selectedBrandProp]);

  // Synchronize search query when initialSearchQuery prop changes
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Live URL synchronization: keep browser address bar encoded with active filters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('view', 'store');

    if (selectedCategorySlug && selectedCategorySlug !== 'all') {
      params.set('cat', selectedCategorySlug);
    } else {
      params.delete('cat');
    }

    if (selectedBrand && selectedBrand !== 'all') {
      params.set('brand', selectedBrand);
    } else {
      params.delete('brand');
    }

    if (selectedPower && selectedPower !== 'all') {
      params.set('power', selectedPower);
    } else {
      params.delete('power');
    }

    if (searchQuery && searchQuery.trim() !== '') {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }

    if (inStockOnly) {
      params.set('stock', '1');
    } else {
      params.delete('stock');
    }

    if (sortBy && sortBy !== 'popular') {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }

    const newSearch = params.toString() ? `?${params.toString()}` : '';
    const newUrl = `${window.location.pathname}${newSearch}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedCategorySlug, selectedBrand, selectedPower, searchQuery, inStockOnly, sortBy]);

  const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const handleBrandChange = (brand: string) => {
    const nextBrand = selectedBrand === brand ? 'all' : brand;
    setSelectedBrand(nextBrand);
    if (onSelectBrand) {
      onSelectBrand(nextBrand);
    }
  };

  // Extract all distinct brands for filter
  const allBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    const priorityBrands = ['RayTools', 'OSPRI', 'WSX', 'BOCHU', 'Precitec', 'SMC', 'BOCI'];
    priorityBrands.forEach(b => brandsSet.add(b));
    products.forEach(p => {
      if (p.brand) brandsSet.add(p.brand);
      if (p.compatibleBrands) {
        p.compatibleBrands.forEach(b => brandsSet.add(b));
      }
    });
    return Array.from(brandsSet);
  }, [products]);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategorySlug !== 'all') {
        const matchesCategory = product.categorySlug === selectedCategorySlug || 
          product.category.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') === selectedCategorySlug ||
          (selectedCategorySlug === 'laser-spares-consumables') ||
          (selectedCategorySlug === 'protective-lenses' && (product.categorySlug === 'protective-lenses' || product.title.toLowerCase().includes('lens'))) ||
          (selectedCategorySlug === 'cutting-nozzles' && (product.categorySlug === 'cutting-nozzles' || product.title.toLowerCase().includes('nozzle'))) ||
          (selectedCategorySlug === 'ceramic-rings' && (product.categorySlug === 'ceramic-rings' || product.categorySlug === 'ceramic-locking-ring' || product.title.toLowerCase().includes('ceramic'))) ||
          (selectedCategorySlug === 'focusing-collimating-lenses' && (product.categorySlug === 'focus-collimation-lens' || product.title.toLowerCase().includes('focus') || product.title.toLowerCase().includes('collimat'))) ||
          (selectedCategorySlug === 'laser-cutting-heads' && (product.categorySlug?.startsWith('cutting-head') || product.title.toLowerCase().includes('head'))) ||
          (selectedCategorySlug === 'cnc-controllers-cypcut' && (product.categorySlug === 'control-card' || product.categorySlug === 'remote-controller' || product.categorySlug === 'rf-cable-sensor-cable' || product.title.toLowerCase().includes('cypcut') || product.title.toLowerCase().includes('bochu'))) ||
          (selectedCategorySlug === 'laser-sources-qbh' && (product.categorySlug === 'laser-source' || product.categorySlug === 'qbh-protection-cap')) ||
          (selectedCategorySlug === 'pneumatic-smc-valves' && (product.categorySlug === 'smc-valve' || product.title.toLowerCase().includes('smc'))) ||
          (selectedCategorySlug === 'optics-cleaning-maintenance' && (product.categorySlug === 'cleaning-consumables' || product.categorySlug === 'safety-equipment' || product.title.toLowerCase().includes('swab') || product.title.toLowerCase().includes('clean')));

        if (!matchesCategory) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        const target = selectedBrand.toLowerCase().trim();
        const matchesBrand = Boolean(
          (product.brand && product.brand.toLowerCase() === target) ||
          (product.brand && product.brand.toLowerCase().includes(target)) ||
          (product.compatibleBrands && product.compatibleBrands.some(cb => cb.toLowerCase().includes(target) || target.includes(cb.toLowerCase()))) ||
          product.title.toLowerCase().includes(target) ||
          product.description.toLowerCase().includes(target) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(target)) ||
          (product.specs && product.specs.some(s => s.toLowerCase().includes(target))) ||
          (product.specificationsTable && product.specificationsTable.some(st => st.value.toLowerCase().includes(target) || st.label.toLowerCase().includes(target)))
        );

        if (!matchesBrand) return false;
      }

      // Power filter
      if (selectedPower !== 'all') {
        if (!product.powerRange || !product.powerRange.includes(selectedPower.replace('kW', ''))) {
          // Soft match
          if (!product.description.toLowerCase().includes(selectedPower.toLowerCase())) {
            return false;
          }
        }
      }

      // In stock only
      if (inStockOnly && product.stockStatus !== 'In Stock') {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          product.title.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          (product.sku && product.sku.toLowerCase().includes(q)) ||
          (product.brand && product.brand.toLowerCase().includes(q)) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(q)) ||
          product.specs.some(s => s.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return (a.estimatedPrice || 0) - (b.estimatedPrice || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      // default: popular/featured first
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
  }, [products, selectedCategorySlug, selectedBrand, selectedPower, inStockOnly, searchQuery, sortBy]);

  const activeCategoryDef = availableCategories.find(c => c.slug === selectedCategorySlug);

  const handleWhatsAppProduct = (p: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    let text = `*🚨 INQUIRY FOR ${p.title}*\n`;
    if (p.sku) text += `*SKU Code:* ${p.sku}\n`;
    if (p.brand) text += `*Brand:* ${p.brand}\n`;
    if (p.dimensions) text += `*Dimensions:* ${p.dimensions}\n`;
    if (settings.showPricing && p.estimatedPrice) {
      text += `*Price:* ₹${p.estimatedPrice.toLocaleString('en-IN')}\n`;
    }
    text += `\nHello NK Laser team, please let me know stock availability and dispatch time for this item.`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const resetAllFilters = () => {
    setSelectedBrand('all');
    if (onSelectBrand) {
      onSelectBrand('all');
    }
    setSelectedPower('all');
    setInStockOnly(false);
    setSearchQuery('');
    onSelectCategory('all');
  };

  const hasActiveFilters = selectedCategorySlug !== 'all' || selectedBrand !== 'all' || selectedPower !== 'all' || inStockOnly || searchQuery.trim() !== '';

  return (
    <div className={`min-h-screen pt-3 sm:pt-4 pb-8 px-4 sm:px-6 lg:px-8 transition-colors bg-zinc-50 text-zinc-900`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Streamlined Store Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 pb-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {activeCategoryDef ? activeCategoryDef.name : 'Spare Parts & Consumables Catalog'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'part' : 'parts'}
              </span>
            </div>
            <p className={`text-xs mt-1 text-zinc-500`}>
              {activeCategoryDef 
                ? activeCategoryDef.description 
                : 'Direct factory importer inventory with OEM compatibility for fiber laser cutting and welding systems.'}
            </p>
          </div>
        </div>

        {/* Category Carousel / Top Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            style={selectedCategorySlug === 'all' ? {
              backgroundColor: 'var(--primary-color, #f59e0b)',
              color: 'var(--primary-contrast, #09090b)',
              borderColor: 'var(--primary-color, #f59e0b)'
            } : {}}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategorySlug === 'all'
                ? 'shadow-xs font-black'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            All Spares ({products.length})
          </button>

          {availableCategories.map((cat) => {
            const count = products.filter(p => p.categorySlug === cat.slug).length;
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                style={isSelected ? {
                  backgroundColor: 'var(--primary-color, #f59e0b)',
                  color: 'var(--primary-contrast, #09090b)',
                  borderColor: 'var(--primary-color, #f59e0b)'
                } : {}}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'font-bold shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span>{cat.shortTitle}</span>
                {count > 0 && (
                  <span 
                    style={isSelected ? {
                      backgroundColor: 'var(--primary-contrast-badge-bg, rgba(0,0,0,0.15))',
                      color: 'var(--primary-contrast, #09090b)'
                    } : {}}
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected 
                        ? '' 
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Store Layout (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar (Desktop Filters with Expand/Collapse Accordions) */}
          {showSidebar && (
            <div className="hidden lg:block lg:col-span-3 space-y-5 transition-all duration-300">
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 bg-white border-zinc-200 shadow-xs`}>
                
                {/* Filters Top Control Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <Filter 
                      style={{ color: 'var(--primary-color, #f59e0b)' }} 
                      className="w-4 h-4" 
                    />
                    <span className="font-extrabold text-sm">Filters</span>
                    {hasActiveFilters && (
                      <span 
                        style={{ backgroundColor: 'var(--primary-color, #f59e0b)', color: 'var(--primary-contrast, #09090b)' }}
                        className="text-[10px] px-2 py-0.5 rounded-full font-black shadow-2xs"
                      >
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAllSections}
                      className="text-[11px] font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                      title={allExpanded ? "Collapse all filter sections" : "Expand all filter sections"}
                    >
                      <ChevronsUpDown 
                        style={{ color: 'var(--primary-color, #f59e0b)' }}
                        className="w-3 h-3" 
                      />
                      <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
                    </button>

                    {hasActiveFilters && (
                      <button
                        onClick={resetAllFilters}
                        style={{ color: 'var(--primary-color, #f59e0b)' }}
                        className="text-[11px] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        title="Reset all applied filters"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. Category Filter Section (Collapsible Accordion) */}
                <div className="border-b border-zinc-200/80 pb-3.5 space-y-2">
                  <button
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 group-hover:text-primary transition-colors"
                      >
                        Categories
                      </span>
                      {selectedCategorySlug !== 'all' && (
                        <span 
                          style={{ backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.15)', color: 'var(--primary-color, #f59e0b)', borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)' }}
                          className="text-[10px] font-bold px-1.5 py-0.2 rounded border"
                        >
                          1 Selected
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      style={{ color: expandedSections.categories ? 'var(--primary-color, #f59e0b)' : undefined }}
                      className={`w-4 h-4 text-zinc-400 group-hover:text-primary transition-transform duration-200 ${
                        expandedSections.categories ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>

                  {expandedSections.categories && (
                    <div className="space-y-1 text-xs pt-1 animate-in fade-in duration-200">
                      <button
                        onClick={() => onSelectCategory('all')}
                        style={selectedCategorySlug === 'all' ? {
                          backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.14)',
                          color: 'var(--primary-color, #f59e0b)',
                          fontWeight: '700'
                        } : {}}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCategorySlug === 'all'
                            ? ''
                            : 'hover:bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        <span>All Products</span>
                        <span className="font-mono text-[10px]">{products.length}</span>
                      </button>
                      {availableCategories.map(cat => {
                        const count = products.filter(p => p.categorySlug === cat.slug).length;
                        const isSelected = selectedCategorySlug === cat.slug;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.slug)}
                            style={isSelected ? {
                              backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.14)',
                              color: 'var(--primary-color, #f59e0b)',
                              fontWeight: '700'
                            } : {}}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? ''
                                : 'hover:bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="font-mono text-[10px]">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Brand Filter Section (Collapsible Accordion) */}
                <div className="border-b border-zinc-200/80 pb-3.5 space-y-2">
                  <button
                    onClick={() => toggleSection('brands')}
                    className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 group-hover:text-primary transition-colors">
                        OEM Brands
                      </span>
                      {selectedBrand !== 'all' && (
                        <span 
                          style={{ backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.15)', color: 'var(--primary-color, #f59e0b)', borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)' }}
                          className="text-[10px] font-bold px-1.5 py-0.2 rounded border"
                        >
                          {selectedBrand}
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      style={{ color: expandedSections.brands ? 'var(--primary-color, #f59e0b)' : undefined }}
                      className={`w-4 h-4 text-zinc-400 group-hover:text-primary transition-transform duration-200 ${
                        expandedSections.brands ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>

                  {expandedSections.brands && (
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs pt-1 animate-in fade-in duration-200">
                      <button
                        onClick={() => handleBrandChange('all')}
                        style={selectedBrand === 'all' ? {
                          backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.14)',
                          color: 'var(--primary-color, #f59e0b)',
                          fontWeight: '700'
                        } : {}}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                          selectedBrand === 'all'
                            ? ''
                            : 'text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        <span>All Brands</span>
                      </button>
                      {allBrands.map(brand => (
                        <button
                          key={brand}
                          onClick={() => handleBrandChange(brand)}
                          style={selectedBrand === brand ? {
                            backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.14)',
                            color: 'var(--primary-color, #f59e0b)',
                            fontWeight: '700'
                          } : {}}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                            selectedBrand === brand
                              ? ''
                              : 'text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          <span>{brand}</span>
                          {selectedBrand === brand && (
                            <Check 
                              style={{ color: 'var(--primary-color, #f59e0b)' }} 
                              className="w-3.5 h-3.5" 
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Laser Power Rating Filter (Collapsible Accordion) */}
                <div className="border-b border-zinc-200/80 pb-3.5 space-y-2">
                  <button
                    onClick={() => toggleSection('power')}
                    className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 group-hover:text-primary transition-colors">
                        Power Rating
                      </span>
                      {selectedPower !== 'all' && (
                        <span 
                          style={{ backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.15)', color: 'var(--primary-color, #f59e0b)', borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)' }}
                          className="text-[10px] font-bold px-1.5 py-0.2 rounded border"
                        >
                          {selectedPower}
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      style={{ color: expandedSections.power ? 'var(--primary-color, #f59e0b)' : undefined }}
                      className={`w-4 h-4 text-zinc-400 group-hover:text-primary transition-transform duration-200 ${
                        expandedSections.power ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>

                  {expandedSections.power && (
                    <div className="grid grid-cols-2 gap-1.5 text-xs pt-1 animate-in fade-in duration-200">
                      {availablePowerRanges.map(pow => (
                        <button
                          key={pow}
                          onClick={() => setSelectedPower(pow === selectedPower ? 'all' : pow)}
                          style={selectedPower === pow ? {
                            backgroundColor: 'var(--primary-color, #f59e0b)',
                            color: 'var(--primary-contrast, #09090b)',
                            borderColor: 'var(--primary-color, #f59e0b)'
                          } : {}}
                          className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold border transition-colors cursor-pointer ${
                            selectedPower === pow
                              ? 'font-bold shadow-2xs'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300'
                          }`}
                        >
                          {pow === 'all' ? 'All Powers' : pow}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Availability (Collapsible Accordion) */}
                <div className="border-b border-zinc-200/80 pb-3.5 space-y-2">
                  <button
                    onClick={() => toggleSection('availability')}
                    className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 group-hover:text-primary transition-colors">
                        Stock & Dispatch
                      </span>
                      {inStockOnly && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          1 Active
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      style={{ color: expandedSections.availability ? 'var(--primary-color, #f59e0b)' : undefined }}
                      className={`w-4 h-4 text-zinc-400 group-hover:text-primary transition-transform duration-200 ${
                        expandedSections.availability ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>

                  {expandedSections.availability && (
                    <div className="space-y-2 text-xs pt-1 animate-in fade-in duration-200">
                      <label 
                        style={inStockOnly ? {
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          borderColor: 'rgba(16, 185, 129, 0.3)'
                        } : {}}
                        className="flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-zinc-700/50 cursor-pointer select-none transition-colors"
                      >
                        <span className="font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>In Stock Ready</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          style={{ accentColor: 'var(--primary-color, #f59e0b)' }}
                          className="rounded cursor-pointer w-4 h-4"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* 5. Custom Fitment Help (Collapsible Accordion) */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection('help')}
                    className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        style={{ color: 'var(--primary-color, #f59e0b)' }}
                        className="text-xs font-extrabold uppercase tracking-wider"
                      >
                        Fitment Assistance
                      </span>
                    </div>
                    <ChevronDown 
                      style={{ color: 'var(--primary-color, #f59e0b)' }}
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedSections.help ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>

                  {expandedSections.help && (
                    <div 
                      style={{
                        backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.06)',
                        borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.25)'
                      }}
                      className="p-3.5 rounded-xl border space-y-2 animate-in fade-in duration-200"
                    >
                      <p className="text-[11px] text-zinc-500">
                        Send machine photo or part code to our engineering team on WhatsApp.
                      </p>
                      <a
                        href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent("Hello NK Laser, I need help identifying the right spare part for my laser cutting machine.")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary w-full text-center py-2 px-3 rounded-lg text-xs"
                      >
                        WhatsApp Part Specialist
                      </a>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Right Column: Search, Sort & Product Catalog Grid */}
          <div className={`${showSidebar ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-4 transition-all duration-300`}>
            
            {/* Top Controls Bar */}
            <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 bg-white border-zinc-200 shadow-xs`}>
              
              {/* Desktop Toggle Filter Sidebar Button */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                style={!showSidebar ? {
                  backgroundColor: 'var(--primary-color, #f59e0b)',
                  color: 'var(--primary-contrast, #09090b)',
                  borderColor: 'var(--primary-color, #f59e0b)'
                } : {}}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  !showSidebar
                    ? 'shadow-xs font-black'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                }`}
                title={showSidebar ? "Hide Filter Sidebar" : "Show Filter Sidebar"}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showSidebar ? 'Hide Filters' : 'Show Filters'}</span>
                {hasActiveFilters && (
                  <span 
                    style={{ backgroundColor: 'var(--primary-color, #f59e0b)' }}
                    className="w-2 h-2 rounded-full" 
                  />
                )}
              </button>

              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search model, nozzle size (e.g. D28, BM110, 27.9x4.1)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-primary bg-zinc-50 border-zinc-300 text-zinc-900`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold bg-zinc-50 border-zinc-300 text-zinc-700`}
              >
                <Filter 
                  style={{ color: 'var(--primary-color, #f59e0b)' }}
                  className="w-3.5 h-3.5" 
                />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span 
                    style={{ backgroundColor: 'var(--primary-color, #f59e0b)', color: 'var(--primary-contrast, #09090b)' }}
                    className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                  >
                    Active
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className={`text-xs hidden sm:inline text-zinc-500`}>
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-pointer bg-zinc-50 border-zinc-300 text-zinc-800`}
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name (A-Z)</option>
                </select>

                {/* Share Results Button */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.12)',
                    color: 'var(--primary-color, #f59e0b)',
                    borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)'
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-2xs"
                  title="Share this tailored product search with clients"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Results</span>
                  <span className="sm:hidden">Share</span>
                </button>

                {/* View Switcher */}
                <div className={`hidden sm:flex items-center rounded-xl border p-0.5 bg-zinc-50 border-zinc-300`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={viewMode === 'grid' ? {
                      backgroundColor: 'var(--primary-color, #f59e0b)',
                      color: 'var(--primary-contrast, #09090b)'
                    } : {}}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={viewMode === 'list' ? {
                      backgroundColor: 'var(--primary-color, #f59e0b)',
                      color: 'var(--primary-contrast, #09090b)'
                    } : {}}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                    title="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Active Filters Pill Strip */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`font-semibold text-zinc-500`}>
                  Showing {filteredProducts.length} items:
                </span>

                {selectedCategorySlug !== 'all' && (
                  <span 
                    style={{ 
                      backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.15)', 
                      color: 'var(--primary-color, #f59e0b)', 
                      borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)' 
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  >
                    <span>Category: {activeCategoryDef?.name}</span>
                    <button onClick={() => onSelectCategory('all')} className="cursor-pointer hover:opacity-80"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {selectedBrand !== 'all' && (
                  <span 
                    style={{ 
                      backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.15)', 
                      color: 'var(--primary-color, #f59e0b)', 
                      borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)' 
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  >
                    <span>Brand: {selectedBrand}</span>
                    <button onClick={() => handleBrandChange('all')} className="cursor-pointer hover:opacity-80">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedPower !== 'all' && (
                  <span 
                    style={{ 
                      backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.15)', 
                      color: 'var(--primary-color, #f59e0b)', 
                      borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)' 
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  >
                    <span>Power: {selectedPower}</span>
                    <button onClick={() => setSelectedPower('all')} className="cursor-pointer hover:opacity-80"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-500/30">
                    <span>In Stock Only</span>
                    <button onClick={() => setInStockOnly(false)} className="cursor-pointer hover:opacity-80"><X className="w-3 h-3" /></button>
                  </span>
                )}

                <button
                  onClick={resetAllFilters}
                  style={{ color: 'var(--primary-color, #f59e0b)' }}
                  className="text-xs font-bold hover:underline ml-2 cursor-pointer"
                >
                  Clear all
                </button>

                {/* Direct Share Pill Button */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{ 
                    backgroundColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.15)', 
                    color: 'var(--primary-color, #f59e0b)',
                    borderColor: 'rgba(var(--primary-rgb, 245, 158, 11), 0.3)'
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-transform hover:scale-102 cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Custom View ({filteredProducts.length})</span>
                </button>
              </div>
            )}

            {/* Mobile Collapsible Filter Drawer */}
            {isMobileFilterOpen && (
              <div className="lg:hidden p-4 sm:p-5 rounded-2xl border space-y-4 animate-in fade-in duration-200 bg-white border-zinc-200 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <Filter 
                      style={{ color: 'var(--primary-color, #f59e0b)' }}
                      className="w-4 h-4" 
                    />
                    <h4 className="font-bold text-xs uppercase tracking-wider">Filter Spares</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      style={{ color: 'var(--primary-color, #f59e0b)' }}
                      className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={resetAllFilters}
                        style={{ color: 'var(--primary-color, #f59e0b)' }}
                        className="text-xs font-bold"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Categories */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold block text-zinc-400">Category</label>
                  <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                    <button
                      onClick={() => onSelectCategory('all')}
                      style={selectedCategorySlug === 'all' ? {
                        backgroundColor: 'var(--primary-color, #f59e0b)',
                        color: 'var(--primary-contrast, #09090b)',
                        borderColor: 'var(--primary-color, #f59e0b)'
                      } : {}}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                        selectedCategorySlug === 'all'
                          ? 'font-bold shadow-2xs'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      All
                    </button>
                    {availableCategories.map(c => {
                      const isSel = selectedCategorySlug === c.slug;
                      return (
                        <button
                          key={c.id}
                          onClick={() => onSelectCategory(c.slug)}
                          style={isSel ? {
                            backgroundColor: 'var(--primary-color, #f59e0b)',
                            color: 'var(--primary-contrast, #09090b)',
                            borderColor: 'var(--primary-color, #f59e0b)'
                          } : {}}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                            isSel
                              ? 'font-bold shadow-2xs'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {c.shortTitle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Brands */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                  <label className="text-xs font-bold block text-zinc-500">OEM Brand</label>
                  <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                    <button
                      onClick={() => handleBrandChange('all')}
                      style={selectedBrand === 'all' ? {
                        backgroundColor: 'var(--primary-color, #f59e0b)',
                        color: 'var(--primary-contrast, #09090b)',
                        borderColor: 'var(--primary-color, #f59e0b)'
                      } : {}}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                        selectedBrand === 'all'
                          ? 'font-bold shadow-2xs'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      All
                    </button>
                    {allBrands.map(b => {
                      const isSel = selectedBrand === b;
                      return (
                        <button
                          key={b}
                          onClick={() => handleBrandChange(b)}
                          style={isSel ? {
                            backgroundColor: 'var(--primary-color, #f59e0b)',
                            color: 'var(--primary-contrast, #09090b)',
                            borderColor: 'var(--primary-color, #f59e0b)'
                          } : {}}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                            isSel
                              ? 'font-bold shadow-2xs'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Power */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                  <label className="text-xs font-bold block text-zinc-500">Power Rating</label>
                  <div className="grid grid-cols-2 gap-1">
                    {availablePowerRanges.map(pow => {
                      const isSel = selectedPower === pow;
                      return (
                        <button
                          key={pow}
                          onClick={() => setSelectedPower(pow === selectedPower ? 'all' : pow)}
                          style={isSel ? {
                            backgroundColor: 'var(--primary-color, #f59e0b)',
                            color: 'var(--primary-contrast, #09090b)',
                            borderColor: 'var(--primary-color, #f59e0b)'
                          } : {}}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border cursor-pointer text-center ${
                            isSel
                              ? 'font-bold shadow-2xs'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {pow === 'all' ? 'All' : pow}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Stock Toggle */}
                <div className="flex gap-4 text-xs pt-2 border-t border-zinc-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      style={{ accentColor: 'var(--primary-color, #f59e0b)' }}
                      className="rounded w-4 h-4 cursor-pointer"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold text-center"
                >
                  View {filteredProducts.length} Products
                </button>
              </div>
            )}

            {/* Products Listing */}
            {filteredProducts.length === 0 ? (
              <div className={`p-12 rounded-3xl border text-center space-y-4 bg-white border-zinc-200`}>
                <Search className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold">No spare parts match your filters</h3>
                <p className={`text-xs max-w-sm mx-auto text-zinc-500`}>
                  Try clearing your search query or brand selection, or contact our engineering team directly on WhatsApp for custom part sourcing.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={resetAllFilters}
                    className="btn-primary px-4 py-2 text-xs"
                  >
                    Reset All Filters
                  </button>
                  <a
                    href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent("Hello NK Laser, I am searching for a specific laser spare part that is not in the catalog.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary px-4 py-2 text-xs"
                  >
                    Inquire on WhatsApp
                  </a>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
                {filteredProducts.map((p) => {
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className={`rounded-xl sm:rounded-2xl border transition-all duration-300 group cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md bg-white border-zinc-200 hover:border-amber-400`}
                    >
                      {/* Top Image Section */}
                      <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-zinc-200">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start max-w-[85%]">
                          {p.brand && (
                            <span className="px-1.5 sm:px-2.5 py-0.5 rounded-md text-[9px] sm:text-[11px] font-black theme-bg-primary shadow-xs truncate max-w-full">
                              {p.brand}
                            </span>
                          )}
                        </div>

                        {/* SKU Tag */}
                        {p.sku && (
                          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 max-w-[90%]">
                            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-mono font-bold bg-black/80 text-amber-400 backdrop-blur-xs border border-amber-500/20 truncate block">
                              {p.sku}
                            </span>
                          </div>
                        )}

                        {/* Quick View Button on Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2 backdrop-blur-xs">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProduct(p);
                            }}
                            className="px-3.5 py-2 bg-white text-zinc-950 font-bold rounded-xl text-xs shadow-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick View</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                        <div className="space-y-1 sm:space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400">
                            <span className="truncate font-semibold text-amber-600">
                              {p.subCategory || p.category}
                            </span>
                            {p.stockStatus && (
                              <span className={`font-semibold shrink-0 ml-1 text-[9px] sm:text-[11px] ${
                                p.stockStatus === 'In Stock' ? 'text-emerald-600' : 'text-amber-500'
                              }`}>
                                ● {p.stockStatus}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors">
                            {p.title}
                          </h3>

                          {p.dimensions && (
                            <p className="text-[9px] sm:text-[11px] font-mono text-zinc-500 truncate">
                              Spec: {p.dimensions}
                            </p>
                          )}
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="pt-2 sm:pt-3 border-t border-zinc-200 space-y-1.5 sm:space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              {settings.showPricing && p.estimatedPrice ? (
                                <span className="text-xs sm:text-base font-black font-mono text-emerald-600 truncate block">
                                  ₹{p.estimatedPrice.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="text-[10px] sm:text-xs font-bold text-amber-700 truncate block">
                                  Quote on Request
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-zinc-400 shrink-0 ml-1">
                              MOQ: {p.moq || 1}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-1 sm:gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenQuickInquiry(p);
                              }}
                              className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800`}
                              title="Instant RFQ Inquiry"
                            >
                              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                              <span className="truncate">RFQ</span>
                            </button>

                            <button
                              onClick={(e) => handleWhatsAppProduct(p, e)}
                              className="btn-primary py-1.5 sm:py-2 px-1 sm:px-2 text-[10px] sm:text-xs gap-1 flex items-center justify-center rounded-lg sm:rounded-xl font-bold"
                              title="Direct WhatsApp Quote"
                            >
                              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                              <span className="truncate">WhatsApp</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-3">
                {filteredProducts.map((p) => {
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className={`p-4 rounded-2xl border transition-all duration-200 group cursor-pointer flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border-zinc-200 hover:border-amber-400 hover:shadow-xs`}
                    >
                      {/* Image & Title */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800/40">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            {p.brand && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black theme-bg-primary">
                                {p.brand}
                              </span>
                            )}
                            {p.sku && (
                              <span className="font-mono font-bold text-zinc-400">
                                {p.sku}
                              </span>
                            )}
                            {p.stockStatus && (
                              <span className="text-[10px] font-semibold text-emerald-500">
                                ● {p.stockStatus}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm truncate group-hover:text-amber-500 transition-colors">
                            {p.title}
                          </h3>

                          <p className="text-xs text-zinc-500 line-clamp-1">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200">
                        {settings.showPricing && p.estimatedPrice ? (
                          <span className="text-lg font-black font-mono text-emerald-600">
                            ₹{p.estimatedPrice.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700">
                            Quote on Request
                          </span>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenQuickInquiry(p);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer bg-zinc-100 border-zinc-300 text-zinc-800`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick RFQ</span>
                          </button>

                          <button
                            onClick={(e) => handleWhatsAppProduct(p, e)}
                            className="btn-primary px-3.5 py-1.5 text-xs gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Inquire on WhatsApp</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Share Custom Catalog Results Modal */}
      <ShareCatalogModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        filteredProducts={filteredProducts}
        totalProductsCount={products.length}
        activeFilters={{
          categorySlug: selectedCategorySlug,
          categoryName: activeCategoryDef?.name,
          brand: selectedBrand,
          power: selectedPower,
          inStockOnly,
          searchQuery,
          sortBy
        }}
        settings={settings}
      />

    </div>
  );
}
