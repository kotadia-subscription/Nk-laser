import React, { useState, useEffect } from 'react';
import { 
  Home,
  Store, 
  Menu, 
  X, 
  MessageSquare, 
  Star, 
  Phone, 
  ShieldCheck, 
  Flame, 
  ChevronDown, 
  ChevronRight,
  Truck,
  ArrowRight,
  Zap,
  ShoppingBag,
  Sparkles,
  Layers,
  Activity,
  Cpu,
  Scissors,
  Instagram,
  Disc,
  CircleDot,
  Sliders,
  Grid,
  Wrench
} from 'lucide-react';
import { SiteSettings, PageView, ProductCategoryDef } from '../../types';
import { NKLogo } from '../common/NKLogo';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { extractInstagramUsername, getInstagramUrl } from '../../utils/instagram';

interface NavbarProps {
  settings: SiteSettings;
  currentView: PageView;
  onNavigatePage: (view: PageView) => void;
  onOpenInquiryModal?: () => void;
  onToggleTheme?: (mode: 'light' | 'dark') => void;
  onOpenStoreWithCategory?: (category: string, subCategory?: string) => void;
  onOpenStoreWithBrand?: (brand: string) => void;
  onSearchStore?: (query: string) => void;
  onOpenAdmin?: () => void;
  onOpenQuoteTool?: () => void;
  categories?: ProductCategoryDef[];
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentView,
  onNavigatePage,
  onOpenInquiryModal,
  onToggleTheme,
  onOpenStoreWithCategory,
  onOpenStoreWithBrand,
  onSearchStore,
  onOpenAdmin,
  onOpenQuoteTool,
  categories = []
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);
  const [desktopExpandedCategory, setDesktopExpandedCategory] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanNumber = (settings.whatsappNumber || '+919902035374').replace(/[^0-9]/g, '');

  const availableCategories = categories.length > 0 ? categories : [
    { 
      id: 'cat-laser-spares-consumables', 
      slug: 'laser-spares-consumables', 
      name: 'Laser Spares/Consumables', 
      iconName: 'Flame', 
      description: 'Protective lens, Nozzles, Ceramic rings, Collimation & Focus lens, Sensors, RF cables',
      subCategories: [
        'Protective lens', 'Nozzles', 'Ceramic ring', 'Collimation & Focus lens', 'Sensor head TRA',
        'RF cable', 'Amplifier', 'QBH protection cap', 'Remote', 'Smc valve', 'Seal ring',
        'Cleaning consumbles', 'Ceramic locking Ring', 'Nozzle visual aligner', 'Welding reflector mirror',
        'Fiber cable', 'Bodor consumbles', 'Cutting head & controller', 'Welding controller'
      ]
    },
    { 
      id: 'cat-laser-source', 
      slug: 'laser-source', 
      name: 'Laser Source', 
      iconName: 'Zap', 
      description: 'Max, Raycus CW fiber laser sources',
      subCategories: ['Max', 'Raycus']
    },
    { 
      id: 'cat-laser-chiller', 
      slug: 'laser-chiller', 
      name: 'Laser Chiller', 
      iconName: 'Activity', 
      description: 'Hanli, S&a, Hexacool dual temperature chillers',
      subCategories: ['Hanli', 'S&a', 'Hexacool']
    }
  ];

  // Categories for the spare parts catalog popup
  // Direct application of admin featured config (categories with featured !== false are shown)
  const activeFeatured = availableCategories.filter(cat => cat.featured !== false);
  const displayCategories = activeFeatured.length > 0 ? activeFeatured : availableCategories;

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'CircleDot': return <CircleDot className="w-4 h-4 text-amber-500" />;
      case 'Disc': return <Disc className="w-4 h-4 text-orange-500" />;
      case 'Shield':
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'Flame': return <Flame className="w-4 h-4 text-[var(--accent)]" />;
      case 'Zap': return <Zap className="w-4 h-4 text-[var(--primary)]" />;
      case 'Activity': return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-emerald-500" />;
      case 'Scissors': return <Scissors className="w-4 h-4 text-[var(--accent)]" />;
      case 'Layers': return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'Sliders': return <Sliders className="w-4 h-4 text-indigo-500" />;
      case 'Grid': return <Grid className="w-4 h-4 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-cyan-500" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-amber-500" />;
      default: return <Flame className="w-4 h-4 text-[var(--accent)]" />;
    }
  };

  const navItems: { id: PageView; label: string; icon: React.FC<{ className?: string }>; badge?: string; hasDropdown?: boolean }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'store', label: 'Spare Parts Catalog', icon: Store, badge: 'Direct Importer', hasDropdown: true },
    { id: 'reviews', label: 'Client Reviews', icon: Star },
    { id: 'contact', label: 'Contact & RFQ', icon: Phone }
  ];

  const handleMouseEnter = (id: string) => {
    setHoveredMenu(id);
  };

  const handleMouseLeave = () => {
    setHoveredMenu(null);
  };

  const handleCategorySelect = (categorySlug: string) => {
    setHoveredMenu(null);
    setMobileMenuOpen(false);
    if (onOpenStoreWithCategory) {
      onOpenStoreWithCategory(categorySlug);
    } else {
      onNavigatePage('store');
    }
  };

  const handleBrandSelect = (brandName: string) => {
    setHoveredMenu(null);
    setMobileMenuOpen(false);
    if (onOpenStoreWithBrand) {
      onOpenStoreWithBrand(brandName);
    } else {
      onNavigatePage('store');
    }
  };

  const handleSubCategorySelect = (subCategoryName: string, categorySlug?: string) => {
    setHoveredMenu(null);
    setMobileMenuOpen(false);
    if (onOpenStoreWithCategory) {
      onOpenStoreWithCategory(categorySlug || 'all', subCategoryName);
    } else if (onSearchStore) {
      onSearchStore(subCategoryName);
    } else {
      onNavigatePage('store');
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_14px_36px_-6px_rgba(22,38,87,0.18),0_4px_14px_-2px_rgba(0,0,0,0.08)] border-slate-300 dark:border-slate-700' 
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_8px_26px_-4px_rgba(22,38,87,0.12),0_2px_8px_-1px_rgba(0,0,0,0.05)] border-slate-200/90 dark:border-slate-800'
      } text-[var(--text-primary)]`}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Precision Laser Glow Strip */}
      <div 
        className="h-[3.5px] w-full relative z-20 shadow-[0_1px_8px_rgba(22,38,87,0.25)]" 
        style={{ 
          background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 35%, #F59E0B 50%, var(--accent) 65%, var(--primary) 100%)' 
        }} 
      />

      {/* Top Internal Specular Gloss Sheen */}
      <div className="absolute inset-x-0 top-[3.5px] h-5 bg-gradient-to-b from-white/70 dark:from-white/5 to-transparent pointer-events-none" />

      {/* Bottom Laser Beam Glare / Highlight line separating header from main content */}
      <div 
        className="absolute inset-x-0 -bottom-[1px] h-[1.5px] z-20 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent 3%, var(--primary) 22%, var(--accent) 50%, #F59E0B 68%, var(--primary) 82%, transparent 97%)',
          opacity: isScrolled ? 0.95 : 0.75
        }}
      />

      {/* Ambient Drop Glow (soft laser radiance extending down onto main content) */}
      <div 
        className="absolute inset-x-0 -bottom-3.5 h-3.5 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(22, 38, 87, 0.09) 0%, rgba(22, 38, 87, 0.02) 65%, transparent 100%)',
          opacity: isScrolled ? 1 : 0.75
        }}
      />

      {/* ========================================================================= */}
      {/* COMPACT CLEAN HEADER                                                      */}
      {/* ========================================================================= */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Left: Brand Identity Lockup */}
          <div 
            onClick={() => {
              setHoveredMenu(null);
              onNavigatePage('home');
            }} 
            className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 cursor-pointer group shrink-0 select-none py-1"
          >
            <NKLogo
              logoUrl={settings.logoUrl}
              size="sm"
              showSubtitle={false}
              themeMode={settings.themeMode}
              alt={settings.businessName}
              className="h-8 sm:h-9 w-auto group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[11px] sm:text-sm tracking-tight text-[var(--text-primary)]">
                  {settings.businessName}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[8px] font-mono font-bold tracking-wider uppercase theme-accent-badge">
                  Direct Importer
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] hidden md:inline">
                Fiber Laser Spares, Optics & Consumables
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Links with Megamenu Hooks */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isHovered = hoveredMenu === item.id;

              return (
                <div 
                  key={item.id} 
                  className="relative"
                  onMouseEnter={() => {
                    if (item.hasDropdown && item.id === 'store') {
                      handleMouseEnter(item.id);
                    } else {
                      setHoveredMenu(null);
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.hasDropdown) {
                      handleMouseLeave();
                    }
                  }}
                >
                  <button
                    onClick={() => {
                      setHoveredMenu(null);
                      onNavigatePage(item.id);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer relative border ${
                      isActive
                        ? 'btn-primary shadow-sm font-bold'
                        : isHovered
                        ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] border-[var(--primary)] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] border-transparent font-medium'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        isActive ? 'bg-white/20 text-white' : 'theme-accent-badge'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.hasDropdown && (
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                        isHovered ? 'rotate-180 text-[var(--accent)]' : ''
                      }`} />
                    )}
                  </button>

                  {/* Reverted Anchored Dropdown for Spare Parts Catalog */}
                  {item.hasDropdown && isHovered && (
                    <div 
                      className="hidden lg:block absolute top-full left-0 pt-2 z-50 w-[420px] pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-150"
                      onMouseEnter={() => handleMouseEnter('store')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-xl overflow-hidden">
                        
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg theme-light-badge">
                              <Store className="w-4 h-4 text-[var(--primary)]" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">Spare Parts Catalog</h4>
                              <p className="text-[10px] text-[var(--text-secondary)]">100% Genuine Direct Importer</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full theme-accent-badge uppercase tracking-wide">
                            Ready Stock
                          </span>
                        </div>

                        {/* Category List with Expandable Subcategories */}
                        <div className="p-2 max-h-[380px] overflow-y-auto space-y-1">
                          {displayCategories.map((cat) => {
                            const hasSubCategories = Boolean(cat.subCategories && cat.subCategories.length > 0);
                            const isExpanded = desktopExpandedCategory === cat.slug;

                            return (
                              <div 
                                key={cat.id || cat.slug}
                                className={`rounded-xl border transition-all ${
                                  isExpanded 
                                    ? 'border-[var(--primary)]/40 bg-[var(--surface-secondary)]/50 shadow-2xs' 
                                    : 'border-transparent hover:border-[var(--primary)]/20 hover:bg-[var(--surface-secondary)]'
                                }`}
                              >
                                <div className="flex items-center gap-2 p-1.5 group">
                                  {/* Main Category Click -> Navigate */}
                                  <button
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.slug)}
                                    className="flex-1 flex items-center gap-2.5 text-left cursor-pointer min-w-0"
                                  >
                                    <div className="p-2 rounded-lg border border-[var(--border)] theme-light-badge shrink-0 group-hover:scale-105 transition-transform">
                                      {getCategoryIcon(cat.iconName)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                                          {cat.name}
                                        </span>
                                        {cat.itemCount ? (
                                          <span className="text-[9.5px] text-[var(--text-secondary)] font-mono shrink-0">
                                            {cat.itemCount} items
                                          </span>
                                        ) : null}
                                      </div>
                                      <p className="text-[10px] text-[var(--text-secondary)] truncate">
                                        {cat.description || (hasSubCategories ? `${cat.subCategories?.length} subcategories available` : 'Industrial laser spares')}
                                      </p>
                                    </div>
                                  </button>

                                  {/* Right Arrow: Click to Expand / Collapse Subcategories */}
                                  {hasSubCategories ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDesktopExpandedCategory(isExpanded ? null : cat.slug);
                                      }}
                                      className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                                        isExpanded 
                                          ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-2xs' 
                                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/50'
                                      }`}
                                      title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                                      aria-label={`Toggle ${cat.name} subcategories`}
                                    >
                                      <ChevronRight 
                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                          isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'
                                        }`} 
                                      />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleCategorySelect(cat.slug)}
                                      className="p-1.5 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors cursor-pointer shrink-0"
                                      title="Browse category"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                  )}
                                </div>

                                {/* Expanded Subcategories Panel in Web UI */}
                                {isExpanded && hasSubCategories && cat.subCategories && (
                                  <div className="mx-2 mb-2 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 animate-fadeIn">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-secondary)] pb-1.5 border-b border-[var(--border)]">
                                      <span className="uppercase tracking-wider font-mono">
                                        Subcategories ({cat.subCategories.length})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCategorySelect(cat.slug)}
                                        className="text-[var(--primary)] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                                      >
                                        <span>View All Spares</span>
                                        <ArrowRight className="w-2.5 h-2.5" />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
                                      {cat.subCategories.map((sub) => (
                                        <button
                                          key={sub}
                                          type="button"
                                          onClick={() => handleSubCategorySelect(sub, cat.slug)}
                                          className="flex items-center gap-1.5 text-left px-2 py-1 rounded-md text-[10.5px] font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--surface-secondary)] border border-transparent hover:border-[var(--primary)]/20 transition-all cursor-pointer truncate group/sub"
                                          title={`Browse ${sub}`}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/50 group-hover/sub:bg-[var(--primary)] shrink-0"></span>
                                          <span className="truncate">{sub}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Quick OEM Brands */}
                        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-secondary)]/50 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-[var(--text-secondary)]">OEM:</span>
                          {['RayTools', 'OSPRI', 'WSX', 'BOCHU', 'Precitec'].map((brand) => (
                            <button
                              key={brand}
                              onClick={() => handleBrandSelect(brand)}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-primary)] transition-all cursor-pointer"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>

                        {/* Footer Action */}
                        <div className="p-2.5 border-t border-[var(--border)] bg-[var(--surface)]">
                          <button
                            onClick={() => handleCategorySelect('all')}
                            className="btn-primary w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>View All Spares ({categories.length || availableCategories.length})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile Home Quick Action Button (Visible on mobile to the left of WhatsApp) */}
            <button
              type="button"
              onClick={() => {
                setHoveredMenu(null);
                setMobileMenuOpen(false);
                onNavigatePage('home');
              }}
              className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                currentView === 'home'
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-secondary)] font-bold shadow-2xs'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
              title="Home"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </button>

            {/* Direct WhatsApp Contact Button */}
            <a
              href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent("Hello NK Laser, I would like to inquire about laser spare parts and instant quote.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs p-2 sm:px-4 sm:py-2 rounded-xl shrink-0 flex items-center gap-1.5 sm:gap-2 shadow-md cursor-pointer"
              title="Direct WhatsApp Inquiry"
              aria-label="WhatsApp Dispatch"
            >
              <WhatsAppIcon className="w-4 h-4 text-[var(--primary-contrast)]" />
              <span className="hidden sm:inline">WhatsApp Dispatch</span>
            </a>

            {/* Mobile Contact Quick Action Button (Visible on mobile after WhatsApp without opening menu) */}
            <button
              type="button"
              onClick={() => {
                setHoveredMenu(null);
                setMobileMenuOpen(false);
                onNavigatePage('contact');
              }}
              className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                currentView === 'contact'
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-secondary)] font-bold shadow-2xs'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
              title="Contact & RFQ"
              aria-label="Contact"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl cursor-pointer border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-all flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER ACCORDION WITH DIRECT CATEGORY LINKS                         */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto bg-[var(--surface)] text-[var(--text-primary)] shadow-2xl animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isStore = item.id === 'store';
            const isExpandable = isStore;
            const isExpanded = mobileExpandedSection === item.id;

            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (isExpandable) {
                        setMobileExpandedSection(isExpanded ? null : item.id);
                      } else {
                        onNavigatePage(item.id);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'btn-primary'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full theme-accent-badge">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isExpandable && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[var(--accent)]' : ''
                      }`} />
                    )}
                  </button>
                </div>

                {/* Mobile Subcategory Accordion */}
                {isStore && isExpanded && (
                  <div className="pl-3 pr-1 py-2 space-y-1.5 border-l-2 border-[var(--primary)] ml-3 my-1">
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-2 mb-1">
                      Spare Parts Categories
                    </div>
                    {displayCategories.map((cat) => {
                      const isCatExpanded = mobileExpandedCategory === cat.slug;
                      const isFeatured = cat.featured !== false;
                      return (
                        <div key={cat.id || cat.slug} className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCategorySelect(cat.slug)}
                              className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-between cursor-pointer truncate ${
                                isFeatured 
                                  ? 'border-[var(--primary)]/40 bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold' 
                                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                              }`}
                            >
                              <span className="truncate">{cat.name}</span>
                              {isFeatured && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 border border-amber-500/30 uppercase tracking-wider shrink-0 ml-1">
                                  Featured
                                </span>
                              )}
                            </button>
                            {cat.subCategories && cat.subCategories.length > 0 && (
                              <button
                                onClick={() => setMobileExpandedCategory(isCatExpanded ? null : cat.slug)}
                                className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]"
                              >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCatExpanded ? 'rotate-180 text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} />
                              </button>
                            )}
                          </div>
                          {isCatExpanded && cat.subCategories && (
                            <div className="pl-3 pr-1 space-y-1 my-1">
                              {cat.subCategories.map(sub => (
                                <button
                                  key={sub}
                                  onClick={() => handleSubCategorySelect(sub, cat.slug)}
                                  className="w-full text-left px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-secondary)] cursor-pointer truncate"
                                >
                                  {sub}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => handleCategorySelect('all')}
                      className="w-full text-center px-3 py-2 rounded-lg text-xs font-bold btn-secondary border-[var(--primary)] text-[var(--primary)] mt-3 cursor-pointer"
                    >
                      Browse Entire Catalog →
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[var(--text-secondary)]">Call / WhatsApp:</span>
            <a 
              href={`tel:${cleanNumber}`}
              className="font-mono font-bold text-[var(--primary)] hover:underline"
            >
              {settings.whatsappDisplay || settings.whatsappNumber}
            </a>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-[11px] text-[var(--text-secondary)]">Instagram:</span>
            <a 
              href={getInstagramUrl(settings.instagramUrl || settings.socialLinks?.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-pink-600 hover:underline inline-flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{extractInstagramUsername(settings.instagramUrl || settings.socialLinks?.instagram)}</span>
            </a>
          </div>
        </div>
      )}

    </header>
  );
};
