import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Save, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Building,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Instagram,
  Share2,
  ExternalLink,
  Globe,
  Youtube,
  Download,
  Upload,
  Copy,
  RefreshCw,
  Database,
  Cloud,
  FileJson,
  Check,
  AlertTriangle,
  History,
  HardDrive,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Star,
  ChevronUp,
  ChevronDown,
  Navigation,
  X,
  Truck,
  Clock,
  UserCheck,
  Package,
  FileSpreadsheet,
  Layers,
  Palette,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { SiteSettings, FullAppConfigurationBackup, ConfigSnapshot, BusinessAddress } from '../../../types';
import { 
  TEMPLATE_LOGO_PRESETS, 
  getEffectivePresetLogoInfo 
} from '../../client/templates/templatePresets';
import { 
  DEFAULT_PRIMARY_COLOR, 
  DEFAULT_ACCENT_COLOR,
  DEFAULT_THEME_MODE, 
  applyThemeToDocument
} from '../../../utils/themeColors';
import { ImageUploadField } from '../../common/ImageUploadField';
import { extractInstagramUsername, getInstagramUrl } from '../../../utils/instagram';
import {
  exportFullConfiguration,
  downloadConfigurationBackupFile,
  importFullConfiguration,
  pushConfigurationToServer,
  publishConfigurationEverywhere,
  syncConfigurationWithServer,
  loadConfigurationSnapshots,
  restoreConfigurationSnapshot,
  getLastServerSyncTime,
  loadSiteSettings,
  downloadProductsFile,
  downloadCategoriesFile,
  downloadReviewsFile,
  downloadSiteSettingsFile,
  loadProducts,
  loadCategories,
  loadReviews
} from '../../../lib/storage';
import { ImportDataModal, ImportEntity } from '../modals/ImportDataModal';
import { DEFAULT_SITE_SETTINGS } from '../../../data/settingsData';

interface AdminSettingsViewProps {
  theme: 'light' | 'dark';
  settings: SiteSettings;
  onSaveSettings: (newSettings: SiteSettings) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  theme,
  settings,
  onSaveSettings
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initializeAddresses = (inputSettings: SiteSettings): BusinessAddress[] => {
    if (Array.isArray(inputSettings.addresses) && inputSettings.addresses.length > 0) {
      return inputSettings.addresses;
    }
    if (Array.isArray(DEFAULT_SITE_SETTINGS.addresses) && DEFAULT_SITE_SETTINGS.addresses.length > 0) {
      return [...DEFAULT_SITE_SETTINGS.addresses];
    }
    return [
      {
        id: 'addr-1',
        title: 'Central Spares Warehouse & HQ',
        addressLine: inputSettings.address || 'Plot No. 42, GIDC Industrial Area, Sector 3',
        cityState: 'Gujarat, India',
        pincode: '382445',
        warehouseType: 'Central Warehouse & HQ',
        phone: inputSettings.phoneDisplay || inputSettings.phone || '+91 99020 35374',
        email: inputSettings.email || 'nklaser33@gmail.com',
        contactPerson: 'Central Dispatch Desk',
        workingHours: 'Mon - Sat: 8:30 AM - 8:00 PM',
        dispatchTiming: 'Same-day dispatch for orders confirmed by 4:00 PM',
        isPrimary: true,
        mapUrl: ''
      }
    ];
  };

  const [formData, setFormData] = useState<SiteSettings>(() => ({
    ...settings,
    addresses: initializeAddresses(settings),
    primaryColor: DEFAULT_PRIMARY_COLOR,
    accentColor: DEFAULT_ACCENT_COLOR,
    themeMode: 'light'
  }));

  useEffect(() => {
    setFormData(prev => ({
      ...settings,
      addresses: initializeAddresses(settings),
      primaryColor: DEFAULT_PRIMARY_COLOR,
      accentColor: DEFAULT_ACCENT_COLOR,
      themeMode: 'light'
    }));
  }, [settings]);

  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [copiedJsonNotice, setCopiedJsonNotice] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [lastSync, setLastSync] = useState<string | null>(getLastServerSyncTime());
  const [snapshots, setSnapshots] = useState<ConfigSnapshot[]>([]);
  const [restorePreview, setRestorePreview] = useState<{
    isOpen: boolean;
    data: any;
    summary?: { products: number; categories: number; businessName: string; exportedAt: string };
  }>({ isOpen: false, data: null });
  const [isRawJsonModalOpen, setIsRawJsonModalOpen] = useState(false);
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [jsonParseError, setJsonParseError] = useState('');
  const [activeImportEntity, setActiveImportEntity] = useState<ImportEntity | null>(null);

  // Multi-address management state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<BusinessAddress | null>(null);
  const [addressFormData, setAddressFormData] = useState<Partial<BusinessAddress>>({
    title: '',
    addressLine: '',
    cityState: '',
    pincode: '',
    warehouseType: 'Express Dispatch Hub',
    phone: '',
    email: '',
    contactPerson: '',
    workingHours: 'Mon - Sat: 8:30 AM - 8:00 PM',
    dispatchTiming: 'Same-day dispatch for orders confirmed by 4:00 PM',
    isPrimary: false,
    mapUrl: ''
  });

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      id: `addr-${Date.now()}`,
      title: '',
      addressLine: '',
      cityState: '',
      pincode: '',
      warehouseType: (formData.addresses || []).length === 0 ? 'Central Warehouse & HQ' : 'Express Dispatch Hub',
      phone: formData.phoneDisplay || formData.phone || '',
      email: formData.email || '',
      contactPerson: '',
      workingHours: 'Mon - Sat: 8:30 AM - 8:00 PM',
      dispatchTiming: 'Same-day dispatch for orders confirmed by 4:00 PM',
      isPrimary: (formData.addresses || []).length === 0,
      mapUrl: ''
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: BusinessAddress) => {
    setEditingAddress(addr);
    setAddressFormData({ ...addr });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressFormData.title?.trim() || !addressFormData.addressLine?.trim()) return;

    const addrToSave: BusinessAddress = {
      id: editingAddress?.id || addressFormData.id || `addr-${Date.now()}`,
      title: addressFormData.title.trim(),
      addressLine: addressFormData.addressLine.trim(),
      cityState: addressFormData.cityState?.trim() || '',
      pincode: addressFormData.pincode?.trim() || '',
      warehouseType: addressFormData.warehouseType?.trim() || 'Express Dispatch Hub',
      phone: addressFormData.phone?.trim() || '',
      email: addressFormData.email?.trim() || '',
      contactPerson: addressFormData.contactPerson?.trim() || '',
      workingHours: addressFormData.workingHours?.trim() || '',
      dispatchTiming: addressFormData.dispatchTiming?.trim() || '',
      isPrimary: Boolean(addressFormData.isPrimary),
      mapUrl: addressFormData.mapUrl?.trim() || ''
    };

    let updatedList: BusinessAddress[] = [];
    const existingList = formData.addresses && formData.addresses.length > 0 ? [...formData.addresses] : [];

    if (editingAddress) {
      updatedList = existingList.map(a => (a.id === editingAddress.id ? addrToSave : a));
    } else {
      updatedList = [...existingList, addrToSave];
    }

    if (addrToSave.isPrimary) {
      updatedList = updatedList.map(a => ({
        ...a,
        isPrimary: a.id === addrToSave.id
      }));
    } else if (!updatedList.some(a => a.isPrimary)) {
      updatedList[0].isPrimary = true;
    }

    const primary = updatedList.find(a => a.isPrimary) || updatedList[0];
    setFormData({
      ...formData,
      addresses: updatedList,
      address: primary ? primary.addressLine : formData.address
    });
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: string) => {
    const existingList = formData.addresses || [];
    if (existingList.length <= 1) {
      alert('At least one business address must remain configured for store operations.');
      return;
    }
    const updatedList = existingList.filter(a => a.id !== id);
    if (!updatedList.some(a => a.isPrimary) && updatedList.length > 0) {
      updatedList[0].isPrimary = true;
    }
    const primary = updatedList.find(a => a.isPrimary) || updatedList[0];
    setFormData({
      ...formData,
      addresses: updatedList,
      address: primary ? primary.addressLine : formData.address
    });
  };

  const handleSetPrimaryAddress = (id: string) => {
    const existingList = formData.addresses || [];
    const updatedList = existingList.map(a => ({
      ...a,
      isPrimary: a.id === id
    }));
    const primary = updatedList.find(a => a.id === id);
    setFormData({
      ...formData,
      addresses: updatedList,
      address: primary ? primary.addressLine : formData.address
    });
  };

  const handleMoveAddress = (index: number, direction: 'up' | 'down') => {
    const existingList = [...(formData.addresses || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= existingList.length) return;
    const temp = existingList[index];
    existingList[index] = existingList[targetIndex];
    existingList[targetIndex] = temp;
    setFormData({
      ...formData,
      addresses: existingList
    });
  };

  useEffect(() => {
    setSnapshots(loadConfigurationSnapshots());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SiteSettings = {
      ...formData,
      themeMode: 'light',
      primaryColor: DEFAULT_PRIMARY_COLOR,
      accentColor: DEFAULT_ACCENT_COLOR
    };
    applyThemeToDocument('light', DEFAULT_PRIMARY_COLOR, DEFAULT_ACCENT_COLOR);
    onSaveSettings(updatedSettings);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Trigger manual cloud server synchronization and publish everywhere
  const handleSyncServer = async () => {
    setSyncStatus('syncing');
    try {
      const res = await publishConfigurationEverywhere();
      if (res.success) {
        setSyncStatus('success');
        setSyncMessage('Configuration published and broadcasted live to all devices!');
        setLastSync(res.publishedAt || new Date().toISOString());
      } else {
        setSyncStatus('error');
        setSyncMessage('Sync request failed: ' + res.message);
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err.message || 'Error syncing configuration');
    }
    setTimeout(() => setSyncStatus('idle'), 4000);
  };

  // Copy full config JSON to clipboard
  const handleCopyConfigJson = () => {
    try {
      const config = exportFullConfiguration();
      navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopiedJsonNotice(true);
      setTimeout(() => setCopiedJsonNotice(false), 3000);
    } catch (err) {
      console.error('Error copying JSON:', err);
    }
  };

  // Handle file selection for restore
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          setRestorePreview({
            isOpen: true,
            data: parsed,
            summary: {
              products: Array.isArray(parsed.products) ? parsed.products.length : 0,
              categories: Array.isArray(parsed.categories) ? parsed.categories.length : 0,
              businessName: parsed.settings?.businessName || 'NK Laser Spares',
              exportedAt: parsed.exportedAt || 'Unknown date'
            }
          });
        } else {
          alert('Invalid backup file. Please provide a valid JSON file.');
        }
      } catch (err) {
        alert('Could not parse JSON file. Please ensure it is a valid configuration backup.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Confirm restore
  const handleConfirmRestore = () => {
    if (!restorePreview.data) return;
    const result = importFullConfiguration(restorePreview.data);
    if (result.success) {
      const updated = loadSiteSettings();
      setFormData(updated);
      onSaveSettings(updated);
      setSnapshots(loadConfigurationSnapshots());
      setRestorePreview({ isOpen: false, data: null });
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 4000);
    } else {
      alert(result.message);
    }
  };

  // Apply raw JSON directly
  const handleApplyRawJson = () => {
    setJsonParseError('');
    try {
      const parsed = JSON.parse(rawJsonInput);
      const result = importFullConfiguration(parsed);
      if (result.success) {
        const updated = loadSiteSettings();
        setFormData(updated);
        onSaveSettings(updated);
        setSnapshots(loadConfigurationSnapshots());
        setIsRawJsonModalOpen(false);
        setRawJsonInput('');
        setSaveSuccessNotice(true);
        setTimeout(() => setSaveSuccessNotice(false), 4000);
      } else {
        setJsonParseError(result.message);
      }
    } catch (err: any) {
      setJsonParseError(`Invalid JSON: ${err.message}`);
    }
  };

  // Restore snapshot from local history
  const handleRestoreSnapshot = (id: string) => {
    if (window.confirm('Restore configuration to this previous snapshot? Current state will be replaced.')) {
      const ok = restoreConfigurationSnapshot(id);
      if (ok) {
        const updated = loadSiteSettings();
        setFormData(updated);
        onSaveSettings(updated);
        setSnapshots(loadConfigurationSnapshots());
        setSaveSuccessNotice(true);
        setTimeout(() => setSaveSuccessNotice(false), 3000);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Top Header Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                Store & Business Configuration
              </h2>
              <p className={`text-xs text-slate-500`}>
                Manage store details, contact numbers, and persistent deployment backups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {saveSuccessNotice && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-in fade-in">
                ✓ Settings & Backup Preserved!
              </span>
            )}
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 rounded-xl text-xs gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DEPLOYMENT PERSISTENCE & BACKUP CONTROL PANEL                             */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-900 text-white shrink-0 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm text-slate-900">
                    Deployment & Configuration Persistence
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    <Cloud className="w-3 h-3" /> Server Sync Ready
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Preserve your custom products, categories, store settings, and contact information across every app deployment.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSyncServer}
                disabled={syncStatus === 'syncing'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync with Server'}</span>
              </button>
            </div>
          </div>

          {syncMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              syncStatus === 'success' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {syncStatus === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Action Grid: Export, Import, Copy JSON */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Download Backup */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Download className="w-4 h-4 text-blue-700" />
                  <span>Download Backup (.json)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Save all products, categories, pricing & business details to an offline file.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadConfigurationBackupFile()}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Backup</span>
              </button>
            </div>

            {/* 2. Import Backup */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Restore from Backup</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload a previously exported JSON backup to instantly restore full configurations.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Restore</span>
                </button>
              </div>
            </div>

            {/* 3. Clipboard JSON */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <FileJson className="w-4 h-4 text-indigo-700" />
                  <span>Quick JSON Transfer</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Copy configuration JSON or paste raw JSON directly across deployment environments.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyConfigJson}
                  className="flex-1 py-2 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedJsonNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJsonNotice ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRawJsonModalOpen(true);
                    setRawJsonInput('');
                    setJsonParseError('');
                  }}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Paste JSON
                </button>
              </div>
            </div>

          </div>

          {/* Modular Category Data Management (Export & Import by Entity) */}
          <div className="pt-3 border-t border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-700" />
                  <span>Category & Collection Data Management</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Export or import specific collections (Products, Categories, Reviews, Settings) independently with Merge or Replace modes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Products */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span>Products</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {loadProducts().length} items
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Catalog SKUs, laser specs, OEM fitment & pricing.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => downloadProductsFile('json')}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Export Products as JSON"
                    >
                      <Download className="w-3 h-3 text-blue-700" />
                      <span>JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadProductsFile('csv')}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Export Products as Excel/CSV"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-700" />
                      <span>CSV</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveImportEntity('products')}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-emerald-700" />
                    <span>Import Products</span>
                  </button>
                </div>
              </div>

              {/* 2. Categories */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <span>Categories</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {loadCategories().length} items
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Taxonomy slugs, subcategories & brand mappings.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => downloadCategoriesFile()}
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Export Categories as JSON"
                  >
                    <Download className="w-3 h-3 text-blue-700" />
                    <span>Export Categories JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImportEntity('categories')}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-emerald-700" />
                    <span>Import Categories</span>
                  </button>
                </div>
              </div>

              {/* 3. Reviews */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span>Reviews</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {loadReviews().length} items
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Verified customer ratings, feedback & cities.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => downloadReviewsFile()}
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Export Reviews as JSON"
                  >
                    <Download className="w-3 h-3 text-blue-700" />
                    <span>Export Reviews JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImportEntity('reviews')}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-emerald-700" />
                    <span>Import Reviews</span>
                  </button>
                </div>
              </div>

              {/* 4. Settings */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Settings className="w-4 h-4 text-slate-600" />
                      <span>Site Settings</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Config
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Store details, WhatsApp, address & pricing policy.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => downloadSiteSettingsFile()}
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Export Settings as JSON"
                  >
                    <Download className="w-3 h-3 text-blue-700" />
                    <span>Export Settings JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImportEntity('settings')}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-emerald-700" />
                    <span>Import Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Local Snapshot History */}
          {snapshots.length > 0 && (
            <div className="pt-2 border-t border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-800" />
                  <span>Recent Local Auto-Snapshots ({snapshots.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Roll back to any snapshot instantly</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {snapshots.map((snap) => (
                  <div 
                    key={snap.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                  >
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-semibold text-slate-800 text-[11px]">{snap.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap.id)}
                      className="ml-1 text-[10px] text-blue-700 hover:underline font-bold cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Business & Dispatch Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Business Name */}
          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Business / Store Name
            </label>
            <div className="relative">
              <Building className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                type="text"
                required
                value={formData.businessName || ''}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
          </div>

          {/* Store Logo Image URL / Upload */}
          <div className="md:col-span-2">
            <ImageUploadField
              label="Official Store Header Logo (URL or Direct Upload)"
              value={formData.logoUrl || ''}
              onChange={(val) => setFormData({ ...formData, logoUrl: val })}
              theme={theme}
              brandName={formData.businessName || 'NK Laser'}
              placeholder="https://... or upload local PNG/SVG/JPG"
              helperText="Upload or enter an image URL for the website navbar & footer. Replaces the active logo immediately."
              previewSize="md"
              aspectRatio="wide"
              idPrefix="store-logo"
            />
          </div>

          {/* Homepage Inventory Warehouse Banner */}
          <div className="md:col-span-2">
            <ImageUploadField
              label="Homepage 'Inventory Warehouse' Banner Image (URL or Direct Upload)"
              value={formData.warehouseBannerUrl || ''}
              onChange={(val) => setFormData({ ...formData, warehouseBannerUrl: val })}
              theme={theme}
              brandName="Warehouse Stock"
              placeholder="https://... or upload warehouse stock photo"
              helperText="Featured on the homepage under 'Find the component you need' to highlight in-stock warehouse inventory and same-day dispatch."
              previewSize="md"
              aspectRatio="video"
              idPrefix="warehouse-banner"
            />
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              WhatsApp Order Dispatch Number (with country code)
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="text"
                required
                placeholder="e.g. +91 99020 35374"
                value={formData.whatsappNumber || ''}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-600 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Primary Contact Phone
            </label>
            <div className="relative">
              <Phone className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                type="text"
                value={formData.phoneDisplay || formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phoneDisplay: e.target.value, phone: e.target.value })}
                className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
          </div>

          {/* Contact Email */}
          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Contact Email
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
          </div>

          {/* Multi-Location & Warehouse Hubs Manager */}
          <div className="md:col-span-2 space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold text-slate-900`}>
                    Business, Warehouse & Dispatch Locations ({formData.addresses?.length || 1})
                  </h4>
                  <p className={`text-[11px] text-slate-500`}>
                    Add multiple branch offices, central warehouses, and dispatch hubs. All locations are visible to clients.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Location</span>
              </button>
            </div>

            {/* Address Cards List */}
            <div className="space-y-2.5">
              {(formData.addresses || []).map((addr, idx, arr) => (
                <div 
                  key={addr.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    addr.isPrimary 
                      ? ('bg-blue-50/50 border-blue-300 ring-1 ring-blue-500/20')
                      : ('bg-slate-50 border-slate-200 hover:border-slate-300')
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    
                    {/* Location Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {addr.title}
                        </span>

                        {addr.warehouseType && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            <Package className="w-2.5 h-2.5" />
                            <span>{addr.warehouseType}</span>
                          </span>
                        )}
                        
                        {addr.isPrimary ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-white">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Primary Location / HQ</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryAddress(addr.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-colors cursor-pointer"
                            title="Set this as the primary business address"
                          >
                            <Star className="w-2.5 h-2.5" />
                            <span>Set as Primary</span>
                          </button>
                        )}

                        {(addr.cityState || addr.pincode) && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200">
                            {[addr.cityState, addr.pincode ? `PIN: ${addr.pincode}` : ''].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-slate-700">
                        {addr.addressLine}
                      </p>

                      {/* Dispatch & Operations Meta Strip */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                        {addr.dispatchTiming && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{addr.dispatchTiming}</span>
                          </span>
                        )}

                        {addr.workingHours && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{addr.workingHours}</span>
                          </span>
                        )}

                        {addr.contactPerson && (
                          <span className="inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>Contact: {addr.contactPerson}</span>
                          </span>
                        )}

                        {addr.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{addr.phone}</span>
                          </span>
                        )}

                        {addr.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{addr.email}</span>
                          </span>
                        )}

                        {addr.mapUrl && (
                          <a
                            href={addr.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline font-bold"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>View on Map</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-1 sm:pt-0">
                      {arr.length > 1 && (
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden mr-1 bg-white">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveAddress(idx, 'up')}
                            className="p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveAddress(idx, 'down')}
                            className="p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Edit Location"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                        <span className="hidden sm:inline text-[11px]">Edit</span>
                      </button>

                      {arr.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Delete Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Quick Summary Note */}
            <p className="text-[10px] text-slate-400 leading-tight">
              💡 The Primary Location is set as the default quotation letterhead address. All locations will be rendered in your website footer, contact section, and RFQ communications.
            </p>
          </div>

        </div>
      </div>

      {/* Social Media & Public Channels Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Social Media & Public Channels</h3>
              <p className={`text-[11px] text-slate-500`}>
                Connect your official Instagram, YouTube, and social profiles for customer discovery.
              </p>
            </div>
          </div>

          {formData.instagramUrl && (
            <a
              href={getInstagramUrl(formData.instagramUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Preview @{extractInstagramUsername(formData.instagramUrl)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Instagram URL */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile / Handle</span>
              </label>
              {(formData.instagramUrl || formData.socialLinks?.instagram) && (
                <span className="text-[11px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
                  @{extractInstagramUsername(formData.instagramUrl || formData.socialLinks?.instagram)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. https://www.instagram.com/laser.nk or @laser.nk"
                value={formData.instagramUrl || formData.socialLinks?.instagram || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    instagramUrl: val,
                    socialLinks: {
                      ...formData.socialLinks,
                      instagram: val
                    }
                  });
                }}
                className={`w-full border rounded-xl pl-3.5 pr-3 py-2 text-xs focus:outline-none focus:border-pink-600 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Enter either your full Instagram link or simply your username (e.g. <span className="font-mono text-slate-600">@laser.nk</span>). The system will automatically link it and display your clean handle.
            </p>
          </div>

          {/* YouTube or Video Channel URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span>YouTube / Video Catalog (Optional)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="e.g. https://www.youtube.com/@nklaser"
                value={formData.socialLinks?.youtube || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      youtube: val
                    }
                  });
                }}
                className={`w-full border rounded-xl pl-3.5 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Branded Product Presentation Template - Logo Presets Card */}
      <div className="p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                Branded Product Presentation Template - Preset Logos
              </h3>
              <p className="text-[11px] text-slate-500">
                Set and manage the 4 logo options available across all Branded Presentation Templates. Upload your custom logo files or paste image URLs.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            4 Global Logo Slots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Slot 1: 3D Metallic Emblem */}
          {(() => {
            const isCustom = Boolean(formData.templateLogoPresets?.['official-badge']);
            const effective = getEffectivePresetLogoInfo('official-badge', formData.templateLogoPresets);
            return (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Logo 1: 3D Metallic Emblem (Default)</span>
                      {isCustom && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Custom File Set
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Primary metallic chrome & ruby badge used as default product logo
                    </p>
                  </div>
                  
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...(formData.templateLogoPresets || {}) };
                        delete updated['official-badge'];
                        setFormData({ ...formData, templateLogoPresets: updated });
                      }}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer shrink-0"
                      title="Reset to factory SVG default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Live Dark Preview Badge */}
                <div className="h-14 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shadow-inner">
                  {effective.url ? (
                    <img
                      src={effective.url}
                      alt="Logo 1 Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No Logo Loaded</span>
                  )}
                </div>

                <ImageUploadField
                  label="Upload Custom Logo File or Paste Image URL"
                  value={formData.templateLogoPresets?.['official-badge'] || ''}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      templateLogoPresets: {
                        ...(formData.templateLogoPresets || {}),
                        'official-badge': val
                      }
                    });
                  }}
                  theme={theme}
                  placeholder="https://... or upload transparent PNG/SVG"
                  helperText="Replaces the 3D Metallic Emblem across all product presentation templates."
                  previewSize="sm"
                  idPrefix="tpl-logo-preset-1"
                />
              </div>
            );
          })()}

          {/* Slot 2: Clean White Minimal Logo */}
          {(() => {
            const isCustom = Boolean(formData.templateLogoPresets?.['white-minimal']);
            const effective = getEffectivePresetLogoInfo('white-minimal', formData.templateLogoPresets);
            return (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Logo 2: Clean White Minimal Logo</span>
                      {isCustom && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Custom File Set
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Pure white monochrome mark optimized for dark card templates
                    </p>
                  </div>
                  
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...(formData.templateLogoPresets || {}) };
                        delete updated['white-minimal'];
                        setFormData({ ...formData, templateLogoPresets: updated });
                      }}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer shrink-0"
                      title="Reset to factory SVG default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Live Dark Preview Badge */}
                <div className="h-14 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shadow-inner">
                  {effective.url ? (
                    <img
                      src={effective.url}
                      alt="Logo 2 Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No Logo Loaded</span>
                  )}
                </div>

                <ImageUploadField
                  label="Upload Custom Logo File or Paste Image URL"
                  value={formData.templateLogoPresets?.['white-minimal'] || ''}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      templateLogoPresets: {
                        ...(formData.templateLogoPresets || {}),
                        'white-minimal': val
                      }
                    });
                  }}
                  theme={theme}
                  placeholder="https://... or upload transparent PNG/SVG"
                  helperText="Replaces the White Minimal mark across all product presentation templates."
                  previewSize="sm"
                  idPrefix="tpl-logo-preset-2"
                />
              </div>
            );
          })()}

          {/* Slot 3: Crimson Laser Red Accent Logo */}
          {(() => {
            const isCustom = Boolean(formData.templateLogoPresets?.['red-accent']);
            const effective = getEffectivePresetLogoInfo('red-accent', formData.templateLogoPresets);
            return (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Logo 3: Crimson Laser Red Accent</span>
                      {isCustom && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Custom File Set
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Vibrant laser-red accent badge for high-contrast presentation cards
                    </p>
                  </div>
                  
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...(formData.templateLogoPresets || {}) };
                        delete updated['red-accent'];
                        setFormData({ ...formData, templateLogoPresets: updated });
                      }}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer shrink-0"
                      title="Reset to factory SVG default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Live Dark Preview Badge */}
                <div className="h-14 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shadow-inner">
                  {effective.url ? (
                    <img
                      src={effective.url}
                      alt="Logo 3 Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No Logo Loaded</span>
                  )}
                </div>

                <ImageUploadField
                  label="Upload Custom Logo File or Paste Image URL"
                  value={formData.templateLogoPresets?.['red-accent'] || ''}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      templateLogoPresets: {
                        ...(formData.templateLogoPresets || {}),
                        'red-accent': val
                      }
                    });
                  }}
                  theme={theme}
                  placeholder="https://... or upload transparent PNG/SVG"
                  helperText="Replaces the Crimson Red Accent mark across all product presentation templates."
                  previewSize="sm"
                  idPrefix="tpl-logo-preset-3"
                />
              </div>
            );
          })()}

          {/* Slot 4: Secondary / Custom Brand Logo */}
          {(() => {
            const isCustom = Boolean(formData.templateLogoPresets?.custom);
            const effective = getEffectivePresetLogoInfo('custom', formData.templateLogoPresets);
            return (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Logo 4: Secondary / Custom Brand Logo</span>
                      {isCustom && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active Preset
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Global custom brand logo, distributor emblem, or secondary company mark
                    </p>
                  </div>
                  
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...(formData.templateLogoPresets || {}) };
                        delete updated.custom;
                        setFormData({ ...formData, templateLogoPresets: updated });
                      }}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer shrink-0"
                      title="Clear custom logo"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Live Dark Preview Badge */}
                <div className="h-14 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shadow-inner">
                  {effective.url ? (
                    <img
                      src={effective.url}
                      alt="Logo 4 Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      No custom logo uploaded yet
                    </span>
                  )}
                </div>

                <ImageUploadField
                  label="Upload Secondary Brand Logo or Paste Image URL"
                  value={formData.templateLogoPresets?.custom || ''}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      templateLogoPresets: {
                        ...(formData.templateLogoPresets || {}),
                        custom: val
                      }
                    });
                  }}
                  theme={theme}
                  placeholder="https://... or upload transparent PNG/SVG"
                  helperText="Acts as the default custom logo for the 'Custom Logo' option across all product templates."
                  previewSize="sm"
                  idPrefix="tpl-logo-preset-4"
                />
              </div>
            );
          })()}

        </div>
      </div>

      {/* Feature Toggles Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <h3 className="font-black text-sm">Store & Pricing Display Preferences</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all bg-slate-50 border-slate-200 hover:bg-slate-100`}>
            <div className="space-y-0.5">
              <div className="font-bold text-xs">Show Indicative Pricing (₹)</div>
              <div className={`text-[10px] text-slate-500`}>
                Display ₹ rates alongside "Request RFQ Quote" & "Instant WhatsApp Inquiry"
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(formData.features?.showPrices ?? formData.showPricing)}
              onChange={(e) => setFormData({
                ...formData,
                showPricing: e.target.checked,
                features: {
                  ...formData.features,
                  showPrices: e.target.checked
                }
              })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
            />
          </label>

          <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all bg-slate-50 border-slate-200 hover:bg-slate-100`}>
            <div className="space-y-0.5">
              <div className="font-bold text-xs">Direct WhatsApp Inquiry Buttons</div>
              <div className={`text-[10px] text-slate-500`}>
                Enable 1-click WhatsApp quote generator across all product cards
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(formData.features?.whatsappChat !== false)}
              onChange={(e) => setFormData({
                ...formData,
                features: {
                  ...formData.features,
                  whatsappChat: e.target.checked
                }
              })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 cursor-pointer"
            />
          </label>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* RESTORE PREVIEW MODAL                                                    */}
      {/* ========================================================================= */}
      {restorePreview.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-slate-900 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm">Restore Configuration Backup</h3>
                <p className="text-xs text-slate-500">Confirm file contents before restoring</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Business Name:</span>
                <span className="font-bold text-slate-800">{restorePreview.summary?.businessName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Products in Backup:</span>
                <span className="font-bold text-blue-900">{restorePreview.summary?.products} SKUs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Categories in Backup:</span>
                <span className="font-bold text-blue-900">{restorePreview.summary?.categories}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Export Timestamp:</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {restorePreview.summary?.exportedAt ? new Date(restorePreview.summary.exportedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
              ⚠️ Restoring will update your store catalog and settings. An automatic recovery snapshot of your current state will be saved first.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRestorePreview({ isOpen: false, data: null })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Apply Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT BUSINESS ADDRESS MODAL                                        */}
      {/* ========================================================================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {editingAddress ? 'Edit Business Location' : 'Add Business / Warehouse Location'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Specify warehouse, branch, or factory location details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setEditingAddress(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              
              {/* Location Title & Facility Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Warehouse / Location Title *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Spares Warehouse & HQ"
                    value={addressFormData.title || ''}
                    onChange={(e) => setAddressFormData({ ...addressFormData, title: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Facility Classification</span>
                  </label>
                  <select
                    value={addressFormData.warehouseType || 'Express Dispatch Hub'}
                    onChange={(e) => setAddressFormData({ ...addressFormData, warehouseType: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900 cursor-pointer"
                  >
                    <option value="Central Warehouse & HQ">Central Warehouse & HQ</option>
                    <option value="Express Dispatch Hub">Express Dispatch Hub</option>
                    <option value="Optics & Cutting Head Service Lab">Optics & Cutting Head Service Lab</option>
                    <option value="Regional Stockyard">Regional Stockyard</option>
                    <option value="Branch Office & Sales Desk">Branch Office & Sales Desk</option>
                  </select>
                </div>
              </div>

              {/* Full Address Line */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Physical Address / Plot / Industrial Area *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Plot No. 42, GIDC Industrial Estate, Sector 3"
                  value={addressFormData.addressLine || ''}
                  onChange={(e) => setAddressFormData({ ...addressFormData, addressLine: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                />
              </div>

              {/* City & State / Pincode Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    City & State / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmedabad, Gujarat or Bengaluru, Karnataka"
                    value={addressFormData.cityState || ''}
                    onChange={(e) => setAddressFormData({ ...addressFormData, cityState: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Pincode / Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 382445 or 560058"
                    value={addressFormData.pincode || ''}
                    onChange={(e) => setAddressFormData({ ...addressFormData, pincode: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              {/* Warehouse In-Charge / Direct Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Warehouse In-Charge / Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Dispatch Desk / Mr. Sharma"
                    value={addressFormData.contactPerson || ''}
                    onChange={(e) => setAddressFormData({ ...addressFormData, contactPerson: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 99020 35374"
                    value={addressFormData.phone || ''}
                    onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              {/* Email & Operating Hours Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Location Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. nklaser33@gmail.com"
                    value={addressFormData.email || ''}
                    onChange={(e) => setAddressFormData({ ...addressFormData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mon - Sat: 8:30 AM - 8:00 PM"
                    value={addressFormData.workingHours || ''}
                    onChange={(e) => setAddressFormData({ ...addressFormData, workingHours: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              {/* Dispatch Timing / SLA */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Dispatch SLA / Cut-off Notice</span>
                  <span className="text-[10px] text-slate-400 font-normal">Shown to clients</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Same-day express dispatch for orders placed before 4:00 PM"
                  value={addressFormData.dispatchTiming || ''}
                  onChange={(e) => setAddressFormData({ ...addressFormData, dispatchTiming: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                />
              </div>

              {/* Google Maps Link */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Google Maps / Direction URL</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={addressFormData.mapUrl || ''}
                  onChange={(e) => setAddressFormData({ ...addressFormData, mapUrl: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 text-slate-900"
                />
              </div>

              {/* Primary Address Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(addressFormData.isPrimary)}
                    onChange={(e) => setAddressFormData({ ...addressFormData, isPrimary: e.target.checked })}
                    className="w-4 h-4 text-blue-900 rounded accent-blue-900 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Set as Primary Business Address & Quotation Letterhead</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Primary address is highlighted as HQ and used on official client quotations.
                    </p>
                  </div>
                </label>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setEditingAddress(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddressModal}
                disabled={!addressFormData.title?.trim() || !addressFormData.addressLine?.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingAddress ? 'Update Location' : 'Add Location'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASTE RAW JSON MODAL                                                     */}
      {/* ========================================================================= */}
      {isRawJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileJson className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm text-slate-900">Paste Configuration JSON</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRawJsonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste the exported configuration JSON below to apply settings, products, and categories.
            </p>

            <textarea
              rows={8}
              value={rawJsonInput}
              onChange={(e) => setRawJsonInput(e.target.value)}
              placeholder='{ "version": "1.0", "settings": { ... }, "products": [ ... ] }'
              className="w-full border border-slate-300 rounded-2xl p-3 font-mono text-xs focus:outline-none focus:border-indigo-600 bg-slate-50"
            />

            {jsonParseError && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {jsonParseError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRawJsonModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRawJson}
                disabled={!rawJsonInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                Apply JSON Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modular Category Import Modal */}
      {activeImportEntity && (
        <ImportDataModal
          theme={theme}
          entity={activeImportEntity}
          onClose={() => setActiveImportEntity(null)}
          onSuccess={(res) => {
            if (activeImportEntity === 'settings' && res.data) {
              setFormData(res.data);
              onSaveSettings(res.data);
            }
            setSyncStatus('success');
            setSyncMessage(`Imported ${activeImportEntity} successfully (${res.importedCount || 0} items)`);
            setTimeout(() => setSyncMessage(''), 4000);
          }}
        />
      )}

    </form>
  );
};

