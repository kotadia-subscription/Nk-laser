import React, { useState } from 'react';
import { X, Sparkles, Factory } from 'lucide-react';
import { BrandItem } from '../../../types';
import { ImageUploadField } from '../../common/ImageUploadField';

interface BrandEditModalProps {
  theme: 'light' | 'dark';
  brand: Partial<BrandItem>;
  onSave: (brand: Partial<BrandItem>) => void;
  onClose: () => void;
}

export const BrandEditModal: React.FC<BrandEditModalProps> = ({
  theme,
  brand,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<BrandItem>>({
    name: '',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    category: 'Laser Optics & Cutting Heads',
    description: 'OEM laser spares and consumables supplier.',
    ...brand
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    onSave({
      ...formData,
      name: formData.name.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`rounded-3xl border max-w-md w-full flex flex-col shadow-2xl overflow-hidden my-auto bg-white border-slate-200 text-slate-900`}>
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 border-slate-200 bg-slate-50`}>
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-sm sm:text-base">
              {formData.id ? 'Edit OEM Brand' : 'Register New OEM Brand'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-200`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Brand Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RayTools / OSPRI / WSX / Precitec"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          {/* Logo URL and File Upload */}
          <ImageUploadField
            label="Brand Logo / Emblem"
            value={formData.logoUrl || ''}
            onChange={(val) => setFormData({ ...formData, logoUrl: val })}
            theme={theme}
            brandName={formData.name}
            placeholder="https://images.unsplash.com/... or paste image URL"
            helperText="Upload PNG/SVG/JPG or enter an online image URL. Replaces previous logo immediately."
            previewSize="md"
            idPrefix="brand-logo"
          />

          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Category Tag / Ecosystem
            </label>
            <input
              type="text"
              placeholder="e.g. Cutting Heads & Spares"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          <div className={`flex items-center justify-end gap-3 pt-4 border-t border-slate-200`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs shadow-md cursor-pointer"
            >
              Save Brand Logo
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
