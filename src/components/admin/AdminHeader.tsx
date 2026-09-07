import React from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  ShieldCheck,
  Search,
  Bell,
  Globe,
  Loader2,
  Send
} from 'lucide-react';
import { AdminTabType } from './AdminSidebar';

interface AdminHeaderProps {
  activeTab: AdminTabType;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenMobileMenu: () => void;
  onClose: () => void;
  tabInfo: { title: string; description: string };
  newInquiriesCount: number;
  onNavigateTab: (tab: AdminTabType) => void;
  onPublishEverywhere?: () => void;
  isPublishing?: boolean;
  publishStatus?: 'idle' | 'success' | 'error';
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  theme = 'light',
  onToggleTheme,
  onOpenMobileMenu,
  onClose,
  tabInfo,
  newInquiriesCount,
  onNavigateTab,
  onPublishEverywhere,
  isPublishing = false,
  publishStatus = 'idle'
}) => {
  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 border-b backdrop-blur-md shrink-0 flex items-center justify-between gap-4 transition-colors bg-white/95 border-slate-200 text-slate-900 shadow-xs">
      
      {/* Left: Mobile Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border transition-colors bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black tracking-tight truncate">
              {tabInfo.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AUTHENTICATED
            </span>
          </div>
          <p className="text-xs truncate hidden sm:block text-slate-500">
            {tabInfo.description}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Publish Everywhere Button */}
        {onPublishEverywhere && (
          <button
            onClick={onPublishEverywhere}
            disabled={isPublishing}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              publishStatus === 'success'
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/20'
                : publishStatus === 'error'
                ? 'bg-rose-600 border-rose-700 text-white'
                : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 border-blue-800 text-white shadow-blue-500/10'
            }`}
            title="Publish all settings, inventory and changes live across all client devices and browsers"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Publishing...</span>
              </>
            ) : publishStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Published Live!</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden sm:inline">Publish Live Everywhere</span>
                <span className="sm:hidden">Publish</span>
              </>
            )}
          </button>
        )}

        {/* Quick Inquiries Notification Badge */}
        {newInquiriesCount > 0 && (
          <button
            onClick={() => onNavigateTab('inquiries')}
            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer animate-in fade-in"
            title={`${newInquiriesCount} new customer inquiries require review`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            <span className="hidden md:inline">{newInquiriesCount} New RFQs</span>
          </button>
        )}

        {/* Public Store Shortcut */}
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
          title="Return to Public Website"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Live Store</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl border transition-all cursor-pointer bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          title="Exit Admin Panel"
        >
          <X className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};
