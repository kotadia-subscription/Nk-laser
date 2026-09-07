import { SiteSettings } from '../types';
export { INITIAL_REVIEWS } from './reviewsData';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  businessName: "NK Laser Spares & Optics",
  tagline: "Direct Importers of Fiber Laser Spares, RayTools/OSPRI/WSX Consumables & Optics",
  whatsappNumber: "+919902035374",
  whatsappDisplay: "+91 99020 35374",
  email: "nklaser33@gmail.com",
  phoneDisplay: "+91 99020 35374",
  address: "Plot No. 42, GIDC Industrial Area, Sector 3, Gujarat, India",
  addresses: [
    {
      id: "addr-1",
      title: "Central Spares Warehouse & Import HQ",
      addressLine: "Plot No. 42, GIDC Industrial Area, Sector 3",
      cityState: "Ahmedabad, Gujarat, India",
      pincode: "382445",
      warehouseType: "Central Warehouse & HQ",
      phone: "+91 99020 35374",
      email: "nklaser33@gmail.com",
      contactPerson: "Central Dispatch Desk",
      workingHours: "Mon - Sat: 8:30 AM - 8:00 PM",
      dispatchTiming: "Same-day express dispatch for orders placed before 4:00 PM",
      isPrimary: true,
      mapUrl: "https://maps.google.com/?q=Plot+No+42+GIDC+Industrial+Area+Gujarat"
    },
    {
      id: "addr-2",
      title: "South India Regional Dispatch Center",
      addressLine: "Plot No. 18, Peenya Industrial Area, 2nd Phase",
      cityState: "Bengaluru, Karnataka, India",
      pincode: "560058",
      warehouseType: "Express Dispatch Hub",
      phone: "+91 99020 35374",
      email: "nklaser33@gmail.com",
      contactPerson: "South Zone Logistics",
      workingHours: "Mon - Sat: 9:00 AM - 7:30 PM",
      dispatchTiming: "Fast 24-48h dispatch across Southern India",
      isPrimary: false,
      mapUrl: "https://maps.google.com/?q=Peenya+Industrial+Area+Bengaluru"
    },
    {
      id: "addr-3",
      title: "West India Stockyard & Service Lab",
      addressLine: "Sector 10, PCMC Industrial Corridor, Bhosari",
      cityState: "Pune, Maharashtra, India",
      pincode: "411026",
      warehouseType: "Optics & Cutting Head Service Lab",
      phone: "+91 99020 35374",
      email: "nklaser33@gmail.com",
      contactPerson: "Technical Desk",
      workingHours: "Mon - Sat: 9:30 AM - 7:00 PM",
      dispatchTiming: "Direct pick-up & emergency spare courier",
      isPrimary: false,
      mapUrl: "https://maps.google.com/?q=Bhosari+Industrial+Area+Pune"
    }
  ],
  workingHours: "Mon - Sat: 8:30 AM - 8:00 PM | Sun: By Appointment",
  logoUrl: "/images/logo/nk-laser-logo.svg",
  warehouseBannerUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
  instagramUrl: "https://www.instagram.com/laser.nk",
  socialLinks: {
    instagram: "https://www.instagram.com/laser.nk"
  },
  themeMode: 'light', // Light theme by default
  primaryColor: '#162657', // Default NKL Deep Navy
  accentColor: '#E51024', // Default NKL Laser Red
  showPricing: true,
  dxfUploadNotice: "Send part numbers, photos, or machine models on WhatsApp for instant spare parts quotation.",
  heroTitle: "Direct Importer of Fiber Laser Spares, Optics & Consumables",
  heroSubtitle: "Genuine RayTools, OSPRI, WSX, BOCHU, Precitec & SMC parts with fast 1-2 days express delivery across India.",
  noticeBannerText: "⚡ DIRECT IMPORTER: RayTools, OSPRI & WSX Lenses, Nozzles, Ceramics & Heads in Stock with 1-2 Days Express Delivery across India!",
  showNoticeBanner: true,
  features: {
    showPrices: true,
    whatsappChat: true,
    calculator: false
  },
  adminSecretKey: 'nk-vault-9921-x',
  sectionsVisibility: {
    hero: true,
    services: false,
    brands: true,
    quoteCalculator: false,
    products: true,
    materials: false,
    reviews: true,
    contact: true,
    footer: true
  }
};
