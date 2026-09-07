import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Truck, 
  Filter, 
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Zap,
  Tag,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  ChevronDown
} from 'lucide-react';
import { ProductItem, ProductCategoryDef, BrandItem } from '../../../types';
import { downloadProductsFile } from '../../../lib/storage';
import { ImportDataModal } from '../modals/ImportDataModal';

interface AdminProductsViewProps {
  theme: 'light' | 'dark';
  products: ProductItem[];
  categories: ProductCategoryDef[];
  brands: BrandItem[];
  powerRanges: string[];
  onOpenCreateProduct: () => void;
  onOpenEditProduct: (product: ProductItem) => void;
  onDeleteProduct: (id: string, title: string) => void;
  onDuplicateProduct: (product: ProductItem) => void;
  onToggleProductInStock: (productId: string, currentVal: boolean | undefined, currentStatus: string | undefined) => void;
  onQuickChangeStockStatus: (productId: string, newStatus: ProductItem['stockStatus']) => void;
  onProductsUpdated?: (products: ProductItem[]) => void;
}

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({
  theme,
  products,
  categories,
  brands,
  powerRanges,
  onOpenCreateProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onToggleProductInStock,
  onQuickChangeStockStatus,
  onProductsUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'price-asc' | 'price-desc' | 'sku'>('title');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.title.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategoryFilter !== 'all') {
        if (p.categorySlug !== selectedCategoryFilter && p.category !== selectedCategoryFilter) {
          return false;
        }
      }

      // Brand
      if (selectedBrandFilter !== 'all') {
        if (p.brand?.toLowerCase() !== selectedBrandFilter.toLowerCase()) {
          return false;
        }
      }

      // Stock filter
      if (stockFilter === 'in-stock') {
        return p.stockStatus === 'In Stock' || p.inStock === true;
      }
      if (stockFilter === 'out-of-stock') {
        return p.stockStatus !== 'In Stock' && p.inStock !== true;
      }

      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.estimatedPrice || 0) - (b.estimatedPrice || 0);
      if (sortBy === 'price-desc') return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
      if (sortBy === 'sku') return (a.sku || '').localeCompare(b.sku || '');
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [products, searchQuery, selectedCategoryFilter, selectedBrandFilter, stockFilter, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200`}>
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black tracking-tight">
                Global Product Catalog & Inventory ({products.length})
              </h2>
            </div>
            <p className={`text-xs mt-0.5 text-slate-500`}>
              Manage live inventory, instant stock ready toggles, pricing, and technical specifications.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export Products"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isExportMenuOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-xl z-20 py-1 overflow-hidden"
                  onMouseLeave={() => setIsExportMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      downloadProductsFile('json');
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Export JSON (.json)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadProductsFile('csv');
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export Excel/CSV (.csv)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Import Button */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Import Products from JSON or CSV"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Import</span>
            </button>

            {/* Add New Product Button */}
            <button
              onClick={onOpenCreateProduct}
              className="btn-primary px-4 py-2 rounded-xl text-xs gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              placeholder="Search by title, SKU, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400`}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-800`}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-800`}
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-800`}
            >
              <option value="all">All Stock Statuses</option>
              <option value="in-stock">In Stock Ready</option>
              <option value="out-of-stock">Low / Custom Order</option>
            </select>
          </div>

        </div>
      </div>

      {/* Products Table Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Package className={`w-12 h-12 mx-auto text-slate-300`} />
            <h3 className="font-bold text-base">No Products Found</h3>
            <p className={`text-xs max-w-sm mx-auto text-slate-500`}>
              Try clearing filters or search terms to view products in your inventory.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('all');
                setSelectedBrandFilter('all');
                setStockFilter('all');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider border-slate-200 bg-slate-100 text-slate-600`}>
                  <th className="py-3 px-3">Product / SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">OEM Brand</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3 text-center">Stock Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-200`}>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className={`transition-colors hover:bg-amber-50/40`}>
                    
                    {/* Title & SKU */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className={`w-10 h-10 rounded-xl object-cover border shrink-0 border-slate-200 bg-white`}
                        />
                        <div className="min-w-0">
                          <div className="font-bold truncate max-w-xs">{p.title}</div>
                          <div className="font-mono text-[10px] text-amber-600">
                            {p.sku || 'NK-AUTO'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <div className="font-semibold">{p.category || 'Spares'}</div>
                      <div className={`text-[10px] text-slate-500`}>
                        {p.subCategory || 'Standard'}
                      </div>
                    </td>

                    {/* OEM Brand */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-slate-100 border-slate-200 text-slate-800`}>
                        {p.brand || 'RayTools'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 font-mono font-bold">
                      ₹{p.estimatedPrice || 850}
                    </td>

                    {/* Stock Status Toggle */}
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

                    {/* Actions */}
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportDataModal
          theme={theme}
          entity="products"
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={(res) => {
            if (res.data && onProductsUpdated) {
              onProductsUpdated(res.data);
            }
          }}
        />
      )}

    </div>
  );
};
