import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Package, 
  Award, 
  Settings as SettingsIcon,
  HelpCircle
} from 'lucide-react';
import { ProductItem, ProductCategoryDef, ReviewItem, SiteSettings } from '../../../types';
import { 
  importProducts, 
  importCategories, 
  importReviews, 
  importSiteSettings,
  parseCsvText,
  csvToProducts 
} from '../../../lib/storage';

export type ImportEntity = 'products' | 'categories' | 'reviews' | 'settings';

interface ImportDataModalProps {
  theme: 'light' | 'dark';
  entity: ImportEntity;
  onSuccess: (result: { entity: ImportEntity; count?: number; data?: any }) => void;
  onClose: () => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  theme,
  entity,
  onSuccess,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewStats, setPreviewStats] = useState<{
    validCount: number;
    sample: any[];
    format: 'json' | 'csv';
    warnings: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEntityTitle = () => {
    switch (entity) {
      case 'products': return 'Products & Consumables Catalog';
      case 'categories': return 'Product Categories & Taxonomies';
      case 'reviews': return 'Customer Feedback & Reviews';
      case 'settings': return 'Store Settings & Brand Information';
    }
  };

  const getEntityIcon = () => {
    switch (entity) {
      case 'products': return <Package className="w-5 h-5 text-blue-700" />;
      case 'categories': return <Layers className="w-5 h-5 text-amber-500" />;
      case 'reviews': return <Award className="w-5 h-5 text-emerald-600" />;
      case 'settings': return <SettingsIcon className="w-5 h-5 text-indigo-600" />;
    }
  };

  // Inspect and parse incoming content
  const analyzeContent = (text: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    const trimmed = text.trim();
    if (!trimmed) {
      setPreviewStats(null);
      return;
    }

    try {
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        // Parse JSON
        const parsed = JSON.parse(trimmed);
        let items: any[] = [];
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (entity === 'products' && Array.isArray(parsed.products)) items = parsed.products;
          else if (entity === 'categories' && Array.isArray(parsed.categories)) items = parsed.categories;
          else if (entity === 'reviews' && Array.isArray(parsed.reviews)) items = parsed.reviews;
          else if (entity === 'settings') items = [parsed.settings || parsed];
          else items = [parsed];
        }

        setPreviewStats({
          validCount: items.length,
          sample: items.slice(0, 4),
          format: 'json',
          warnings: items.length === 0 ? ['No valid items found in JSON structure.'] : []
        });
      } else if (entity === 'products' && trimmed.includes(',')) {
        // Parse CSV for products
        const { products, errors } = csvToProducts(trimmed);
        setPreviewStats({
          validCount: products.length,
          sample: products.slice(0, 4),
          format: 'csv',
          warnings: errors
        });
      } else {
        setPreviewStats(null);
        setErrorMsg('Unrecognized format. Please provide valid JSON or CSV.');
      }
    } catch (e: any) {
      setPreviewStats(null);
      setErrorMsg(`Syntax error: ${e.message || 'Could not parse payload'}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      analyzeContent(content);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    analyzeContent(val);
  };

  const handleExecuteImport = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Please upload a file or paste data before importing.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (entity === 'products') {
        const res = importProducts(rawText, importMode);
        if (!res.success) {
          setErrorMsg(res.message);
          setIsProcessing(false);
          return;
        }
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess({ entity: 'products', count: res.count, data: res.products });
          onClose();
        }, 800);
      } else if (entity === 'categories') {
        const res = importCategories(rawText, importMode);
        if (!res.success) {
          setErrorMsg(res.message);
          setIsProcessing(false);
          return;
        }
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess({ entity: 'categories', count: res.count, data: res.categories });
          onClose();
        }, 800);
      } else if (entity === 'reviews') {
        const res = importReviews(rawText, importMode);
        if (!res.success) {
          setErrorMsg(res.message);
          setIsProcessing(false);
          return;
        }
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess({ entity: 'reviews', count: res.count, data: res.reviews });
          onClose();
        }, 800);
      } else if (entity === 'settings') {
        const res = importSiteSettings(rawText);
        if (!res.success) {
          setErrorMsg(res.message);
          setIsProcessing(false);
          return;
        }
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess({ entity: 'settings', data: res.settings });
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message || 'Unknown processing error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="rounded-3xl border max-w-xl w-full flex flex-col shadow-2xl overflow-hidden my-auto bg-white border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0 border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            {getEntityIcon()}
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 leading-tight">
                Import {getEntityTitle()}
              </h3>
              <p className="text-[11px] text-slate-500">
                Upload a JSON {entity === 'products' ? 'or CSV' : ''} file to update the database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Method Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File (.json{entity === 'products' ? ', .csv' : ''})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'paste' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Raw Text / JSON</span>
            </button>
          </div>

          {/* Upload Drop Area */}
          {activeTab === 'upload' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-700 hover:bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center group"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept={entity === 'products' ? '.json,.csv,text/csv,application/json' : '.json,application/json'}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Click to select or drop your file here'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports .json {entity === 'products' ? 'and .csv' : ''} formats
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Paste JSON or CSV Content
              </label>
              <textarea
                value={rawText}
                onChange={handlePasteChange}
                rows={6}
                placeholder={`Paste valid ${entity === 'products' ? 'JSON or CSV' : 'JSON'} structure here...`}
                className="w-full border rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-blue-600 bg-slate-50 border-slate-300 text-slate-900 resize-none"
              />
            </div>
          )}

          {/* Import Mode Toggle (Merge vs Replace) */}
          {entity !== 'settings' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Import Mode:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    importMode === 'merge'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">Merge with Existing</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Update matched items (by SKU/ID), append new records. Recommended.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-amber-900">Replace Dataset</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Overwrite and replace existing {entity} with this imported list.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Validation & Preview Card */}
          {previewStats && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Valid {previewStats.format.toUpperCase()} Detected: {previewStats.validCount} item(s)</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-200/60">
                  Ready to Import
                </span>
              </div>

              {previewStats.sample.length > 0 && (
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 font-mono text-[11px] text-slate-700 max-h-28 overflow-y-auto space-y-1">
                  {previewStats.sample.map((item, idx) => (
                    <div key={idx} className="truncate">
                      • {item.title || item.name || item.clientName || item.sku || JSON.stringify(item)}
                    </div>
                  ))}
                </div>
              )}

              {previewStats.warnings.length > 0 && (
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-sans space-y-0.5">
                  <span className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Warnings ({previewStats.warnings.length}):
                  </span>
                  <div className="list-disc pl-4">
                    {previewStats.warnings.slice(0, 3).map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-1">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>
              An automatic snapshot backup will be created in your browser history before any changes are written. Changes are automatically synced to the server database.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={isProcessing || !previewStats || previewStats.validCount === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 active:scale-98"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Importing & Syncing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Confirm & Import ({previewStats ? previewStats.validCount : 0})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
