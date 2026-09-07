import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Palette, 
  Sparkles, 
  Eye, 
  RefreshCw, 
  Check, 
  Sliders, 
  Globe, 
  Tag, 
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { 
  ProductItem, 
  ProductTemplateConfig, 
  ProductTemplateId, 
  ProductTemplateLogoPreset, 
  ProductTemplateIconType 
} from '../../../types';
import { 
  TEMPLATE_DEFINITIONS, 
  TEMPLATE_LOGO_PRESETS, 
  extractDefaultSpecsFromProduct,
  getEffectivePresetLogoInfo 
} from '../../client/templates/templatePresets';
import { ProductTemplateRenderer } from '../../client/templates/ProductTemplateRenderer';
import { ImageUploadField } from '../../common/ImageUploadField';
import { loadSiteSettings } from '../../../lib/storage';

interface ProductTemplateConfigSectionProps {
  product: Partial<ProductItem>;
  config: ProductTemplateConfig;
  onChange: (updated: ProductTemplateConfig) => void;
  theme: 'light' | 'dark';
}

export const ProductTemplateConfigSection: React.FC<ProductTemplateConfigSectionProps> = ({
  product,
  config,
  onChange,
  theme
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isAdvancedSpecsOpen, setIsAdvancedSpecsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = config.templateId || 'none';
  const selectedLogoPreset = config.logoPreset || 'official-badge';

  const handleDownloadHdPng = async (scale = 2) => {
    if (!previewContainerRef.current) return;
    setIsExporting(true);
    try {
      // Allow DOM / images to stabilize
      await new Promise(resolve => setTimeout(resolve, 150));

      const dataUrl = await toPng(previewContainerRef.current, {
        pixelRatio: scale,
        quality: 0.98,
        cacheBust: true,
      });

      const cleanSku = (product.sku || product.title || 'NKL-Spare-Part')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 32);
      const filename = `${cleanSku}-${config.templateId || 'branded'}-${scale >= 3 ? 'UHD' : 'HD'}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to export template as HD PNG:', err);
      alert('Could not generate HD PNG. If the product photo is loaded from an external CDN without CORS headers, please upload the image file directly via the image uploader above.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectTemplate = (id: ProductTemplateId) => {
    // If selecting specs or simple and no specs set yet, generate them
    const newConfig = { ...config, templateId: id };
    if (!newConfig.specs || newConfig.specs.length === 0) {
      newConfig.specs = extractDefaultSpecsFromProduct(product);
    }
    if (!newConfig.sizeText) {
      newConfig.sizeText = product.dimensions || product.thickness || '';
    }
    onChange(newConfig);
  };

  const handleLogoPresetChange = (preset: ProductTemplateLogoPreset) => {
    onChange({
      ...config,
      logoPreset: preset,
      logoSrc: preset === 'custom' ? (config.logoSrc || '') : undefined
    });
  };

  const handleAutoFillSpecs = () => {
    const generated = extractDefaultSpecsFromProduct(product);
    onChange({
      ...config,
      specs: generated,
      sizeText: product.dimensions || product.thickness || config.sizeText || ''
    });
  };

  const handleSpecChange = (index: number, field: 'label' | 'value' | 'icon', value: string) => {
    const currentSpecs = [...(config.specs || extractDefaultSpecsFromProduct(product))];
    if (currentSpecs[index]) {
      currentSpecs[index] = {
        ...currentSpecs[index],
        [field]: value
      };
      onChange({ ...config, specs: currentSpecs });
    }
  };

  return (
    <div className="border border-amber-500/30 rounded-2xl p-4 sm:p-5 bg-amber-500/5 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Branded Product Presentation Template</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 font-bold">
                Consistency Engine
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Select a standardized presentation frame. Automatically embeds your product photo inside the chosen industrial template.
            </p>
          </div>
        </div>

        {selectedTemplate !== 'none' && (
          <button
            type="button"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-white hover:bg-amber-50 text-xs font-bold text-amber-700 cursor-pointer transition-colors shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewOpen ? 'Hide Live Preview' : 'Show Live Preview'}</span>
            {isPreviewOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* 1. Template Style Selection Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Select Template Style:</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {TEMPLATE_DEFINITIONS.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-white ring-2 ring-amber-400/30 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {tpl.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-700">
                    {tpl.badge}
                  </span>
                  <span className="text-[9px] text-amber-600 font-semibold">
                    {isSelected ? 'Active' : 'Choose'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Box (If template is not 'none') */}
      {selectedTemplate !== 'none' && isPreviewOpen && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 sm:p-4 text-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b border-white/10">
            <span className="font-bold flex items-center gap-1.5 text-amber-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Real-Time Template Output Preview</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {selectedTemplate.toUpperCase()}
              </span>

              {/* Download HD PNG Action Button */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleDownloadHdPng(2)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                  exportSuccess 
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                    : isExporting
                      ? 'bg-amber-600 text-white opacity-80 cursor-wait'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/20'
                }`}
                title="Download this exact template composition as a crisp HD PNG file (2000+ px)"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering HD PNG...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Downloaded HD PNG!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download HD PNG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div 
            ref={previewContainerRef}
            className="relative aspect-square max-w-[360px] mx-auto rounded-xl overflow-hidden shadow-2xl bg-slate-950 flex items-center justify-center"
          >
            <ProductTemplateRenderer
              product={product}
              templateConfig={config}
              mode="detail"
              className="w-full h-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 pt-1">
            <span>
              Consistent branded representation across client catalog, detail sheets, and WhatsApp quotes.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleDownloadHdPng(3)}
                className="hover:text-amber-400 font-mono underline cursor-pointer"
                title="Download in Ultra HD 3K resolution"
              >
                Ultra-HD (3K)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Settings (Only visible when template is not 'none') */}
      {selectedTemplate !== 'none' && (
        <div className="space-y-3 pt-2">
          
          {/* Logo Settings - With Site Settings Synchronization */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <span>Branded Template Logo Option</span>
              </label>
              <span className="text-[10px] text-slate-400">
                4 standard logo choices (customizable in Site Settings)
              </span>
            </div>

            {/* Logo Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['official-badge', 'white-minimal', 'red-accent', 'custom'] as ProductTemplateLogoPreset[]).map((preset) => {
                const isSel = selectedLogoPreset === preset;
                const isCustom = preset === 'custom';
                const siteSettings = loadSiteSettings();
                const info = getEffectivePresetLogoInfo(preset, siteSettings?.templateLogoPresets);

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleLogoPresetChange(preset)}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      isSel 
                        ? 'border-amber-500 bg-amber-500/10 font-bold text-slate-900 shadow-2xs ring-1 ring-amber-400/50' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      {/* Logo Preview Badge */}
                      <div className="w-9 h-7 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
                        {info.url ? (
                          <img
                            src={info.url}
                            alt={info.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Palette className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs truncate flex items-center gap-1.5">
                          <span className="truncate">{info.name}</span>
                          {info.isCustomized && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                              Custom File
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {isCustom && !info.isCustomized
                            ? 'Upload per-product or set global in Settings'
                            : info.description}
                        </div>
                      </div>
                    </div>

                    {isSel && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Logo Upload if 'custom' is selected */}
            {selectedLogoPreset === 'custom' && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <ImageUploadField
                  label="Product-Specific Custom Template Logo (PNG/SVG/WebP)"
                  value={config.logoSrc || ''}
                  onChange={(val) => onChange({ ...config, logoSrc: val })}
                  theme={theme}
                  placeholder="https://... or upload transparent logo file"
                  helperText="Upload transparent PNG, SVG, or WebP logo specifically for this product (overrides site default)."
                  previewSize="sm"
                  idPrefix="tpl-logo"
                />
              </div>
            )}

            {/* Quick helper note */}
            <p className="text-[10px] text-slate-400 leading-tight pt-1">
              💡 Need to change the default logos used across all templates? You can customize all 4 logo presets anytime in <span className="font-bold text-slate-600">Admin Settings → Branded Presentation Template Logos</span>.
            </p>
          </div>

          {/* Size / Dimension Subtitle & Footer texts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-500" />
                  <span>Size / Subtitle</span>
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, sizeText: product.dimensions || product.thickness || '' })}
                  className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                  title="Auto-fill from dimensions"
                >
                  Auto-fill
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Ø 32 mm or D27.9 T4.1"
                value={config.sizeText ?? (product.dimensions || product.thickness || '')}
                onChange={(e) => onChange({ ...config, sizeText: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-500" />
                <span>Footer Website</span>
              </label>
              <input
                type="text"
                placeholder="WWW.NKLASER.IN"
                value={config.websiteText || 'WWW.NKLASER.IN'}
                onChange={(e) => onChange({ ...config, websiteText: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Footer Tagline
              </label>
              <input
                type="text"
                placeholder="IDEAS SHAPED WITH LASER"
                value={config.footerTagline || 'IDEAS SHAPED WITH LASER'}
                onChange={(e) => onChange({ ...config, footerTagline: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-white border-slate-300 text-slate-900"
              />
            </div>
          </div>

          {/* Technical Specs Customizer (Especially relevant for 'specs' template) */}
          {(selectedTemplate === 'specs' || isAdvancedSpecsOpen) && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <label className="text-xs font-bold text-slate-800">
                    Template Technical Specs List (4 Key Rows)
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillSpecs}
                  className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync from Product Attributes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(config.specs || extractDefaultSpecsFromProduct(product)).slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <select
                      value={spec.icon || 'generic'}
                      onChange={(e) => handleSpecChange(idx, 'icon', e.target.value as ProductTemplateIconType)}
                      className="p-1 rounded border border-slate-300 text-[10px] font-bold bg-white text-slate-800 cursor-pointer"
                      title="Icon Type"
                    >
                      <option value="diameter">⌀ Dia</option>
                      <option value="height">↕ Height</option>
                      <option value="power">⚡ Power</option>
                      <option value="qty">◈ Qty</option>
                      <option value="generic">● Other</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Label"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                      className="w-20 p-1 border rounded text-xs bg-white border-slate-300 text-slate-900"
                    />
                    <span className="font-bold">:</span>
                    <input
                      type="text"
                      placeholder="Value (e.g. 32 mm)"
                      value={spec.value || ''}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      className="flex-1 p-1 border rounded text-xs bg-white border-slate-300 text-slate-900 font-semibold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTemplate !== 'specs' && (
            <button
              type="button"
              onClick={() => setIsAdvancedSpecsOpen(!isAdvancedSpecsOpen)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer pt-1"
            >
              <Sliders className="w-3 h-3" />
              <span>{isAdvancedSpecsOpen ? 'Hide Technical Specification Customizer' : 'Customize Technical Specification Rows'}</span>
            </button>
          )}

        </div>
      )}
    </div>
  );
};
