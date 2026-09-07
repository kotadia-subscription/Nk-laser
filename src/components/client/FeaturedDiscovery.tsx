import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Package, Sparkles, TrendingUp, Flame } from 'lucide-react';
import { ProductItem, SiteSettings, InquiryRecord } from '../../types';
import { loadInquiries } from '../../lib/storage';
import { ProductTemplateRenderer } from './templates/ProductTemplateRenderer';

interface FeaturedDiscoveryProps {
  products: ProductItem[];
  settings: SiteSettings;
  inquiries?: InquiryRecord[];
  onSearch: (query: string) => void;
  onProductClick: (product: ProductItem) => void;
}

export const FeaturedDiscovery: React.FC<FeaturedDiscoveryProps> = ({
  products,
  settings,
  inquiries,
  onSearch,
  onProductClick
}) => {
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onSearch(localSearch.trim());
    }
  };

  // Automatically organize the 6 products based on highest inquiry count from admin / inquiries database
  const rankedProducts = useMemo(() => {
    const currentInquiries = (inquiries && inquiries.length > 0) ? inquiries : loadInquiries();

    const scored = products.map((product) => {
      let inquiryCount = 0;
      const titleLower = (product.title || '').trim().toLowerCase();
      const skuLower = (product.sku || '').trim().toLowerCase();
      const idLower = (product.id || '').trim().toLowerCase();

      currentInquiries.forEach((inq) => {
        const pos = (inq.productOrService || '').toLowerCase();
        const specs = (inq.specsSummary || '').toLowerCase();
        const msg = (inq.message || '').toLowerCase();

        // 1. SKU matching
        if (skuLower && (pos.includes(skuLower) || specs.includes(skuLower) || msg.includes(skuLower))) {
          inquiryCount++;
          return;
        }
        // 2. Title matching
        if (titleLower && (pos.includes(titleLower) || titleLower.includes(pos) || specs.includes(titleLower) || msg.includes(titleLower))) {
          inquiryCount++;
          return;
        }
        // 3. ID matching
        if (idLower && (pos.includes(idLower) || msg.includes(idLower))) {
          inquiryCount++;
          return;
        }
      });

      return {
        product,
        inquiryCount
      };
    });

    // Sort descending by highest inquiry count!
    scored.sort((a, b) => {
      if (b.inquiryCount !== a.inquiryCount) {
        return b.inquiryCount - a.inquiryCount;
      }
      // Secondary sort: featured -> popular -> inStock
      if (b.product.isFeatured !== a.product.isFeatured) {
        return (b.product.isFeatured ? 1 : 0) - (a.product.isFeatured ? 1 : 0);
      }
      if (b.product.isPopular !== a.product.isPopular) {
        return (b.product.isPopular ? 1 : 0) - (a.product.isPopular ? 1 : 0);
      }
      return (b.product.inStock ? 1 : 0) - (a.product.inStock ? 1 : 0);
    });

    // Return top 6 items
    return scored.slice(0, 6);
  }, [products, inquiries]);

  return (
    <section className="py-8 sm:py-12 lg:py-20 border-b border-[var(--border)] bg-[var(--surface-secondary)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Top Header Split */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-14 items-start lg:items-center justify-between">
          
          {/* Left: Info & Search */}
          <div className="w-full lg:w-3/5 space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--primary)]">
                <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                <span>Ranked by Inquiries • High Demand Spares</span>
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                Find the component you need.
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
                Organized automatically by highest customer inquiries and RFQs. If it's on an industrial laser cutting machine, we stock it.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative max-w-md">
              <input
                type="text"
                placeholder="Search nozzle, lens, head, brand, SKU..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 sm:py-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] shadow-2xs transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-[var(--primary)] text-[var(--primary-contrast)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                title="Search Spares"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right: Small Category Visual */}
          <div className="hidden sm:flex w-full lg:w-2/5 justify-start lg:justify-end">
             <div className="relative w-full max-w-sm aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--border)] shadow-xs bg-[var(--surface)]">
                <img
                  src={settings.warehouseBannerUrl || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"}
                  alt="Inventory Warehouse"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-end p-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[11px] font-bold w-fit border border-white/20">
                    <Package className="w-3.5 h-3.5" />
                    <span>In-Stock • Same-Day Dispatch</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Featured Product Grid: 2-Cols on Mobile, 3-Cols on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5 lg:gap-6 pt-2 sm:pt-4">
          {rankedProducts.map(({ product, inquiryCount }, idx) => {
            const productImage = product.imageUrl || (product as any).image || (product.galleryImages && product.galleryImages[0]) || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
            const displayPrice = product.salePrice || product.regularPrice || product.estimatedPrice || (product as any).price;

            return (
              <div 
                key={product.id}
                onClick={() => onProductClick(product)}
                className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col active:scale-[0.98]"
              >
                {/* Image Area */}
                <div className="relative aspect-square w-full bg-[var(--surface-secondary)]/50 overflow-hidden p-1.5 sm:p-2.5 flex items-center justify-center">
                  <ProductTemplateRenderer
                    product={product}
                    mode="card"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                  />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {product.brand && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[var(--surface)]/90 backdrop-blur-xs border border-[var(--border)] text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] shadow-2xs">
                        {product.brand}
                      </span>
                    )}
                    {inquiryCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>{inquiryCount} {inquiryCount === 1 ? 'Inquiry' : 'Inquiries'}</span>
                      </span>
                    ) : idx < 3 ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 border border-amber-500/30 text-[8px] sm:text-[9px] font-extrabold uppercase">
                        Top Spare
                      </span>
                    ) : null}
                  </div>

                  {/* Stock Tag */}
                  {product.inStock && (
                    <div className="absolute top-2 right-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[8px] sm:text-[9px] font-bold text-emerald-600">
                        In Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-2.5 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-base text-[var(--text-primary)] mb-1 line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                      {product.title}
                    </h3>
                    
                    {product.specs && product.specs.length > 0 && (
                      <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] line-clamp-1 mb-2">
                        {product.specs.slice(0, 2).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="text-[11px] sm:text-xs font-black text-[var(--primary)]">
                      {settings.showPricing && displayPrice 
                        ? `₹${displayPrice.toLocaleString('en-IN')}` 
                        : 'Quote on Request'}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--primary)] flex items-center gap-0.5 transition-colors">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
