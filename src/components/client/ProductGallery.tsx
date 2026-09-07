import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  CheckCircle2, 
  Eye, 
  X,
  Tag
} from 'lucide-react';
import { ProductItem, SiteSettings } from '../../types';
import { buildWhatsAppLink, createProductInquiryMessage } from '../../utils/whatsapp';
import { SectionHeading } from '../common/SectionHeading';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface ProductGalleryProps {
  products: ProductItem[];
  settings: SiteSettings;
  onSelectProductForInquiry: (product: ProductItem) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  products,
  settings,
  onSelectProductForInquiry
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);


  // Dynamic Category Extraction from products
  const categories = Array.from(new Set([
    'All',
    'Laser Cutting Spares',
    'Sheet Metal Cutting',
    'Decorative & Architectural Jali',
    'Tube & Pipe Laser',
    'Custom Fabrication',
    'Laser Welding',
    ...products.map(p => p.category).filter(Boolean)
  ]));

  const materials = ['All', 'Quartz / Glass', 'Copper & Brass', 'Stainless Steel', 'Mild Steel (MS)', 'Aluminum', 'Acrylic'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesMaterial = selectedMaterial === 'All' || product.material === selectedMaterial;
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesMaterial && matchesSearch;
  });

  return (
    <section
      id="gallery"
      className="py-16 md:py-24 transition-colors duration-300 border-b bg-white text-zinc-900 border-zinc-200"
    >
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <SectionHeading
          badge="Category-Wise Catalog & Spares"
          title="Laser Cut Components & Consumables by Category"
          subtitle="Browse high-precision laser cut metal parts, decorative architectural screens, and direct imported fiber laser spares organized category-wise."
          themeMode={settings.themeMode}
        />

        {/* Filters & Search Controls */}
        <div className="p-4 sm:p-5 rounded-2xl mb-8 space-y-4 border bg-zinc-50 border-zinc-200 shadow-sm">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, spares, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 border font-medium bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400"
              />
            </div>

            {/* Material Filter Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold shrink-0 text-zinc-600">Filter Material:</span>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 border font-semibold bg-white border-zinc-300 text-zinc-800"
              >
                {materials.map(mat => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Category Filter Buttons */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-200">
            <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-800">
              <Tag className="w-3 h-3" />
              <span>Browse Categories:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const count = cat === 'All' 
                  ? products.length 
                  : products.filter(p => p.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-zinc-950 shadow-md'
                        : 'bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 shadow-2xs'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      selectedCategory === cat
                        ? 'bg-zinc-950/20 text-zinc-950 font-black'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {filteredProducts.map((product, index) => {
            const waMessage = createProductInquiryMessage(
              product.title,
              product.category,
              product.material,
              product.thickness,
              product.description
            );
            const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, waMessage);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="border rounded-xl sm:rounded-2xl overflow-hidden shadow-md transition-all duration-300 flex flex-col justify-between group bg-zinc-50 border-zinc-200 hover:border-amber-400/80 hover:shadow-xl hover:bg-white"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-32 sm:h-48 overflow-hidden bg-zinc-800">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />

                    {/* Popular Badge */}
                    {product.isPopular && (
                      <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-amber-500 text-zinc-950 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-md">
                        FEATURED
                      </span>
                    )}

                    {/* Material Tag */}
                    <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-zinc-900/90 backdrop-blur border border-zinc-700 text-amber-400 text-[8px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg truncate max-w-[55%]">
                      {product.material}
                    </span>

                    {/* Quick Preview Button Overlay */}
                    <button
                      onClick={() => setActiveModalProduct(product)}
                      className="absolute inset-0 hidden sm:flex items-center justify-center bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs gap-1.5 backdrop-blur-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>View Specifications</span>
                    </button>
                  </div>

                  {/* Body Copy */}
                  <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">
                    <h3 className="font-bold text-xs sm:text-sm transition-colors line-clamp-1 text-zinc-900 group-hover:text-amber-600">
                      {product.title}
                    </h3>

                    <p className="text-[11px] sm:text-xs line-clamp-2 leading-snug sm:leading-relaxed text-zinc-600">
                      {product.description}
                    </p>

                    {product.thickness && (
                      <div className="text-[10px] sm:text-[11px] font-mono p-1.5 sm:p-2 rounded-lg sm:rounded-xl border truncate text-zinc-700 bg-white border-zinc-200">
                        <strong>Specs:</strong> {product.thickness}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Price & WhatsApp Action */}
                <div className="p-2.5 sm:p-4 pt-0 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1.5 sm:pt-2 border-t border-zinc-200">
                    <span className="font-mono text-zinc-500">STATUS:</span>
                    {settings.showPricing && product.estimatedPrice ? (
                      <span className="font-bold text-emerald-600 font-mono text-[11px] sm:text-xs truncate">
                        ₹{product.estimatedPrice.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="font-bold text-[9px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border truncate text-amber-900 bg-amber-100 border-amber-300">
                        Quote
                      </span>
                    )}
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 btn-primary font-bold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-colors cursor-pointer shadow-xs truncate"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                    <span className="truncate">Inquire</span>
                  </a>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Modal for Detailed Product View */}
        {activeModalProduct && (
          <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border bg-white border-zinc-200 text-zinc-900">
              
              <button
                onClick={() => setActiveModalProduct(null)}
                className="absolute top-3 right-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 p-1.5 rounded-full z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-64 bg-zinc-950">
                <img
                  src={activeModalProduct.imageUrl}
                  alt={activeModalProduct.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border bg-amber-100 text-amber-900 border-amber-300 font-extrabold">
                    {activeModalProduct.category}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                    {activeModalProduct.material}
                  </span>
                </div>

                <h3 className="text-xl font-bold">
                  {activeModalProduct.title}
                </h3>

                <p className="text-sm leading-relaxed text-zinc-600">
                  {activeModalProduct.description}
                </p>

                <div className="p-3 rounded-2xl border space-y-1.5 text-xs bg-zinc-50 border-zinc-200">
                  <div className="font-bold mb-1 text-amber-800 font-extrabold">
                    Key Specifications:
                  </div>
                  {activeModalProduct.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <a
                    href={buildWhatsAppLink(
                      settings.whatsappNumber,
                      createProductInquiryMessage(
                        activeModalProduct.title,
                        activeModalProduct.category,
                        activeModalProduct.material,
                        activeModalProduct.thickness
                      )
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 btn-primary font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Inquire on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      const prod = activeModalProduct;
                      setActiveModalProduct(null);
                      onSelectProductForInquiry(prod);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Request Web Quote
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

