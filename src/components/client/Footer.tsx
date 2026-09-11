import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUp,
  ShieldCheck,
  Instagram,
  Building2,
  Navigation,
  ExternalLink,
  Clock,
  CheckCircle2,
  ChevronRight,
  Truck,
  Package,
  Sparkles,
  PhoneCall,
  Lock,
  UserCheck,
  Star
} from 'lucide-react';
import { SiteSettings, ProductCategoryDef, BrandItem, PageView, BusinessAddress } from '../../types';
import { buildWhatsAppLink } from '../../utils/whatsapp';
import { extractInstagramUsername, getInstagramUrl } from '../../utils/instagram';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { NKLogo } from '../common/NKLogo';

export interface FooterProps {
  settings: SiteSettings;
  categories?: ProductCategoryDef[];
  brands?: BrandItem[];
  onOpenAdmin?: () => void;
  onOpenQuoteTool: () => void;
  onOpenCategory?: (categorySlug: string) => void;
  onOpenBrand?: (brandName: string) => void;
  onOpenSubcategory?: (subCategoryName: string) => void;
  onNavigatePage?: (view: PageView, targetSection?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories = [],
  brands = [],
  onOpenAdmin,
  onOpenQuoteTool,
  onOpenCategory,
  onOpenBrand,
  onOpenSubcategory,
  onNavigatePage
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hello ${settings.businessName}! I am contacting you from your website footer regarding fiber laser spare parts.`
  );

  const phoneRaw = (settings.phone || settings.whatsappNumber || '+919902035374').replace(/[^0-9+]/g, '');
  const phoneDisplay = settings.phoneDisplay || settings.phone || settings.whatsappDisplay || '+91 99020 35374';
  const instagramUrl = getInstagramUrl(settings.instagramUrl || settings.socialLinks?.instagram);
  const instagramUsername = extractInstagramUsername(settings.instagramUrl || settings.socialLinks?.instagram);

  // In-demand parts for quick catalog query
  const popularSpares = [
    { label: 'Protective Quartz Lenses (D27.9 - D37)', query: 'Protective Lens', categorySlug: 'laser-spares-consumables' },
    { label: 'Tellurium Copper Nozzles (Single/Double)', query: 'Cutting Nozzle', categorySlug: 'laser-spares-consumables' },
    { label: 'Ceramic Sensor Rings & Lock Nuts', query: 'Ceramic Ring', categorySlug: 'laser-spares-consumables' },
    { label: 'Focus & Collimator Lens Assemblies', query: 'Focus & Collimation Lens', categorySlug: 'laser-spares-consumables' },
    { label: 'BOCHU FSCUT Wireless Remotes & RF Cables', query: 'Remote', categorySlug: 'laser-spares-consumables' },
    { label: 'RayTools & WSX Cutting Head Spares', query: 'Cutting Head', categorySlug: 'laser-spares-consumables' },
    { label: 'Fiber Laser Power Sources (Max / Raycus)', query: 'Laser Source', categorySlug: 'laser-source' },
    { label: 'Industrial Laser Water Chillers (S&A / Hanli)', query: 'Laser Chillers', categorySlug: 'laser-chillers' }
  ];

  // Resolve warehouse addresses list with safe fallback
  const resolvedAddresses: BusinessAddress[] = (settings.addresses && settings.addresses.length > 0)
    ? settings.addresses
    : settings.address
      ? [
          {
            id: 'addr-default',
            title: 'Central Spares Warehouse & HQ',
            addressLine: settings.address,
            cityState: 'Gujarat, India',
            pincode: '',
            warehouseType: 'Central Warehouse & HQ',
            phone: settings.phoneDisplay || settings.phone || '+91 99020 35374',
            email: settings.email || 'nklaser33@gmail.com',
            workingHours: settings.workingHours || 'Mon - Sat: 8:30 AM - 8:00 PM',
            dispatchTiming: 'Same-day dispatch nationwide',
            isPrimary: true,
            mapUrl: `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`
          }
        ]
      : [];

  return (
    <footer 
      id="footer-section" 
      className="relative bg-white text-slate-600 border-t border-slate-200 text-xs shadow-[0_-20px_45px_-12px_rgba(22,38,87,0.07),0_-1px_3px_rgba(0,0,0,0.03)] overflow-hidden"
    >
      {/* Laser Beam Glare Line Across Top */}
      <div 
        className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--primary,#162657)] via-[var(--accent,#E51024)] to-transparent opacity-90 z-20" 
      />

      {/* Optical Lens Ambient Glare Effect */}
      <div 
        className="absolute top-0 inset-x-0 h-48 bg-[radial-gradient(ellipse_75%_180px_at_50%_0%,rgba(22,38,87,0.04),transparent)] pointer-events-none" 
      />
      <div 
        className="absolute top-0 right-1/4 w-80 h-32 bg-[radial-gradient(circle_80px_at_center,rgba(229,16,36,0.035),transparent)] pointer-events-none" 
      />

      {/* Main Footer Content Grid: 4-Column Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        
        {/* Column 1: Brand Info & Operating Hours (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col items-start gap-1">
            <NKLogo
              logoUrl={settings.logoUrl}
              size="lg"
              showSubtitle={true}
              themeMode="light"
              alt={settings.businessName}
              className="h-12 w-auto"
            />
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            {settings.tagline || 'Direct Importers of Fiber Laser Spares, RayTools/OSPRI/WSX Consumables & High-Purity Optics.'}
          </p>

          {/* Working & Dispatch Hours Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-900 font-black text-[10.5px] tracking-wide">
                <Clock className="w-3.5 h-3.5 text-blue-900" />
                <span>OPERATING & DISPATCH</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="text-slate-900 text-xs font-mono font-bold">
              {settings.workingHours || "Mon - Sat: 8:30 AM - 8:00 PM | Sun: By Appointment"}
            </p>
            <p className="text-[10px] text-slate-500">
              Orders before 4:00 PM dispatched same-day across India.
            </p>
          </div>

          {/* Trust Value Propositions */}
          <div className="text-[11.5px] text-slate-600 space-y-1.5 pt-0.5 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Direct Importer & Stockist</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>1-2 Days Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>100% Guaranteed Fitment</span>
            </div>
          </div>
        </div>

        {/* Column 2: In-Demand Spares & Categories (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-extrabold text-[var(--primary,#162657)] uppercase tracking-wider font-mono text-xs pb-1.5 border-b border-slate-200">
            Top Spares & Optics
          </h4>
          <ul className="space-y-1.5 text-slate-600 font-medium">
            {popularSpares.map((item, idx) => (
              <li key={idx}>
                <button 
                  onClick={() => {
                    if (onOpenSubcategory) {
                      onOpenSubcategory(item.query);
                    } else if (onOpenCategory) {
                      onOpenCategory(item.categorySlug);
                    } else {
                      onOpenQuoteTool();
                    }
                  }}
                  className="hover:text-[var(--primary,#162657)] transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[var(--primary,#162657)] shrink-0 mt-0.5" />
                  <span className="group-hover:underline">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Supported OEM Laser Heads & Systems (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-extrabold text-[var(--primary,#162657)] uppercase tracking-wider font-mono text-xs pb-1.5 border-b border-slate-200">
            Supported Systems
          </h4>
          <ul className="space-y-1.5 text-slate-600">
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('RayTools') : onOpenQuoteTool()} 
                className="hover:text-[var(--primary,#162657)] transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group w-full"
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[var(--primary,#162657)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[var(--primary,#162657)]">RayTools</span>
                  <span className="block text-[10px] text-slate-500">BM110, BM111, BT240, BM06K</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('OSPRI') : onOpenQuoteTool()} 
                className="hover:text-[var(--primary,#162657)] transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group w-full"
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[var(--primary,#162657)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[var(--primary,#162657)]">OSPRI</span>
                  <span className="block text-[10px] text-slate-500">LC208, LC210, LC218 Autofocus</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('BOCHU') : onOpenQuoteTool()} 
                className="hover:text-[var(--primary,#162657)] transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group w-full"
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[var(--primary,#162657)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[var(--primary,#162657)]">BOCHU (FSCUT)</span>
                  <span className="block text-[10px] text-slate-500">BCS100, Wireless Remotes</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('WSX') : onOpenQuoteTool()} 
                className="hover:text-[var(--primary,#162657)] transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group w-full"
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[var(--primary,#162657)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[var(--primary,#162657)]">WSX Heads</span>
                  <span className="block text-[10px] text-slate-500">NC30, NC60, NC150 Precision</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('Precitec') : onOpenQuoteTool()} 
                className="hover:text-[var(--primary,#162657)] transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group w-full"
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[var(--primary,#162657)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[var(--primary,#162657)]">Precitec</span>
                  <span className="block text-[10px] text-slate-500">ProCutter, LightCutter 2.0</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('SMC') : onOpenQuoteTool()} 
                className="hover:text-[var(--primary,#162657)] transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group w-full"
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[var(--primary,#162657)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[var(--primary,#162657)]">SMC Pneumatics</span>
                  <span className="block text-[10px] text-slate-500">ITV Valves & Solenoids</span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Direct Support, Channels & Warehouse Hubs (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-3">
            <h4 className="font-extrabold text-[var(--primary,#162657)] uppercase tracking-wider font-mono text-xs pb-1.5 border-b border-slate-200">
              Contact & Support
            </h4>

            {/* Communication Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Direct Phone */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] text-slate-500 uppercase font-mono font-bold">Call Support</span>
                  <a href={`tel:${phoneRaw}`} className="text-slate-900 text-xs font-bold hover:text-blue-900 hover:underline truncate">
                    {phoneDisplay}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] text-slate-500 uppercase font-mono font-bold">WhatsApp RFQ</span>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 text-xs font-bold hover:underline truncate">
                    {settings.whatsappDisplay || settings.whatsappNumber}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] text-slate-500 uppercase font-mono font-bold">Official Email</span>
                  <a href={`mailto:${settings.email}`} className="text-slate-900 text-xs font-semibold hover:text-blue-900 hover:underline truncate" title={settings.email}>
                    {settings.email}
                  </a>
                </div>
              </div>

              {/* Instagram */}
              {instagramUrl && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-pink-300 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9.5px] text-slate-500 uppercase font-mono font-bold">Instagram</span>
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-700 text-xs font-bold hover:underline truncate">
                      @{instagramUsername}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Navigation to Full Contact Page */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => onNavigatePage ? onNavigatePage('contact') : undefined}
              className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    Workshop & Dispatch Hubs
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {resolvedAddresses.length > 0 ? `${resolvedAddresses.length} locations across India` : 'Central Warehouse & Hubs'} • View Full Contact & Map
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Bar with Copyright, ISO Badge, Admin Link & Back to Top */}
      <div className="relative z-10 bg-slate-50 border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>© {new Date().getFullYear()} {settings.businessName || 'NK Laser Spares & Optics'}. All rights reserved.</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600 hidden sm:inline">Direct Importer of Fiber Laser Spares Across India</span>
            {onOpenAdmin && (
              <>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-900 hover:underline transition-colors cursor-pointer"
                  title="Store Management & Back-Office"
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>Admin Console</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Tested Optical Purity</span>
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs font-semibold"
              title="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
};
