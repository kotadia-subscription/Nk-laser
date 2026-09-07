import React from 'react';
import { 
  Layers, 
  Package, 
  CheckCircle2, 
  Truck, 
  Inbox, 
  Plus, 
  Sparkles, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Tag,
  Star
} from 'lucide-react';
import { ProductCategoryDef, ProductItem, InquiryRecord, BrandItem, ReviewItem } from '../../../types';
import { AdminTabType } from '../AdminSidebar';

interface AdminDashboardViewProps {
  theme: 'light' | 'dark';
  categories: ProductCategoryDef[];
  products: ProductItem[];
  brands: BrandItem[];
  powerRanges: string[];
  inquiries: InquiryRecord[];
  reviews?: ReviewItem[];
  onNavigateTab: (tab: AdminTabType) => void;
  onOpenAddProduct: () => void;
  onOpenAddCategory: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  theme,
  categories,
  products,
  brands,
  powerRanges,
  inquiries,
  reviews = [],
  onNavigateTab,
  onOpenAddProduct,
  onOpenAddCategory
}) => {

  const inStockCount = products.filter(p => p.inStock === true || p.stockStatus === 'In Stock').length;
  const newInquiries = inquiries.filter(i => i.status === 'New');

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-colors bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-200/80 shadow-xs`}>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Inventory & Catalog Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            NK Laser & Spares Command Center
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed text-slate-600`}>
            Manage fiber laser cutting spares, protective optics, nozzles, ceramic rings, subcategories, customer inquiries, and direct WhatsApp RFQ dispatching with real-time updates.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAddProduct}
              className="btn-primary px-4 py-2.5 rounded-xl text-xs gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Spare Part</span>
            </button>

            <button
              onClick={onOpenAddCategory}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs`}
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Create Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigateTab('categories')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider text-slate-500`}>
              Categories
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-500">{categories.length}</div>
            <div className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 text-slate-500`}>
              <span>Manage taxonomies</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('products')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider text-slate-500`}>
              Total Spares
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black">{products.length}</div>
            <div className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 text-slate-500`}>
              <span>Live catalog products</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigateTab('products')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group bg-white border-slate-200 hover:border-emerald-400 hover:shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider text-slate-500`}>
              In-Stock Ready
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{inStockCount}</div>
            <div className={`text-[11px] font-medium mt-0.5 text-slate-500`}>
              {Math.round((inStockCount / (products.length || 1)) * 100)}% immediate dispatch
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigateTab('inquiries')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider text-slate-500`}>
              New RFQs
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-600">{newInquiries.length}</div>
            <div className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 text-slate-500`}>
              <span>{inquiries.length} total inquiries</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Metric 5: Reviews */}
        <div 
          onClick={() => onNavigateTab('reviews')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm col-span-2 sm:col-span-1`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider text-slate-500`}>
              Reviews
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{reviews.length}</div>
            <div className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 text-slate-500`}>
              <span>Manage & add reviews</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1: Categories Snapshot */}
        <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-sm">Top Categories</h3>
            </div>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {categories.slice(0, 5).map((cat) => {
              const count = products.filter(p => p.categorySlug === cat.slug).length;
              return (
                <div 
                  key={cat.id}
                  onClick={() => onNavigateTab('categories')}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold truncate">{cat.name}</div>
                    <div className={`text-[10px] truncate text-slate-500`}>
                      {cat.subCategories?.length || 0} subcategories • {cat.oemBrands?.length || 0} brands
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-slate-200 text-slate-700`}>
                    {count} items
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: Brand & Power Ranges Snapshot */}
        <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-sm">Laser Power Ranges</h3>
            </div>
            <button
              onClick={() => onNavigateTab('filters')}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              Configure
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {powerRanges.map((pr) => (
              <span
                key={pr}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700`}
              >
                {pr}
              </span>
            ))}
          </div>

          <div className="pt-2">
            <div className={`text-xs font-bold mb-2 text-slate-500`}>
              Registered OEM Brands ({brands.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {brands.slice(0, 8).map((b) => (
                <span
                  key={b.id}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg border bg-slate-100 border-slate-200 text-slate-700`}
                >
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Recent Inquiries */}
        <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-sm">Recent Inquiries</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              View All ({inquiries.length})
            </button>
          </div>

          <div className="space-y-2">
            {inquiries.length === 0 ? (
              <div className={`text-center py-8 text-xs text-slate-400`}>
                No customer inquiries logged yet.
              </div>
            ) : (
              inquiries.slice(0, 4).map((inq) => (
                <div 
                  key={inq.id}
                  onClick={() => onNavigateTab('inquiries')}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold truncate">{inq.customerName}</div>
                    <div className={`text-[10px] truncate text-slate-500`}>
                      {inq.productOrService}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    inq.status === 'New' 
                      ? 'bg-amber-500 text-zinc-950 font-black' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {inq.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
