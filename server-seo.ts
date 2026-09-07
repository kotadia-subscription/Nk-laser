import { Request } from 'express';
import { ProductItem, ProductCategoryDef, ServiceItem, SiteSettings, BusinessAddress } from './src/types';
import { slugify, getProductSlug, findProductBySlug, findCategoryBySlug, SITE_FAQS, generateSchemaGraph } from './src/utils/seo';

/**
 * Common bot / crawler User-Agent regex
 */
export const BOT_UA_REGEX = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|twitterbot|facebookexternalhit|linkedinbot|whatsapp|telegrambot|applebot|chatgpt-user|gptbot|perplexitybot|claude-web|claudebot|bytespider|google-inspectiontool|ahrefsbot|semrushbot/i;

/**
 * Checks if incoming request is from a search engine bot, crawler, or explicitly requesting bot view
 */
export function isBotRequest(req: Request): boolean {
  const ua = req.headers['user-agent'] || '';
  if (BOT_UA_REGEX.test(ua)) return true;
  if (req.query.bot === '1' || req.query.bot === 'true') return true;
  if (req.query._escaped_fragment_ !== undefined) return true;
  return false;
}

/**
 * Generates an XML Sitemap for all indexable pages, products, categories, and services
 */
export function generateSitemapXml(db: {
  products: ProductItem[];
  categories: ProductCategoryDef[];
  settings: SiteSettings;
  lastPublishedAt?: string;
}, siteUrl: string): string {
  const lastMod = db.lastPublishedAt ? new Date(db.lastPublishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/store`, changefreq: 'daily', priority: '0.9' },
    { loc: `${siteUrl}/services`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/reviews`, changefreq: 'weekly', priority: '0.7' },
    { loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/llms.txt`, changefreq: 'weekly', priority: '0.6' }
  ];

  const categoryUrls = (db.categories || [])
    .filter(c => c.slug && c.slug !== 'all')
    .map(c => ({
      loc: `${siteUrl}/category/${c.slug}`,
      changefreq: 'daily',
      priority: '0.85',
      image: c.imageUrl
    }));

  const productUrls = (db.products || []).map(p => ({
    loc: `${siteUrl}/product/${getProductSlug(p)}`,
    changefreq: 'daily',
    priority: '0.9',
    image: p.imageUrl,
    title: p.title
  }));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Static URLs
  for (const item of staticUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Categories
  for (const item of categoryUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    if (item.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(item.image.startsWith('http') ? item.image : `${siteUrl}${item.image}`)}</image:loc>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  // Products
  for (const item of productUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    if (item.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(item.image.startsWith('http') ? item.image : `${siteUrl}${item.image}`)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(item.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Pre-renders a complete semantic HTML response with Schema.org JSON-LD for crawlers & bots
 */
export function renderBotPage(
  pathname: string,
  db: {
    products: ProductItem[];
    categories: ProductCategoryDef[];
    settings: SiteSettings;
    reviews?: any[];
  },
  siteUrl: string
): { html: string; status: number } | null {
  const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';
  const companyName = db.settings.businessName || 'NK Laser Spares & Optics';
  const logoUrl = db.settings.logoUrl ? (db.settings.logoUrl.startsWith('http') ? db.settings.logoUrl : `${siteUrl}${db.settings.logoUrl}`) : `${siteUrl}/images/logo/nk-laser-logo.svg`;

  // 1. PRODUCT DETAIL PAGE
  if (cleanPath.startsWith('/product/')) {
    const slugOrSku = cleanPath.replace('/product/', '').trim();
    const product = findProductBySlug(slugOrSku, db.products);

    if (!product) {
      return {
        status: 404,
        html: wrapHtmlDoc({
          title: `Product Not Found (404) | ${companyName}`,
          description: `The requested fiber laser spare part could not be found in our catalog.`,
          canonicalUrl: `${siteUrl}${cleanPath}`,
          robots: 'noindex, follow',
          bodyContent: `
            <main>
              <nav><a href="/">Home</a> &gt; <a href="/store">Spares Store</a> &gt; <span>Not Found</span></nav>
              <h1>Product Not Found (404)</h1>
              <p>The product you are looking for may have been updated, relocated, or re-categorized.</p>
              <p><a href="/store">Browse All Fiber Laser Spare Parts &amp; Optics &rarr;</a></p>
            </main>
          `,
          schemaGraph: null,
          companyName,
          siteUrl
        })
      };
    }

    const canonicalUrl = `${siteUrl}/product/${getProductSlug(product)}`;
    const brandText = product.compatibleBrands?.length ? ` for ${product.compatibleBrands.slice(0, 3).join(', ')}` : '';
    const powerText = product.powerRange ? ` (${product.powerRange})` : '';
    const skuText = product.sku ? ` [SKU: ${product.sku}]` : '';
    const title = `${product.title}${skuText}${brandText}${powerText} | ${companyName}`;
    const description = `${product.title}${skuText}${brandText}. ${product.description || 'Premium industrial fiber laser spare component with guaranteed fitment and high optical transmission.'} Same-day express dispatch from regional warehouses across India.`.slice(0, 290);
    const imageUrl = product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${siteUrl}${product.imageUrl}`) : `${siteUrl}/images/categories/protective-lenses.jpg`;

    const schemaGraph = generateSchemaGraph({
      siteUrl,
      settings: db.settings,
      pageType: 'product',
      product,
      canonicalUrl
    });

    const specsHtml = (product.specs && product.specs.length > 0)
      ? `<h2>Technical Specifications</h2>
         <ul>${product.specs.map(s => `<li>${escapeXml(s)}</li>`).join('')}</ul>`
      : '';

    const brandsHtml = (product.compatibleBrands && product.compatibleBrands.length > 0)
      ? `<p><strong>Compatible OEM Laser Heads &amp; Machines:</strong> ${product.compatibleBrands.map(b => escapeXml(b)).join(', ')}</p>`
      : '';

    const displayPrice = product.salePrice || product.regularPrice || product.estimatedPrice || 0;
    const priceHtml = db.settings.showPricing && displayPrice > 0
      ? `<p><strong>Price:</strong> &#8377;${displayPrice.toLocaleString('en-IN')} (Excl. GST)</p>`
      : `<p><strong>Pricing:</strong> Commercial B2B Quotation on Request</p>`;

    const bodyContent = `
      <main>
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> &gt; 
          <a href="/store">Spares Store</a> &gt; 
          ${product.categorySlug ? `<a href="/category/${product.categorySlug}">${escapeXml(typeof product.category === 'string' ? product.category : 'Category')}</a> &gt; ` : ''}
          <span>${escapeXml(product.title)}</span>
        </nav>
        <article>
          <h1>${escapeXml(product.title)}</h1>
          <p><strong>SKU:</strong> ${escapeXml(product.sku || product.id)} | <strong>Stock Status:</strong> ${escapeXml(product.stockStatus || 'In Stock')}</p>
          <img src="${escapeXml(imageUrl)}" alt="${escapeXml(product.title)} fiber laser spare component" width="600" height="450" />
          <p>${escapeXml(product.description || '')}</p>
          ${priceHtml}
          ${brandsHtml}
          ${specsHtml}
          <div class="cta-box">
            <h3>Need an Official Commercial Quotation?</h3>
            <p>Direct import spare parts backed by guaranteed fitment and same-day dispatch from Ahmedabad, Bengaluru, and Pune hubs.</p>
            <p><a href="https://wa.me/${(db.settings.whatsappNumber || '919902035374').replace(/\D/g, '')}?text=Hello+NK+Laser,+please+provide+a+quote+for+${encodeURIComponent(product.title)}+SKU:+${encodeURIComponent(product.sku || '')}">Inquire via WhatsApp: +91 99020 35374 &rarr;</a></p>
          </div>
        </article>
      </main>
    `;

    return {
      status: 200,
      html: wrapHtmlDoc({
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        bodyContent,
        schemaGraph,
        companyName,
        siteUrl,
        imageUrl
      })
    };
  }

  // 2. CATEGORY PAGE
  if (cleanPath.startsWith('/category/')) {
    const slug = cleanPath.replace('/category/', '').trim();
    const category = findCategoryBySlug(slug, db.categories);

    if (!category) {
      return {
        status: 404,
        html: wrapHtmlDoc({
          title: `Category Not Found (404) | ${companyName}`,
          description: `The requested fiber laser spare parts category was not found.`,
          canonicalUrl: `${siteUrl}${cleanPath}`,
          robots: 'noindex, follow',
          bodyContent: `
            <main>
              <nav><a href="/">Home</a> &gt; <a href="/store">Spares Store</a> &gt; <span>Not Found</span></nav>
              <h1>Category Not Found (404)</h1>
              <p><a href="/store">Browse All Fiber Laser Spare Parts &amp; Optics &rarr;</a></p>
            </main>
          `,
          schemaGraph: null,
          companyName,
          siteUrl
        })
      };
    }

    const canonicalUrl = `${siteUrl}/category/${category.slug}`;
    const title = `${category.name} - Fiber Laser Spares & Consumables | ${companyName}`;
    const description = `Buy ${category.name.toLowerCase()} for industrial fiber laser cutting heads. Direct importer pricing, OEM fitment guarantee, and express same-day dispatch from Ahmedabad, Bengaluru & Pune facilities.`;

    const catProducts = (db.products || []).filter(p => 
      p.categorySlug === category.slug || 
      (typeof p.category === 'string' && slugify(p.category) === slugify(category.name))
    );

    const productsListHtml = catProducts.length > 0
      ? `<h2>Available ${escapeXml(category.name)} Spares</h2>
         <div class="product-grid">
           ${catProducts.map(p => `
             <div class="product-card">
               <h3><a href="/product/${getProductSlug(p)}">${escapeXml(p.title)}</a></h3>
               <p><strong>SKU:</strong> ${escapeXml(p.sku || p.id)} | <strong>Brand Fit:</strong> ${escapeXml(p.compatibleBrands?.slice(0, 2).join(', ') || 'Universal')}</p>
               <p>${escapeXml((p.description || '').slice(0, 140))}...</p>
             </div>
           `).join('')}
         </div>`
      : `<p>Contact our technical desk for custom inquiries in this category.</p>`;

    const schemaGraph = generateSchemaGraph({
      siteUrl,
      settings: db.settings,
      pageType: 'category',
      category,
      canonicalUrl
    });

    const bodyContent = `
      <main>
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> &gt; 
          <a href="/store">Spares Store</a> &gt; 
          <span>${escapeXml(category.name)}</span>
        </nav>
        <h1>${escapeXml(category.name)}</h1>
        <p>${escapeXml(category.description || `Industrial-grade ${category.name.toLowerCase()} for high-power fiber laser machines.`)}</p>
        ${productsListHtml}
      </main>
    `;

    return {
      status: 200,
      html: wrapHtmlDoc({
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        bodyContent,
        schemaGraph,
        companyName,
        siteUrl
      })
    };
  }

  // 3. STORE / ALL CATALOG
  if (cleanPath === '/store' || cleanPath === '/catalog') {
    const canonicalUrl = `${siteUrl}/store`;
    const title = `Fiber Laser Spare Parts, Optics & Consumables Catalog | ${companyName}`;
    const description = `Browse all industrial fiber laser cutting consumables: quartz protective windows, Tellurium copper nozzles, ceramic sensor rings, and CypCut controllers. Same-day dispatch across India.`;

    const categoriesListHtml = (db.categories || []).map(c => `
      <li>
        <a href="/category/${c.slug}"><strong>${escapeXml(c.name)}</strong></a>: ${escapeXml((c.description || '').slice(0, 100))}
      </li>
    `).join('');

    const topProductsHtml = (db.products || []).slice(0, 30).map(p => `
      <li>
        <a href="/product/${getProductSlug(p)}"><strong>${escapeXml(p.title)}</strong> (SKU: ${escapeXml(p.sku || p.id)})</a>
      </li>
    `).join('');

    const schemaGraph = generateSchemaGraph({
      siteUrl,
      settings: db.settings,
      pageType: 'store',
      canonicalUrl
    });

    const bodyContent = `
      <main>
        <nav aria-label="Breadcrumb"><a href="/">Home</a> &gt; <span>Spares Catalog</span></nav>
        <h1>Fiber Laser Spare Parts &amp; Optics Catalog</h1>
        <p>${escapeXml(description)}</p>
        <h2>Product Categories</h2>
        <ul>${categoriesListHtml}</ul>
        <h2>Featured Spare Parts</h2>
        <ul>${topProductsHtml}</ul>
      </main>
    `;

    return {
      status: 200,
      html: wrapHtmlDoc({
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        bodyContent,
        schemaGraph,
        companyName,
        siteUrl
      })
    };
  }

  // 4. SERVICES
  if (cleanPath === '/services' || cleanPath.startsWith('/services/')) {
    const canonicalUrl = `${siteUrl}/services`;
    const title = `Industrial Fiber Laser Cutting & CNC Fabrication Services | ${companyName}`;
    const description = `High-power CNC fiber laser sheet metal cutting (MS up to 25mm, SS up to 20mm, Aluminum up to 16mm, Brass/Copper up to 10mm), rotary tube cutting, and press brake bending in Gujarat & Karnataka.`;

    const schemaGraph = generateSchemaGraph({
      siteUrl,
      settings: db.settings,
      pageType: 'services',
      canonicalUrl
    });

    const bodyContent = `
      <main>
        <nav aria-label="Breadcrumb"><a href="/">Home</a> &gt; <span>Services</span></nav>
        <h1>Industrial CNC Fiber Laser Cutting &amp; Fabrication Services</h1>
        <p>${escapeXml(description)}</p>
        <section>
          <h2>CNC Sheet Metal Laser Cutting Capabilities</h2>
          <table>
            <thead>
              <tr><th>Material</th><th>Max Thickness</th><th>Assist Gas</th><th>Tolerance</th></tr>
            </thead>
            <tbody>
              <tr><td>Mild Steel (MS / IS 2062)</td><td>Up to 25 mm</td><td>Oxygen (O2) / Nitrogen</td><td>&plusmn;0.05 mm</td></tr>
              <tr><td>Stainless Steel (SS304 / SS316)</td><td>Up to 20 mm</td><td>High-Pressure Nitrogen (N2)</td><td>&plusmn;0.05 mm (Burr-Free)</td></tr>
              <tr><td>Aluminum (5052 / 6061)</td><td>Up to 16 mm</td><td>Nitrogen</td><td>&plusmn;0.08 mm</td></tr>
              <tr><td>Brass &amp; Copper</td><td>Up to 10 mm</td><td>Nitrogen / High-Pressure Air</td><td>&plusmn;0.08 mm</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h2>Rotary Pipe &amp; Tube Laser Cutting</h2>
          <p>Cutting round pipes up to 220mm OD, square tubes up to 150x150mm with multi-angle miter joints, interlocking slots, and high-speed hole perforation.</p>
        </section>
      </main>
    `;

    return {
      status: 200,
      html: wrapHtmlDoc({
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        bodyContent,
        schemaGraph,
        companyName,
        siteUrl
      })
    };
  }

  // 5. REVIEWS
  if (cleanPath === '/reviews') {
    const canonicalUrl = `${siteUrl}/reviews`;
    const title = `Verified Client Reviews & B2B Testimonials | ${companyName}`;
    const description = `Read verified customer feedback from CNC laser machine operators, sheet metal fabrication units, and industrial plant owners across India trusting ${companyName}.`;

    const reviews = db.reviews || [];
    const reviewsHtml = reviews.slice(0, 20).map(r => `
      <div class="review-card">
        <h3>${escapeXml(r.author || r.reviewerName || 'Industrial Client')} &mdash; ${'&#9733;'.repeat(r.rating || 5)}</h3>
        <p><em>${escapeXml(r.role || r.company || 'CNC Fabrication Plant')} (${escapeXml(r.location || 'India')})</em></p>
        <p>&ldquo;${escapeXml(r.comment || r.text || '')}&rdquo;</p>
      </div>
    `).join('');

    const schemaGraph = generateSchemaGraph({
      siteUrl,
      settings: db.settings,
      pageType: 'reviews',
      canonicalUrl
    });

    const bodyContent = `
      <main>
        <nav aria-label="Breadcrumb"><a href="/">Home</a> &gt; <span>Reviews</span></nav>
        <h1>Client Reviews &amp; Testimonials</h1>
        <p>${escapeXml(description)}</p>
        <div class="reviews-container">${reviewsHtml}</div>
      </main>
    `;

    return {
      status: 200,
      html: wrapHtmlDoc({
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        bodyContent,
        schemaGraph,
        companyName,
        siteUrl
      })
    };
  }

  // 6. CONTACT & WAREHOUSES
  if (cleanPath === '/contact') {
    const canonicalUrl = `${siteUrl}/contact`;
    const title = `Contact & Regional Warehouse Facilities | ${companyName}`;
    const description = `Contact ${companyName} for technical spares support, RFQs, and dispatch inquiries. Facilities in Ahmedabad (Gujarat), Bengaluru (Karnataka), and Pune (Maharashtra).`;

    const addressesHtml = (db.settings.addresses || []).map(addr => `
      <div class="warehouse-box">
        <h3>${escapeXml(addr.title)} ${addr.isPrimary ? '(HQ)' : ''}</h3>
        <p>${escapeXml(addr.addressLine)}, ${escapeXml(addr.cityState)} &mdash; PIN: ${escapeXml(addr.pincode)}</p>
        <p><strong>Phone:</strong> ${escapeXml(addr.phone || db.settings.phone || '+91 99020 35374')}</p>
      </div>
    `).join('');

    const schemaGraph = generateSchemaGraph({
      siteUrl,
      settings: db.settings,
      pageType: 'contact',
      canonicalUrl
    });

    const bodyContent = `
      <main>
        <nav aria-label="Breadcrumb"><a href="/">Home</a> &gt; <span>Contact</span></nav>
        <h1>Contact &amp; Warehouse Dispatch Hubs</h1>
        <p>${escapeXml(description)}</p>
        <div class="warehouses">${addressesHtml}</div>
        <div class="contact-details">
          <h2>Direct Inquiries</h2>
          <p><strong>WhatsApp &amp; Phone:</strong> +91 99020 35374</p>
          <p><strong>Email:</strong> ${escapeXml(db.settings.email || 'nklaser33@gmail.com')}</p>
        </div>
      </main>
    `;

    return {
      status: 200,
      html: wrapHtmlDoc({
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        bodyContent,
        schemaGraph,
        companyName,
        siteUrl
      })
    };
  }

  // 7. HOMEPAGE (Default fallback for /)
  if (cleanPath === '/' || cleanPath === '') {
    const canonicalUrl = `${siteUrl}/`;
    const title = `${companyName} | Fiber Laser Cutting Services, Industrial Spares & Optics`;
    const description = `${companyName} is an industrial direct importer of fiber laser cutting spares: RayTools/OSPRI cutting heads, quartz protective lenses, Tellurium copper nozzles, ceramic rings, and CNC controllers.`;

    const categoriesHtml = (db.categories || []).map(c => `
      <li><a href="/category/${c.slug}"><strong>${escapeXml(c.name)}</strong></a>: ${escapeXml((c.description || '').slice(0, 90))}</li>
    `).join('');

    const featuredSparesHtml = (db.products || []).slice(0, 12).map(p => `
      <li><a href="/product/${getProductSlug(p)}"><strong>${escapeXml(p.title)}</strong> (SKU: ${escapeXml(p.sku || p.id)})</a></li>
    `).join('');

    const faqsHtml = SITE_FAQS.map(faq => `
      <div class="faq-item">
        <h3>${escapeXml(faq.question)}</h3>
        <p>${escapeXml(faq.answer)}</p>
      </div>
    `).join('');

    const schemaGraph = generateSchemaGraph({
      siteUrl,
      settings: db.settings,
      pageType: 'home',
      canonicalUrl
    });

    const bodyContent = `
      <main>
        <h1>${escapeXml(companyName)} &mdash; Fiber Laser Consumables, Optics &amp; Fabrication</h1>
        <p class="lead">${escapeXml(description)}</p>
        
        <section>
          <h2>Fiber Laser Consumables &amp; Spares Taxonomy</h2>
          <ul>${categoriesHtml}</ul>
          <p><a href="/store">View Complete Fiber Laser Spares Catalog &rarr;</a></p>
        </section>

        <section>
          <h2>Popular Spare Parts In Stock</h2>
          <ul>${featuredSparesHtml}</ul>
        </section>

        <section>
          <h2>Precision Laser Cutting &amp; Fabrication Services</h2>
          <p>Mild Steel up to 25mm, Stainless Steel up to 20mm with nitrogen assist gas, Aluminum up to 16mm, and Brass/Copper up to 10mm. <a href="/services">Read detailed engineering specifications &rarr;</a></p>
        </section>

        <section>
          <h2>Regional Warehouses &amp; Express Dispatch</h2>
          <p>Operating facilities in Ahmedabad (Gujarat HQ), Peenya Bengaluru (Karnataka), and Bhosari Pune (Maharashtra) ensuring 24-48 hour arrival across India.</p>
          <p><a href="/contact">View warehouse addresses &amp; contact details &rarr;</a></p>
        </section>

        <section>
          <h2>Frequently Asked Questions (FAQ)</h2>
          ${faqsHtml}
        </section>
      </main>
    `;

    return {
      status: 200,
      html: wrapHtmlDoc({
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        bodyContent,
        schemaGraph,
        companyName,
        siteUrl
      })
    };
  }

  return null;
}

/**
 * Wraps HTML body content into a complete, clean, SEO-optimized document
 */
function wrapHtmlDoc(options: {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  bodyContent: string;
  schemaGraph: any;
  companyName: string;
  siteUrl: string;
  imageUrl?: string;
}): string {
  const { title, description, canonicalUrl, robots, bodyContent, schemaGraph, companyName, siteUrl, imageUrl } = options;
  const ogImg = imageUrl || `${siteUrl}/images/categories/protective-lenses.jpg`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeXml(title)}</title>
  <meta name="description" content="${escapeXml(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${escapeXml(canonicalUrl)}" />

  <!-- Open Graph / Social Protocol -->
  <meta property="og:site_name" content="${escapeXml(companyName)}" />
  <meta property="og:title" content="${escapeXml(title)}" />
  <meta property="og:description" content="${escapeXml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeXml(canonicalUrl)}" />
  <meta property="og:image" content="${escapeXml(ogImg)}" />

  <!-- Twitter Protocol -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeXml(title)}" />
  <meta name="twitter:description" content="${escapeXml(description)}" />
  <meta name="twitter:image" content="${escapeXml(ogImg)}" />

  <link rel="icon" type="image/svg+xml" href="/images/logo/nk-laser-logo.svg" />

  ${schemaGraph ? `<script type="application/ld+json">\n${JSON.stringify(schemaGraph, null, 2)}\n  </script>` : ''}

  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #18181b; max-width: 960px; margin: 0 auto; padding: 24px 16px; background: #fafafa; }
    header { border-bottom: 2px solid #e4e4e7; padding-bottom: 16px; margin-bottom: 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
    header a.brand { font-size: 1.35rem; font-weight: 800; color: #f59e0b; text-decoration: none; text-transform: uppercase; }
    nav a { color: #27272a; text-decoration: none; margin-right: 14px; font-weight: 600; font-size: 0.95rem; }
    nav a:hover { color: #f59e0b; text-decoration: underline; }
    h1 { color: #09090b; font-size: 1.85rem; margin-top: 0; line-height: 1.25; }
    h2 { color: #18181b; font-size: 1.35rem; margin-top: 2rem; border-bottom: 1px solid #e4e4e7; padding-bottom: 6px; }
    h3 { font-size: 1.1rem; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #ffffff; }
    th, td { border: 1px solid #e4e4e7; padding: 10px 12px; text-align: left; }
    th { background: #f4f4f5; }
    img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e4e4e7; margin: 12px 0; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin: 16px 0; }
    .product-card, .warehouse-box, .review-card, .cta-box { background: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; }
    .cta-box { background: #fffbeb; border-color: #fde68a; margin: 24px 0; }
    .cta-box a { color: #b45309; font-weight: 700; font-size: 1.05rem; }
    footer { border-top: 1px solid #e4e4e7; margin-top: 48px; padding-top: 20px; font-size: 0.85rem; color: #71717a; text-align: center; }
  </style>
</head>
<body>
  <header>
    <a href="/" class="brand">${escapeXml(companyName)}</a>
    <nav>
      <a href="/">Home</a>
      <a href="/store">Spares Catalog</a>
      <a href="/services">Services</a>
      <a href="/reviews">Reviews</a>
      <a href="/contact">Warehouses &amp; Contact</a>
      <a href="/llms.txt">LLMs Documentation</a>
    </nav>
  </header>

  ${bodyContent}

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeXml(companyName)}. All rights reserved. | <a href="/sitemap.xml">XML Sitemap</a> | <a href="/robots.txt">Robots.txt</a> | <a href="/llms.txt">LLMs API</a></p>
    <p>Central HQ: Plot No. 42, GIDC Industrial Area, Sector 3, Gujarat, India | WhatsApp: +91 99020 35374</p>
  </footer>
</body>
</html>`;
}
