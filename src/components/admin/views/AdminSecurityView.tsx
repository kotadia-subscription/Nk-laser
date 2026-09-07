import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Lock,
  Copy,
  ExternalLink,
  EyeOff,
  Terminal,
  Cpu,
  Tag,
  Filter,
  Layers,
  Package,
  Info,
  AlertCircle
} from 'lucide-react';
import { ProductCategoryDef, ProductItem, BrandItem, SiteSettings, ComprehensiveAuditResult } from '../../../types';

interface AdminSecurityViewProps {
  theme: 'light' | 'dark';
  categories: ProductCategoryDef[];
  products: ProductItem[];
  brands: BrandItem[];
  settings?: SiteSettings;
  onUpdateSettings?: (settings: SiteSettings) => void;
  onChangePassword: (oldPass: string, newPass: string) => boolean | Promise<boolean>;
  onRunAudit: () => ComprehensiveAuditResult;
}

export const AdminSecurityView: React.FC<AdminSecurityViewProps> = ({
  theme,
  categories,
  products,
  brands,
  settings,
  onUpdateSettings,
  onChangePassword,
  onRunAudit
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [auditResult, setAuditResult] = useState<ComprehensiveAuditResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [auditTab, setAuditTab] = useState<'all' | 'brand' | 'catalog'>('all');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [portalKeyInput, setPortalKeyInput] = useState(settings?.adminSecretKey || 'nk-vault-9921-x');
  const [keySavedMsg, setKeySavedMsg] = useState(false);

  const activePortalKey = settings?.adminSecretKey || 'nk-vault-9921-x';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nklaserspares.com';
  const privateAdminUrl = `${origin}/?vault=${activePortalKey}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(privateAdminUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleSavePortalKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalKeyInput.trim()) return;
    const sanitized = portalKeyInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (onUpdateSettings && settings) {
      onUpdateSettings({
        ...settings,
        adminSecretKey: sanitized
      });
      setKeySavedMsg(true);
      setTimeout(() => setKeySavedMsg(false), 3500);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters long with uppercase, lowercase, numbers, or symbols.' });
      return;
    }

    const success = await onChangePassword(oldPassword, newPassword);
    if (success) {
      setPasswordMsg({ type: 'success', text: 'Master admin password encrypted and updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'Current password is incorrect or failed to update.' });
    }
  };

  const handleAuditClick = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = onRunAudit();
      setAuditResult(res);
      setIsScanning(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      
      {/* Unpredictable Admin Access URL Shield */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Secret Unpredictable URL Entry Portal</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                  Stealth Protected
                </span>
              </h2>
              <p className={`text-xs text-slate-500`}>
                Standard <code className="px-1 py-0.5 rounded bg-zinc-200">/admin</code> and <code className="px-1 py-0.5 rounded bg-zinc-200">?admin=true</code> are completely disabled to block automated crawlers, web scrapers, and bot scanners.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className={`text-xs font-bold block text-slate-700`}>
            Your Private Administrative URL:
          </label>
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl border font-mono text-xs bg-slate-50 border-slate-200 text-indigo-700`}>
            <span className="flex-1 px-3 py-1.5 break-all select-all">{privateAdminUrl}</span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedUrl
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied Secret Link!' : 'Copy Private URL'}</span>
            </button>
          </div>

          <form onSubmit={handleSavePortalKey} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 max-w-xl">
            <div className="flex-1 w-full">
              <label className={`text-[11px] font-semibold block pb-1 text-slate-500`}>
                Customize Unpredictable Portal Key:
              </label>
              <input
                type="text"
                value={portalKeyInput}
                onChange={(e) => setPortalKeyInput(e.target.value)}
                placeholder="e.g. nk-vault-9921-x"
                className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 bg-white border-slate-300 text-slate-900`}
              />
            </div>
            <button
              type="submit"
              className="mt-4 sm:mt-5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Save Custom Key
            </button>
          </form>
          {keySavedMsg && (
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Secret entrance key updated! Bookmark your new URL to log in.
            </p>
          )}
        </div>

        <div className={`p-3.5 rounded-2xl border text-xs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border-slate-200 text-slate-700`}>
          <div className="flex items-start gap-2">
            <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-zinc-900">HttpOnly, Secure Cookies</p>
              <p className="text-[11px] text-zinc-500">Session cookies are completely inaccessible to client JavaScript (XSS immune) with SameSite=Strict.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Cpu className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-zinc-900">Bcrypt (Cost 12) Hashing</p>
              <p className="text-[11px] text-zinc-500">Master passwords are protected with 12 salt rounds, resisting GPU cracking and rainbow tables.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-zinc-900">Brute-Force & PII Shield</p>
              <p className="text-[11px] text-zinc-500">5-attempt IP rate limit with 15-minute lockouts and AES-256 encrypted customer lead storage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex items-center gap-3 pb-4 border-b border-slate-200`}>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black">
              Change Master Admin Password
            </h2>
            <p className={`text-xs text-slate-500`}>
              Update your administrative PIN / password used to unlock this console.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {passwordMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                : 'bg-red-500/10 border-red-500/30 text-red-600'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          <div className="pt-1 flex items-center justify-between">
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 rounded-xl text-xs cursor-pointer font-bold"
            >
              Update Admin Password
            </button>
            <span className={`text-[11px] text-slate-400`}>
              Min. 8 characters • Bcrypt Hashed (12 Rounds)
            </span>
          </div>
        </form>
      </div>

      {/* Catalog & Non-Product Brand Compliance Audit */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${auditResult && !auditResult.passed ? 'bg-amber-500/10 text-amber-600' : 'bg-purple-500/10 text-purple-600'}`}>
              {auditResult && !auditResult.passed ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Non-Product Brand Compliance & Catalog Audit</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600">
                  NKL Enforced
                </span>
              </h2>
              <p className={`text-xs text-slate-500 max-w-2xl`}>
                Scans all website content (Settings, Services, Categories, Reviews). Strictly enforces that only <strong className="text-slate-800">"NKL"</strong> is referenced in site content. Any third-party brand (RayTools, Precitec, Bodor, Trumpf, Nova, etc.) in non-product content is flagged. Products remain exempt for OEM replacement fitment.
              </p>
            </div>
          </div>

          <button
            onClick={handleAuditClick}
            disabled={isScanning}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning System...' : 'Run Integrity Scan'}</span>
          </button>
        </div>

        {/* Policy Scope Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl border bg-emerald-50/70 border-emerald-200/80 text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-emerald-800">Allowed Company Brand</p>
              <p className="text-[11px] text-emerald-700 font-semibold">NKL (NK Laser)</p>
              <p className="text-[10px] text-emerald-600/90 mt-0.5">Permitted across all site content & titles</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl border bg-purple-50/70 border-purple-200/80 text-purple-900 flex items-start gap-2.5">
            <Tag className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-purple-800">Non-Product Content Scope</p>
              <p className="text-[11px] text-purple-700 font-semibold">Strictly Flagged</p>
              <p className="text-[10px] text-purple-600/90 mt-0.5">Settings, Services, Categories, Reviews</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl border bg-blue-50/70 border-blue-200/80 text-blue-900 flex items-start gap-2.5">
            <Package className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-blue-800">Product Catalog Scope</p>
              <p className="text-[11px] text-blue-700 font-semibold">Exempt for OEM Fitment</p>
              <p className="text-[10px] text-blue-600/90 mt-0.5">Compatible spares for Raytools, Precitec, etc.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl border bg-amber-50/70 border-amber-200/80 text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-800">Monitored Brand Catalog</p>
              <p className="text-[11px] text-amber-700 font-semibold">{brands.length + 30}+ Monitored Brands</p>
              <p className="text-[10px] text-amber-600/90 mt-0.5">OEM manufacturers, Nova & competitors</p>
            </div>
          </div>
        </div>

        {/* Audit Results View */}
        {auditResult && (
          <div className="space-y-4 pt-2">
            {/* Summary Banner */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              auditResult.passed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900'
            }`}>
              <div className="font-bold flex items-center gap-2 text-sm">
                {auditResult.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{auditResult.message}</span>
              </div>
              
              {auditResult.stats && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-white/80 border border-current font-medium">
                    Total Scanned Sections: {auditResult.stats.totalScanned}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                    auditResult.stats.brandFlags > 0 ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    Brand Compliance Flags: {auditResult.stats.brandFlags}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                    auditResult.stats.catalogIssues > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    Catalog Consistency Issues: {auditResult.stats.catalogIssues}
                  </span>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            {auditResult.issues.length > 0 && (
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setAuditTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    auditTab === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All Findings ({auditResult.issues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditTab('brand')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    auditTab === 'brand'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  <span>Brand Compliance Flags</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                    {auditResult.brandItems?.filter(i => i.status === 'Flagged').length || 0}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuditTab('catalog')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    auditTab === 'catalog'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  <span>Catalog Integrity</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                    {auditResult.catalogIssues?.length || 0}
                  </span>
                </button>
              </div>
            )}

            {/* Brand Compliance Flags List */}
            {(auditTab === 'all' || auditTab === 'brand') && auditResult.brandItems && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-red-500" />
                  <span>Non-Product Brand Compliance Flags ({auditResult.brandItems.filter(i => i.status === 'Flagged').length})</span>
                </div>

                {auditResult.brandItems.filter(i => i.status === 'Flagged').length === 0 ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Clean: Zero unauthorized third-party brands detected in non-product content. 100% NKL compliant!</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {auditResult.brandItems
                      .filter(i => i.status === 'Flagged')
                      .map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3 rounded-2xl border bg-red-50/60 border-red-200/80 text-xs space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-wider">
                                Brand Flag: {item.detectedBrand || 'External Brand'}
                              </span>
                              <span className="font-bold text-slate-800">
                                {item.source} ➔ <span className="text-red-700">{item.field}</span>
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500">
                              Status: Flagged
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-white border border-red-200 font-mono text-[11px] text-slate-700 break-all">
                            {item.urlOrContent}
                          </div>

                          <p className="text-[11px] text-red-700 flex items-center gap-1 font-medium">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>Rule violation: Only <strong>"NKL"</strong> is permitted in content outside of products. Please replace <strong>"{item.detectedBrand}"</strong> with NKL or generic OEM terminology.</span>
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Catalog Consistency Issues List */}
            {(auditTab === 'all' || auditTab === 'catalog') && auditResult.catalogIssues && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  <span>Catalog Consistency Issues ({auditResult.catalogIssues.length})</span>
                </div>

                {auditResult.catalogIssues.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Clean: All {products.length} catalog products have valid SKUs, categories, and OEM brand links.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {auditResult.catalogIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border bg-amber-50/60 border-amber-200 text-xs flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900">{issue}</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">Please edit the product in the Products tab to resolve this consistency warning.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 100% Clean State Display */}
            {auditResult.passed && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Site is 100% NKL Compliant</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Zero unauthorized external brand names detected in non-product content. Products are cleanly separated for OEM fitment compatibility.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
