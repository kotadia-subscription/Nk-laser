import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, RefreshCw, ShieldCheck, Truck, Phone, Package, Sparkles, Building2 } from 'lucide-react';
import { ProductItem, SiteSettings } from '../../types';
import { saveInquiry } from '../../lib/storage';
import { createProductInquiryMessage, buildWhatsAppLink } from '../../utils/whatsapp';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { ProductTemplateRenderer } from './templates/ProductTemplateRenderer';

interface InquiryModalProps {
  item: ProductItem;
  settings: SiteSettings;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ item, settings, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    quantity: item.moq || 1,
    requiredBy: '',
    machineBrand: item.brand || '',
    preferredWarehouse: '',
    message: ''
  });

  const cleanNumber = (settings.whatsappNumber || '').replace(/[^0-9]/g, '');

  // Handle ESC key press and scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);

    const warehouseInfo = formData.preferredWarehouse || (settings.addresses && settings.addresses.length > 0 ? 'Nearest Express Dispatch Hub' : '');

    saveInquiry({
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email || 'N/A',
      productOrService: item.title,
      material: formData.machineBrand,
      quantity: formData.quantity,
      message: `${formData.company ? `Company: ${formData.company} | ` : ''}${warehouseInfo ? `Dispatch Hub: ${warehouseInfo} | ` : ''}Req Date: ${formData.requiredBy || 'N/A'} | Machine: ${formData.machineBrand || 'N/A'} | Msg: ${formData.message}`,
      source: 'Product Inquiry',
      specsSummary: `${item.title} | SKU: ${item.sku || 'N/A'} | Qty: ${formData.quantity}${warehouseInfo ? ` | Hub: ${warehouseInfo}` : ''}`
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const waNotes = [
    formData.preferredWarehouse ? `📍 *Preferred Dispatch Hub:* ${formData.preferredWarehouse}` : null,
    formData.requiredBy ? `📅 *Delivery Need:* ${formData.requiredBy}` : null,
    formData.message ? `💬 *Notes:* ${formData.message}` : null
  ].filter(Boolean).join('\n');

  const waMessage = createProductInquiryMessage(
    item.title,
    item.category,
    formData.machineBrand || item.brand,
    `Qty: ${formData.quantity} pcs`,
    waNotes || formData.message
  );
  
  const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, waMessage);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rfq-modal-title"
    >
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl overflow-hidden relative transition-all"
      >
        
        {/* Modal Sticky Header with Prominent Close & ESC Badge */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-zinc-200 bg-white shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: 'var(--primary, #162657)', color: '#ffffff' }}
              className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-2xs"
            >
              RFQ & Quote
            </span>
            <h3 id="rfq-modal-title" className="text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-md text-zinc-950">
              Request Quotation for Part
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-zinc-100 text-zinc-700 border-zinc-300">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer border bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800 hover:text-zinc-950"
              title="Close (Esc)"
              aria-label="Close RFQ Modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-white">
          {isSubmitted ? (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
                RFQ Inquiry Received
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-800">
                Thank you, <strong className="font-extrabold text-zinc-950">{formData.name}</strong>. Our engineering desk will review the part specifications and provide your quotation at <strong className="font-extrabold text-zinc-950">{formData.phone}</strong> shortly.
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md text-white"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span className="text-white">Forward to WhatsApp for Instant Response</span>
                </a>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Split 2-Column Grid on Desktop, Compact Responsive Flow on Mobile */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-5">
              
              {/* Left Column: Compact Product Summary & OEM Specs (4 cols) */}
              <div className="md:col-span-4 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  {/* Thumbnail & Title on Mobile (Side-by-Side), Stacked on Desktop */}
                  <div className="flex flex-row md:flex-col items-center md:items-stretch gap-3">
                    {/* Compact Branded Template Thumbnail */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-full md:h-28 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
                      <ProductTemplateRenderer
                        product={item}
                        mode="thumbnail"
                        className="w-full h-full"
                      />
                    </div>

                    {/* Title & Category & Price (On mobile next to image, on desktop below image) */}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 truncate">
                        {item.subCategory || item.category}
                      </div>
                      <h4 className="text-xs sm:text-sm font-black leading-snug line-clamp-2 mt-0.5 text-zinc-950">
                        {item.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {settings.showPricing && item.estimatedPrice ? `₹${item.estimatedPrice.toLocaleString('en-IN')}` : 'Quote on Request'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Specs List */}
                  <div className="space-y-1.5 text-[11px] font-mono border-t border-slate-200 pt-2.5">
                    {item.dimensions && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-zinc-600 font-semibold">Spec:</span>
                        <span className="font-extrabold text-zinc-950 truncate max-w-[140px]">{item.dimensions}</span>
                      </div>
                    )}
                    {item.powerRating && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-zinc-600 font-semibold">Power:</span>
                        <span className="font-extrabold text-zinc-950">{item.powerRating}</span>
                      </div>
                    )}
                    {item.moq && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-zinc-600 font-semibold">Min Order:</span>
                        <span className="font-extrabold text-zinc-950">{item.moq} pc</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Trust Highlights */}
                <div className="pt-2.5 border-t border-slate-200 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>100% Genuine OEM Fitment</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-800 font-bold">
                    <Truck className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Express Dispatch Pan-India</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-800 font-bold">
                    <Phone className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                    <span>+91 {cleanNumber}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: RFQ Form (8 cols) */}
              <form onSubmit={handleSubmitInquiry} className="md:col-span-8 flex flex-col justify-between space-y-3.5">
                
                <div className="space-y-3">
                  {/* Contact Fields (2x2) */}
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2 mb-1.5">
                      <span 
                        style={{ backgroundColor: 'var(--primary, #162657)', color: '#ffffff' }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0"
                      >
                        1
                      </span>
                      <span>Contact Details</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl px-3 py-2 text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] placeholder:text-zinc-500 bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp / Phone *"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl px-3 py-2 text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] placeholder:text-zinc-500 bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400"
                      />
                      <input
                        type="email"
                        placeholder="Email Address (Optional)"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl px-3 py-2 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] placeholder:text-zinc-500 bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400"
                      />
                      <input
                        type="text"
                        placeholder="Company / Workshop"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full rounded-xl px-3 py-2 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] placeholder:text-zinc-500 bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400"
                      />
                    </div>
                  </div>

                  {/* Requirement Details */}
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2 mb-1.5">
                      <span 
                        style={{ backgroundColor: 'var(--primary, #162657)', color: '#ffffff' }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0"
                      >
                        2
                      </span>
                      <span>Quantity & Machine Model</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-zinc-900 font-bold mb-1">
                          Quantity (pcs) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full rounded-xl px-3 py-2 text-xs font-mono font-bold border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-900 font-bold mb-1">
                          Laser Torch / Machine Brand
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Raytools BM111, OSPRI"
                          value={formData.machineBrand}
                          onChange={(e) => setFormData({ ...formData, machineBrand: e.target.value })}
                          className="w-full rounded-xl px-3 py-2 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] placeholder:text-zinc-500 bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400"
                        />
                      </div>
                    </div>

                    {/* Warehouse & Dispatch Hub Selection (If multiple warehouses configured) */}
                    {settings.addresses && settings.addresses.length > 0 && (
                      <div className="pt-2">
                        <label className="text-xs text-zinc-900 font-bold mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-900" />
                            <span>Preferred Dispatch Warehouse</span>
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {settings.addresses.length} Facilities Available
                          </span>
                        </label>
                        <select
                          value={formData.preferredWarehouse}
                          onChange={(e) => setFormData({ ...formData, preferredWarehouse: e.target.value })}
                          className="w-full rounded-xl px-3 py-2 text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400 cursor-pointer"
                        >
                          <option value="">⚡ Automatic / Nearest Hub (Fastest Dispatch)</option>
                          {settings.addresses.map((addr) => (
                            <option key={addr.id} value={`${addr.title} (${addr.cityState || addr.warehouseType || 'Dispatch Hub'})`}>
                              {addr.title} {addr.cityState ? `— ${addr.cityState.split(',')[0]}` : ''} {addr.isPrimary ? '★ Primary HQ' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2 mb-1.5">
                      <span 
                        style={{ backgroundColor: 'var(--primary, #162657)', color: '#ffffff' }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0"
                      >
                        3
                      </span>
                      <span>Notes & Specific Requirements</span>
                    </span>
                    <textarea
                      rows={2}
                      placeholder="Specify caliber, focal length, delivery urgency, or GST details..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl px-3 py-2 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] placeholder:text-zinc-500 bg-white border-zinc-300 text-zinc-950 hover:border-zinc-400 resize-none"
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2.5 border-t border-zinc-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ backgroundColor: 'var(--primary, #162657)', color: '#ffffff' }}
                      className="btn-primary py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                          <span className="text-white">Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-white" />
                          <span className="text-white">Submit RFQ</span>
                        </>
                      )}
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer text-white"
                      title="Instant WhatsApp Inquiry"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                      <span className="truncate text-white">Inquire on WhatsApp</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-center font-semibold text-zinc-700 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[var(--accent)] shrink-0" />
                    <span>Fast response within 15 minutes during business hours.</span>
                  </p>
                </div>

              </form>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

