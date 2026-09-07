import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ProductItem, ProductCategoryDef, SiteSettings, PageView } from '../../types';
import { generateSchemaGraph, getProductSlug } from '../../utils/seo';

interface SEOHeadProps {
  currentView: PageView;
  selectedProduct?: ProductItem | null;
  selectedCategory?: ProductCategoryDef | null;
  selectedCategorySlug?: string;
  selectedBrand?: string;
  storeSearchQuery?: string;
  storePower?: string;
  isAdminOpen?: boolean;
  settings: SiteSettings;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  currentView,
  selectedProduct,
  selectedCategory,
  selectedCategorySlug = 'all',
  selectedBrand = 'all',
  storeSearchQuery = '',
  storePower = 'all',
  isAdminOpen = false,
  settings
}) => {
  const companyName = settings.businessName || 'NK Laser Spares & Optics';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nklaser.com';

  let title = `${companyName} | Fiber Laser Cutting Services, Industrial Spares & Optics`;
  let description = settings.heroSubtitle || 
    'Direct importer & supplier of fiber laser cutting consumables, RayTools & OSPRI cutting heads, optical quartz protective lenses, Tellurium copper nozzles, ceramic rings, and CypCut CNC controllers.';
  let keywords = 'fiber laser spares, laser cutting services, laser optics, quartz protective window, tellurium copper nozzle, ceramic sensor body, raytools bm110, ospri cutting head, cypcut pendant, fiber laser cutting consumables, sheet metal fabrication';
  let ogImage = settings.logoUrl || `${siteUrl}/images/categories/protective-lenses.jpg`;
  let ogType = 'website';
  let robots = 'index, follow';
  let canonicalUrl = `${siteUrl}/`;
  let pageType: 'home' | 'product' | 'category' | 'services' | 'reviews' | 'contact' | 'store' = 'home';

  // 1. Admin Panel Open
  if (isAdminOpen) {
    title = `Admin Vault Management | ${companyName}`;
    description = `Secure management back-office for ${companyName} catalog, inquiries, and inventory.`;
    robots = 'noindex, nofollow';
    canonicalUrl = `${siteUrl}/`;
  } 
  // 2. Product Detail View
  else if ((currentView === 'product-detail' || selectedProduct) && selectedProduct) {
    pageType = 'product';
    const brandText = selectedProduct.compatibleBrands?.length 
      ? ` for ${selectedProduct.compatibleBrands.slice(0, 3).join(', ')}` 
      : '';
    const powerText = selectedProduct.powerRange ? ` (${selectedProduct.powerRange})` : '';
    const skuText = selectedProduct.sku ? ` [SKU: ${selectedProduct.sku}]` : '';
    
    title = `${selectedProduct.title}${skuText}${brandText}${powerText} | ${companyName}`;
    
    const specsSnippet = selectedProduct.specs && selectedProduct.specs.length > 0 
      ? selectedProduct.specs.slice(0, 3).join(' • ') 
      : '';
    
    description = `${selectedProduct.title}${skuText}${brandText}. ${selectedProduct.description || 'Premium industrial fiber laser spare component with guaranteed fitment and high optical transmission.'} ${specsSnippet ? `Key Specs: ${specsSnippet}.` : ''} Same-day express dispatch from regional warehouses across India.`.slice(0, 290);
    
    keywords = `${selectedProduct.title}, ${selectedProduct.sku || ''}, ${selectedProduct.category}, ${selectedProduct.compatibleBrands?.join(', ') || ''}, fiber laser spares, laser consumables`;
    ogType = 'product';
    if (selectedProduct.imageUrl) {
      ogImage = selectedProduct.imageUrl;
    }
    canonicalUrl = `${siteUrl}/product/${getProductSlug(selectedProduct)}`;
  } 
  // 3. Store / Category View
  else if (currentView === 'store') {
    const isSingleCategory = selectedCategory && selectedCategory.slug !== 'all';
    
    if (isSingleCategory) {
      pageType = 'category';
      title = `${selectedCategory.name} - Fiber Laser Spares & Consumables | ${companyName}`;
      description = `Buy industrial ${selectedCategory.name.toLowerCase()} for fiber laser cutting heads. Direct importer pricing, OEM fitment guarantee, and express same-day dispatch from Ahmedabad, Bengaluru & Pune hubs.`;
      canonicalUrl = `${siteUrl}/category/${selectedCategory.slug}`;
      if (selectedCategory.imageUrl) ogImage = selectedCategory.imageUrl;
    } else {
      pageType = 'store';
      const filterParts: string[] = [];
      if (storeSearchQuery && storeSearchQuery.trim()) {
        filterParts.push(`Search "${storeSearchQuery.trim()}"`);
      }
      if (selectedBrand && selectedBrand !== 'all') {
        filterParts.push(`${selectedBrand} Compatible`);
      }
      if (storePower && storePower !== 'all') {
        filterParts.push(`${storePower}`);
      }

      if (filterParts.length > 0) {
        title = `${filterParts.join(' - ')} | Spares Catalog - ${companyName}`;
        description = `Browse ${filterParts.join(', ')} fiber laser spare parts, cutting consumables, and optics. In-stock components ready for express dispatch with same-day dispatch.`;
      } else {
        title = `Fiber Laser Spare Parts & Optics Catalog | ${companyName}`;
        description = `Explore industrial fiber laser consumables, high-pressure cutting nozzles, quartz protective windows, ceramic sensor bodies, and CypCut controllers.`;
      }
      canonicalUrl = `${siteUrl}/store`;
    }
  } 
  // 4. Reviews Page
  else if (currentView === 'reviews') {
    pageType = 'reviews';
    title = `Client Reviews & Verified B2B Testimonials | ${companyName}`;
    description = `Read verified reviews from CNC laser operators, job shops, and sheet metal fabrication plants across India trusting ${companyName} for spares, optics, and cutting services.`;
    keywords = 'fiber laser reviews, laser spares customer feedback, CNC operator ratings, laser cutting testimonials';
    canonicalUrl = `${siteUrl}/reviews`;
  } 
  // 5. Contact Page
  else if (currentView === 'contact') {
    pageType = 'contact';
    title = `Contact & Regional Warehouses | ${companyName}`;
    description = `Contact ${companyName} for technical support, instant RFQ quotations, and same-day spare parts dispatch. Facilities in Ahmedabad (Gujarat), Bengaluru (Karnataka), and Pune (Maharashtra).`;
    keywords = 'contact laser spares, fiber laser support, laser warehouse address, RFQ quote, ahmedabad laser spares, bengaluru laser hub';
    canonicalUrl = `${siteUrl}/contact`;
  } 
  // 6. Home Landing Page
  else {
    pageType = 'home';
    title = `${companyName} | Fiber Laser Cutting Services, Industrial Spares & Optics`;
    description = `${companyName} is an industrial direct importer of fiber laser cutting spares (RayTools, OSPRI, WSX, BOCHU) and precision CNC sheet metal & tube laser cutting service provider.`;
    canonicalUrl = `${siteUrl}/`;
  }

  // Generate full Schema.org JSON-LD
  const schemaGraph = generateSchemaGraph({
    siteUrl,
    settings,
    pageType,
    product: selectedProduct,
    category: selectedCategory,
    canonicalUrl
  });

  return (
    <Helmet>
      {/* Primary Page Title & Core Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook Protocol */}
      <meta property="og:site_name" content={companyName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card Protocol */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaGraph)}
      </script>
    </Helmet>
  );
};
