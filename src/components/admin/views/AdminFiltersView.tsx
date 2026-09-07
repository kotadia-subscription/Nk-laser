import React, { useState, useRef } from 'react';
import { 
  ListFilter, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Zap, 
  Layers, 
  CheckCircle2, 
  X,
  Factory,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { BrandItem } from '../../../types';

interface AdminFiltersViewProps {
  theme: 'light' | 'dark';
  powerRanges: string[];
  brands: BrandItem[];
  onAddPowerRange: (pr: string) => void;
  onDeletePowerRange: (pr: string) => void;
  onOpenCreateBrand: () => void;
  onOpenEditBrand: (brand: BrandItem) => void;
  onDeleteBrand: (id: string, name: string) => void;
  onQuickUpdateBrandLogo?: (brand: BrandItem, newLogoUrl: string) => void;
}

export const AdminFiltersView: React.FC<AdminFiltersViewProps> = ({
  theme,
  powerRanges,
  brands,
  onAddPowerRange,
  onDeletePowerRange,
  onOpenCreateBrand,
  onOpenEditBrand,
  onDeleteBrand,
  onQuickUpdateBrandLogo
}) => {
  const [newPowerInput, setNewPowerInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBrand, setUploadingBrand] = useState<BrandItem | null>(null);

  const handleAddPower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPowerInput.trim()) return;
    onAddPowerRange(newPowerInput.trim());
    setNewPowerInput('');
  };

  const handleDirectLogoUploadClick = (brand: BrandItem) => {
    setUploadingBrand(brand);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingBrand && onQuickUpdateBrandLogo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onQuickUpdateBrandLogo(uploadingBrand, reader.result as string);
          setUploadingBrand(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Power Ratings (kW) Manager */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                Laser Power Rating Options (kW)
              </h2>
              <p className={`text-xs text-slate-500`}>
                Controls the power filters in the online store sidebar and category views.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Power Ratings */}
        <div className="flex flex-wrap gap-2 pt-1">
          {powerRanges.map((pr) => (
            <div
              key={pr}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold bg-slate-50 border-slate-300 text-slate-800 shadow-2xs`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{pr}</span>
              <button
                type="button"
                onClick={() => onDeletePowerRange(pr)}
                className={`p-0.5 rounded cursor-pointer text-slate-400 hover:text-red-600`}
                title={`Remove ${pr}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Power Form */}
        <form onSubmit={handleAddPower} className="flex items-center gap-2 max-w-md pt-2">
          <input
            type="text"
            placeholder="e.g. 30kW - 60kW Ultra High Power"
            value={newPowerInput}
            onChange={(e) => setNewPowerInput(e.target.value)}
            className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400`}
          />
          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded-xl text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rating</span>
          </button>
        </form>
      </div>

      {/* OEM Brands Manager */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                Registered OEM Laser Brands ({brands.length})
              </h2>
              <p className={`text-xs text-slate-500`}>
                OEM cutting head brands, laser source manufacturers, and controller ecosystems.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreateBrand}
            className="btn-primary px-3.5 py-1.5 rounded-xl text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Brand</span>
          </button>
        </div>

        {/* Hidden Global Brand File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUploaded}
          className="hidden"
        />

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {brands.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 bg-slate-50 border-slate-200`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative group shrink-0">
                  <img
                    src={b.logoUrl}
                    alt={b.name}
                    className={`w-11 h-11 rounded-xl object-contain p-1 border shrink-0 border-slate-300 bg-white`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDirectLogoUploadClick(b)}
                    className="absolute inset-0 rounded-xl bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[9px] font-bold"
                    title={`Upload new logo for ${b.name}`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-xs truncate flex items-center gap-1.5">
                    <span>{b.name}</span>
                  </div>
                  <div className={`text-[10px] truncate text-slate-500`}>
                    {b.category || 'Laser Optics & Heads'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDirectLogoUploadClick(b)}
                  className={`p-1.5 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:bg-blue-50`}
                  title={`Upload/Replace ${b.name} Logo`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditBrand(b)}
                  className={`p-1.5 rounded-lg cursor-pointer text-slate-500 hover:text-amber-600 hover:bg-slate-200`}
                  title="Edit Brand URL & Name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteBrand(b.id, b.name)}
                  className={`p-1.5 rounded-lg cursor-pointer text-slate-500 hover:text-red-600 hover:bg-slate-200`}
                  title="Delete Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
