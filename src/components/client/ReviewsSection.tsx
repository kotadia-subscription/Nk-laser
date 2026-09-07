import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle, Quote, MessageSquare, Send, X, Search } from 'lucide-react';
import { ReviewItem, ThemeMode, SiteSettings } from '../../types';
import { SectionHeading } from '../common/SectionHeading';

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  themeMode: ThemeMode;
  settings: SiteSettings;
  onAddReview?: (newReview: ReviewItem) => void;
  onInquireWhatsApp?: (msg: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  themeMode,
  settings,
  onAddReview,
  onInquireWhatsApp
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  // Form State (kept in code if re-enabled in future)
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [projectType, setProjectType] = useState('Sheet Metal Cutting');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;

  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        r.clientName.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.projectType.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim()) return;

    const newRev: ReviewItem = {
      id: 'rev-' + Date.now(),
      clientName: clientName.trim(),
      companyName: companyName.trim() || 'Valued Client',
      location: location.trim() || 'India',
      rating,
      comment: comment.trim(),
      date: 'Just now',
      projectType,
      verified: true,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=150&q=80`
    };

    if (onAddReview) {
      onAddReview(newRev);
    }

    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setShowAddModal(false);
      setClientName('');
      setCompanyName('');
      setLocation('');
      setComment('');
    }, 1800);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section
      id="reviews"
      className={`py-16 sm:py-24 relative overflow-hidden transition-colors duration-300 bg-zinc-50 text-zinc-900`}
    >
      {/* Background Decorative Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl bg-amber-300/30`}
        />
        <div
          className={`absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl bg-orange-200/40`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          badge="Verified Client Feedback"
          title="What Our Fabricators & Engineers Say"
          subtitle={`Trusted by 500+ industrial OEMs, laser machine owners, and fabricators across India. Rated ${averageRating} / 5.0 across ${reviews.length} verified B2B reviews.`}
          themeMode={themeMode}
        />

        {/* Top Controls & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-700/30">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold uppercase tracking-wider text-zinc-500`}
            >
              Filter Rating:
            </span>
            <button
              onClick={() => {
                setFilterRating('all');
                setVisibleCount(12);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterRating === 'all'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => {
                setFilterRating(5);
                setVisibleCount(12);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                filterRating === 5
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <span>5</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] opacity-75 font-normal">({fiveStarCount})</span>
            </button>
            <button
              onClick={() => {
                setFilterRating(4);
                setVisibleCount(12);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                filterRating === 4
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <span>4</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] opacity-75 font-normal">({fourStarCount})</span>
            </button>
          </div>

          {/* Search bar & count (Write a Review button is intentionally hidden as requested) */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(12);
                }}
                placeholder="Search reviews, parts, cities..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-6 px-1">
          <span>
            Showing <strong className="text-zinc-800 font-semibold">{displayedReviews.length}</strong> of <strong className="text-zinc-800 font-semibold">{filteredReviews.length}</strong> verified reviews
            {searchQuery && ` for "${searchQuery}"`}
          </span>
          {filterRating !== 'all' && (
            <button
              onClick={() => setFilterRating('all')}
              className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedReviews.map((rev, index) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min((index % 12) * 0.03, 0.3) }}
                className={`p-6 sm:p-7 rounded-2xl border relative flex flex-col justify-between transition-all duration-300 hover:shadow-xl bg-white border-zinc-200 hover:border-amber-400/50 shadow-sm`}
              >
                <Quote
                  className={`absolute top-5 right-5 w-8 h-8 pointer-events-none opacity-10 text-zinc-900`}
                />

                <div>
                  {/* Rating & Project Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300 fill-zinc-200'
                          }`}
                        />
                      ))}
                      <span
                        className={`text-xs font-bold ml-1.5 text-zinc-700`}
                      >
                        {rev.rating}.0
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-zinc-100 text-zinc-700 border-zinc-300`}
                    >
                      {rev.projectType}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p
                    className={`text-sm sm:text-base leading-relaxed italic mb-6 text-zinc-800`}
                  >
                    "{rev.comment}"
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
                      {rev.avatarUrl ? (
                        <img
                          src={rev.avatarUrl}
                          alt={rev.clientName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        rev.clientName.charAt(0)
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4
                          className={`text-sm font-bold text-zinc-900`}
                        >
                          {rev.clientName}
                        </h4>
                        {rev.verified && (
                          <span
                            title="Verified Order / Inquiry Client"
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs text-zinc-500`}
                      >
                        {rev.companyName} • {rev.location}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs text-zinc-400`}
                  >
                    {rev.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Controls */}
        {displayedReviews.length < filteredReviews.length && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setVisibleCount((prev) => prev + 16)}
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Load More Reviews</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-amber-400 font-semibold">
                +{Math.min(16, filteredReviews.length - displayedReviews.length)}
              </span>
            </button>
            <button
              onClick={() => setVisibleCount(filteredReviews.length)}
              className="px-4 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Show All ({filteredReviews.length})
            </button>
          </div>
        )}

        {/* Direct WhatsApp Review CTA */}
        <div
          className={`mt-12 p-6 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50 border-amber-200`}
        >
          <div className="text-left">
            <h4
              className={`text-base font-bold text-zinc-900`}
            >
              Have you ordered laser cutting or spare parts from NK Laser?
            </h4>
            <p
              className={`text-xs sm:text-sm text-zinc-600`}
            >
              Share your verified experience directly on WhatsApp to help other fabricators and laser engineers!
            </p>
          </div>

          <button
            onClick={() => {
              if (onInquireWhatsApp) {
                onInquireWhatsApp(
                  `Hello NK Laser Team, I would like to submit my client review for laser cutting / spares services.`
                );
              } else {
                window.open(
                  `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    'Hello NK Laser Team, I would like to submit my client review for laser cutting / spares services.'
                  )}`,
                  '_blank'
                );
              }
            }}
            className="px-5 py-2.5 rounded-xl btn-primary font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Review on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-full max-w-lg rounded-2xl p-6 sm:p-8 border shadow-2xl relative bg-white text-zinc-900 border-zinc-200`}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-full cursor-pointer hover:bg-zinc-100 text-zinc-600`}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-1">Submit Your Review</h3>
            <p className={`text-xs mb-6 text-zinc-600`}>
              Your feedback helps us continuously improve our laser cutting and spare parts quality.
            </p>

            {submittedMessage ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-emerald-400">Thank You!</h4>
                <p className={`text-xs mt-1 text-zinc-700`}>
                  Your review has been successfully added to NK Laser website.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rajesh Patel"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                      Company / Workshop
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Engineering"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Ahmedabad, Gujarat"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                      Service / Product Type
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500`}
                    >
                      <option value="Sheet Metal Cutting">Sheet Metal Fiber Laser</option>
                      <option value="Laser Spares & Consumables">Laser Spares & Consumables</option>
                      <option value="Tube & Pipe Laser">Tube & Pipe Laser</option>
                      <option value="CNC Bending">CNC Press Brake Bending</option>
                      <option value="Laser Welding">Laser Welding</option>
                      <option value="Architectural Jali">Architectural Decorative Jali</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 text-zinc-700`}>
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <button
                        key={starNum}
                        type="button"
                        onClick={() => setRating(starNum)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            starNum <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300 fill-zinc-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">{rating}.0 / 5.0</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                    Review Comment *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the laser cut quality, speed, edge accuracy, or spare parts experience..."
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all resize-none bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500`}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-zinc-100 text-zinc-600`}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
};
