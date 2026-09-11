/**
 * Cloudflare Pages Function: Edge Dynamic SSR Pre-Renderer for Bots & Crawlers
 * This function intercepts requests at Cloudflare's 300+ Edge locations.
 * - For Googlebot, Bingbot, Social & AI scrapers: Returns pre-rendered HTML with full Schema.org JSON-LD & meta tags.
 * - For human visitors: Calls context.next(), serving the ultra-fast Vite SPA.
 */

import { BOT_UA_REGEX } from '../server-seo';
import { DEFAULT_SITE_SETTINGS } from '../src/lib/storage';
import { ProductItem, ProductCategoryDef } from '../src/types';
import { slugify, getProductSlug, findProductBySlug, findCategoryBySlug, SITE_FAQS, generateSchemaGraph } from '../src/utils/seo';

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
  env: {
    DB?: any; // Cloudflare D1 database binding if provisioned
    [key: string]: any;
  };
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Pass through static files, images, and API requests directly to Pages static assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/') ||
    pathname.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)$/i)
  ) {
    return next();
  }

  // 2. Check if request is from a search crawler or bot
  const isBot = BOT_UA_REGEX.test(userAgent) || url.searchParams.get('bot') === '1';

  // 3. Human users: serve the Vite SPA bundle
  if (!isBot) {
    return next();
  }

  // 4. Bot request: Fetch latest data directly from Cloudflare D1 database
  let products: ProductItem[] = [];
  let categories: ProductCategoryDef[] = [];
  let settings = DEFAULT_SITE_SETTINGS;

  if (env.DB) {
    try {
      const dbSettings = await env.DB.prepare('SELECT value FROM config WHERE key = "settings"').first();
      if (dbSettings && dbSettings.value) settings = JSON.parse(dbSettings.value);

      const dbProducts = await env.DB.prepare('SELECT value FROM config WHERE key = "products"').first();
      if (dbProducts && dbProducts.value) products = JSON.parse(dbProducts.value);

      const dbCategories = await env.DB.prepare('SELECT value FROM config WHERE key = "categories"').first();
      if (dbCategories && dbCategories.value) categories = JSON.parse(dbCategories.value);
    } catch (e) {
      // Graceful fallback to embedded seed data
    }
  }

  const siteUrl = `${url.protocol}//${url.host}`;
  const companyName = settings.businessName || 'NK Laser Spares & Optics';
  const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';

  // PRODUCT DETAIL PAGE
  if (cleanPath.startsWith('/product/')) {
    const slug = cleanPath.replace('/product/', '').trim();
    const product = findProductBySlug(slug, products);

    if (!product) {
      return new Response(`<!DOCTYPE html><html><head><title>Product Not Found | ${companyName}</title><meta name="robots" content="noindex, follow"></head><body><h1>Product Not Found (404)</h1><p><a href="/store">Browse All Products</a></p></body></html>`, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const canonicalUrl = `${siteUrl}/product/${getProductSlug(product)}`;
    const brandText = product.compatibleBrands?.length ? ` for ${product.compatibleBrands.slice(0, 3).join(', ')}` : '';
    const title = `${product.title} [SKU: ${product.sku || product.id}]${brandText} | ${companyName}`;
    const description = `${product.title}. ${product.description || 'Premium industrial fiber laser spare component with guaranteed fitment.'} Same-day express dispatch from Ahmedabad, Bengaluru & Pune.`.slice(0, 280);
    const schema = generateSchemaGraph({ siteUrl, settings, pageType: 'product', product, canonicalUrl });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title><meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
  <meta property="og:image" content="${product.imageUrl || `${siteUrl}/images/categories/protective-lenses.jpg`}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <header><a href="/"><strong>${companyName}</strong></a> | <a href="/store">Spares Catalog</a> | <a href="/contact">Contact</a></header>
  <main>
    <h1>${product.title}</h1>
    <p><strong>SKU:</strong> ${product.sku || product.id} | <strong>Status:</strong> ${product.stockStatus || 'In Stock'}</p>
    <img src="${product.imageUrl}" alt="${product.title} fiber laser spare" width="500">
    <p>${product.description || ''}</p>
    ${product.specs && product.specs.length ? `<h2>Specifications</h2><ul>${product.specs.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
    <p><a href="https://wa.me/919902035374?text=Quote+request+for+${encodeURIComponent(product.title)}">Request Quote via WhatsApp (+91 99020 35374)</a></p>
  </main>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Rendered-By': 'Cloudflare-Pages-Edge-SSR'
      }
    });
  }

  // CATEGORY PAGE
  if (cleanPath.startsWith('/category/')) {
    const catSlug = cleanPath.replace('/category/', '').trim();
    const cat = findCategoryBySlug(catSlug, categories);
    if (!cat) {
      return new Response(`<!DOCTYPE html><html><head><title>Category Not Found | ${companyName}</title></head><body><h1>Category Not Found</h1></body></html>`, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const canonicalUrl = `${siteUrl}/category/${cat.slug}`;
    const title = `${cat.name} - Fiber Laser Spares | ${companyName}`;
    const description = `Buy ${cat.name.toLowerCase()} for fiber laser cutting heads. Direct importer pricing and express dispatch.`;
    const catProducts = products.filter(p => p.categorySlug === cat.slug);
    const schema = generateSchemaGraph({ siteUrl, settings, pageType: 'category', category: cat, canonicalUrl });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonicalUrl}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <header><a href="/"><strong>${companyName}</strong></a> | <a href="/store">Store</a></header>
  <main>
    <h1>${cat.name}</h1>
    <p>${cat.description || ''}</p>
    <ul>${catProducts.map(p => `<li><a href="/product/${getProductSlug(p)}">${p.title} (SKU: ${p.sku})</a></li>`).join('')}</ul>
  </main>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Rendered-By': 'Cloudflare-Pages-Edge-SSR'
      }
    });
  }

  // Fallback to next handler for other pages
  return next();
}
