import React from 'react';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { SiteSettings, BrandItem } from '../../types';
import { INITIAL_BRANDS } from '../../data/brandsData';

interface BrandsSectionProps {
  settings: SiteSettings;
  brands?: BrandItem[];
  onOpenBrand?: (brand: string) => void;
}

export const BrandsSection: React.FC<BrandsSectionProps> = ({
  settings,
  brands,
  onOpenBrand
}) => {
  const activeBrands = (brands && brands.length > 0) ? brands : INITIAL_BRANDS;

  return (
    <section className="py-8 lg:py-12 border-b border-[var(--border)] bg-[var(--background)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-6 bg-[var(--primary)] rounded-full"></div>
             <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-secondary)]">
                Supported Product Brands
             </h3>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] cursor-pointer hover:underline" onClick={() => onOpenBrand?.('')}>
            View All Brands <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 justify-start lg:justify-between">
          {activeBrands.slice(0, 8).map((brand) => (
            <div
              key={brand.id}
              onClick={() => onOpenBrand && onOpenBrand(brand.name)}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md transition-all cursor-pointer group"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-6 sm:h-8 w-auto max-w-[120px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-sm sm:text-base font-black tracking-tight text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-[10px] sm:text-xs text-[var(--text-secondary)] font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>NKL supplies 100% genuine OEM replacement parts for the brands listed above.</span>
        </div>

      </div>
    </section>
  );
};
