import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  Cpu
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { buildWhatsAppLink } from '../../utils/whatsapp';

interface HeroProps {
  settings: SiteSettings;
  onExploreShop: () => void;
  onExploreBrands: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreShop,
  onExploreBrands
}) => {
  const whatsappUrl = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hello ${settings.businessName}! I am visiting your website and want to ask about fiber laser spare parts and consumables.`
  );

  return (
    <section
      id="hero"
      className="relative flex items-center min-h-[auto] lg:min-h-[80vh] py-6 sm:py-10 lg:py-0 border-b border-[var(--border)] bg-[var(--background)] transition-colors duration-300 overflow-hidden"
    >
      {/* Background Layer: Subtle Technical Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ 
          backgroundImage: 'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }}
      />
      
      {/* Soft Glow Accents */}
      <div 
        className="absolute top-0 right-1/4 w-full max-w-[800px] h-[800px] rounded-full filter blur-[120px] pointer-events-none opacity-10 translate-x-1/2 -translate-y-1/4"
        style={{ backgroundColor: 'var(--primary)' }}
      />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-10 lg:gap-14">
          
          {/* Left Column - Main Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full lg:w-[55%] space-y-3 sm:space-y-5 lg:space-y-6 lg:pr-6 flex flex-col items-start text-left"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-2xs text-[10px] sm:text-xs font-mono font-bold tracking-wide text-[var(--primary)] uppercase">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" />
              <span>
                Direct Importer • {settings.addresses && settings.addresses.length > 1 
                  ? `${settings.addresses.length} Regional Warehouses Across India` 
                  : 'Pan-India Fast Dispatch'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-[var(--text-primary)]">
              Precision Parts. <br className="hidden sm:inline" />
              <span className="text-[var(--primary)]">Reliable Laser Performance.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-base max-w-xl leading-relaxed text-[var(--text-secondary)]">
              {settings.heroSubtitle || "Direct importers of RayTools, OSPRI, WSX, BOCHU & Precitec laser cutting heads, nozzles, lenses, and consumables. 1-2 days express dispatch across India."}
            </p>

            {/* CTAs */}
            <div className="flex flex-row items-center w-full sm:w-auto gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={onExploreShop}
                className="btn-primary flex-1 sm:flex-initial px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold group gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex-1 sm:flex-initial px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold gap-1.5 text-center cursor-pointer"
              >
                <span>Instant RFQ</span>
              </a>
            </div>

            {/* Trust Statement */}
            <div className="flex items-center gap-3 pt-2 sm:pt-3 border-t border-[var(--border)] w-full lg:max-w-md">
              <div className="flex -space-x-1.5 shrink-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--surface-secondary)] border border-[var(--surface)] flex items-center justify-center text-[var(--primary)] shadow-2xs z-30">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--surface-secondary)] border border-[var(--surface)] flex items-center justify-center text-[var(--accent)] shadow-2xs z-20">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-medium leading-tight">
                100% Genuine OEM Factory Specs • {settings.addresses && settings.addresses.length > 1 
                  ? `Stocked across ${settings.addresses.length} Regional Warehouses` 
                  : 'Stocked in India'}
              </div>
            </div>

          </motion.div>

          {/* Right Column - Visual Showcase (Adaptive for Mobile) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="w-full lg:w-[45%] relative mt-2 lg:mt-0"
          >
            <div className="relative w-full h-44 sm:h-64 lg:h-[460px] flex items-center justify-center">
              
              {/* Central Visual */}
              <div className="absolute inset-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
                  alt="Industrial Fiber Laser Head"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/10" />
                
                {/* Bottom Overlay Pill on Mobile */}
                <div className="absolute bottom-2 left-2 right-2 sm:hidden flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  <span>RayTools • OSPRI • WSX Spares</span>
                  <span className="text-[var(--accent)] font-mono">1-2 Days Dispatch</span>
                </div>
              </div>

              {/* Floating Technical Card 1 (Hidden on smallest mobile, shown on sm+) */}
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="hidden sm:flex absolute top-4 lg:top-8 -left-2 lg:-left-8 bg-[var(--surface)] border border-[var(--border)] p-2.5 sm:p-3 rounded-2xl shadow-md items-center gap-2.5 backdrop-blur-md bg-opacity-95"
              >
                <div className="p-1.5 rounded-xl bg-[var(--surface-secondary)] text-[var(--accent)]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="pr-1">
                  <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Laser Spares</div>
                  <div className="text-[11px] font-black text-[var(--text-primary)]">Consumables</div>
                </div>
              </motion.div>

              {/* Floating Technical Card 2 */}
              <motion.div 
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="hidden sm:flex absolute bottom-4 lg:bottom-12 -right-2 lg:-right-6 bg-[var(--surface)] border border-[var(--border)] p-2.5 sm:p-3 rounded-2xl shadow-md items-center gap-2.5 backdrop-blur-md bg-opacity-95"
              >
                <div className="p-1.5 rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)]">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="pr-1">
                  <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Laser Heads</div>
                  <div className="text-[11px] font-black text-[var(--text-primary)]">RayTools / WSX</div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
