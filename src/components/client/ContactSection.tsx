import React from 'react';
import { 
  Mail, 
  ArrowRight, 
  PhoneCall, 
  Instagram, 
  MapPin, 
  Clock, 
  ExternalLink, 
  ShieldCheck,
  Sparkles,
  Building2,
  Navigation,
  Star,
  Phone,
  Truck,
  Package,
  UserCheck
} from 'lucide-react';
import { SiteSettings, BusinessAddress } from '../../types';
import { buildWhatsAppLink } from '../../utils/whatsapp';
import { extractInstagramUsername, getInstagramUrl } from '../../utils/instagram';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const whatsappUrl = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hello ${settings.businessName}! I am looking for a specific fiber laser part.`
  );

  const rawInstagram = settings.instagramUrl || settings.socialLinks?.instagram;
  const instagramUrl = getInstagramUrl(rawInstagram);
  const instagramUsername = extractInstagramUsername(rawInstagram);

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
    <section id="contact" className="relative w-full max-w-5xl mx-auto my-3 sm:my-5 px-3 sm:px-6">
      
      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs space-y-6 sm:space-y-8 p-4 sm:p-8">
        
        {/* Header Message */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Direct Dispatch & Customer Support</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Looking for a Specific Fiber Laser Spare Part?
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Send us your cutting head model, nozzle diameter, or a photo of the damaged part. Our technical team will verify compatibility and arrange express dispatch.
          </p>
        </div>

        {/* Primary Contact Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* 1. WhatsApp / Phone Call */}
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Instant Reply
              </span>
            </div>
            
            <div className="space-y-0.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                WhatsApp & Direct Call
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                {settings.whatsappDisplay}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                Fastest way to send CAD drawings, part photos, or torch serials.
              </p>
            </div>

            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 pt-2 border-t border-slate-200/80 group-hover:border-emerald-200">
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 2. Official Instagram Channel */}
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-pink-50/50 hover:border-pink-300 transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
                @{instagramUsername}
              </span>
            </div>
            
            <div className="space-y-0.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Official Instagram
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 group-hover:text-pink-700 transition-colors truncate">
                Instagram / {instagramUsername}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                Cutting tests, lens maintenance tutorials, and stock updates.
              </p>
            </div>

            <div className="text-xs font-bold text-pink-600 flex items-center gap-1.5 pt-2 border-t border-slate-200/80 group-hover:border-pink-200">
              <span>Visit @{instagramUsername}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* 3. Email Support */}
          <a 
            href={`mailto:${settings.email}`} 
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#162657] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                Official RFQ
              </span>
            </div>
            
            <div className="space-y-0.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email Quotations
              </span>
              <div className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-blue-900 transition-colors" title={settings.email}>
                {settings.email}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                Send PO requests, tender sheets, and corporate GST quote requests.
              </p>
            </div>

            <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5 pt-2 border-t border-slate-200/80 group-hover:border-blue-200">
              <span>Send Email RFQ</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

        </div>

        {/* Social Spotlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border border-pink-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Instagram className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900">
                Follow {settings.businessName} on Instagram: @{instagramUsername}
              </h4>
              <p className="text-[11px] text-slate-600">
                Live cutting parameters, lens cleaning tips, and new stock arrivals.
              </p>
            </div>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#DD2A7B] to-[#8134AF] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity shrink-0 cursor-pointer"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Follow @{instagramUsername}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Location & Warehouse Info */}
        <div className="space-y-4 pt-3 border-t border-slate-200">
          
          {resolvedAddresses.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      Our Warehouse Network & Dispatch Hubs ({resolvedAddresses.length} Facilities)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Dispatched from the nearest inventory facility for fastest arrival
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold self-start sm:self-auto">
                  <Truck className="w-3 h-3 text-emerald-600" />
                  <span>Pan-India Express Dispatch</span>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${
                resolvedAddresses.length >= 4 
                  ? 'lg:grid-cols-4 md:grid-cols-2' 
                  : resolvedAddresses.length === 3 
                  ? 'lg:grid-cols-3 md:grid-cols-2' 
                  : resolvedAddresses.length === 2 
                  ? 'md:grid-cols-2' 
                  : 'grid-cols-1'
              } gap-3.5`}>
                {resolvedAddresses.map((addr) => (
                  <div 
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      addr.isPrimary 
                        ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/10 shadow-2xs' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Title & Badges */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                            {addr.title}
                          </h4>
                          {addr.isPrimary && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-900 text-white">
                              <Star className="w-2 h-2 fill-current" />
                              <span>HQ</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {addr.warehouseType && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              <Package className="w-2.5 h-2.5" />
                              <span>{addr.warehouseType}</span>
                            </span>
                          )}

                          {(addr.cityState || addr.pincode) && (
                            <span className="text-[10px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {[addr.cityState, addr.pincode ? `PIN: ${addr.pincode}` : ''].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Address Line */}
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {addr.addressLine}
                      </p>

                      {/* Operational Details */}
                      <div className="space-y-1 pt-1 text-[11px] text-slate-600 border-t border-slate-200/80">
                        {addr.dispatchTiming && (
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{addr.dispatchTiming}</span>
                          </div>
                        )}

                        {addr.workingHours && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{addr.workingHours}</span>
                          </div>
                        )}

                        {addr.contactPerson && (
                          <div className="flex items-center gap-1.5 text-blue-900 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                            <span>Contact: {addr.contactPerson}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact & Map Footer */}
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {addr.phone && (
                          <a href={`tel:${addr.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-900 font-bold">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{addr.phone}</span>
                          </a>
                        )}
                        {addr.email && (
                          <a href={`mailto:${addr.email}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-900 font-medium">
                            <Mail className="w-3 h-3 text-amber-600" />
                            <span>{addr.email}</span>
                          </a>
                        )}
                      </div>

                      {addr.mapUrl && (
                        <a 
                          href={addr.mapUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-blue-800 hover:text-blue-900 font-bold hover:underline ml-auto"
                        >
                          <Navigation className="w-3 h-3 text-blue-700" />
                          <span>Directions</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Working Hours Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 shrink-0">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  Operating Hours: <span className="font-normal text-slate-700">{settings.workingHours}</span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  Express same-day dispatch available across India for orders placed before 3:00 PM.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0 self-start sm:self-auto border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>24/7 WhatsApp Emergency Spares Support</span>
            </div>
          </div>

        </div>

        {/* Bottom Action CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp for Instant Part Quotation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
