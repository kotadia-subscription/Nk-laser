import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  Tag, 
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { ReviewItem } from '../../../types';
import { ReviewEditModal } from '../modals/ReviewEditModal';

interface AdminReviewsViewProps {
  theme: 'light' | 'dark';
  reviews: ReviewItem[];
  onAddReview: (newReview: Partial<ReviewItem>) => void;
  onUpdateReview: (updatedReview: Partial<ReviewItem>) => void;
  onDeleteReview: (id: string) => void;
}

const ITEMS_PER_PAGE = 15;

export const AdminReviewsView: React.FC<AdminReviewsViewProps> = ({
  theme,
  reviews,
  onAddReview,
  onUpdateReview,
  onDeleteReview
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | number>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'name'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Partial<ReviewItem> | null>(null);

  // Delete Confirmation State
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  // KPI Calculations
  const totalReviews = reviews.length;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(2)
    : '5.00';

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Rating filter
      if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;

      // Verified filter
      if (verifiedFilter === 'verified' && !r.verified) return false;
      if (verifiedFilter === 'unverified' && r.verified) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const client = (r.clientName || '').toLowerCase();
        const comp = (r.companyName || '').toLowerCase();
        const loc = (r.location || '').toLowerCase();
        const comm = (r.comment || '').toLowerCase();
        const proj = (r.projectType || '').toLowerCase();
        if (!client.includes(q) && !comp.includes(q) && !loc.includes(q) && !comm.includes(q) && !proj.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'lowest') return (a.rating || 5) - (b.rating || 5);
      if (sortBy === 'name') return (a.clientName || '').localeCompare(b.clientName || '');
      // 'newest' default retains original array order or id
      return 0;
    });
  }, [reviews, searchQuery, ratingFilter, verifiedFilter, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedReviews = useMemo(() => {
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredReviews, validPage]);

  const handleOpenAdd = () => {
    setEditingReview({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (review: ReviewItem) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Partial<ReviewItem>) => {
    if (data.id) {
      onUpdateReview(data);
    } else {
      onAddReview(data);
    }
    setIsModalOpen(false);
    setEditingReview(null);
  };

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      onDeleteReview(reviewToDelete.id);
      setReviewToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Metrics */}
      <div className="p-6 sm:p-7 rounded-3xl border relative overflow-hidden transition-colors bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Customer Satisfaction & Verified Feedback</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Client Reviews & Testimonial Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Add new verified customer feedback, manage client testimonials, and highlight high-power fiber laser optics & consumables fitment across India.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shrink-0 shadow-md cursor-pointer hover:scale-102 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Review</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Reviews</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalReviews}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live customer testimonials</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average Rating</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-baseline gap-1">
            <span>{averageRating}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Industrial Grade 99%+</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">5-Star Ratings</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{fiveStarCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalReviews > 0 ? `${Math.round((fiveStarCount / totalReviews) * 100)}% of total reviews` : '0%'}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">4-Star Ratings</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
              <Star className="w-4 h-4 fill-slate-400 text-slate-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{fourStarCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Reliable & Verified</div>
        </div>
      </div>

      {/* Control Filters & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by client name, company, city, spare part, or comment..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rating Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setRatingFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === 'all'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({totalReviews})
            </button>

            <button
              onClick={() => {
                setRatingFilter(5);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                ratingFilter === 5
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>5★</span>
              <span className="text-[10px] opacity-75">({fiveStarCount})</span>
            </button>

            <button
              onClick={() => {
                setRatingFilter(4);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                ratingFilter === 4
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>4★</span>
              <span className="text-[10px] opacity-75">({fourStarCount})</span>
            </button>
          </div>

          {/* Sort & Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="name">Client Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{paginatedReviews.length}</strong> of{' '}
            <strong className="text-slate-800 font-semibold">{filteredReviews.length}</strong> reviews
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          {(ratingFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setRatingFilter('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-amber-700 hover:text-amber-800 font-bold text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {paginatedReviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
          <h4 className="font-black text-slate-700 text-sm">No reviews found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords or rating filter, or click "+ Add New Review" to add customer feedback.
          </p>
          <button
            onClick={handleOpenAdd}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Review Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300/80 transition-all shadow-2xs hover:shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.rating}.0</span>
                  </div>

                  {/* Client Name */}
                  <span className="font-black text-slate-900 text-sm truncate">
                    {rev.clientName}
                  </span>

                  {/* Verified Badge */}
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Buyer</span>
                    </span>
                  )}

                  {/* Date */}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{rev.date || 'Recent'}</span>
                  </span>
                </div>

                {/* Company & Location Lockup */}
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  {rev.companyName && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <strong className="text-slate-700 font-semibold">{rev.companyName}</strong>
                    </span>
                  )}
                  {rev.location && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{rev.location}</span>
                    </span>
                  )}
                  {rev.projectType && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <Tag className="w-2.5 h-2.5 text-amber-600" />
                      <span>{rev.projectType}</span>
                    </span>
                  )}
                </div>

                {/* Testimonial Excerpt */}
                <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2">
                  "{rev.comment}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleOpenEdit(rev)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit Review"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setReviewToDelete(rev)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white text-xs text-slate-600">
          <div>
            Page <strong className="font-bold text-slate-800">{validPage}</strong> of{' '}
            <strong className="font-bold text-slate-800">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validPage <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Review Edit / Create Modal */}
      {isModalOpen && editingReview && (
        <ReviewEditModal
          theme={theme}
          review={editingReview}
          onSave={handleSaveModal}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-slate-200 bg-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Review?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the review by{' '}
                <strong className="text-slate-800">{reviewToDelete.clientName}</strong> ({reviewToDelete.companyName})?
                This action will remove it from the public feedback showcase.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
