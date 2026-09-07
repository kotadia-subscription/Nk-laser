import React, { useState } from 'react';
import { X, Layers, Sparkles } from 'lucide-react';
import { ProductCategoryDef } from '../../../types';
import { ImageUploadField } from '../../common/ImageUploadField';

interface CategoryEditModalProps {
  theme: 'light' | 'dark';
  category: Partial<ProductCategoryDef>;
  onSave: (category: Partial<ProductCategoryDef>) => void;
  onClose: () => void;
}

export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  theme,
  category,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<ProductCategoryDef>>({
    name: '',
    shortTitle: '',
    slug: '',
    iconName: 'Wrench',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: '',
    subCategories: ['Standard Series'],
    oemBrands: ['RayTools', 'OSPRI'],
    featured: true,
    ...category
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    onSave({
      ...formData,
      slug,
      shortTitle: formData.shortTitle || formData.name
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`rounded-3xl border max-w-lg w-full flex flex-col shadow-2xl overflow-hidden my-auto bg-white border-slate-200 text-slate-900`}>
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 border-slate-200 bg-slate-50`}>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-sm sm:text-base">
              {formData.id ? 'Edit Category' : 'Create New Store Category'}
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
              Category Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Laser Cutting Protective Lenses"
              value={formData.name || ''}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: formData.id ? (formData.slug || '') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  shortTitle: formData.shortTitle || name
                });
              }}
              className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                Short Nav Title
              </label>
              <input
                type="text"
                placeholder="e.g. Protective Lenses"
                value={formData.shortTitle || ''}
                onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold text-slate-700`}>
                URL Slug
              </label>
              <input
                type="text"
                placeholder="e.g. protective-lenses"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Icon Theme
            </label>
            <select
              value={formData.iconName || 'Wrench'}
              onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-900`}
            >
              <option value="Shield">Shield (Protective Lenses)</option>
              <option value="Disc">Disc (Nozzles)</option>
              <option value="CircleDot">CircleDot (Ceramic Rings)</option>
              <option value="Eye">Eye (Focus/Collimating Lenses)</option>
              <option value="Zap">Zap (Laser Cutting Heads)</option>
              <option value="Cpu">Cpu (CNC Controllers / FSCUT)</option>
              <option value="Flame">Flame (Laser Welding Spares)</option>
              <option value="Sliders">Sliders (SMC Valves & Gas)</option>
              <option value="Radio">Radio (Laser Sources & QBH)</option>
              <option value="Sparkles">Sparkles (Optics Cleaning)</option>
              <option value="Layers">Layers (Sheet Metal Parts)</option>
              <option value="Grid">Grid (Decorative Jali)</option>
              <option value="Wrench">Wrench (General Tooling)</option>
            </select>
          </div>

          {/* Category Banner Image with URL & Upload */}
          <ImageUploadField
            label="Category Cover Image"
            value={formData.imageUrl || ''}
            onChange={(val) => setFormData({ ...formData, imageUrl: val })}
            theme={theme}
            placeholder="https://images.unsplash.com/... or paste URL"
            helperText="Provide an image URL or upload a file directly. Replaces the current category banner immediately."
            previewSize="md"
            aspectRatio="wide"
            idPrefix="cat-img"
          />

          <div className="space-y-1">
            <label className={`text-xs font-bold text-slate-700`}>
              Category Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
            />
          </div>

          <div className={`space-y-3 pt-2 border-t border-slate-200`}>
            <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.showOnHome !== false}
                onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className={`font-bold block text-slate-800`}>
                  Display on Home Page
                </span>
                <span className={`text-[11px] block text-slate-500`}>
                  Include this category in the Core Product Categories grid on the Home Page
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(formData.featured)}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className={`font-bold block text-slate-800`}>
                  Feature this category in the Spare Parts Catalog popup menu
                </span>
                <span className={`text-[11px] block text-slate-500`}>
                  Gives priority position and prominent "Featured" styling inside the Spare Parts navigation catalog popup
                </span>
              </div>
            </label>
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
              className="btn-primary px-5 py-2 rounded-xl text-xs shadow-md"
            >
              Save Category
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
