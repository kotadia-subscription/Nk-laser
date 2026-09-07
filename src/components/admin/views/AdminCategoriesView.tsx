import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Sparkles, 
  Package, 
  X, 
  CheckCircle2, 
  Truck, 
  ChevronRight,
  ShieldCheck,
  Disc,
  CircleDot,
  Eye,
  Zap,
  Cpu,
  Flame,
  Sliders,
  Radio,
  Grid,
  Wrench,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { ProductCategoryDef, ProductItem, SiteSettings } from '../../../types';
import { downloadCategoriesFile } from '../../../lib/storage';
import { ImportDataModal } from '../modals/ImportDataModal';

interface AdminCategoriesViewProps {
  theme: 'light' | 'dark';
  categories: ProductCategoryDef[];
  products: ProductItem[];
  selectedCategorySlug: string;
  onSelectCategorySlug: (slug: string) => void;
  onOpenEditCategory: (cat: ProductCategoryDef) => void;
  onOpenCreateCategory: () => void;
  onDeleteCategory: (catId: string, catName: string) => void;
  onOpenCreateProductForCategory: (cat: ProductCategoryDef) => void;
  onOpenEditProduct: (product: ProductItem) => void;
  onDeleteProduct: (id: string, title: string) => void;
  onDuplicateProduct: (product: ProductItem) => void;
  onToggleProductInStock: (productId: string, currentVal: boolean | undefined, currentStatus: string | undefined) => void;
  onQuickChangeStockStatus: (productId: string, newStatus: ProductItem['stockStatus']) => void;
  onAddSubcategory: (sub: string) => void;
  onRemoveSubcategory: (sub: string) => void;
  onAddBrandToCategory: (brand: string) => void;
  onRemoveBrandFromCategory: (brand: string) => void;
  onToggleCategoryFeatured?: (catId: string, currentVal: boolean | undefined) => void;
  onToggleCategoryHome?: (catId: string, currentVal: boolean | undefined) => void;
  onCategoriesUpdated?: (categories: ProductCategoryDef[]) => void;
}

export const AdminCategoriesView: React.FC<AdminCategoriesViewProps> = ({
  theme,
  categories,
  products,
  selectedCategorySlug,
  onSelectCategorySlug,
  onOpenEditCategory,
  onOpenCreateCategory,
  onDeleteCategory,
  onOpenCreateProductForCategory,
  onOpenEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onToggleProductInStock,
  onQuickChangeStockStatus,
  onAddSubcategory,
  onRemoveSubcategory,
  onAddBrandToCategory,
  onRemoveBrandFromCategory,
  onToggleCategoryFeatured,
  onToggleCategoryHome,
  onCategoriesUpdated
}) => {
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [productSearchInCategory, setProductSearchInCategory] = useState('');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');
  const [newOemBrandInput, setNewOemBrandInput] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'Disc': return <Disc className="w-4 h-4 text-orange-500" />;
      case 'CircleDot': return <CircleDot className="w-4 h-4 text-amber-400" />;
      case 'Eye': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-emerald-500" />;
      case 'Flame': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Sliders': return <Sliders className="w-4 h-4 text-indigo-500" />;
      case 'Radio': return <Radio className="w-4 h-4 text-pink-500" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-cyan-500" />;
      case 'Layers': return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'Grid': return <Grid className="w-4 h-4 text-purple-400" />;
      default: return <Wrench className="w-4 h-4 text-amber-500" />;
    }
  };

  const activeCategory = useMemo(() => {
    return categories.find(c => c.slug === selectedCategorySlug) || categories[0];
  }, [categories, selectedCategorySlug]);

  const filteredCategoryList = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const q = categorySearchQuery.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.slug.toLowerCase().includes(q) ||
      (c.shortTitle && c.shortTitle.toLowerCase().includes(q))
    );
  }, [categories, categorySearchQuery]);

  const categoryProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = p.categorySlug === selectedCategorySlug ||
        p.category?.toLowerCase() === activeCategory?.name.toLowerCase() ||
        (selectedCategorySlug === 'protective-lenses' && p.title.toLowerCase().includes('lens')) ||
        (selectedCategorySlug === 'cutting-nozzles' && p.title.toLowerCase().includes('nozzle')) ||
        (selectedCategorySlug === 'ceramic-rings' && p.title.toLowerCase().includes('ceramic')) ||
        (selectedCategorySlug === 'focusing-collimating-lenses' && (p.title.toLowerCase().includes('focus') || p.title.toLowerCase().includes('collimat'))) ||
        (selectedCategorySlug === 'laser-cutting-heads' && p.title.toLowerCase().includes('head')) ||
        (selectedCategorySlug === 'cnc-controllers-cypcut' && (p.title.toLowerCase().includes('cypcut') || p.title.toLowerCase().includes('bochu') || p.title.toLowerCase().includes('rf '))) ||
        (selectedCategorySlug === 'laser-welding-spares' && p.title.toLowerCase().includes('weld')) ||
        (selectedCategorySlug === 'pneumatic-smc-valves' && p.title.toLowerCase().includes('smc')) ||
        (selectedCategorySlug === 'optics-cleaning-maintenance' && (p.title.toLowerCase().includes('swab') || p.title.toLowerCase().includes('goggle') || p.title.toLowerCase().includes('clean')));

      if (!matchesCategory) return false;

      if (productSearchInCategory.trim()) {
        const q = productSearchInCategory.toLowerCase();
        const matchesQuery = p.title.toLowerCase().includes(q) || 
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (productStockFilter === 'in-stock') {
        return p.stockStatus === 'In Stock' || p.inStock === true;
      }
      if (productStockFilter === 'out-of-stock') {
        return p.stockStatus !== 'In Stock' && p.inStock !== true;
      }

      return true;
    });
  }, [products, selectedCategorySlug, activeCategory, productSearchInCategory, productStockFilter]);

  const handleAddSub = () => {
    if (!newSubcategoryInput.trim()) return;
    onAddSubcategory(newSubcategoryInput.trim());
    setNewSubcategoryInput('');
  };

  const handleAddBrand = () => {
    if (!newOemBrandInput.trim()) return;
    onAddBrandToCategory(newOemBrandInput.trim());
    setNewOemBrandInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Category Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Categories List */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className={`p-4 sm:p-5 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
            
            <div className={`flex items-center justify-between pb-3 border-b border-slate-200`}>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm">Categories ({categories.length})</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => downloadCategoriesFile()}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                  title="Export Categories JSON"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
                  title="Import Categories JSON"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                </button>
                <button
                  onClick={onOpenCreateCategory}
                  className="btn-primary px-2.5 py-1 rounded-lg text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400`}
              />
            </div>

            {/* Category Cards List */}
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredCategoryList.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                const catProdCount = products.filter(p => p.categorySlug === cat.slug).length;

                return (
                  <div
                    key={cat.id}
                    onClick={() => onSelectCategorySlug(cat.slug as string)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer select-none group relative ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400/80 shadow-xs ring-1 ring-amber-400/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isSelected 
                            ? 'bg-amber-500 text-zinc-950 font-bold' 
                            : 'bg-white text-slate-700 shadow-2xs'
                        }`}>
                          {renderCategoryIcon(cat.iconName)}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-black truncate ${
                            isSelected 
                              ? 'text-amber-900' 
                              : 'text-slate-800 group-hover:text-slate-900'
                          }`}>
                            {cat.name}
                          </div>
                          <div className={`text-[10px] font-mono truncate text-slate-400`}>
                            /{cat.slug}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected 
                          ? 'bg-amber-500 text-zinc-950 font-black' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {catProdCount}
                      </span>
                    </div>

                    {/* Quick Visibility & Top Nav Status Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCategoryHome?.(cat.id, cat.showOnHome);
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          cat.showOnHome !== false
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300'
                        }`}
                        title="Click to toggle Home Page visibility"
                      >
                        {cat.showOnHome !== false ? '🏠 Home: On' : '🏠 Home: Off'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCategoryFeatured?.(cat.id, cat.featured);
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          cat.featured !== false
                            ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30 hover:bg-amber-500/25'
                            : 'bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300'
                        }`}
                        title="Click to toggle featured status in the Spare Parts Catalog popup menu"
                      >
                        {cat.featured !== false ? '⭐ Featured in Nav' : '☆ Standard in Nav'}
                      </button>
                    </div>

                    <div className={`flex items-center justify-between pt-2 mt-2 border-t text-[10px] border-slate-200 text-slate-500`}>
                      <span>
                        {cat.subCategories?.length || 0} Subcats • {cat.oemBrands?.length || 0} Brands
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditCategory(cat);
                          }}
                          className={`p-1 rounded cursor-pointer text-slate-400 hover:text-amber-600 hover:bg-slate-200`}
                          title="Edit Category Info"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(cat.id, cat.name);
                          }}
                          className={`p-1 rounded cursor-pointer text-slate-400 hover:text-red-600 hover:bg-slate-200`}
                          title="Delete Category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column: Category Configuration & Products */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {activeCategory && (
            <div className={`p-5 sm:p-6 rounded-3xl border space-y-5 bg-white border-slate-200 shadow-xs`}>
              
              {/* Category Header Bar */}
              <div className={`flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                    {renderCategoryIcon(activeCategory.iconName)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black">
                        {activeCategory.name}
                      </h2>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200`}>
                        slug: {activeCategory.slug}
                      </span>
                    </div>

                    <p className={`text-xs max-w-3xl text-slate-600`}>
                      {activeCategory.description}
                    </p>

                    {/* Quick 1-Click Toggles for Home Page & Top Nav */}
                    <div className="flex flex-wrap items-center gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleCategoryHome?.(activeCategory.id, activeCategory.showOnHome)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          activeCategory.showOnHome !== false
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20'
                            : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Toggle whether this category is displayed on the Home Page"
                      >
                        <span>🏠 Home Page:</span>
                        <span className="font-extrabold">{activeCategory.showOnHome !== false ? 'ON (Visible)' : 'OFF (Hidden)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleCategoryFeatured?.(activeCategory.id, activeCategory.featured)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          activeCategory.featured !== false
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20'
                            : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Toggle whether this category is featured in the Spare Parts Catalog navigation popup"
                      >
                        <span>⭐ Nav Catalog Popup:</span>
                        <span className="font-extrabold">{activeCategory.featured !== false ? 'FEATURED (Priority)' : 'STANDARD'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenEditCategory(activeCategory)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Edit Category</span>
                  </button>

                  <button
                    onClick={() => onOpenCreateProductForCategory(activeCategory)}
                    className="btn-primary px-3.5 py-1.5 rounded-xl text-xs gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Spare in Category</span>
                  </button>
                </div>
              </div>

              {/* Subcategories & OEM Brands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Subcategories Manager */}
                <div className={`p-4 rounded-2xl border space-y-3 bg-slate-50 border-slate-200`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Sub-Categories & Types</span>
                    </label>
                    <span className={`text-[10px] font-mono text-slate-500`}>
                      {activeCategory.subCategories?.length || 0} items
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                    {activeCategory.subCategories?.map((sub) => (
                      <span
                        key={sub}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white border-slate-300 text-slate-800 shadow-2xs`}
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveSubcategory(sub)}
                          className={`p-0.5 cursor-pointer text-slate-400 hover:text-red-600`}
                          title={`Remove ${sub}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add subcategory..."
                      value={newSubcategoryInput}
                      onChange={(e) => setNewSubcategoryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSub())}
                      className={`flex-1 border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={handleAddSub}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800`}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* 2. OEM Compatible Brands */}
                <div className={`p-4 rounded-2xl border space-y-3 bg-slate-50 border-slate-200`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Compatible OEM Brands</span>
                    </label>
                    <span className={`text-[10px] font-mono text-slate-500`}>
                      {activeCategory.oemBrands?.length || 0} brands
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                    {activeCategory.oemBrands?.map((brand) => (
                      <span
                        key={brand}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white border-slate-300 text-slate-800 shadow-2xs`}
                      >
                        <span>{brand}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveBrandFromCategory(brand)}
                          className={`p-0.5 cursor-pointer text-slate-400 hover:text-red-600`}
                          title={`Remove ${brand}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add OEM brand..."
                      value={newOemBrandInput}
                      onChange={(e) => setNewOemBrandInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBrand())}
                      className={`flex-1 border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={handleAddBrand}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800`}
                    >
                      Add
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Products in Selected Category Table */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
            <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200`}>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm">
                  Products in {activeCategory?.name} ({categoryProducts.length})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
                  <input
                    type="text"
                    placeholder="Search in category..."
                    value={productSearchInCategory}
                    onChange={(e) => setProductSearchInCategory(e.target.value)}
                    className={`border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400`}
                  />
                </div>

                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value as any)}
                  className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-800`}
                >
                  <option value="all">All Inventory</option>
                  <option value="in-stock">In Stock Ready</option>
                  <option value="out-of-stock">Low / Custom Order</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {categoryProducts.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Package className={`w-10 h-10 mx-auto text-slate-300`} />
                <p className={`text-xs text-slate-500`}>
                  No products found for this category and filter.
                </p>
                {activeCategory && (
                  <button
                    onClick={() => onOpenCreateProductForCategory(activeCategory)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Product</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] font-bold uppercase tracking-wider border-slate-200 bg-slate-100 text-slate-600`}>
                      <th className="py-3 px-3">Product / SKU</th>
                      <th className="py-3 px-3">OEM / Subcategory</th>
                      <th className="py-3 px-3">Price (₹)</th>
                      <th className="py-3 px-3 text-center">Stock Ready</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-200`}>
                    {categoryProducts.map((p) => (
                      <tr key={p.id} className={`transition-colors hover:bg-amber-50/40`}>
                        
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className={`w-9 h-9 rounded-lg object-cover border shrink-0 border-slate-200 bg-white`}
                            />
                            <div className="min-w-0">
                              <div className="font-bold truncate max-w-xs">{p.title}</div>
                              <div className="font-mono text-[10px] text-amber-600">{p.sku || 'NK-AUTO'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold">{p.brand || 'RayTools'}</div>
                          <div className={`text-[10px] text-slate-500`}>{p.subCategory || 'Standard'}</div>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold">
                          ₹{p.estimatedPrice || 850}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleProductInStock(p.id, p.inStock, p.stockStatus)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                              p.inStock || p.stockStatus === 'In Stock'
                                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-zinc-500/20 text-zinc-600 border-zinc-500/30 hover:bg-zinc-500/30'
                            }`}
                          >
                            {p.inStock || p.stockStatus === 'In Stock' ? 'In Stock' : 'Low Stock'}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenEditProduct(p)}
                              className={`p-1.5 rounded-lg cursor-pointer text-slate-500 hover:text-amber-600 hover:bg-slate-200`}
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDuplicateProduct(p)}
                              className={`p-1.5 rounded-lg cursor-pointer text-slate-500 hover:text-blue-600 hover:bg-slate-200`}
                              title="Duplicate Product"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(p.id, p.title)}
                              className={`p-1.5 rounded-lg cursor-pointer text-slate-500 hover:text-red-600 hover:bg-slate-200`}
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Import Categories Modal */}
      {isImportModalOpen && (
        <ImportDataModal
          theme={theme}
          entity="categories"
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={(res) => {
            if (res.data && onCategoriesUpdated) {
              onCategoriesUpdated(res.data);
            }
          }}
        />
      )}

    </div>
  );
};
