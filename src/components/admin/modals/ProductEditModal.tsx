import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle2, Sparkles, Package } from 'lucide-react';
import { ProductItem, ProductCategoryDef, BrandItem } from '../../../types';
import { CategoryAutocomplete } from '../CategoryAutocomplete';
import { ImageUploadField } from '../../common/ImageUploadField';
import { ProductTemplateConfigSection } from './ProductTemplateConfigSection';
import { extractDefaultSpecsFromProduct } from '../../client/templates/templatePresets';

interface ProductEditModalProps {
  theme: 'light' | 'dark';
  product: Partial<ProductItem>;
  categories: ProductCategoryDef[];
  brands: BrandItem[];
  powerRanges: string[];
  onSave: (product: Partial<ProductItem>) => void;
  onClose: () => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  theme,
  product,
  categories,
  brands,
  powerRanges,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<ProductItem>>({
    title: '',
    sku: `NK-${Math.floor(1000 + Math.random() * 9000)}`,
    category: categories[0]?.name || 'Protective Lenses',
    categorySlug: categories[0]?.slug || 'protective-lenses',
    subCategory: 'Standard Series',
    brand: brands[0]?.name || 'RayTools',
    material: 'Fused Quartz / Silica',
    thickness: '3 mm',
    dimensions: 'Dia 27.9mm x 4.1mm',
    powerRange: powerRanges[0] || '1kW - 6kW',
    wavelength: '1064nm Fiber Laser',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: false,
    estimatedPrice: 850,
    moq: 1,
    description: 'Precision fiber laser replacement spare.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    specs: ['High optical transmission > 99.5%', 'Precision anti-reflective coating'],
    specificationsTable: [
      { label: 'Substrate', value: 'Imported JGS1 Optical Quartz' },
      { label: 'Damage Threshold', value: '> 15J/cm2 @ 1064nm' }
    ],
    ...product,
    templateConfig: (product.templateConfig && product.templateConfig.templateId) ? product.templateConfig : {
      templateId: 'simple',
      logoPreset: 'official-badge',
      sizeText: product.dimensions || product.thickness || 'Dia 27.9mm x 4.1mm',
      websiteText: 'WWW.NKLASER.IN',
      footerTagline: 'IDEAS SHAPED WITH LASER',
      specs: extractDefaultSpecsFromProduct(product)
    }
  });

  const [newSpecInput, setNewSpecInput] = useState('');
  const [newTableLabel, setNewTableLabel] = useState('');
  const [newTableValue, setNewTableValue] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSpec = () => {
    if (!newSpecInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      specs: [...(prev.specs || []), newSpecInput.trim()]
    }));
    setNewSpecInput('');
  };

  const handleRemoveSpec = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs?.filter((_, i) => i !== idx)
    }));
  };

  const handleAddTableRow = () => {
    if (!newTableLabel.trim() || !newTableValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      specificationsTable: [
        ...(prev.specificationsTable || []),
        { label: newTableLabel.trim(), value: newTableValue.trim() }
      ]
    }));
    setNewTableLabel('');
    setNewTableValue('');
  };

  const handleRemoveTableRow = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      specificationsTable: prev.specificationsTable?.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="rounded-3xl border max-w-6xl w-full flex flex-col shadow-2xl overflow-hidden my-auto max-h-[94vh] bg-white border-slate-200 text-slate-900">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0 border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {formData.id ? 'Edit Spare Part & Branded Template' : 'Add New Spare Part to Inventory'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Update SKU specifications, fitment attributes, and presentation template output.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body - Two Column Grid for Ergonomic Viewing */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Product Data & Specs */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-4">
              
              {/* Card 1: Core Part Identity */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Part Identity & Classification</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Product Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RayTools BM111 D27.9 T4.1 Protective Lens"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      SKU / Part Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="NK-8821"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Primary Category *
                    </label>
                    <CategoryAutocomplete
                      categories={categories}
                      value={formData.category || ''}
                      onChange={(val, slug) => setFormData({ ...formData, category: val, categorySlug: slug })}
                      theme={theme}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Sub-Category / Type
                    </label>
                    {(() => {
                      const activeCat = categories.find(c => c.slug === formData.categorySlug);
                      const hasSubcats = activeCat && activeCat.subCategories && activeCat.subCategories.length > 0;
                      
                      if (hasSubcats) {
                        return (
                          <select
                            value={formData.subCategory || ''}
                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-white border-slate-300 text-slate-900"
                          >
                            <option value="">Select Sub-Category</option>
                            {activeCat.subCategories.map((sub, i) => (
                              <option key={i} value={sub}>{sub}</option>
                            ))}
                          </select>
                        );
                      }
                      return (
                        <input
                          type="text"
                          placeholder="e.g. Single Layer / Precitec Type"
                          value={formData.subCategory || ''}
                          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                          className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900"
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Card 2: Technical Specifications & Fitment */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Fitment, Power & Commercials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Compatible OEM Brand
                    </label>
                    <select
                      value={formData.brand || 'RayTools'}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-white border-slate-300 text-slate-900 font-semibold"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Laser Power Rating
                    </label>
                    <select
                      value={formData.powerRange || '1kW - 6kW'}
                      onChange={(e) => setFormData({ ...formData, powerRange: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-white border-slate-300 text-slate-900 font-semibold"
                    >
                      {powerRanges.map((pr) => (
                        <option key={pr} value={pr}>{pr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Dimensions / Spec Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. D27.9mm x 4.1mm"
                      value={formData.dimensions || ''}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Base Material / Substrate
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Imported Fused Silica / Tellurium Copper"
                      value={formData.material || ''}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Estimated Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedPrice ?? 850}
                      onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                      className="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Stock Availability Status
                    </label>
                    <select
                      value={formData.stockStatus || 'In Stock'}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        stockStatus: e.target.value as any,
                        inStock: e.target.value === 'In Stock'
                      })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-white border-slate-300 text-slate-900 font-semibold"
                    >
                      <option value="In Stock">In Stock Ready</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Direct Import Stock">Direct Import Stock</option>
                      <option value="Custom Order">Custom Order</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Feature Bullet Points */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Key Technical Highlights & Bullet Points
                </label>
                <div className="space-y-1.5">
                  {formData.specs?.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1 p-2 rounded-lg border text-xs bg-white border-slate-200 text-slate-800">
                        {spec}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-1 text-red-500 hover:text-red-600 cursor-pointer"
                        title="Remove highlight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add bullet highlight (e.g. Anti-reflective 1064nm coating)..."
                    value={newSpecInput}
                    onChange={(e) => setNewSpecInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpec())}
                    className="flex-1 border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Card 4: Description */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Technical Description & Application Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe optimal cutting head compatibility, maintenance recommendations, and durability specs..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900 leading-relaxed"
                />
              </div>
            </div>

            {/* Right Column: Image & Branded Template Presentation */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              
              {/* Product Image Field */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                <ImageUploadField
                  label="Product Photo (Upload File or Paste Image URL)"
                  value={formData.imageUrl || ''}
                  onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                  theme={theme}
                  brandName={formData.title}
                  placeholder="https://images.unsplash.com/... or upload photo directly"
                  helperText="Upload a transparent or studio photo of the laser spare part. It will be framed inside the branded template below."
                  previewSize="md"
                  idPrefix="prod-img"
                />
              </div>

              {/* Branded Product Presentation Template Customizer */}
              <ProductTemplateConfigSection
                product={formData}
                config={formData.templateConfig || {
                  templateId: 'simple',
                  logoPreset: 'official-badge',
                  sizeText: formData.dimensions || formData.thickness || '',
                  websiteText: 'WWW.NKLASER.IN',
                  footerTagline: 'IDEAS SHAPED WITH LASER',
                  specs: extractDefaultSpecsFromProduct(formData)
                }}
                onChange={(updatedConfig) => setFormData(prev => ({ ...prev, templateConfig: updatedConfig }))}
                theme={theme}
              />

            </div>

          </div>

          {/* Modal Sticky Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-[11px] text-slate-500">
              * Changes apply immediately across your public catalog and quotation generator.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Save Product & Specs
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
