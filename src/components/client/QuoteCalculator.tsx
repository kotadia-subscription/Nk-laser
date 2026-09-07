import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Upload, 
  FileCheck, 
  Send, 
  CheckCircle2, 
  Zap, 
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  MaterialType, 
  ServiceCategory, 
  QuoteCalculationInput, 
  SiteSettings 
} from '../../types';
import { buildWhatsAppLink, createQuoteCalculatorWhatsAppMessage } from '../../utils/whatsapp';
import { saveInquiry } from '../../lib/storage';
import { SectionHeading } from '../common/SectionHeading';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface QuoteCalculatorProps {
  settings: SiteSettings;
  onQuoteSubmitted?: () => void;
}

const MATERIAL_THICKNESS_LIMITS: Record<MaterialType, { min: number; max: number; default: number }> = {
  'Stainless Steel': { min: 0.8, max: 16, default: 3 },
  'Mild Steel (MS)': { min: 0.8, max: 25, default: 4 },
  'Aluminum': { min: 0.8, max: 12, default: 2 },
  'Brass': { min: 0.8, max: 8, default: 1.5 },
  'Copper': { min: 0.8, max: 6, default: 1 },
  'Acrylic': { min: 1, max: 20, default: 5 },
  'Wood/MDF': { min: 2, max: 18, default: 6 },
  'Fused Quartz / Silica': { min: 1.5, max: 15, default: 5 },
  'Copper (TeCu / T2)': { min: 1, max: 10, default: 2 },
  'Technical Ceramic (Al2O3)': { min: 1, max: 12, default: 3 },
  'Optical Glass': { min: 1, max: 15, default: 4 }
};

export const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({
  settings,
  onQuoteSubmitted
}) => {
  const [formData, setFormData] = useState<QuoteCalculationInput>({
    serviceType: 'Sheet Metal Cutting',
    material: 'Stainless Steel',
    thicknessMm: 3,
    quantity: 10,
    lengthMm: 300,
    widthMm: 200,
    bendingOperations: 0,
    weldingRequired: false,
    powderCoating: false,
    expressDelivery: false,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    fileName: '',
    fileSize: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);


  // Handle Material Change and adjust max thickness
  const handleMaterialChange = (material: MaterialType) => {
    const limits = MATERIAL_THICKNESS_LIMITS[material] || { min: 0.8, max: 20, default: 3 };
    setFormData(prev => ({
      ...prev,
      material,
      thicknessMm: Math.min(Math.max(prev.thicknessMm, limits.min), limits.max)
    }));
  };

  // Simulated File Upload handler for DXF/DWG files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB'
      }));
    }
  };

  // Simple rule-based cost estimator for reference if price display is enabled
  const calculateEstimatedCost = () => {
    const { thicknessMm, quantity, lengthMm, widthMm, material, bendingOperations, weldingRequired, powderCoating, expressDelivery } = formData;
    
    // Rough area in sq mm -> sq meters
    const areaSqM = (lengthMm * widthMm) / 1000000;
    
    // Material cost factor per sq meter
    const materialRates: Record<MaterialType, number> = {
      'Stainless Steel': 2800,
      'Mild Steel (MS)': 1200,
      'Aluminum': 2200,
      'Brass': 5500,
      'Copper': 6800,
      'Acrylic': 1500,
      'Wood/MDF': 600,
      'Fused Quartz / Silica': 4500,
      'Copper (TeCu / T2)': 7200,
      'Technical Ceramic (Al2O3)': 5800,
      'Optical Glass': 4800
    };

    const rate = materialRates[material] || 1500;
    const baseMaterial = areaSqM * rate * (1 + thicknessMm * 0.15);
    const laserRuntimeCost = 40 + (thicknessMm * 8); // per piece laser time
    
    let pieceCost = baseMaterial + laserRuntimeCost;
    pieceCost += bendingOperations * 15;
    if (weldingRequired) pieceCost += 80;
    if (powderCoating) pieceCost += 45;

    let total = pieceCost * quantity;
    if (expressDelivery) total *= 1.2;

    const minEst = Math.round(total * 0.9);
    const maxEst = Math.round(total * 1.15);

    return { minEst: Math.max(minEst, 250), maxEst: Math.max(maxEst, 350) };
  };

  const costEstimate = calculateEstimatedCost();
  const costEstimateStr = `₹${costEstimate.minEst.toLocaleString('en-IN')} - ₹${costEstimate.maxEst.toLocaleString('en-IN')}`;

  // Build WhatsApp link
  const waMessage = createQuoteCalculatorWhatsAppMessage({
    ...formData,
    estimatedCostRange: settings.showPricing ? costEstimateStr : undefined
  });
  const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, waMessage);

  // Submit via Web Inquiry
  const handleSubmitWebsiteInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      alert('Please provide your Name and Phone Number so we can get back to you with the quote.');
      return;
    }

    setIsSubmitting(true);

    const specsSummary = `${formData.material} | ${formData.thicknessMm}mm | ${formData.lengthMm}x${formData.widthMm}mm | Qty: ${formData.quantity}${formData.fileName ? ' | File: ' + formData.fileName : ''}`;

    saveInquiry({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || 'N/A',
      productOrService: formData.serviceType,
      material: formData.material,
      thickness: `${formData.thicknessMm} mm`,
      quantity: formData.quantity,
      message: formData.notes || `Quote requested for ${formData.quantity} pcs of ${formData.material} (${formData.thicknessMm}mm).`,
      source: 'Quote Calculator',
      specsSummary
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      if (onQuoteSubmitted) onQuoteSubmitted();
    }, 600);
  };

  const currentThicknessLimits = MATERIAL_THICKNESS_LIMITS[formData.material];

  return (
    <section
      id="quote-tool"
      className={`py-8 md:py-12 transition-colors duration-300 border-b ${
        'bg-zinc-50 text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        
        {/* Section Header */}
        <SectionHeading
          badge="Instant RFQ Specification"
          title="Laser Cutting & Spares Quote Calculator"
          subtitle="Select process, material thickness, dimensions, and upload CAD/DXF drawings to auto-generate a WhatsApp or direct quote brief."
          themeMode={settings.themeMode}
        />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Left Side Form (8 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className={`lg:col-span-8 border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5 ${
              'bg-white border-zinc-200'
            }`}
          >
                     {/* Step 1: Service & Material */}
            <div className="space-y-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
                'text-amber-900 font-extrabold'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>1</span>
                Service & Material Selection
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Service Type */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 text-zinc-700`}>
                    Process / Service Type
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as ServiceCategory }))}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500 border transition-colors ${
                      'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  >
                    <option value="Sheet Metal Cutting">Sheet Metal Fiber Laser Cutting</option>
                    <option value="Laser Cutting Head Spares">Laser Cutting Head Spares (RayTools/OSPRI)</option>
                    <option value="Tube & Pipe Laser">CNC Tube & Pipe Laser Cutting</option>
                    <option value="CNC Bending">CNC Press Brake Bending</option>
                    <option value="Laser Welding">Laser Welding & Seams</option>
                    <option value="Decorative & Architectural Jali">Decorative Jali & Elevation Panel</option>
                    <option value="Custom Fabrication">Custom Turnkey Assembly</option>
                  </select>
                </div>

                {/* Material Selection */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 text-zinc-700`}>
                    Material Type
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => handleMaterialChange(e.target.value as MaterialType)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500 border transition-colors ${
                      'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  >
                    <option value="Stainless Steel">Stainless Steel (SS 304 / 316)</option>
                    <option value="Mild Steel (MS)">Mild Steel (MS Plate / Carbon Steel)</option>
                    <option value="Aluminum">Aluminum (6061 / 5052)</option>
                    <option value="Brass">Brass (Solid Yellow Brass)</option>
                    <option value="Copper">Copper (High Electrical Grade)</option>
                    <option value="Acrylic">Cast Acrylic Sheet</option>
                    <option value="Wood/MDF">Wood / MDF / Plywood</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Step 2: Dimensions, Thickness, & Quantity */}
            <div className={`space-y-4 pt-2 border-t border-zinc-200`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
                'text-amber-900 font-extrabold'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>2</span>
                Thickness, Dimensions & Batch Quantity
              </h3>

              {/* Thickness Slider & Input */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={'text-zinc-700'}>Sheet / Plate Thickness:</span>
                  <span className={`font-mono text-sm font-black text-amber-900`}>{formData.thicknessMm} mm</span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={currentThicknessLimits.min}
                    max={currentThicknessLimits.max}
                    step="0.5"
                    value={formData.thicknessMm}
                    onChange={(e) => setFormData(prev => ({ ...prev, thicknessMm: parseFloat(e.target.value) }))}
                    className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min={currentThicknessLimits.min}
                    max={currentThicknessLimits.max}
                    step="0.1"
                    value={formData.thicknessMm}
                    onChange={(e) => setFormData(prev => ({ ...prev, thicknessMm: parseFloat(e.target.value) || 1 }))}
                    className={`w-20 rounded-lg px-2 py-1 text-center font-mono text-xs font-bold border ${
                      'bg-white border-zinc-300 text-amber-900'
                    }`}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Min: {currentThicknessLimits.min} mm</span>
                  <span>Max for {formData.material}: {currentThicknessLimits.max} mm</span>
                </div>
              </div>

              {/* Dimensions & Quantity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                    Length (mm)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="6000"
                    value={formData.lengthMm}
                    onChange={(e) => setFormData(prev => ({ ...prev, lengthMm: parseInt(e.target.value) || 10 }))}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                      'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={formData.widthMm}
                    onChange={(e) => setFormData(prev => ({ ...prev, widthMm: parseInt(e.target.value) || 10 }))}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                      'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                    Total Quantity (pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                      'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

              </div>
            </div>

            {/* Step 3: Value-Added Operations */}
            <div className={`space-y-3 pt-2 border-t border-zinc-200`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
                'text-amber-900 font-extrabold'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>3</span>
                Value-Added Services & Add-Ons
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Bending operations count */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  'bg-zinc-50 border-zinc-200'
                }`}>
                  <span className={`font-semibold text-zinc-700`}>Press Bending Strokes:</span>
                  <select
                    value={formData.bendingOperations}
                    onChange={(e) => setFormData(prev => ({ ...prev, bendingOperations: parseInt(e.target.value) }))}
                    className={`rounded px-2 py-1 font-mono font-bold border ${
                      'bg-white border-zinc-300 text-amber-900'
                    }`}
                  >
                    <option value={0}>0 Bends</option>
                    <option value={1}>1 Bend</option>
                    <option value={2}>2 Bends</option>
                    <option value={4}>4 Bends (Box/Tray)</option>
                    <option value={8}>8+ Complex Bends</option>
                  </select>
                </div>

                {/* Welding */}
                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                  'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.weldingRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, weldingRequired: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <div>
                    <div className={`font-semibold text-zinc-800`}>Laser Welding / Assembly</div>
                    <div className={`text-[10px] text-zinc-500`}>Airtight seam or spot welding</div>
                  </div>
                </label>

                {/* Powder Coating */}
                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                  'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.powderCoating}
                    onChange={(e) => setFormData(prev => ({ ...prev, powderCoating: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <div>
                    <div className={`font-semibold text-zinc-800`}>Powder Coating Finish</div>
                    <div className={`text-[10px] text-zinc-500`}>Matte black, texture, RAL colors</div>
                  </div>
                </label>

                {/* Express Priority */}
                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                  'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.expressDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, expressDelivery: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <div>
                    <div className={`font-bold flex items-center gap-1 text-amber-900`}>
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>24-Hour Express Priority</span>
                    </div>
                    <div className={`text-[10px] text-zinc-500`}>Fast-track production queue</div>
                  </div>
                </label>

              </div>
            </div>

            {/* Step 4: CAD File Upload & Contact Details */}
            <div className={`space-y-4 pt-2 border-t border-zinc-200`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
                'text-amber-900 font-extrabold'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>4</span>
                CAD Drawing File & Contact Details
              </h3>

              {/* Upload Drop Zone */}
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors ${
                'border-zinc-300 hover:border-amber-500 bg-zinc-50'
              }`}>
                <input
                  type="file"
                  id="dxf-file-input"
                  accept=".dxf,.dwg,.step,.stp,.iges,.igs,.pdf,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <label htmlFor="dxf-file-input" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-amber-500 mx-auto" />
                  <div className={`text-xs font-semibold text-zinc-800`}>
                    {uploadedFile ? (
                      <span className="text-emerald-500 font-mono flex items-center justify-center gap-1">
                        <FileCheck className="w-4 h-4" /> {uploadedFile.name} ({formData.fileSize})
                      </span>
                    ) : (
                      <span>Upload CAD Drawing File (.DXF, .DWG, .STEP, .PDF)</span>
                    )}
                  </div>
                  <p className={`text-[11px] max-w-sm mx-auto text-zinc-400`}>
                    {settings.dxfUploadNotice}
                  </p>
                </label>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-amber-500 ${
                      'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-amber-500 ${
                      'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-amber-500 ${
                      'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-xs font-semibold mb-1 text-zinc-700`}>
                  Additional Notes / Tolerances
                </label>
                <textarea
                  rows={2}
                  placeholder="Specify any special cutting gas (Nitrogen/Oxygen), surface finish, countersink holes, or delivery urgency..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-amber-500 resize-none ${
                    'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

            </div>

          </motion.div>

          {/* Right Side Summary Panel (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-4 space-y-4"
          >
            
            <div className={`sticky top-24 border rounded-3xl p-6 shadow-2xl space-y-5 ${
              'bg-white border-zinc-200'
            }`}>
              
              <div className={`flex items-center justify-between pb-3 border-b ${
                'border-zinc-200'
              }`}>
                <span className={`font-bold text-sm flex items-center gap-2 text-zinc-900`}>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Quote Specification Summary
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono border border-amber-500/20 font-bold">
                  LIVE BRIEF
                </span>
              </div>

              {/* Specs List */}
              <div className="space-y-2.5 text-xs">
                
                <div className={`flex justify-between py-1 border-b border-zinc-100`}>
                  <span className={'text-zinc-500'}>Process:</span>
                  <span className={`font-bold text-zinc-900`}>{formData.serviceType}</span>
                </div>

                <div className={`flex justify-between py-1 border-b border-zinc-100`}>
                  <span className={'text-zinc-500'}>Material:</span>
                  <span className={`font-bold text-amber-800 font-extrabold`}>{formData.material}</span>
                </div>

                <div className={`flex justify-between py-1 border-b border-zinc-100`}>
                  <span className={'text-zinc-500'}>Thickness:</span>
                  <span className={`font-mono font-bold text-zinc-900`}>{formData.thicknessMm} mm</span>
                </div>

                <div className={`flex justify-between py-1 border-b border-zinc-100`}>
                  <span className={'text-zinc-500'}>Dimensions:</span>
                  <span className={`font-mono text-zinc-900`}>{formData.lengthMm} x {formData.widthMm} mm</span>
                </div>

                <div className={`flex justify-between py-1 border-b border-zinc-100`}>
                  <span className={'text-zinc-500'}>Quantity:</span>
                  <span className={`font-mono font-bold text-zinc-900`}>{formData.quantity} Pcs</span>
                </div>

                {formData.fileName && (
                  <div className={`flex justify-between py-1 border-b border-zinc-100`}>
                    <span className={'text-zinc-500'}>Attached File:</span>
                    <span className="text-emerald-500 font-mono truncate max-w-[130px] font-bold">{formData.fileName}</span>
                  </div>
                )}

              </div>

              {/* Pricing Box / Custom Quote Notice */}
              <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                'bg-zinc-50 border-zinc-200'
              }`}>
                {settings.showPricing ? (
                  <>
                    <div className={`text-xs text-zinc-500`}>Estimated Cost Range:</div>
                    <div className="text-2xl font-black text-emerald-600 font-mono">
                      {costEstimateStr}
                    </div>
                    <p className={`text-[10px] text-zinc-400`}>
                      *Baseline estimation. Final quote subject to DXF geometry nested inspection.
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`font-bold text-sm flex items-center justify-center gap-1.5 ${
                      'text-amber-900 font-extrabold'
                    }`}>
                      <FileText className={`w-4 h-4 text-amber-700`} />
                      <span>Custom Quote Mode Active</span>
                    </div>
                    <p className={`text-xs text-zinc-700`}>
                      Our engineering team will analyze your material specs and DXF drawing to provide the lowest manufacturing price.
                    </p>
                  </>
                )}
              </div>

              {/* Success Message Banner */}
              {submitSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Inquiry Submitted to NK Laser!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    Our team will contact you shortly via phone/WhatsApp at {formData.customerPhone}.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                
                {/* 1. Send via WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 btn-primary font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 text-xs transition-all cursor-pointer"
                  title="Auto-fills all quote details directly in WhatsApp message!"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Send Quote Brief on WhatsApp</span>
                </a>

                {/* 2. Submit on Website */}
                <button
                  onClick={handleSubmitWebsiteInquiry}
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 px-4 rounded-xl text-xs gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Website Inquiry</span>
                    </>
                  )}
                </button>

              </div>

              {/* Contact Guarantee Note */}
              <p className={`text-[10px] text-center leading-normal text-zinc-400`}>
                Direct Contact: <strong>{settings.email}</strong> • WhatsApp: <strong>{settings.whatsappDisplay}</strong>
              </p>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

