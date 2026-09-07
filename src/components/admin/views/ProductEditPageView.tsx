import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  Layers, 
  Tag, 
  Sliders, 
  Eye, 
  FileText, 
  Check, 
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ProductItem, ProductCategoryDef, BrandItem, SiteSettings } from '../../../types';
import { CategoryAutocomplete } from '../CategoryAutocomplete';
import { ImageUploadField } from '../../common/ImageUploadField';
import { ProductTemplateConfigSection } from '../modals/ProductTemplateConfigSection';
import { extractDefaultSpecsFromProduct } from '../../client/templates/templatePresets';

interface ProductEditPageViewProps {
  theme: 'light' | 'dark';
  product: Partial<ProductItem>;
  categories: ProductCategoryDef[];
  brands: BrandItem[];
  powerRanges: string[];
  settings?: SiteSettings;
  onSave: (product: Partial<ProductItem>) => void;
  onBack?: () => void;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

export const ProductEditPageView: React.FC<ProductEditPageViewProps> = ({
  theme,
  product,
  categories,
  brands,
  powerRanges,
  settings,
  onSave,
  onBack,
  onClose,
  onOpenSettings
}) => {
  const isCreatingNew = !product.id;

  const handleExit = () => {
    if (onBack) {
      onBack();
    } else if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, onClose]);

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
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync state if incoming product changes
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        ...product,
        templateConfig: (product.templateConfig && product.templateConfig.templateId) ? product.templateConfig : prev.templateConfig
      }));
    }
  }, [product]);

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Please enter a product title or spare part description.');
      return;
    }
    onSave(formData);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Sticky Top Header & Breadcrumb Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleExit}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
              title="Return to Product Inventory"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Back to Products</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Products Catalog</span>
                <span>/</span>
                <span className="font-mono text-slate-700 font-bold">{formData.sku || 'SKU'}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-950 truncate flex items-center gap-2">
                <span>{isCreatingNew ? 'Add New Spare Part' : (formData.title || 'Edit Product')}</span>
                {formData.inStock ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    In Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    Lead Time
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isSavedNotice && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved Successfully!</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleExit}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-blue-900 hover:bg-blue-800 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isCreatingNew ? 'Create Spare Part' : 'Save Changes'}</span>
              <span className="hidden md:inline text-[10px] opacity-70 font-mono ml-1">⌘S</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Page Content Container */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT COLUMN: PRODUCT DATA, TAXONOMY, SPECS & BULLETS (7 cols)        */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Core Part Identity */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Part Identity & Classification</h2>
                    <p className="text-xs text-slate-500">Official SKU, product title, and category taxonomy</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {formData.sku}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Product / Spare Part Title *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Customer-facing title</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. RayTools BM111 High-Power Collimating Lens D30 F100"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                  />
                </div>

                {/* SKU & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Stock Keeping Unit (SKU) *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku || ''}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. NK-RT-BM111-CL"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>Indicative Price (₹)</span>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={formData.estimatedPrice || ''}
                        onChange={e => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                        placeholder="850"
                        className="w-full border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Category *</label>
                    <select
                      value={formData.categorySlug || ''}
                      onChange={e => {
                        const sel = categories.find(c => c.slug === e.target.value);
                        setFormData({
                          ...formData,
                          categorySlug: e.target.value,
                          category: sel ? sel.name : formData.category
                        });
                      }}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900 cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Subcategory</label>
                    <CategoryAutocomplete
                      theme={theme}
                      value={formData.subCategory || ''}
                      onChange={val => setFormData({ ...formData, subCategory: val })}
                      suggestions={
                        categories.find(c => c.slug === formData.categorySlug)?.subcategories?.map(s => typeof s === 'string' ? s : s.name) || []
                      }
                      placeholder="e.g. Collimation Optics, D30 Series"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Section 2: Technical Specifications & Fitment */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Technical Specifications & Fitment</h2>
                  <p className="text-xs text-slate-500">Machine compatibility, laser power, and physical dimensions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                
                {/* Brand / Fitment */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Compatible Machine / OEM Brand</label>
                  <select
                    value={formData.brand || ''}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900 cursor-pointer"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Power Range */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fiber Laser Power Rating</label>
                  <select
                    value={formData.powerRange || ''}
                    onChange={e => setFormData({ ...formData, powerRange: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900 cursor-pointer"
                  >
                    {powerRanges.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Dimensions / Size */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dimensions / Diameter & Thickness</label>
                  <input
                    type="text"
                    value={formData.dimensions || ''}
                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g. Dia 27.9mm x 4.1mm"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                  />
                </div>

                {/* Material / Substrate */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Substrate / Material</label>
                  <input
                    type="text"
                    value={formData.material || ''}
                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. Imported Fused Silica / JGS1 Quartz"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                  />
                </div>

                {/* Stock Status */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Availability</label>
                  <select
                    value={formData.stockStatus || 'In Stock'}
                    onChange={e => {
                      const val = e.target.value as ProductItem['stockStatus'];
                      setFormData({
                        ...formData,
                        stockStatus: val,
                        inStock: val === 'In Stock'
                      });
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900 cursor-pointer"
                  >
                    <option value="In Stock">In Stock (Ready for Dispatch)</option>
                    <option value="Low Stock">Low Stock (Fast Moving)</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="On Demand">On Demand (2-3 Days)</option>
                  </select>
                </div>

                {/* Minimum Order Qty */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Minimum Order Qty (MOQ)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.moq || 1}
                    onChange={e => setFormData({ ...formData, moq: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                  />
                </div>

              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer text-xs">
                  <span className="font-bold text-slate-800">Feature in Homepage Showcase</span>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer text-xs">
                  <span className="font-bold text-slate-800">Highlight as Popular Fast-Moving</span>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isPopular)}
                    onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Technical Highlights Bullets */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Technical Highlight Bullets</h2>
                    <p className="text-xs text-slate-500">Key feature points shown on product cards and catalog</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {(formData.specs || []).length} highlights
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {(formData.specs || []).map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-slate-800 font-medium">{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSpecInput}
                    onChange={e => setNewSpecInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpec(); } }}
                    placeholder="e.g. Double-sided anti-reflective AR coating < 0.2% reflection"
                    className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Specifications Table Rows */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Engineering Specifications Table</h2>
                    <p className="text-xs text-slate-500">Key-Value parameter sheet rendered on detailed product spec view</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {(formData.specificationsTable || []).length} rows
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {(formData.specificationsTable || []).map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 items-center">
                    <span className="col-span-5 font-bold text-slate-700 truncate">{row.label}</span>
                    <span className="col-span-6 font-mono text-slate-900 truncate">{row.value}</span>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveTableRow(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                  <input
                    type="text"
                    value={newTableLabel}
                    onChange={e => setNewTableLabel(e.target.value)}
                    placeholder="Parameter (e.g. Damage Threshold)"
                    className="sm:col-span-5 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                  />
                  <input
                    type="text"
                    value={newTableValue}
                    onChange={e => setNewTableValue(e.target.value)}
                    placeholder="Value (e.g. > 15J/cm2 @ 1064nm)"
                    className="sm:col-span-5 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddTableRow}
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 5: Description & Application Note */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Application Note & Description</h2>
                  <p className="text-xs text-slate-500">Maintenance guidance, fitment advice, and technical notes</p>
                </div>
              </div>

              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive technical application note, replacement frequency, cleaning procedure, and laser head fitment..."
                className="w-full border border-slate-300 rounded-2xl p-3.5 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 text-slate-900 leading-relaxed"
              />
            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: STUDIO PHOTO & BRANDED TEMPLATE PRESENTATION (5 cols)  */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Section 6: Direct Product Image Upload */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Studio Product Photo</h2>
                    <p className="text-xs text-slate-500">Clean product photo used for template synthesis</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ImageUploadField
                  label="Primary Product Photo"
                  value={formData.imageUrl || ''}
                  onChange={val => setFormData({ ...formData, imageUrl: val })}
                  theme={theme}
                  placeholder="https://... or upload raw spare part photo"
                  helperText="Primary high-res product photo used for storefront catalog cards and primary presentation."
                  previewSize="md"
                  idPrefix="prod-photo"
                />

                {/* Additional Gallery Photos */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Additional Views & Gallery Photos</h3>
                      <p className="text-[11px] text-slate-500">
                        Thumbnails are shown on product detail only when more than one image is present.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.galleryImages || [];
                        setFormData({ ...formData, galleryImages: [...current, ''] });
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add View Photo</span>
                    </button>
                  </div>

                  {formData.galleryImages && formData.galleryImages.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      {formData.galleryImages.map((imgUrl, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                          <div className="flex-1">
                            <ImageUploadField
                              label={`Alternate Angle / View #${index + 1}`}
                              value={imgUrl}
                              onChange={val => {
                                const updated = [...(formData.galleryImages || [])];
                                updated[index] = val;
                                setFormData({ ...formData, galleryImages: updated });
                              }}
                              theme={theme}
                              placeholder="https://... or upload alternate view photo"
                              previewSize="sm"
                              idPrefix={`gallery-photo-${index}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.galleryImages || []).filter((_, i) => i !== index);
                              setFormData({ ...formData, galleryImages: updated });
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors mt-6 cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Section 7: Branded Product Presentation Template */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Branded Presentation Template</h2>
                    <p className="text-xs text-slate-500">
                      Standardized industrial template with 4 selectable logo options
                    </p>
                  </div>
                </div>

                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="text-[11px] font-bold text-blue-900 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    title="Customize the 4 default logo options in Site Settings"
                  >
                    <span>⚙️ Manage Logos</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Template Configuration & Live Output Box */}
              <ProductTemplateConfigSection
                product={formData}
                config={formData.templateConfig || {
                  templateId: 'simple',
                  logoPreset: 'official-badge',
                  sizeText: formData.dimensions || '',
                  specs: extractDefaultSpecsFromProduct(formData)
                }}
                onChange={newCfg => setFormData({ ...formData, templateConfig: newCfg })}
                theme={theme}
              />
            </div>

          </div>

        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Currently Editing:</span>
            <span className="font-bold text-slate-900">{formData.title || 'New Spare Part'}</span>
            <span className="font-mono text-slate-500">({formData.sku})</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExit}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-blue-900 hover:bg-blue-800 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isCreatingNew ? 'Create Spare Part' : 'Save Product & Specs'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
