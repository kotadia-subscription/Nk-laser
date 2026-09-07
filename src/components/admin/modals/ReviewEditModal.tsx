import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2, Sparkles, Building2, MapPin, Tag, Calendar } from 'lucide-react';
import { ReviewItem } from '../../../types';

interface ReviewEditModalProps {
  theme: 'light' | 'dark';
  review: Partial<ReviewItem>;
  onSave: (review: Partial<ReviewItem>) => void;
  onClose: () => void;
}

const COMMON_SPARE_SUGGESTIONS = [
  'D28/D32 Double Copper Nozzles',
  '1064nm Fused Silica Protective Windows',
  'Ceramic Sensor Body & Lock Ring',
  'Collimating & Focusing Lens Set',
  'CypCut Wireless CNC Remote Pendant',
  'RayTools BM111 Cutting Head Consumables',
  'Precitec ProCutter 2.0 Spares',
  'Bodor & Max Photonics Laser Consumables'
];

export const ReviewEditModal: React.FC<ReviewEditModalProps> = ({
  theme,
  review,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<ReviewItem>>({
    clientName: review.clientName || '',
    companyName: review.companyName || '',
    location: review.location || '',
    rating: review.rating ?? 5,
    comment: review.comment || '',
    date: review.date || 'Today',
    projectType: review.projectType || 'Fiber Laser Spares',
    verified: review.verified ?? true,
    ...review
  });

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName?.trim() || !formData.comment?.trim()) return;
    
    setIsSubmitting(true);
    onSave({
      ...formData,
      clientName: formData.clientName.trim(),
      companyName: formData.companyName?.trim() || 'Laser Cutting Facility',
      location: formData.location?.trim() || 'India',
      rating: Number(formData.rating) || 5,
      date: formData.date?.trim() || 'Today',
      projectType: formData.projectType?.trim() || 'Fiber Laser Spares',
      comment: formData.comment.trim(),
      verified: Boolean(formData.verified)
    });
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5: return '5.0 - Outstanding (Highest Industrial Grade)';
      case 4: return '4.0 - Very Good & Reliable';
      case 3: return '3.0 - Satisfactory / Standard Fit';
      case 2: return '2.0 - Fair / Minor Fitment Delay';
      case 1: return '1.0 - Needs Inspection';
      default: return `${val} Stars`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="rounded-3xl border max-w-lg w-full flex flex-col shadow-2xl overflow-hidden my-auto bg-white border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0 border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                {formData.id ? 'Edit Client Review' : 'Add New Customer Review'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {formData.id ? 'Update testimonial details, ratings, or part fitment' : 'Record verified feedback from B2B fabricator or CNC laser operator'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Star Rating Selector */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Overall Rating *</span>
              </label>
              <span className="text-[11px] font-bold text-amber-900">
                {getRatingLabel(hoveredRating ?? formData.rating ?? 5)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isActive = (hoveredRating ?? formData.rating ?? 5) >= starVal;
                return (
                  <button
                    type="button"
                    key={starVal}
                    onMouseEnter={() => setHoveredRating(starVal)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => setFormData({ ...formData, rating: starVal })}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isActive 
                          ? 'fill-amber-400 text-amber-500 drop-shadow-xs' 
                          : 'text-slate-300 fill-transparent hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Name & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Client / Engineer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikramjit Singh"
                value={formData.clientName || ''}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>Company / Workshop</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Punjab Heavy Fab & Engineering"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900"
              />
            </div>
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>City & State</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ludhiana, Punjab or Pune, MH"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Display Date</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Today, 2 days ago, Oct 2025"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900"
              />
            </div>
          </div>

          {/* Spare Part / Project Type */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Laser Spare Part / Application</span>
              </label>
              <span className="text-[10px] text-slate-400">Click suggestion below to autofill</span>
            </div>
            <input
              type="text"
              placeholder="e.g. D28/D32 Copper Nozzles & 1064nm Windows"
              value={formData.projectType || ''}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900"
            />
            
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_SPARE_SUGGESTIONS.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => setFormData({ ...formData, projectType: sugg })}
                  className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 text-slate-600 transition-colors cursor-pointer"
                >
                  + {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Review Comment */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span>Review Testimonial Text *</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write genuine feedback on fiber laser optics, nozzle endurance, beam clarity, or prompt dispatch..."
              value={formData.comment || ''}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900 leading-relaxed"
            />
          </div>

          {/* Verified Buyer Checkbox */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Verified B2B Buyer Badge</span>
                <span className="text-[10px] text-slate-500">Shows green verified shield icon on the public review card</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.verified)}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.clientName?.trim() || !formData.comment?.trim()}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{formData.id ? 'Save Changes' : 'Publish Review'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
