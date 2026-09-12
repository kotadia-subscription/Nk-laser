import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  ListFilter,
  Inbox,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  Lock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  Star
} from 'lucide-react';
import { NKLogo } from '../common/NKLogo';

export type AdminTabType = 
  | 'dashboard' 
  | 'categories' 
  | 'products' 
  | 'filters' 
  | 'inquiries' 
  | 'reviews'
  | 'settings' 
  | 'security';

interface AdminSidebarProps {
  activeTab: AdminTabType;
  onSelectTab: (tab: AdminTabType) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onClose: () => void;
  onLogout: () => void;
  counts: {
    categories: number;
    products: number;
    inquiries: number;
    newInquiries: number;
    reviews?: number;
  };
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  logoUrl?: string;
  businessName?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  theme = 'light',
  onToggleTheme,
  onClose,
  onLogout,
  counts,
  isMobileOpen,
  onCloseMobile,
  logoUrl,
  businessName = 'NK Laser'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: { id: AdminTabType; label: string; subLabel: string; icon: React.ComponentType<{ className?: string }>; badge?: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      subLabel: 'KPIs & Catalog Health',
      icon: LayoutDashboard
    },
    {
      id: 'categories',
      label: 'Categories & Taxonomy',
      subLabel: 'Subcategories & Specs',
      icon: Layers,
      badge: <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{counts.categories}</span>
    },
    {
      id: 'products',
      label: 'Product Catalog',
      subLabel: 'Inventory & Stock Status',
      icon: Package,
      badge: <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{counts.products}</span>
    },
    {
      id: 'filters',
      label: 'Filter & Laser Options',
      subLabel: 'Power kW & OEM Brands',
      icon: ListFilter
    },
    {
      id: 'inquiries',
      label: 'Inquiries & RFQs',
      subLabel: 'Customer Leads & Quotes',
      icon: Inbox,
      badge: counts.newInquiries > 0 ? (
        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 animate-pulse">
          {counts.newInquiries} New
        </span>
      ) : (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{counts.inquiries}</span>
      )
    },
    {
      id: 'reviews',
      label: 'Customer Reviews',
      subLabel: 'Feedback & Ratings',
      icon: Star,
      badge: <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{counts.reviews ?? 0}</span>
    },
    {
      id: 'settings',
      label: 'Site & Business Config',
      subLabel: 'WhatsApp, CAD & Details',
      icon: Settings
    },
    {
      id: 'security',
      label: 'Security & Compliance',
      subLabel: 'Master Pass & Brand Audit',
      icon: ShieldCheck
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
        bg-white border-r border-slate-200 text-slate-900 shadow-sm
      `}>

        {/* Collapse / Expand Toggle (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-300 cursor-pointer z-10"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Brand / Logo Top Lockup */}
        <div className={`p-4 sm:p-5 flex items-center border-b shrink-0 border-slate-200 ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="p-1 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
              <NKLogo
                logoUrl={logoUrl}
                size="sm"
                showSubtitle={false}
                themeMode="light"
                alt={businessName}
                className="h-8 w-auto"
              />
            </div>
            <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight truncate">{businessName}</span>
                <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-500/25 shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                Master Control Center
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className={`lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer shrink-0 ${isCollapsed ? 'lg:hidden' : ''}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Options */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 ${isCollapsed ? 'lg:hidden' : ''}`}>
            Management Modules
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`
                  w-full text-left p-2.5 sm:p-3 rounded-2xl transition-all flex items-center justify-between gap-2.5 cursor-pointer group select-none
                  ${isCollapsed ? 'lg:justify-center' : ''}
                  ${isSelected
                    ? 'theme-bg-primary font-black shadow-sm ring-1 ring-black/10'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      !isSelected
                        ? 'bg-slate-100 text-slate-500 group-hover:text-amber-600 group-hover:bg-slate-200'
                        : ''
                    }`}
                    style={isSelected ? {
                      backgroundColor: 'var(--primary-contrast-badge-bg, rgba(0,0,0,0.18))',
                      color: 'var(--primary-contrast, #09090b)'
                    } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
                    <div
                      className={`text-xs leading-tight truncate ${isSelected ? 'font-black' : 'font-bold'}`}
                      style={isSelected ? { color: 'var(--primary-contrast, #09090b)' } : undefined}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] leading-tight truncate ${
                        isSelected ? 'font-medium opacity-85' : 'text-slate-400'
                      }`}
                      style={isSelected ? { color: 'var(--primary-contrast, #09090b)' } : undefined}
                    >
                      {item.subLabel}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 shrink-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {item.badge}
                  {!isSelected && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Section: Public View & Logout */}
        <div className="p-3 sm:p-4 border-t space-y-2 shrink-0 border-slate-200 bg-slate-50/80">

          {/* Action Row */}
          <div className={`grid gap-2 ${isCollapsed ? 'lg:grid-cols-1' : 'grid-cols-2'}`}>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
              title="Return to Public Store"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className={isCollapsed ? 'lg:hidden' : ''}>Live Store</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Lock Admin Session"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className={isCollapsed ? 'lg:hidden' : ''}>Logout</span>
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};
