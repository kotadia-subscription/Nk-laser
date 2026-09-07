import { ProductItem, ProductCategoryDef, ServiceItem, SiteSettings, BusinessAddress } from '../types';

/**
 * Creates a URL-friendly slug from text
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[\s\/\\]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates canonical slug for a product
 */
export function getProductSlug(product: ProductItem): string {
  if (product.sku) {
    return slugify(`${product.title}-${product.sku}`);
  }
  return slugify(product.title || product.id);
}

/**
 * Finds a product by slug, ID, or SKU
 */
export function findProductBySlug(target: string, products: ProductItem[]): ProductItem | null {
  if (!target || products.length === 0) return null;
  const cleanTarget = decodeURIComponent(target).toLowerCase().trim();

  // 1. Direct ID match
  const byId = products.find(p => p.id.toLowerCase() === cleanTarget);
  if (byId) return byId;

  // 2. Direct SKU match
  const bySku = products.find(p => p.sku && p.sku.toLowerCase() === cleanTarget);
  if (bySku) return bySku;

  // 3. Slug match
  const bySlug = products.find(p => getProductSlug(p) === cleanTarget);
  if (bySlug) return bySlug;

  // 4. Normalized title match
  const byTitle = products.find(p => slugify(p.title) === cleanTarget);
  if (byTitle) return byTitle;

  // 5. Partial SKU match in slug (e.g. slug ends with SKU)
  const bySkuEnd = products.find(p => p.sku && cleanTarget.endsWith(slugify(p.sku)));
  if (bySkuEnd) return bySkuEnd;

  return null;
}

/**
 * Finds category by slug or name
 */
export function findCategoryBySlug(target: string, categories: ProductCategoryDef[]): ProductCategoryDef | null {
  if (!target || categories.length === 0) return null;
  const cleanTarget = decodeURIComponent(target).toLowerCase().trim();

  return categories.find(c => 
    c.slug.toLowerCase() === cleanTarget || 
    slugify(c.name) === cleanTarget ||
    c.id.toLowerCase() === cleanTarget
  ) || null;
}

/**
 * Core FAQ Data for AI Discoverability (AEO) and FAQPage Schema
 */
export interface FAQData {
  question: string;
  answer: string;
}

export const SITE_FAQS: FAQData[] = [
  {
    question: "What industrial laser spare parts does NK Laser supply?",
    answer: "NK Laser is a direct importer and supplier of fiber laser consumables and optical components. Our inventory includes optical protective quartz windows, Tellurium copper laser cutting nozzles (single and double layer), technical ceramic sensor bodies, autofocus cutting heads (RayTools, OSPRI, WSX), collimating and focusing lens assemblies, CypCut CNC controllers, wireless pendants, and proportional gas valves."
  },
  {
    question: "Which fiber laser machine brands are compatible with NK Laser spares?",
    answer: "Our spare parts and optics are 100% compatible with major fiber laser cutting machine manufacturers and cutting heads, including RayTools (BM110, BM111, BM114), OSPRI (LC40, LC60, LC80), WSX (NC30, NC60), Precitec (ProCutter), BOCHU FSCUT CypCut, Bodor, HSG, DNE, IPG, Raycus, and Maxphotonics fiber laser sources ranging from 1kW to 30kW."
  },
  {
    question: "What are NK Laser's dispatch timelines and warehouse locations?",
    answer: "NK Laser operates three regional facilities across India: Central Spares Warehouse & Import HQ in Ahmedabad (Gujarat), South India Regional Dispatch Center in Peenya (Bengaluru, Karnataka), and West India Stockyard & Service Lab in Bhosari (Pune, Maharashtra). Orders confirmed by 4:00 PM are dispatched same-day via express air/courier with typical 24 to 48-hour delivery across India."
  },
  {
    question: "What materials and thicknesses can NK Laser cut and fabricate?",
    answer: "NK Laser provides precision CNC fiber laser cutting for Mild Steel / Carbon Steel up to 25mm, Stainless Steel (SS304/SS316) up to 20mm with nitrogen assist gas, Aluminum (5052/6061) up to 16mm, and Brass/Copper up to 10mm. We also offer CNC tube/pipe laser cutting, hydraulic press brake bending, precision fiber laser welding, and architectural metal jali fabrication."
  },
  {
    question: "How can B2B clients request quotations or place bulk orders?",
    answer: "Clients can generate an official instant PDF quotation directly through our online catalog or submit an RFQ via WhatsApp at +91 99020 35374 with part numbers, technical drawings, or machine photos. Our engineering desk provides instant compatibility verification and commercial quotes within minutes."
  }
];

/**
 * Generates full Schema.org JSON-LD graph for a page
 */
export function generateSchemaGraph(options: {
  siteUrl: string;
  settings: SiteSettings;
  pageType: 'home' | 'product' | 'category' | 'services' | 'reviews' | 'contact' | 'store';
  product?: ProductItem | null;
  category?: ProductCategoryDef | null;
  canonicalUrl: string;
}): Record<string, any> {
  const { siteUrl, settings, pageType, product, category, canonicalUrl } = options;
  const companyName = settings.businessName || 'NK Laser Spares & Optics';
  const primaryAddress: BusinessAddress = (settings.addresses && settings.addresses.length > 0)
    ? (settings.addresses.find(a => a.isPrimary) || settings.addresses[0])
    : {
        id: 'primary',
        title: 'Central Spares Warehouse & HQ',
        addressLine: typeof settings.address === 'string' ? settings.address : 'Plot No. 42, GIDC Industrial Area, Sector 3',
        cityState: 'Ahmedabad, Gujarat, India',
        pincode: '382445',
        phone: settings.phoneDisplay || settings.phone || '+91 99020 35374',
        email: settings.email || 'nklaser33@gmail.com'
      };

  const graph: any[] = [];

  // 1. Organization & LocalBusiness
  const localBusinessSchema: any = {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${siteUrl}/#organization`,
    name: companyName,
    alternateName: ['NK Laser', 'NK Laser Cutting & Spares'],
    url: siteUrl,
    logo: settings.logoUrl ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${siteUrl}${settings.logoUrl}`) : `${siteUrl}/images/logo/nk-laser-logo.svg`,
    image: `${siteUrl}/images/logo/nk-laser-logo.svg`,
    description: settings.tagline || 'Direct Importers of Fiber Laser Spares, RayTools/OSPRI/WSX Consumables, Optics & CNC Laser Cutting Services.',
    telephone: settings.phone || settings.whatsappNumber || '+919902035374',
    email: settings.email || 'nklaser33@gmail.com',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, UPI, Cheque',
    address: {
      '@type': 'PostalAddress',
      streetAddress: primaryAddress.addressLine,
      addressLocality: primaryAddress.cityState?.split(',')[0]?.trim() || 'Ahmedabad',
      addressRegion: primaryAddress.cityState?.split(',')[1]?.trim() || 'Gujarat',
      postalCode: primaryAddress.pincode || '382445',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.0225,
      longitude: 72.5714
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:30',
        closes: '20:00'
      }
    ],
    sameAs: [
      settings.instagramUrl || 'https://www.instagram.com/laser.nk',
      settings.socialLinks?.instagram || 'https://www.instagram.com/laser.nk',
      settings.socialLinks?.facebook,
      settings.socialLinks?.youtube,
      settings.socialLinks?.linkedin
    ].filter(Boolean),
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'State', name: 'Gujarat' },
      { '@type': 'State', name: 'Karnataka' },
      { '@type': 'State', name: 'Maharashtra' }
    ]
  };

  // Branch dispatch hubs if available
  if (settings.addresses && settings.addresses.length > 1) {
    localBusinessSchema.branchCode = primaryAddress.id;
    localBusinessSchema.department = settings.addresses.filter(a => !a.isPrimary).map(addr => ({
      '@type': 'LocalBusiness',
      name: `${companyName} - ${addr.title}`,
      telephone: addr.phone || localBusinessSchema.telephone,
      email: addr.email || localBusinessSchema.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: addr.addressLine,
        addressLocality: addr.cityState?.split(',')[0]?.trim() || 'City',
        addressRegion: addr.cityState?.split(',')[1]?.trim() || 'State',
        postalCode: addr.pincode || '',
        addressCountry: 'IN'
      }
    }));
  }

  graph.push(localBusinessSchema);

  // 2. BreadcrumbList Schema
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl
    }
  ];

  if (pageType === 'store') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Spares Catalog',
      item: `${siteUrl}/store`
    });
  } else if (pageType === 'category' && category) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Spares Catalog',
      item: `${siteUrl}/store`
    });
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: category.name,
      item: `${siteUrl}/category/${category.slug}`
    });
  } else if (pageType === 'product' && product) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Spares Catalog',
      item: `${siteUrl}/store`
    });
    if (product.categorySlug) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 3,
        name: typeof product.category === 'string' ? product.category : 'Components',
        item: `${siteUrl}/category/${product.categorySlug}`
      });
    }
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: product.title,
      item: canonicalUrl
    });
  } else if (pageType === 'services') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Laser Cutting & Fabrication Services',
      item: `${siteUrl}/services`
    });
  } else if (pageType === 'reviews') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Client Reviews',
      item: `${siteUrl}/reviews`
    });
  } else if (pageType === 'contact') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Contact & Warehouses',
      item: `${siteUrl}/contact`
    });
  }

  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbItems
  });

  // 3. Product Schema (if on product view)
  if (pageType === 'product' && product) {
    const displayPrice = product.salePrice || product.regularPrice || product.estimatedPrice || 0;
    const inStock = product.inStock !== false && product.stockStatus !== 'Custom Order';

    const productSchema: any = {
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: product.title,
      description: product.description || `${product.title} fiber laser spare component with guaranteed fitment.`,
      image: product.imageUrl ? [product.imageUrl] : [`${siteUrl}/images/categories/protective-lenses.jpg`],
      sku: product.sku || product.id,
      mpn: product.sku || product.id,
      brand: {
        '@type': 'Brand',
        name: product.compatibleBrands?.[0] || product.brand || companyName
      },
      category: typeof product.category === 'string' ? product.category : 'Fiber Laser Spare Parts',
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'INR',
        price: displayPrice > 0 ? displayPrice : 990,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        itemCondition: 'https://schema.org/NewCondition',
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        seller: {
          '@id': `${siteUrl}/#organization`
        }
      }
    };

    if (product.specs && product.specs.length > 0) {
      productSchema.additionalProperty = product.specs.map(s => {
        const parts = s.split(':');
        return {
          '@type': 'PropertyValue',
          name: parts[0]?.trim() || 'Specification',
          value: parts[1]?.trim() || s.trim()
        };
      });
    }

    graph.push(productSchema);
  }

  // 4. Services Schema (if on services or home)
  if (pageType === 'services' || pageType === 'home') {
    const serviceTypes = [
      {
        name: 'High-Power CNC Fiber Laser Sheet Metal Cutting',
        description: 'Precision CNC fiber laser cutting for Mild Steel, Stainless Steel, Aluminum, Brass, and Copper sheets with micron tolerances.',
        serviceType: 'Laser Cutting'
      },
      {
        name: 'CNC 3D Tube & Pipe Laser Cutting',
        description: 'Rotary chuck laser cutting for round, square, rectangular, and oval pipes with beveling and intersecting hole profiles.',
        serviceType: 'Pipe Cutting'
      },
      {
        name: 'Industrial Fiber Laser Spares & Optics Supply',
        description: 'Same-day express dispatch of lenses, nozzles, ceramics, cutting heads, and CNC controller pendants across India.',
        serviceType: 'Spares Supply'
      }
    ];

    serviceTypes.forEach(st => {
      graph.push({
        '@type': 'Service',
        name: st.name,
        description: st.description,
        serviceType: st.serviceType,
        provider: { '@id': `${siteUrl}/#organization` },
        areaServed: { '@type': 'Country', name: 'India' }
      });
    });
  }

  // 5. FAQPage Schema (Home & Contact)
  if (pageType === 'home' || pageType === 'contact') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: SITE_FAQS.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
