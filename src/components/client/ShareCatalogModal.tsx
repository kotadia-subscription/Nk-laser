import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Download,
  SlidersHorizontal,
  PackageCheck,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Link2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProductItem, SiteSettings } from '../../types';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface ShareCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredProducts: ProductItem[];
  totalProductsCount: number;
  activeFilters: {
    categorySlug: string;
    categoryName?: string;
    subCategory?: string;
    brand: string;
    power: string;
    inStockOnly: boolean;
    searchQuery: string;
    sortBy: string;
  };
  settings: SiteSettings;
}

export const ShareCatalogModal: React.FC<ShareCatalogModalProps> = ({
  isOpen,
  onClose,
  filteredProducts,
  totalProductsCount,
  activeFilters,
  settings
}) => {
  if (!isOpen) return null;

  const cleanNumber = (settings.whatsappNumber || '').replace(/[^0-9]/g, '');

  const canShowPricing = Boolean(settings.showPricing);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [includePricing, setIncludePricing] = useState(canShowPricing);

  // Strictly enforce admin showPricing setting
  const effectiveIncludePricing = canShowPricing && includePricing;

  // Construct the exact shareable URL
  const generateShareUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const params = new URLSearchParams();

    params.set('view', 'store');
    if (activeFilters.categorySlug && activeFilters.categorySlug !== 'all') {
      params.set('cat', activeFilters.categorySlug);
    }
    if (activeFilters.subCategory && activeFilters.subCategory !== 'all') {
      params.set('sub', activeFilters.subCategory);
    }
    if (activeFilters.brand && activeFilters.brand !== 'all') {
      params.set('brand', activeFilters.brand);
    }
    if (activeFilters.power && activeFilters.power !== 'all') {
      params.set('power', activeFilters.power);
    }
    if (activeFilters.searchQuery && activeFilters.searchQuery.trim() !== '') {
      params.set('q', activeFilters.searchQuery.trim());
    }
    if (activeFilters.inStockOnly) {
      params.set('stock', '1');
    }
    if (activeFilters.sortBy && activeFilters.sortBy !== 'popular') {
      params.set('sort', activeFilters.sortBy);
    }

    const queryString = params.toString();
    return `${origin}${pathname}?${queryString}`;
  };

  const shareUrl = generateShareUrl();

  // Generate authentic, downloadable PDF using jsPDF + autoTable (Bypasses iframe print blocks completely)
  const handleSaveToPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const quoteDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const quoteRef = `NK-${Math.floor(100000 + Math.random() * 900000)}`;
      const safeClientName = clientName.trim() || 'Valued Client';

      // 1. Company Brand Header & Letterhead
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(settings.businessName.toUpperCase(), 14, 11);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(245, 158, 11); // Amber accent
      doc.text('DIRECT IMPORTER & OEM LASER SPARES SPECIALIST', 14, 17);

      doc.setTextColor(226, 232, 240);
      doc.setFontSize(8);
      doc.text(`Ref: ${quoteRef} | Date: ${quoteDate}`, 196, 11, { align: 'right' });
      doc.text(`WhatsApp: +91 ${cleanNumber}`, 196, 17, { align: 'right' });

      // 2. Document Title Banner
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 28, 182, 20, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CUSTOM SPARE PARTS SPECIFICATION & RFQ', 18, 35);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Prepared For: ${safeClientName}${clientPhone.trim() ? ` (${clientPhone.trim()})` : ''}`, 18, 42);
      doc.text(`Total Matched Parts: ${filteredProducts.length} Items`, 190, 42, { align: 'right' });

      // 3. Active Search Filters Summary
      const activeFilterStrings: string[] = [];
      if (activeFilters.categorySlug !== 'all') {
        activeFilterStrings.push(`Category: ${activeFilters.categoryName || activeFilters.categorySlug}`);
      }
      if (activeFilters.brand !== 'all') {
        activeFilterStrings.push(`OEM Brand: ${activeFilters.brand}`);
      }
      if (activeFilters.power !== 'all') {
        activeFilterStrings.push(`Power: ${activeFilters.power}`);
      }
      if (activeFilters.searchQuery.trim()) {
        activeFilterStrings.push(`Keywords: "${activeFilters.searchQuery.trim()}"`);
      }
      if (activeFilters.inStockOnly) {
        activeFilterStrings.push(`In-Stock Only`);
      }

      let startYPos = 52;
      if (activeFilterStrings.length > 0) {
        doc.setFillColor(254, 243, 199); // Amber-50
        doc.setDrawColor(251, 191, 36);
        doc.roundedRect(14, 51, 182, 8, 1, 1, 'FD');
        doc.setFontSize(7.5);
        doc.setTextColor(146, 64, 14); // Amber-800
        doc.setFont('helvetica', 'bold');
        doc.text(`Active Filter Criteria: ${activeFilterStrings.join('  |  ')}`, 18, 56.5);
        startYPos = 63;
      }

      // 4. Products Table Body
      const tableHeaders = effectiveIncludePricing 
        ? [['#', 'Part Title & SKU', 'OEM Brand & Specs', 'Availability', 'Price (INR)']]
        : [['#', 'Part Title & SKU', 'OEM Brand & Specifications', 'Availability']];

      const tableBody = filteredProducts.map((p, idx) => {
        const titleAndSku = `${p.title}\nSKU: ${p.sku || 'N/A'}`;
        const specs = [
          p.brand ? `Brand: ${p.brand}` : '',
          p.dimensions ? `Specs: ${p.dimensions}` : '',
          p.powerRating ? `Power: ${p.powerRating}` : ''
        ].filter(Boolean).join('\n') || (p.description ? p.description.slice(0, 50) : '-');

        const stock = p.stockStatus || 'In Stock\n24h Dispatch';

        if (effectiveIncludePricing) {
          const price = p.estimatedPrice ? `₹${p.estimatedPrice.toLocaleString('en-IN')}` : 'RFQ';
          return [(idx + 1).toString(), titleAndSku, specs, stock, price];
        }
        return [(idx + 1).toString(), titleAndSku, specs, stock];
      });

      autoTable(doc, {
        startY: startYPos,
        head: tableHeaders,
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 2.5
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
          cellPadding: 2.5,
          valign: 'top'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: effectiveIncludePricing ? {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 62 },
          2: { cellWidth: 62 },
          3: { cellWidth: 26 },
          4: { cellWidth: 24, halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] }
        } : {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 78 },
          2: { cellWidth: 68 },
          3: { cellWidth: 28 }
        },
        margin: { left: 14, right: 14, bottom: 20 },
        didDrawPage: (data) => {
          // Footer
          const pageCount = (doc as any).internal.getNumberOfPages();
          const pageCurrent = data.pageNumber;
          const primaryAddr = settings.addresses?.find(a => a.isPrimary) || settings.addresses?.[0];
          const addressText = primaryAddr 
            ? `${primaryAddr.title} (${primaryAddr.cityState || primaryAddr.addressLine})` 
            : settings.address;

          doc.setFontSize(6.8);
          doc.setTextColor(148, 163, 184);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `${settings.businessName} • Dispatch HQ: ${addressText} • WhatsApp: +91 ${cleanNumber}`,
            14,
            288
          );
          doc.text(
            `Catalog: ${shareUrl}`,
            14,
            292
          );
          doc.text(`Page ${pageCurrent} of ${pageCount}`, 196, 292, { align: 'right' });
        }
      });

      // Save PDF directly to user's device
      const fileName = `NK_Laser_RFQ_${safeClientName.replace(/[^a-zA-Z0-9]/g, '_')}_${quoteRef}.pdf`;
      doc.save(fileName);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Format professional message text for WhatsApp or clipboard
  const generateQuotationText = () => {
    let msg = `*⚡ ${settings.businessName.toUpperCase()} — CUSTOM SPARE PARTS SELECTION*\n`;
    if (clientName.trim()) {
      msg += `👤 *Prepared for:* ${clientName.trim()}\n`;
    }
    msg += `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n`;
    msg += `------------------------------------\n`;
    
    // Active Criteria summary
    msg += `📋 *Applied Search Criteria:*\n`;
    if (activeFilters.categorySlug !== 'all') {
      msg += `• *Category:* ${activeFilters.categoryName || activeFilters.categorySlug}\n`;
    }
    if (activeFilters.subCategory && activeFilters.subCategory !== 'all') {
      msg += `• *Subcategory:* ${activeFilters.subCategory}\n`;
    }
    if (activeFilters.brand !== 'all') {
      msg += `• *OEM Brand:* ${activeFilters.brand}\n`;
    }
    if (activeFilters.power !== 'all') {
      msg += `• *Laser Power:* ${activeFilters.power}\n`;
    }
    if (activeFilters.searchQuery.trim()) {
      msg += `• *Keywords:* "${activeFilters.searchQuery.trim()}"\n`;
    }
    if (activeFilters.inStockOnly) {
      msg += `• *Availability:* In-Stock Dispatch Only\n`;
    }
    if (
      activeFilters.categorySlug === 'all' && 
      activeFilters.brand === 'all' && 
      activeFilters.power === 'all' && 
      !activeFilters.searchQuery.trim()
    ) {
      msg += `• *Catalog:* Full Master Catalog (${filteredProducts.length} items)\n`;
    }

    msg += `• *Matching Spares Found:* ${filteredProducts.length} items\n`;
    msg += `------------------------------------\n\n`;

    // Itemized list of up to 10 top items
    msg += `📦 *Recommended Spare Parts & Optics:*\n`;
    const previewList = filteredProducts.slice(0, 10);
    previewList.forEach((p, idx) => {
      msg += `${idx + 1}. *${p.title}*\n`;
      if (p.brand) msg += `   • Brand: ${p.brand}\n`;
      if (p.sku) msg += `   • SKU: ${p.sku}\n`;
      if (p.dimensions) msg += `   • Size/Dimensions: ${p.dimensions}\n`;
      if (effectiveIncludePricing && p.estimatedPrice) {
        msg += `   • Price: ₹${p.estimatedPrice.toLocaleString('en-IN')}\n`;
      }
      msg += `   • Stock: ${p.stockStatus || 'Available'}\n\n`;
    });

    if (filteredProducts.length > 10) {
      msg += `... plus ${filteredProducts.length - 10} more matching spare parts.\n\n`;
    }

    msg += `🌐 *View & Order this custom filtered list online:*\n${shareUrl}\n\n`;
    const primaryAddr = settings.addresses?.find(a => a.isPrimary) || settings.addresses?.[0];
    if (primaryAddr) {
      msg += `📍 *Dispatch Facility:* ${primaryAddr.title} (${primaryAddr.cityState || primaryAddr.addressLine})\n`;
    }
    if (settings.addresses && settings.addresses.length > 1) {
      msg += `🏭 *Warehouse Network:* ${settings.addresses.length} Dispatch Hubs across India\n`;
    }
    msg += `📞 *Direct Support & RFQ:* +91 ${cleanNumber}\n`;
    msg += `⚡ Fast Pan-India Dispatch | 100% Genuine Optics Guarantee`;

    return msg;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyFormattedText = async () => {
    const text = generateQuotationText();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleSendWhatsAppToClient = () => {
    const text = generateQuotationText();
    const targetPhone = clientPhone.replace(/[^0-9]/g, '');
    const url = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const activeFiltersCount = [
    activeFilters.categorySlug !== 'all',
    activeFilters.brand !== 'all',
    activeFilters.power !== 'all',
    activeFilters.searchQuery.trim() !== '',
    activeFilters.inStockOnly
  ].filter(Boolean).length;

  // Listen for Escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-catalog-title"
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div 
              style={{ backgroundColor: 'var(--primary, #162657)', color: 'var(--primary-contrast, #ffffff)' }}
              className="w-10 h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-black shadow-xs shrink-0"
            >
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="share-catalog-title" className="text-base sm:text-lg font-black flex items-center gap-2" style={{ color: 'var(--primary, #162657)' }}>
                <span>Share Custom Catalog Results</span>
                <span 
                  style={{ backgroundColor: 'var(--surface-secondary, #EAF0FF)', color: 'var(--primary, #162657)', borderColor: 'rgba(22, 38, 87, 0.2)' }}
                  className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-900"
                >
                  {filteredProducts.length} Items
                </span>
              </h3>
              <p className="text-xs font-medium opacity-85" style={{ color: 'var(--primary, #162657)' }}>
                Save an official PDF quote, dispatch via WhatsApp, or copy direct links for clients.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200" style={{ color: 'var(--primary, #162657)' }}>
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors cursor-pointer border bg-slate-100 hover:bg-slate-200 border-slate-200 hover:text-slate-900"
              style={{ color: 'var(--primary, #162657)' }}
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-5 bg-white">
          
          {/* Active Filter Criteria Preview Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--primary, #162657)' }}>
                <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--primary, #162657)' }} />
                <span>Active Filter Criteria ({activeFiltersCount || 'All Items'})</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{filteredProducts.length} of {totalProductsCount} parts match</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {activeFilters.categorySlug !== 'all' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-medium opacity-80" style={{ color: 'var(--primary, #162657)' }}>Category:</span>
                  <strong className="font-bold" style={{ color: 'var(--primary, #162657)' }}>{activeFilters.categoryName || activeFilters.categorySlug}</strong>
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-slate-200" style={{ color: 'var(--primary, #162657)' }}>
                  All Categories
                </span>
              )}

              {activeFilters.subCategory && activeFilters.subCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-medium opacity-80" style={{ color: 'var(--primary, #162657)' }}>Subcategory:</span>
                  <strong className="font-bold" style={{ color: 'var(--primary, #162657)' }}>{activeFilters.subCategory}</strong>
                </span>
              )}

              {activeFilters.brand !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-medium opacity-80" style={{ color: 'var(--primary, #162657)' }}>Brand:</span>
                  <strong className="font-bold" style={{ color: 'var(--primary, #162657)' }}>{activeFilters.brand}</strong>
                </span>
              )}

              {activeFilters.power !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-medium opacity-80" style={{ color: 'var(--primary, #162657)' }}>Power:</span>
                  <strong className="font-bold" style={{ color: 'var(--primary, #162657)' }}>{activeFilters.power}</strong>
                </span>
              )}

              {activeFilters.searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-medium opacity-80" style={{ color: 'var(--primary, #162657)' }}>Keyword:</span>
                  <strong className="font-bold" style={{ color: 'var(--primary, #162657)' }}>"{activeFilters.searchQuery.trim()}"</strong>
                </span>
              )}

              {activeFilters.inStockOnly && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  In-Stock Ready
                </span>
              )}
            </div>
          </div>

          {/* Client & Quotation Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold" style={{ color: 'var(--primary, #162657)' }}>
                Client / Company Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Precision Lasers"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{ color: 'var(--primary, #162657)' }}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-slate-400/40 transition-all bg-white border-slate-200 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold" style={{ color: 'var(--primary, #162657)' }}>
                  Client WhatsApp Number
                </label>
                {/* Pricing toggle - only available if enabled in admin settings */}
                {canShowPricing && (
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none" style={{ color: 'var(--primary, #162657)' }}>
                    <input
                      type="checkbox"
                      checked={includePricing}
                      onChange={(e) => setIncludePricing(e.target.checked)}
                      style={{ accentColor: 'var(--primary, #162657)' }}
                      className="rounded cursor-pointer w-3.5 h-3.5"
                    />
                    <span>Show Prices</span>
                  </label>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. 919876543210 (or leave blank to select chat)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                style={{ color: 'var(--primary, #162657)' }}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-slate-400/40 transition-all bg-white border-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Section 1: PRIMARY ACTION - Instant Save as PDF */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-3">
              <div 
                style={{ backgroundColor: 'var(--primary, #162657)', color: 'var(--primary-contrast, #ffffff)' }}
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-xs shrink-0"
              >
                <Download className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold" style={{ color: 'var(--primary, #162657)' }}>
                  1. Save as PDF Document (Default Option)
                </h4>
                <p className="text-xs font-medium opacity-85" style={{ color: 'var(--primary, #162657)' }}>
                  Generates a formal, printable PDF document on official company letterhead with 1-click download.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveToPdf}
              disabled={isGeneratingPdf}
              style={{
                backgroundColor: pdfDownloaded ? '#10b981' : 'var(--primary, #162657)',
                color: '#ffffff'
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 cursor-pointer active:scale-[0.99]"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin text-white" />
                  <span className="text-white">Generating Official PDF...</span>
                </>
              ) : pdfDownloaded ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-white">PDF Successfully Saved & Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span className="text-white">Save to PDF ({filteredProducts.length} Spares Included)</span>
                </>
              )}
            </button>
          </div>

          {/* Section 2: Direct WhatsApp Client Dispatch */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <WhatsAppIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold" style={{ color: 'var(--primary, #162657)' }}>
                  2. Send via WhatsApp to Client
                </h4>
                <p className="text-xs font-medium opacity-85" style={{ color: 'var(--primary, #162657)' }}>
                  Dispatches structured specifications with SKUs, technical parameters, and live interactive catalog link.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendWhatsAppToClient}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer active:scale-[0.99]"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Launch WhatsApp & Dispatch Custom Proposal</span>
            </button>
          </div>

          {/* Section 3: One-Click Shareable URL & Copy Text */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--primary, #162657)' }}>
              <Link2 className="w-3.5 h-3.5" style={{ color: 'var(--primary, #162657)' }} />
              <span>3. Direct Shareable Link & Text</span>
            </label>
            
            <div className="flex items-center gap-2">
              <div 
                style={{ color: 'var(--primary, #162657)' }}
                className="flex-1 p-2.5 rounded-xl border text-xs font-mono truncate select-all bg-slate-50 border-slate-200"
              >
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                style={!copiedLink ? { color: 'var(--primary, #162657)' } : undefined}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border shadow-2xs transition-all cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" style={{ color: 'var(--primary, #162657)' }} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyFormattedText}
                style={!copiedText ? { color: 'var(--primary, #162657)' } : undefined}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  copiedText
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
                }`}
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-white" /> : <FileText className="w-3.5 h-3.5" style={{ color: 'var(--primary, #162657)' }} />}
                <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Footer Close */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              style={{ color: 'var(--primary, #162657)' }}
              className="px-5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 border-slate-300 hover:text-slate-900"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};


