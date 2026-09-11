export type MaterialType = 
  | 'Stainless Steel'
  | 'Mild Steel (MS)'
  | 'Aluminum'
  | 'Brass'
  | 'Copper'
  | 'Acrylic'
  | 'Wood/MDF'
  | 'Fused Quartz / Silica'
  | 'Copper (TeCu / T2)'
  | 'Technical Ceramic (Al2O3)'
  | 'Optical Glass';

export type ServiceCategory = 
  | 'Sheet Metal Cutting'
  | 'Tube & Pipe Laser'
  | 'CNC Bending'
  | 'Laser Welding'
  | 'Decorative & Architectural Jali'
  | 'Laser Cutting Spares & Consumables'
  | 'Custom Fabrication';

export type StoreCategorySlug = 
  | 'laser-spares-consumables'
  | 'laser-source'
  | 'laser-chiller'
  | 'laser-chillers'
  | 'protective-lenses'
  | 'cutting-nozzles'
  | 'ceramic-rings'
  | 'focusing-collimating-lenses'
  | 'laser-cutting-heads'
  | 'cnc-controllers-cypcut'
  | 'laser-welding-spares'
  | 'pneumatic-smc-valves'
  | 'laser-sources-qbh'
  | 'optics-cleaning-maintenance'
  | string;

export type PageView = 
  | 'home'
  | 'store'
  | 'product-detail'
  | 'calculator'
  | 'reviews'
  | 'contact'
  | 'admin';

export type AdminTabType = 
  | 'dashboard'
  | 'categories'
  | 'products'
  | 'filters'
  | 'inquiries'
  | 'reviews'
  | 'settings'
  | 'security';

export interface ProductCategoryDef {
  id: string;
  slug: StoreCategorySlug | string;
  name: string;
  shortTitle: string;
  description: string;
  iconName: string;
  imageUrl: string;
  subCategories: string[];
  oemBrands: string[];
  powerRanges?: string[];
  defaultMaterial?: string;
  defaultPower?: string;
  itemCount?: number;
  featured?: boolean;
  showOnHome?: boolean;
}

export type ThemeMode = 'dark' | 'light';

export interface SectionVisibility {
  hero: boolean;
  services: boolean;
  brands: boolean;
  quoteCalculator: boolean;
  products: boolean;
  materials: boolean;
  reviews: boolean;
  contact: boolean;
  footer: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: ServiceCategory;
  shortDesc: string;
  description: string;
  iconName: string;
  imageUrl: string;
  materials: MaterialType[];
  maxThickness: string;
  tolerance: string;
  features: string[];
  startingPriceEstimate?: string;
}

export interface MaterialSpec {
  name: MaterialType | string;
  grades: string[];
  maxThicknessMm: number;
  cuttingGas: string;
  surfaceFinish: string;
  description: string;
  imageUrl?: string;
  applications: string[];
}

export interface MaterialCapability {
  material: string;
  grades: string;
  maxThickness: string;
  assistGas: string;
  gasType?: string;
  applications: string;
  keyApplications?: string;
  tolerance: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProductSpecPair {
  label: string;
  value: string;
}

export type ProductTemplateId = 
  | 'none'
  | 'simple'
  | 'specs'
  | 'badge-hero'
  | 'dark-carbon'
  | 'blueprint';

export type ProductTemplateIconType = 'diameter' | 'height' | 'power' | 'qty' | 'generic';

export interface ProductTemplateSpecItem {
  label: string;
  value?: string;
  icon?: ProductTemplateIconType;
}

export type ProductTemplateLogoPreset = 
  | 'official-badge'
  | 'white-minimal'
  | 'red-accent'
  | 'custom';

export interface ProductTemplateConfig {
  templateId: ProductTemplateId;
  logoSrc?: string;
  logoAlt?: string;
  logoPreset?: ProductTemplateLogoPreset;
  sizeText?: string;
  websiteText?: string;
  footerTagline?: string;
  specs?: ProductTemplateSpecItem[];
}

export interface ProductItem {
  id: string;
  guid?: string; // Guaranteed RFC4122 v4 unique GUID
  sku?: string;
  title: string;
  category: ServiceCategory | string;
  categorySlug?: StoreCategorySlug | string;
  subCategory?: string;
  material: MaterialType | string;
  thickness?: string;
  dimensions?: string;
  imageUrl: string;
  galleryImages?: string[];
  description: string;
  specs: string[];
  specificationsTable?: ProductSpecPair[];
  brand?: string;
  compatibleBrands?: string[];
  powerRange?: string;
  wavelength?: string;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Direct Import Stock' | 'Custom Order';
  inStock?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  estimatedPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  variants?: string;
  originalUrl?: string;
  moq?: number;
  templateConfig?: ProductTemplateConfig;
}

export interface BrandItem {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  description: string;
  seriesList: string[];
}

export interface ReviewItem {
  id: string;
  clientName: string;
  companyName: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  projectType: string;
  verified: boolean;
  avatarUrl?: string;
}

export interface SiteThemeColors {
  primaryColor: string;
  secondaryColor?: string; // Deep Navy or custom dark tone
  accentColor?: string; // Brand Red (#E51024) or highlight tone
  backgroundColor?: string;
  surfaceColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  borderColor?: string;
  hoverColor?: string;
  contrastText?: string;
}

export interface BusinessAddress {
  id: string;
  title: string; // e.g. "Main Spares Warehouse & HQ", "Bengaluru Dispatch Hub", "Gujarat Workshop"
  addressLine: string; // "Plot No. 42, GIDC Industrial Estate, Sector 3"
  cityState?: string; // "Gujarat, India" or "Bengaluru, Karnataka"
  pincode?: string; // e.g. "382445"
  warehouseType?: string; // e.g. "Central Warehouse & HQ", "Express Dispatch Hub", "Service & Refurbishment Lab", "Regional Stockyard"
  phone?: string; // "+91 99020 35374"
  email?: string;
  contactPerson?: string; // e.g. "Dispatch Manager"
  workingHours?: string; // e.g. "Mon - Sat: 8:30 AM - 8:00 PM"
  dispatchTiming?: string; // e.g. "Same-day dispatch for orders placed before 4:00 PM"
  isPrimary?: boolean;
  mapUrl?: string; // Google Maps link or directions URL
}

export interface TemplateLogoPresetConfig {
  'official-badge'?: string;
  'white-minimal'?: string;
  'red-accent'?: string;
  'custom'?: string;
  [key: string]: string | undefined;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  whatsappNumber: string; // "+919902035374"
  whatsappDisplay: string; // "+91 99020 35374"
  email: string;
  phoneDisplay: string;
  phone?: string;
  address: string;
  addresses?: BusinessAddress[];
  workingHours: string;
  logoUrl: string;
  warehouseBannerUrl?: string;
  instagramUrl?: string; // e.g. "https://www.instagram.com/nklaser.india"
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
  };
  themeMode: ThemeMode; // 'light' | 'dark'
  primaryColor?: string; // Primary Navy #162657 or custom
  accentColor?: string; // Brand Red #E51024 or custom
  themeColors?: SiteThemeColors;
  showPricing: boolean;
  dxfUploadNotice: string;
  heroTitle: string;
  heroSubtitle: string;
  noticeBannerText: string;
  showNoticeBanner: boolean;
  sectionsVisibility: SectionVisibility;
  features?: {
    showPrices?: boolean;
    whatsappChat?: boolean;
    calculator?: boolean;
  };
  templateLogoPresets?: TemplateLogoPresetConfig;
  adminSecretKey?: string; // Obfuscated entry portal key (e.g. 'nk-vault-9921-x')
}

export interface QuoteCalculationInput {
  serviceType: ServiceCategory;
  material: MaterialType;
  thicknessMm: number;
  quantity: number;
  lengthMm: number;
  widthMm: number;
  tubeDiameterMm?: number;
  bendingOperations: number;
  weldingRequired: boolean;
  powderCoating: boolean;
  expressDelivery: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  fileName?: string;
  fileSize?: string;
}

export interface CalculatedQuoteResult {
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  estimatedTimeDays: number;
  specSummary: string;
}

export interface InquiryRecord {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productOrService: string;
  material?: string;
  thickness?: string;
  quantity?: number;
  message: string;
  status: 'New' | 'In Progress' | 'Quoted' | 'Completed';
  source: 'Quote Calculator' | 'Product Inquiry' | 'Service Inquiry' | 'General Contact';
  specsSummary?: string;
}

export interface BrandAuditItem {
  id: string;
  source: string;
  field: string;
  urlOrContent: string;
  issue: string;
  status: 'Flagged' | 'Clean' | 'Resolved';
  detectedBrand?: string;
  auditCategory?: 'brand' | 'catalog';
}

export interface ComprehensiveAuditResult {
  passed: boolean;
  message: string;
  issues: string[];
  brandItems?: BrandAuditItem[];
  catalogIssues?: string[];
  stats?: {
    totalScanned: number;
    brandFlags: number;
    catalogIssues: number;
    monitoredBrandsCount: number;
  };
}

export interface FullAppConfigurationBackup {
  version: string;
  exportedAt: string;
  appName: string;
  settings: SiteSettings;
  products: ProductItem[];
  categories: ProductCategoryDef[];
  brands: BrandItem[];
  reviews: ReviewItem[];
  inquiries: InquiryRecord[];
  powerRanges: string[];
  adminPasswordEncrypted?: string;
  adminPasswordHash?: string;
  adminSecretKey?: string;
}

export interface ConfigSnapshot {
  id: string;
  timestamp: string;
  label: string;
  data: FullAppConfigurationBackup;
}

