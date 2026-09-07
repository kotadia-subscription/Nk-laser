import React from 'react';
import { SiteSettings } from '../../types';

interface IntroSectionProps {
  settings: SiteSettings;
}

export const SparesShopBanner: React.FC<IntroSectionProps> = ({ settings }) => {
  return (
    <section className="py-5 sm:py-10 lg:py-16 border-b border-[var(--border)] bg-[var(--surface-secondary)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-3 sm:gap-8 md:gap-14">
          {/* Left: Statement */}
          <div className="w-full md:w-5/12 space-y-1.5 sm:space-y-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-[var(--text-primary)] leading-tight tracking-tight uppercase">
              Laser Component <br className="hidden sm:inline" />
              <span className="text-[var(--primary)]">Direct Supplier</span>
            </h2>
          </div>
          
          {/* Right: Explanation */}
          <div className="w-full md:w-7/12 border-l-2 border-[var(--primary)] pl-3 sm:pl-6 md:pl-8">
            <p className="text-xs sm:text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed font-medium">
              We specialize in sourcing and supplying essential components for industrial laser systems. From precision cutting heads and chillers to everyday consumables like nozzles and optical lenses, NKL provides reliable products to keep your manufacturing running without interruption.
            </p>
            {settings.addresses && settings.addresses.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[var(--primary)] flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>
                  {settings.addresses.length} Dispatch Facilities ({settings.addresses.map(a => a.cityState ? a.cityState.split(',')[0].trim() : a.title).slice(0, 3).join(' • ')}) — Same-Day Express Shipping Available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
