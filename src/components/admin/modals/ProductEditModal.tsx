import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle2, Sparkles, Package } from 'lucide-react';
import { ProductItem, ProductCategoryDef, BrandItem } from '../../../types';
import { CategoryAutocomplete } from '../CategoryAutocomplete';
import { ImageUploadField } from '../../common/ImageUploadField';

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
    ...product
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
      <div className={`rounded-3xl border max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh] bg-white border-slate-200 text-slate-900`}>
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 border-slate-200 bg-slate-50`}>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-sm sm:text-base">
              {formData.id ? 'Edit Product & Specs' : 'Add New Spare Part to Inventory'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-200`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                Product Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RayTools BM111 D27.9 T4.1 Protective Lens"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                SKU / Part Number
              </label>
              <input
                type="text"
                placeholder="NK-8821"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
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
              <label className={`text-xs font-bold text-slate-700`}>
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
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-900`}
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
                    className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
                  />
                );
              })()}
            </div>
          </div>

          {/* OEM Brand & Power Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                Compatible OEM Brand
              </label>
              <select
                value={formData.brand || 'RayTools'}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-900`}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                Laser Power Rating
              </label>
              <select
                value={formData.powerRange || '1kW - 6kW'}
                onChange={(e) => setFormData({ ...formData, powerRange: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-900`}
              >
                {powerRanges.map((pr) => (
                  <option key={pr} value={pr}>{pr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                Estimated Price (₹)
              </label>
              <input
                type="number"
                value={formData.estimatedPrice || 850}
                onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                Stock Availability
              </label>
              <select
                value={formData.stockStatus || 'In Stock'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stockStatus: e.target.value as any,
                  inStock: e.target.value === 'In Stock'
                })}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-900`}
              >
                <option value="In Stock">In Stock Ready</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Direct Import Stock">Direct Import Stock</option>
                <option value="Custom Order">Custom Order</option>
              </select>
            </div>
          </div>

          {/* Product Image URL & Upload */}
          <ImageUploadField
            label="Product Image (URL or Direct Upload)"
            value={formData.imageUrl || ''}
            onChange={(val) => setFormData({ ...formData, imageUrl: val })}
            theme={theme}
            brandName={formData.title}
            placeholder="https://images.unsplash.com/... or paste direct URL"
            helperText="Enter a CDN image URL or upload an image file from your device. Replaces previously saved image immediately."
            previewSize="md"
            idPrefix="prod-img"
          />

          {/* Description */}
          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Description & Application
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          {/* Key Specs Bullets */}
          <div className="space-y-2">
            <label className={`text-xs font-bold text-slate-700`}>
              Key Feature Bullet Points
            </label>
            <div className="space-y-1.5">
              {formData.specs?.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`flex-1 p-2 rounded-lg border text-xs bg-slate-50 border-slate-200`}>
                    {spec}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1 text-red-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add bullet spec (e.g. Anti-reflective 1064nm coating)..."
                value={newSpecInput}
                onChange={(e) => setNewSpecInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpec())}
                className={`flex-1 border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800`}
              >
                Add
              </button>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t border-slate-200`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs shadow-md"
            >
              Save Product
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
