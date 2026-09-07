import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Disc, 
  CircleDot, 
  Eye, 
  Zap, 
  Cpu, 
  Flame, 
  Sliders, 
  Radio,
  Layers, 
  Grid,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import { SiteSettings, ProductCategoryDef } from '../../types';
import { STORE_CATEGORIES } from '../../data/categoriesData';

interface CategoryHubProps {
  settings: SiteSettings;
  categories?: ProductCategoryDef[];
  onOpenStoreWithCategory: (categorySlug: string) => void;
  onNavigatePage: (page: string) => void;
}

export const CategoryHub: React.FC<CategoryHubProps> = ({
  settings,
  categories,
  onOpenStoreWithCategory,
  onNavigatePage
}) => {
  const allCategories = categories && categories.length > 0 ? categories : STORE_CATEGORIES;
  
  // Filter only categories enabled for display on home page by the admin
  const homeCategories = allCategories.filter(c => c.showOnHome !== false);

  const iconMap: Record<string, any> = {
    Shield, Disc, CircleDot, Eye, Zap, Cpu, Flame, Sliders, Radio, Layers, Grid
  };

  const getIcon = (name?: string) => {
    return iconMap[name || 'Shield'] || Shield;
  };

  // If no categories are configured for home, fallback to first 3
  const activeList = homeCategories.length > 0 ? homeCategories : allCategories.slice(0, 3);
  const topCategories = activeList.slice(0, 3);
  const remainingCategories = activeList.slice(3);

  const primaryCategory = topCategories[0] || activeList[0];
  const secondaryCategory1 = topCategories[1];
  const secondaryCategory2 = topCategories[2];

  const PrimaryIcon = getIcon(primaryCategory?.iconName);
  const SecIcon1 = getIcon(secondaryCategory1?.iconName);
  const SecIcon2 = getIcon(secondaryCategory2?.iconName);

  return (
    <section className="py-8 sm:py-12 lg:py-20 transition-colors duration-300 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6">
          <div className="space-y-1 sm:space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary)]">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" />
              <span>Laser Cutting Heads & Optics</span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Core Product <span className="text-[var(--primary)]">Categories</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
              Direct-imported fiber laser spares, optical lenses, Tellurium nozzles, and consumables.
            </p>
          </div>

          <button
            onClick={() => onNavigatePage('store')}
            className="btn-primary self-start sm:self-end px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>All Categories ({activeList.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE COMPACT VIEW (< md): Dense, Fast, Scannable Grid                  */}
        {/* ========================================================================= */}
        <div className="block md:hidden space-y-4">
          
          {/* Mobile Fast-Filter Chips Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {activeList.map((cat) => {
              const Icon = getIcon(cat.iconName);
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => onOpenStoreWithCategory(cat.slug)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[11px] font-bold text-[var(--text-primary)] hover:border-[var(--primary)] hover:bg-[var(--surface-secondary)] active:scale-95 transition-all whitespace-nowrap shrink-0 shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{cat.shortTitle || cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile 2-Column Compact Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {activeList.map((cat, idx) => {
              const Icon = getIcon(cat.iconName);
              return (
                <div
                  key={cat.id || cat.slug}
                  onClick={() => onOpenStoreWithCategory(cat.slug)}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-2xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex flex-col"
                >
                  {/* Compact Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
                      <span className="p-1 rounded-md bg-white/90 text-[var(--primary)] backdrop-blur-xs">
                        <Icon className="w-3 h-3" />
                      </span>
                      {cat.featured && (
                        <span className="text-[8px] font-black px-1 py-0.2 rounded bg-amber-500 text-zinc-950 uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                    <div>
                      <h4 className="font-extrabold text-xs text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors leading-tight line-clamp-1">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1 leading-snug">
                        {cat.oemBrands?.slice(0, 2).join(' • ') || 'All Laser OEMs'}
                      </p>
                    </div>

                    <div className="pt-1 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-bold text-[var(--primary)]">
                      <span>View Spares</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* DESKTOP & TABLET VIEW (>= md): Asymmetrical Hero Bento Grid               */}
        {/* ========================================================================= */}
        <div className="hidden md:block space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            
            {/* Primary Large Category Card (7 cols) */}
            {primaryCategory && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                onClick={() => onOpenStoreWithCategory(primaryCategory.slug)}
                className="lg:col-span-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden group cursor-pointer relative shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col min-h-[380px] lg:min-h-[440px]"
              >
                {/* Image Section */}
                <div className="relative w-full h-[58%] overflow-hidden bg-black/5">
                  <img
                    src={primaryCategory.imageUrl}
                    alt={primaryCategory.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[var(--primary)] text-[var(--primary-contrast)] shadow-sm uppercase tracking-wider">
                      Popular Spares
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 lg:p-6 flex-grow flex flex-col justify-end bg-[var(--surface)] relative z-10 -mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)] border border-[var(--border)]">
                      <PrimaryIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-secondary)]">
                      Primary Category
                    </span>
                  </div>

                  <h3 className="text-xl lg:text-2xl font-black text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--primary)] transition-colors">
                    {primaryCategory.name}
                  </h3>

                  <p className="text-xs lg:text-sm text-[var(--text-secondary)] line-clamp-2 max-w-lg mb-3">
                    {primaryCategory.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--primary)] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                      <span>Explore Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {primaryCategory.oemBrands?.slice(0, 4).join(' • ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Secondary Column Cards (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5 h-full">
              
              {/* Secondary Card 1 */}
              {secondaryCategory1 && (
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  onClick={() => onOpenStoreWithCategory(secondaryCategory1.slug)}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden group cursor-pointer relative shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row flex-1 min-h-[170px]"
                >
                  <div className="w-full sm:w-2/5 h-36 sm:h-full relative overflow-hidden bg-black/5">
                    <img
                      src={secondaryCategory1.imageUrl}
                      alt={secondaryCategory1.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 sm:w-3/5 flex flex-col justify-center bg-[var(--surface)] relative">
                    <div className="text-[9px] font-bold tracking-widest uppercase text-[var(--accent)] mb-1">
                      Specialized
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                      {secondaryCategory1.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
                      {secondaryCategory1.description}
                    </p>
                    <div className="mt-auto text-[var(--primary)] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                      <span>View Parts</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Secondary Card 2 */}
              {secondaryCategory2 && (
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  onClick={() => onOpenStoreWithCategory(secondaryCategory2.slug)}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden group cursor-pointer relative shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row flex-1 min-h-[170px]"
                >
                  <div className="w-full sm:w-2/5 h-36 sm:h-full relative overflow-hidden bg-black/5">
                    <img
                      src={secondaryCategory2.imageUrl}
                      alt={secondaryCategory2.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 sm:w-3/5 flex flex-col justify-center bg-[var(--surface)] relative">
                    <div className="text-[9px] font-bold tracking-widest uppercase text-[var(--primary)] mb-1">
                      Essential
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                      {secondaryCategory2.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
                      {secondaryCategory2.description}
                    </p>
                    <div className="mt-auto text-[var(--primary)] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                      <span>View Parts</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* Remaining Home Categories Grid (if more than 3 enabled for home) */}
          {remainingCategories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {remainingCategories.map((cat) => {
                const Icon = getIcon(cat.iconName);
                return (
                  <div
                    key={cat.id || cat.slug}
                    onClick={() => onOpenStoreWithCategory(cat.slug)}
                    className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-2xs hover:shadow-md hover:border-[var(--primary)] transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/5 shrink-0 relative">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-xs text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)] truncate">
                        {cat.subCategories?.length || 0} Subcategories
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
