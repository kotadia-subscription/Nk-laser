import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Search, 
  Trash2, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText,
  Flame,
  Plus,
  Sparkles,
  X,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { InquiryRecord, SiteSettings, ProductItem } from '../../../types';

interface AdminInquiriesViewProps {
  theme: 'light' | 'dark';
  inquiries: InquiryRecord[];
  settings: SiteSettings;
  products?: ProductItem[];
  onUpdateInquiryStatus: (id: string, newStatus: InquiryRecord['status']) => void;
  onDeleteInquiry: (id: string) => void;
  onAddInquiry?: (newInquiry: Omit<InquiryRecord, 'id' | 'createdAt' | 'status'>) => void;
}

export const AdminInquiriesView: React.FC<AdminInquiriesViewProps> = ({
  theme,
  inquiries,
  settings,
  products = [],
  onUpdateInquiryStatus,
  onDeleteInquiry,
  onAddInquiry
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'New' | 'In Progress' | 'Quoted' | 'Completed'>('all');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form state for logging inquiry
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  // Calculate product inquiry counts using the exact matching logic used on the home page
  const rankedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const counts = new Map<string, number>();

    inquiries.forEach((inq) => {
      const pName = (inq.productOrService || '').toLowerCase().trim();
      const specs = (inq.specsSummary || '').toLowerCase();
      const msg = (inq.message || '').toLowerCase();
      const fullText = `${pName} ${specs} ${msg}`;

      products.forEach((prod) => {
        const prodId = prod.id;
        const prodSku = (prod.sku || '').toLowerCase().trim();
        const prodTitle = prod.title.toLowerCase().trim();

        let isMatch = false;
        if (prodSku && fullText.includes(prodSku)) isMatch = true;
        else if (prodTitle && (fullText.includes(prodTitle) || (pName && pName.includes(prodTitle)))) isMatch = true;
        else if (prodId && (fullText.includes(prodId.toLowerCase()) || (inq as any).productId === prodId)) isMatch = true;

        if (isMatch) {
          counts.set(prodId, (counts.get(prodId) || 0) + 1);
        }
      });
    });

    return products
      .map((p) => ({
        product: p,
        inquiryCount: counts.get(p.id) || 0
      }))
      .sort((a, b) => {
        if (b.inquiryCount !== a.inquiryCount) {
          return b.inquiryCount - a.inquiryCount;
        }
        if (a.product.isFeatured && !b.product.isFeatured) return -1;
        if (!a.product.isFeatured && b.product.isFeatured) return 1;
        return 0;
      })
      .slice(0, 6);
  }, [products, inquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(i => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          (i.customerName && i.customerName.toLowerCase().includes(q)) ||
          (i.customerPhone && i.customerPhone.toLowerCase().includes(q)) ||
          (i.customerEmail && i.customerEmail.toLowerCase().includes(q)) ||
          (i.productOrService && i.productOrService.toLowerCase().includes(q)) ||
          (i.message && i.message.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [inquiries, searchQuery, statusFilter]);

  const handleWhatsAppReply = (inq: InquiryRecord) => {
    const rawPhone = inq.customerPhone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(
      `Hello ${inq.customerName}, this is ${settings.businessName || 'NK Laser'}. We received your inquiry regarding "${inq.productOrService}". How can we assist you with the quotation or technical specifications today?`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const matchedProd = products.find(p => p.id === selectedProductId);
    const prodTitle = matchedProd ? matchedProd.title : (selectedProductId || 'Laser Spare Part');
    const sku = matchedProd?.sku || '';

    if (onAddInquiry) {
      onAddInquiry({
        customerName: newCustomerName.trim(),
        customerPhone: newCustomerPhone.trim(),
        customerEmail: newCustomerEmail.trim(),
        productOrService: prodTitle,
        quantity: Number(newQuantity) || 1,
        message: newMessage.trim() || `Inquiry recorded for ${prodTitle}`,
        source: 'Admin Manual Entry',
        specsSummary: `${prodTitle}${sku ? ` | SKU: ${sku}` : ''} | Qty: ${newQuantity}`
      });
    }

    // Reset form
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerEmail('');
    setSelectedProductId('');
    setNewQuantity(1);
    setNewMessage('');
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 bg-white border-slate-200 shadow-xs`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200`}>
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black tracking-tight">
                Customer Inquiries & RFQs ({inquiries.length})
              </h2>
            </div>
            <p className={`text-xs mt-0.5 text-slate-500`}>
              Review incoming part inquiries, customer CAD requests, and initiate direct WhatsApp quotes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onAddInquiry && (
              <button
                type="button"
                onClick={() => setIsLogModalOpen(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Log Customer Inquiry</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Home Page Auto-Ranking Banner */}
        {rankedProducts.length > 0 && (
          <div className={`p-4 rounded-2xl border bg-amber-50/70 border-amber-200/70`}>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-600">
                  Home Page "Find the component you need" Auto-Ranked Spares
                </span>
              </div>
              <span className={`text-[10px] font-medium text-slate-600`}>
                Automatically organized by highest inquiries
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {rankedProducts.map(({ product, inquiryCount }, idx) => (
                <div
                  key={product.id}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all bg-white border-amber-200/60 shadow-2xs`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[10px] font-black">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {inquiryCount} {inquiryCount === 1 ? 'inq' : 'inqs'}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold line-clamp-2 leading-tight">
                      {product.title}
                    </p>
                  </div>
                  <p className="text-[9px] font-mono text-[var(--text-secondary)] mt-1 truncate">
                    SKU: {product.sku}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="sm:col-span-2 relative">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              placeholder="Search customer, phone, part..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400`}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-800`}
            >
              <option value="all">All Statuses</option>
              <option value="New">New Unread</option>
              <option value="In Progress">In Progress</option>
              <option value="Quoted">Quoted</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-3">
        {filteredInquiries.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border bg-white border-slate-200 shadow-xs`}>
            <Inbox className={`w-12 h-12 mx-auto text-slate-300`} />
            <h3 className="font-bold text-base mt-2">No Inquiries Found</h3>
            <p className={`text-xs mt-1 text-slate-500`}>
              Customer inquiries submitted via the store catalog, quote calculator, or logged manually will appear here.
            </p>
          </div>
        ) : (
          filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className={`p-5 rounded-3xl border transition-all bg-white border-slate-200 shadow-xs`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                
                {/* Customer Details */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm">{inq.customerName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200`}>
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      inq.status === 'New' 
                        ? 'bg-amber-500 text-zinc-950 font-black' 
                        : inq.status === 'Quoted'
                          ? 'bg-blue-500/20 text-blue-600'
                          : inq.status === 'In Progress'
                            ? 'bg-purple-500/20 text-purple-600'
                            : 'bg-zinc-500/20 text-zinc-600'
                    }`}>
                      {inq.status}
                    </span>
                    {inq.source && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border bg-slate-100 border-slate-200 text-slate-500`}>
                        {inq.source}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {inq.customerPhone && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        <span>{inq.customerPhone}</span>
                      </span>
                    )}
                    {inq.customerEmail && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>{inq.customerEmail}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Part: {inq.productOrService}</span>
                    </span>
                  </div>

                  {inq.message && (
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed bg-slate-50 border-slate-200 text-slate-700`}>
                      {inq.message}
                    </div>
                  )}
                </div>

                {/* Actions & Status Dropdown */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  
                  {/* Status Dropdown */}
                  <select
                    value={inq.status}
                    onChange={(e) => onUpdateInquiryStatus(inq.id, e.target.value as any)}
                    className={`border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-800`}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {/* WhatsApp Direct Reply */}
                  {inq.customerPhone && (
                    <button
                      onClick={() => handleWhatsAppReply(inq)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteInquiry(inq.id)}
                    className={`p-1.5 rounded-xl border cursor-pointer bg-slate-100 border-slate-200 text-slate-500 hover:text-red-600`}
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Log Manual Inquiry */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 bg-white border-slate-200 text-slate-900`}>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base">Log Offline / Customer Inquiry</h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-xl hover:bg-zinc-800/40 text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Apex Engineering Works"
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="buyer@company.com"
                    className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Spare Part / Product *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-slate-50 border-slate-300 text-slate-900`}
                >
                  <option value="">-- Select Spare Part to Rank --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.sku})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                  Logging this inquiry will count towards the product's ranking on the home page.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Quantity Requested</label>
                <input
                  type="number"
                  min="1"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value) || 1)}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Notes / Requirement Details</label>
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="e.g. Urgent requirement for night shift. Customer requested quotation over phone."
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-50 border-slate-300 text-slate-900`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border)] hover:bg-zinc-800/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save Inquiry & Re-Rank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
