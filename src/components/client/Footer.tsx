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
  Flame,
  Truck,
  Package,
  Sparkles,
  Layers,
  PhoneCall
} from 'lucide-react';
import { SiteSettings, ProductCategoryDef, BrandItem, PageView } from '../../types';
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

  return (
    <footer id="footer-section" className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 text-xs">
      
      {/* Top Urgent RFQ & Fitment Assistance Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/40 py-6 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="text-center lg:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              <span>SAME-DAY DISPATCH & OEM FITMENT ASSISTANCE</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Need Help Finding the Exact Laser Spare Part or Lens Size?
            </h3>
            <p className="text-zinc-400 text-xs max-w-2xl">
              Send us your cutting head model (RayTools, OSPRI, WSX, BOCHU), nozzle orifice, or lens dimensions for instant stock confirmation and wholesale quotation.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <a
              href={`tel:${phoneRaw}`}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-2 border border-zinc-700 transition-colors shadow-sm"
              title={`Call ${phoneDisplay}`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>Call: {phoneDisplay}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
              <span>WhatsApp Inquiry</span>
            </a>

            <button
              onClick={onOpenQuoteTool}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>Explore Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 xl:gap-8">
        
        {/* Column 1: Brand Info & Operating Hours */}
        <div className="space-y-4">
          <div className="flex flex-col items-start gap-1">
            <NKLogo
              logoUrl={settings.logoUrl}
              size="lg"
              showSubtitle={true}
              themeMode="dark"
              alt={settings.businessName}
              className="h-12 w-auto"
            />
          </div>

          <p className="text-zinc-300 text-xs leading-relaxed">
            {settings.tagline || 'Direct Importers of Fiber Laser Spares, RayTools/OSPRI/WSX Consumables & Optics.'}
          </p>

          {/* Working & Dispatch Hours Box */}
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10.5px] tracking-wide">
                <Clock className="w-3.5 h-3.5" />
                <span>OPERATING & DISPATCH</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-400 font-medium bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="text-zinc-200 text-xs font-mono font-medium">
              {settings.workingHours || "Mon - Sat: 8:30 AM - 8:00 PM | Sun: By Appointment"}
            </p>
            <p className="text-[10px] text-zinc-500">
              Orders before 4:00 PM dispatched same-day across India.
            </p>
          </div>

          {/* Trust Value Propositions */}
          <div className="text-[11px] text-zinc-400 space-y-1.5 pt-0.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Direct Importer & Stockist</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>1-2 Days Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>100% Guaranteed Fitment</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Navigation & Services */}
        <div className="space-y-3">
          <h4 className="font-bold text-amber-400 uppercase tracking-wider font-mono text-xs pb-1 border-b border-zinc-800/80">
            Quick Links
          </h4>
          <ul className="space-y-2 text-zinc-300">
            <li>
              <button 
                onClick={() => onNavigatePage ? onNavigatePage('home') : window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                <span>Home Page</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigatePage ? onNavigatePage('store') : onOpenQuoteTool()}
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                <span>Spare Parts Catalog</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigatePage ? onNavigatePage('home', 'brands') : onOpenQuoteTool()}
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                <span>Compatible OEM Brands</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigatePage ? onNavigatePage('reviews') : onOpenQuoteTool()}
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                <span>Client Reviews & Ratings</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigatePage ? onNavigatePage('contact') : onOpenQuoteTool()}
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                <span>Contact & Inquiries</span>
              </button>
            </li>
            <li>
              <button 
                onClick={onOpenQuoteTool}
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 group font-medium text-amber-400/90"
              >
                <ChevronRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-all" />
                <span>Instant RFQ Quotation</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: In-Demand Spares & Categories */}
        <div className="space-y-3">
          <h4 className="font-bold text-amber-400 uppercase tracking-wider font-mono text-xs pb-1 border-b border-zinc-800/80">
            Top Spares & Optics
          </h4>
          <ul className="space-y-1.5 text-zinc-300">
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
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Supported OEM Laser Heads & Systems */}
        <div className="space-y-3">
          <h4 className="font-bold text-amber-400 uppercase tracking-wider font-mono text-xs pb-1 border-b border-zinc-800/80">
            Supported Systems
          </h4>
          <ul className="space-y-1.5 text-zinc-300">
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('RayTools') : onOpenQuoteTool()} 
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400">RayTools</span>
                  <span className="block text-[10px] text-zinc-500">BM110, BM111, BT240, BM06K</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('OSPRI') : onOpenQuoteTool()} 
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400">OSPRI</span>
                  <span className="block text-[10px] text-zinc-500">LC208, LC210, LC218 Autofocus</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('BOCHU') : onOpenQuoteTool()} 
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400">BOCHU (FSCUT)</span>
                  <span className="block text-[10px] text-zinc-500">BCS100, Wireless Remotes</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('WSX') : onOpenQuoteTool()} 
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400">WSX Heads</span>
                  <span className="block text-[10px] text-zinc-500">NC30, NC60, NC150 Precision</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('Precitec') : onOpenQuoteTool()} 
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400">Precitec</span>
                  <span className="block text-[10px] text-zinc-500">ProCutter, LightCutter 2.0</span>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenBrand ? onOpenBrand('SMC') : onOpenQuoteTool()} 
                className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-start gap-1.5 text-[11.5px] leading-snug group"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400">SMC Pneumatics</span>
                  <span className="block text-[10px] text-zinc-500">ITV Valves & Solenoids</span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 5: Contact, Addresses & Warehouses */}
        <div className="space-y-3">
          <h4 className="font-bold text-amber-400 uppercase tracking-wider font-mono text-xs pb-1 border-b border-zinc-800/80">
            Contact & Locations
          </h4>

          <div className="space-y-2.5 text-zinc-300">
            {/* Direct Phone */}
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Phone Support</span>
                <a href={`tel:${phoneRaw}`} className="text-zinc-200 font-bold hover:text-amber-400 hover:underline">
                  {phoneDisplay}
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-2">
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">WhatsApp RFQ</span>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">
                  {settings.whatsappDisplay || settings.whatsappNumber}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Official Email</span>
                <a href={`mailto:${settings.email}`} className="text-zinc-200 hover:text-amber-400 hover:underline">
                  {settings.email}
                </a>
              </div>
            </div>

            {/* Instagram */}
            {instagramUrl && (
              <div className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Social Updates</span>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-400 font-medium hover:underline">
                    @{instagramUsername}
                  </a>
                </div>
              </div>
            )}

            {/* Addresses list */}
            {settings.addresses && settings.addresses.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-amber-400" />
                  <span>Warehouse Hubs ({settings.addresses.length})</span>
                </div>
                <div className="space-y-2.5">
                  {settings.addresses.map((addr) => (
                    <div key={addr.id} className="text-[11px] leading-snug pl-2 border-l-2 border-amber-500/40 space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-bold text-zinc-200">{addr.title}</span>
                        {addr.isPrimary && (
                          <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">HQ</span>
                        )}
                        {addr.warehouseType && (
                          <span className="text-[8.5px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {addr.warehouseType}
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-400 text-[10.5px]">
                        {addr.addressLine}
                        {addr.cityState ? `, ${addr.cityState}` : ''}
                        {addr.pincode ? ` - ${addr.pincode}` : ''}
                      </div>
                      {addr.dispatchTiming && (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5 shrink-0" />
                          <span>{addr.dispatchTiming}</span>
                        </div>
                      )}
                      {addr.mapUrl && (
                        <div>
                          <a 
                            href={addr.mapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-medium pt-0.5"
                          >
                            <Navigation className="w-2.5 h-2.5" />
                            <span>View on Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : settings.address ? (
              <div className="flex items-start gap-2 pt-1 border-t border-zinc-800">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-snug text-zinc-400">{settings.address}</span>
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* Bottom Bar with Copyright, ISO Badge & Back to Top */}
      <div className="bg-zinc-900 border-t border-zinc-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>© {new Date().getFullYear()} {settings.businessName || 'NK Laser Spares & Optics'}. All rights reserved.</span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="text-zinc-400 hidden sm:inline">Direct Importer of Fiber Laser Spares Across India</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Tested Optical Purity</span>
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
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

