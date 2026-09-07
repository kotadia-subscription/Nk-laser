import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send,
  Info,
  ShieldCheck,
  ChevronRight,
  Package,
  Factory,
  Building2,
  Truck,
  MapPin
} from 'lucide-react';
import { ProductItem, SiteSettings, ProductCategoryDef } from '../../types';
import { buildWhatsAppLink } from '../../utils/whatsapp';

interface ProductDetailViewProps {
  product: ProductItem;
  allProducts: ProductItem[];
  settings: SiteSettings;
  categories: ProductCategoryDef[];
  onBackToCatalog: () => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenCategory: (slug: string) => void;
  onOpenBrand: (brand: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  settings,
  onBackToCatalog,
  onSelectProduct,
  onOpenCategory,
  onOpenBrand
}) => {
  const [quantity, setQuantity] = useState(product.moq || 1);

  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');

  const getWhatsAppMessage = () => {
    let msg = `Hello ${settings.businessName}! I would like to order or inquire about:\n\n`;
    msg += `*Item:* ${product.title}\n`;
    msg += `*Category:* ${product.category}\n`;
    msg += `*Brand/OEM:* ${product.brand || 'Universal/Standard'}\n`;
    if (product.material) msg += `*Material:* ${product.material}\n`;
    if (product.dimensions) msg += `*Dimensions:* ${product.dimensions}\n`;
    msg += `*Quantity Needed:* ${quantity} pieces\n\n`;
    msg += `Could you please confirm availability and provide a final quote with delivery?`;
    return msg;
  };

  const handleWhatsAppOrder = () => {
    const url = buildWhatsAppLink(settings.whatsappNumber, getWhatsAppMessage());
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[var(--background)] min-h-screen pb-16 lg:pb-24">
      {/* Top Breadcrumb Nav */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
            <button 
              onClick={onBackToCatalog}
              className="hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Product Catalog
            </button>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <button 
              onClick={() => onOpenCategory(product.categorySlug || product.category.toLowerCase().replace(/\s+/g, '-'))}
              className="hover:text-[var(--primary)] transition-colors"
            >
              {product.category}
            </button>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-xs">
              {product.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 space-y-16">
        
        {/* Main Product Layout: Split Left/Right */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* LEFT: Large Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center p-8 group">
              <img
                src={product.image || product.imageUrl}
                alt={product.title}
                className="max-w-full max-h-full object-contain drop-shadow-2xl mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Thumbnail row if multiple images exist - mimicking gallery */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div className="w-20 h-20 shrink-0 rounded-xl border-2 border-[var(--primary)] bg-[var(--surface)] p-2 cursor-pointer flex items-center justify-center">
                 <img
                  src={product.image || product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information & CTAs */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-8">
            <div className="space-y-6">
              
              {/* Brand & Title */}
              <div>
                {product.brand && (
                  <button 
                    onClick={() => onOpenBrand(product.brand)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] mb-4 hover:border-[var(--primary)] transition-colors"
                  >
                    <Factory className="w-3.5 h-3.5" />
                    {product.brand} OEM Compatible
                  </button>
                )}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-tight mb-4">
                  {product.title}
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="w-full h-px bg-[var(--border)]" />

              {/* Specs Highlight */}
              {product.specs && product.specs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.specs.map((s, idx) => (
                     <span key={idx} className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-xs font-bold text-[var(--text-primary)] font-mono">
                        {s}
                     </span>
                  ))}
                </div>
              )}

              {/* Price & Availability */}
              <div className="bg-[var(--surface-secondary)] rounded-2xl p-6 border border-[var(--border)] space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Estimated Unit Price</div>
                      <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--primary)]">
                        {settings.showPricing && product.estimatedPrice ? `₹${product.estimatedPrice}` : 'Quote on Request'}
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                         <CheckCircle2 className="w-4 h-4" /> Available In-Stock
                       </div>
                       <div className="text-[10px] text-[var(--text-secondary)] mt-1">Dispatches in 24-48 hrs</div>
                    </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                 <div className="flex flex-col sm:flex-row gap-4">
                    {/* Quantity Control */}
                    <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface)] rounded-xl p-1.5 sm:w-1/3 shrink-0">
                      <button
                        onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-primary)] flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={product.moq || 1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center text-sm font-black font-mono bg-transparent border-0 focus:outline-none text-[var(--text-primary)]"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-primary)] flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Order Button */}
                    <button
                      onClick={handleWhatsAppOrder}
                      className="btn-primary flex-grow py-4 rounded-xl text-sm gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>{settings.showPricing ? `Request Quote (${quantity} pcs)` : 'Inquire on WhatsApp'}</span>
                    </button>
                 </div>
                 <div className="text-center text-xs text-[var(--text-secondary)]">
                   Need help verifying machine compatibility? <a href={`tel:${cleanNumber}`} className="text-[var(--primary)] font-bold hover:underline">Call our technical desk.</a>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Technical Layout */}
        <div className="border-t border-[var(--border)] pt-16 pb-8">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">Overview</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {product.description}
                  {" "}Manufactured to exact OEM standards to ensure optimal performance, beam quality, and longevity in industrial laser cutting applications.
                </p>
                
                <div className="pt-6 space-y-3">
                   <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                     <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                     <span>100% Quality Guaranteed</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                     <Package className="w-5 h-5 text-[var(--primary)]" />
                     <span>Secure Industrial Packaging</span>
                   </div>
                   {settings.addresses && settings.addresses.length > 0 && (
                     <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                       <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                       <span>Dispatched from {settings.addresses.length} Regional Hubs</span>
                     </div>
                   )}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                 <div>
                   <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">Technical Specifications</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.specificationsTable && product.specificationsTable.length > 0 ? (
                        product.specificationsTable.map((spec, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{spec.label}</span>
                            <span className="font-bold text-[var(--text-primary)] text-sm">{spec.value}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Material / Substrate</span>
                            <span className="font-bold text-[var(--text-primary)] text-sm">{product.material || 'Standard'}</span>
                          </div>
                          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dimensions / Spec</span>
                            <span className="font-bold text-[var(--text-primary)] text-sm font-mono">{product.dimensions || product.thickness || 'Varies by model'}</span>
                          </div>
                          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">OEM Compatibility</span>
                            <span className="font-bold text-[var(--text-primary)] text-sm">{product.brand || 'Universal'}</span>
                          </div>
                          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fulfillment</span>
                            <span className="font-bold text-emerald-600 text-sm">Dispatches in 24h</span>
                          </div>
                        </>
                      )}
                   </div>
                 </div>

                 {/* Warehouse Network & Dispatch Facilities */}
                 {settings.addresses && settings.addresses.length > 0 && (
                   <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                         <Building2 className="w-4 h-4 text-[var(--primary)]" />
                         <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                           Regional Warehouse Stock & Dispatch Network ({settings.addresses.length} Facilities)
                         </h4>
                       </div>
                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                         Ready for Dispatch
                       </span>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                       {settings.addresses.map((addr) => (
                         <div 
                           key={addr.id} 
                           className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] flex flex-col justify-between gap-1.5"
                         >
                           <div>
                             <div className="flex items-start justify-between gap-1">
                               <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{addr.title}</span>
                               {addr.isPrimary && (
                                 <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-[var(--primary)] text-[var(--primary-contrast)] shrink-0">
                                   HQ
                                 </span>
                               )}
                             </div>
                             <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                               {addr.cityState || addr.addressLine}
                             </p>
                           </div>

                           <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[var(--border)]/60 text-slate-500">
                             <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold truncate">
                               <Truck className="w-3 h-3 shrink-0" />
                               <span>{addr.dispatchTiming || 'Same-day dispatch'}</span>
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>

           </div>
        </div>

        {/* Related Spares & Recommended Consumables */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-[var(--border)]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Frequently Purchased Together</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Matching laser cutting optics, ceramic rings, and nozzles
                </p>
              </div>
              <button
                onClick={onBackToCatalog}
                className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View Full Catalog <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectProduct(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-square w-full bg-black/5 overflow-hidden p-6 flex items-center justify-center">
                    <img
                      src={rel.image || rel.imageUrl}
                      alt={rel.title}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2 line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                      {rel.title}
                    </h4>
                    <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-600 text-sm">
                        {settings.showPricing && rel.estimatedPrice ? `₹${rel.estimatedPrice}` : 'Inquire'}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors uppercase tracking-wider">
                        Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
