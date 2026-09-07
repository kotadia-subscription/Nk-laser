import { ProductItem, ProductTemplateId, ProductTemplateLogoPreset } from '../../../types';
import { ProductSpec } from './types';

/**
 * Built-in High-Resolution SVG Logo presets for templates.
 * These are optimized for dark navy, carbon, and blueprint backgrounds
 * and operate 100% independently from site settings!
 */
export const TEMPLATE_LOGO_PRESETS: Record<
  Exclude<ProductTemplateLogoPreset, 'custom'>,
  { name: string; description: string; svgDataUri: string }
> = {
  'official-badge': {
    name: 'NK Laser 3D Chrome & Ruby (Official Default)',
    description: '3D metallic white & chrome emblem with laser sparkle burst and 3D ruby red L-mark',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="70 80 420 280" width="420" height="280">
        <defs>
          <linearGradient id="nklMetallicWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="35%" stop-color="#F4F6F9" />
            <stop offset="70%" stop-color="#E2E7EF" />
            <stop offset="100%" stop-color="#CCD5E2" />
          </linearGradient>
          <linearGradient id="nklMetallicHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#DCE4EE" stop-opacity="0.2" />
          </linearGradient>
          <linearGradient id="nklMetallicShade" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#BAC5D5" />
            <stop offset="60%" stop-color="#DCE3EC" />
            <stop offset="100%" stop-color="#F8FAFD" />
          </linearGradient>
          <linearGradient id="nklRubyFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF2442" />
            <stop offset="40%" stop-color="#EE0D2B" />
            <stop offset="85%" stop-color="#C5001A" />
            <stop offset="100%" stop-color="#9C0012" />
          </linearGradient>
          <linearGradient id="nklRubyBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#C5001A" />
            <stop offset="50%" stop-color="#8F0010" />
            <stop offset="100%" stop-color="#600008" />
          </linearGradient>
          <linearGradient id="nklRubyHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFA4B0" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#FF2644" stop-opacity="0" />
          </linearGradient>
          <radialGradient id="laserGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FF002B" stop-opacity="0.95" />
            <stop offset="25%" stop-color="#FF1E3C" stop-opacity="0.75" />
            <stop offset="55%" stop-color="#FF1E3C" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#FF1E3C" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="laserStreak" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FF1E3C" stop-opacity="0" />
            <stop offset="35%" stop-color="#FF3855" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="65%" stop-color="#FF3855" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#FF1E3C" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="laserStreakVert" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FF1E3C" stop-opacity="0" />
            <stop offset="35%" stop-color="#FF3855" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="65%" stop-color="#FF3855" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#FF1E3C" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="nklWordmarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="45%" stop-color="#F2F5F8" />
            <stop offset="70%" stop-color="#D5DFEC" />
            <stop offset="100%" stop-color="#B0BFD2" />
          </linearGradient>
          <linearGradient id="beamLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
            <stop offset="20%" stop-color="#CAD5E4" stop-opacity="0.4" />
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.9" />
            <stop offset="80%" stop-color="#CAD5E4" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
          </linearGradient>
          <filter id="nklShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#020914" flood-opacity="0.5" />
          </filter>
        </defs>
        <g filter="url(#nklShadow)">
          <g id="letters-nk">
            <path fill="#8A9BB3" opacity="0.3" transform="translate(0, 3)" d="M 233,119 231,126 231,289 264,288 265,224 270,225 320,289 361,289 362,286 302,211 299,202 367,126 370,119 326,119 269,185 264,184 264,119 Z M 221,119 191,119 190,205 183,203 112,122 106,120 106,287 108,289 135,288 136,208 140,208 212,289 222,288 Z"/>
            <path fill="url(#nklMetallicWhite)" d="M 233,119 231,126 231,289 264,288 265,224 270,225 320,289 361,289 362,286 302,211 299,202 367,126 370,119 326,119 269,185 264,184 264,119 Z M 221,119 191,119 190,205 183,203 112,122 106,120 106,287 108,289 135,288 136,208 140,208 212,289 222,288 Z"/>
            <path fill="url(#nklMetallicShade)" opacity="0.5" d="M 106,120 L 135,208 L 135,288 L 108,289 Z" />
            <path fill="url(#nklMetallicShade)" opacity="0.4" d="M 112,122 L 183,203 L 212,289 L 191,289 Z" />
            <path fill="url(#nklMetallicHighlight)" opacity="0.65" d="M 269,185 L 367,126 L 370,119 L 326,119 L 264,184 Z" />
            <path fill="url(#nklMetallicShade)" opacity="0.5" d="M 270,225 L 320,289 L 361,289 L 302,211 Z" />
            <path fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" d="M 106,120 L 191,119 L 221,119 M 233,119 L 264,119 M 326,119 L 370,119" />
          </g>
          <g id="letter-l">
            <path fill="#550009" opacity="0.4" transform="translate(0, 3)" d="M 375,119 348,150 348,254 376,289 458,289 458,257 382,256 382,119 Z"/>
            <path fill="url(#nklRubyBevel)" d="M 375,119 348,150 348,254 376,289 382,256 382,119 Z" />
            <path fill="url(#nklRubyFront)" d="M 375,119 L 416,119 L 416,256 L 458,257 L 458,289 L 376,289 L 382,256 L 382,119 Z" />
            <polygon fill="#B80018" points="440,257 458,257 446,289 428,289" opacity="0.4" />
            <path fill="none" stroke="url(#nklRubyHighlight)" stroke-width="2.2" stroke-linecap="round" d="M 375,119 L 416,119 L 416,256 L 458,257" />
          </g>
          <g id="laser-spark" transform="translate(202, 204)">
            <circle cx="0" cy="0" r="48" fill="url(#laserGlow)" />
            <ellipse cx="0" cy="0" rx="65" ry="3.5" fill="url(#laserStreak)" />
            <ellipse cx="0" cy="0" rx="3.5" ry="32" fill="url(#laserStreakVert)" />
            <path fill="#FF1E3C" d="M 0,-24 Q 0,0 -24,0 Q 0,0 0,24 Q 0,0 24,0 Q 0,0 0,-24 Z" />
            <path fill="#FFFFFF" d="M 0,-18 Q 0,0 -18,0 Q 0,0 0,18 Q 0,0 18,0 Q 0,0 0,-18 Z" />
            <circle cx="0" cy="0" r="3.2" fill="#FFFFFF" />
          </g>
          <g id="wordmark">
            <text x="282" y="337" text-anchor="middle" fill="#5F7088" opacity="0.5" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="22" letter-spacing="11">NK LASER</text>
            <text x="282" y="335" text-anchor="middle" fill="url(#nklWordmarkGrad)" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="22" letter-spacing="11">NK LASER</text>
          </g>
          <g id="bottom-beam" transform="translate(0, 350)">
            <line x1="140" y1="0" x2="424" y2="0" stroke="url(#beamLineGrad)" stroke-width="1.8" />
            <g transform="translate(282, 0)">
              <circle cx="0" cy="0" r="14" fill="url(#laserGlow)" opacity="0.8" />
              <path fill="#FF1E3C" d="M 0,-8 Q 0,0 -8,0 Q 0,0 0,8 Q 0,0 8,0 Q 0,0 0,-8 Z" />
              <path fill="#FFFFFF" d="M 0,-5 Q 0,0 -5,0 Q 0,0 0,5 Q 0,0 5,0 Q 0,0 0,-5 Z" />
            </g>
          </g>
        </g>
      </svg>
    `)}`
  },
  'white-minimal': {
    name: 'NK Laser Pure White (Clean Vector)',
    description: 'Crisp monochrome white vector emblem for ultra-clean look',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="98 111 368 236" width="368" height="236">
        <g>
          <path fill="#FFFFFF" opacity="0.96" d="M 233,119 231,126 231,289 264,288 265,224 270,225 320,289 361,289 362,286 302,211 299,202 367,126 370,119 326,119 269,185 264,184 264,119 Z M 221,119 191,119 190,205 183,203 112,122 106,120 106,287 108,289 135,288 136,208 140,208 212,289 222,288 Z"/>
          <path fill="#FFFFFF" opacity="0.96" d="M 375,119 348,150 348,254 376,289 458,289 458,257 382,256 382,119 Z"/>
          <text x="282" y="336" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, 'Inter', sans-serif" font-weight="800" font-size="20" letter-spacing="9">NK LASER</text>
        </g>
      </svg>
    `)}`
  },
  'red-accent': {
    name: 'NK Laser Precision Red (Vibrant Accent)',
    description: 'Laser Red focus emblem with chrome silver details',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="98 111 368 236" width="368" height="236">
        <g>
          <path fill="#5DA0EC" d="M 233,119 231,126 231,289 264,288 265,224 270,225 320,289 361,289 362,286 302,211 299,202 367,126 370,119 326,119 269,185 264,184 264,119 Z M 221,119 191,119 190,205 183,203 112,122 106,120 106,287 108,289 135,288 136,208 140,208 212,289 222,288 Z"/>
          <path fill="#FF1634" d="M 375,119 348,150 348,254 376,289 458,289 458,257 382,256 382,119 Z"/>
          <text x="282" y="336" text-anchor="middle" fill="#EDF3FA" font-family="system-ui, -apple-system, 'Inter', sans-serif" font-weight="900" font-size="21" letter-spacing="9">NK LASER</text>
        </g>
      </svg>
    `)}`
  }
};

/**
 * Metadata for the 5 distinct template styles + Raw photo option
 */
export const TEMPLATE_DEFINITIONS: Array<{
  id: ProductTemplateId;
  name: string;
  badge: string;
  description: string;
  features: string[];
}> = [
  {
    id: 'none',
    name: 'Standard Raw Photo',
    badge: 'Standard',
    description: 'Show original product photo as uploaded, without any branding frame.',
    features: ['Original image view', 'No overlay frames', 'Classic ecommerce card']
  },
  {
    id: 'simple',
    name: 'Classic Centered Showcase',
    badge: 'Popular',
    description: 'Centered large product photo with top brand logo, title bar, and website footer.',
    features: ['Large centered photo frame', 'Dashed border inset', 'Direct brand logo & tagline']
  },
  {
    id: 'specs',
    name: 'Industrial Two-Column Specs',
    badge: 'Detailed',
    description: 'Two-column layout: product photo on left, technical specifications list on right.',
    features: ['4-Row technical specs panel', 'Diameter, Height, Power & Qty icons', 'Engineering datasheet look']
  },
  {
    id: 'badge-hero',
    name: 'OEM Fitment & Power Hero',
    badge: 'OEM Focus',
    description: 'High-impact product stage with prominent OEM brand badge and laser crosshairs.',
    features: ['Floating OEM brand pill', 'Optical crosshair reticles', 'Floating specs chip strip']
  },
  {
    id: 'dark-carbon',
    name: 'Dark Carbon Precision Frame',
    badge: 'High-Tech',
    description: 'Deep graphite carbon texture with millimeter scale markings and red focus accent.',
    features: ['Carbon weave texture', 'Millimeter ruler borders', 'High-contrast laser red bar']
  },
  {
    id: 'blueprint',
    name: 'Laser Engineering Blueprint',
    badge: 'CAD Blueprint',
    description: 'Schematic technical blueprint grid with CAD dimension leader lines and substrate specs.',
    features: ['Laser CAD grid backdrop', 'Dimension leader markers', 'Engineering monospaced callouts']
  }
];

/**
 * Extracts sensible default technical specs from a ProductItem
 */
export function extractDefaultSpecsFromProduct(product: Partial<ProductItem>): ProductSpec[] {
  // 1. Diameter or Dimensions
  let diameterVal = '';
  if (product.dimensions) {
    diameterVal = product.dimensions.replace(/^(Dia|Diameter|D)[:\s]*/i, '').split(/[xX,]/)[0]?.trim() || product.dimensions;
  }
  if (!diameterVal && product.title) {
    const match = product.title.match(/(?:D|Dia|Ø|Diameter)\s*([0-9.]+\s*mm)/i);
    if (match) diameterVal = match[1];
  }

  // 2. Height or Thickness
  let heightVal = product.thickness || '';
  if (product.dimensions && product.dimensions.includes('x')) {
    const parts = product.dimensions.split(/[xX]/);
    if (parts[1]) heightVal = parts[1].trim();
  }

  // 3. Power
  const powerVal = product.powerRange || '1kW - 6kW';

  // 4. Qty or Fitment
  const qtyVal = product.moq ? `${product.moq} pc` : (product.brand ? `${product.brand} OEM` : '1 pc');

  return [
    { label: 'Diameter', value: diameterVal || 'Standard', icon: 'diameter' },
    { label: 'Height', value: heightVal || 'Standard', icon: 'height' },
    { label: 'Power', value: powerVal, icon: 'power' },
    { label: 'Qty', value: qtyVal, icon: 'qty' },
  ];
}

/**
 * Resolves the logo source string from templateConfig, checking site-wide custom presets first.
 */
export function resolveTemplateLogoSrc(
  config?: {
    logoPreset?: ProductTemplateLogoPreset;
    logoSrc?: string;
  },
  sitePresetLogos?: Record<string, string | undefined>
): string {
  if (config?.logoPreset === 'custom') {
    if (config?.logoSrc) return config.logoSrc;
    if (sitePresetLogos?.custom) return sitePresetLogos.custom;
    return TEMPLATE_LOGO_PRESETS['official-badge'].svgDataUri;
  }
  
  if (config?.logoPreset) {
    // Check if user set a custom file for this preset in Site Settings
    if (sitePresetLogos && sitePresetLogos[config.logoPreset]) {
      return sitePresetLogos[config.logoPreset]!;
    }
    if (config.logoPreset in TEMPLATE_LOGO_PRESETS) {
      return TEMPLATE_LOGO_PRESETS[config.logoPreset as keyof typeof TEMPLATE_LOGO_PRESETS].svgDataUri;
    }
  }

  if (config?.logoSrc) {
    return config.logoSrc;
  }

  // Default to official badge (or site customized official badge)
  if (sitePresetLogos?.['official-badge']) {
    return sitePresetLogos['official-badge']!;
  }
  return TEMPLATE_LOGO_PRESETS['official-badge'].svgDataUri;
}

/**
 * Returns effective meta information and rendered URL for a logo preset
 */
export function getEffectivePresetLogoInfo(
  preset: ProductTemplateLogoPreset,
  sitePresetLogos?: Record<string, string | undefined>
): { name: string; description: string; url: string; isCustomized: boolean } {
  const isCustom = preset === 'custom';
  const customUrl = sitePresetLogos?.[preset];

  if (isCustom) {
    return {
      name: 'Custom Product Logo / Upload',
      description: customUrl ? 'Using site-managed custom logo preset (or upload per-product)' : 'Upload image file or paste direct CDN URL',
      url: customUrl || '',
      isCustomized: Boolean(customUrl)
    };
  }

  const defaultMeta = TEMPLATE_LOGO_PRESETS[preset as keyof typeof TEMPLATE_LOGO_PRESETS];
  return {
    name: defaultMeta?.name || preset,
    description: customUrl ? 'Custom logo file loaded from Site Settings' : (defaultMeta?.description || ''),
    url: customUrl || defaultMeta?.svgDataUri || '',
    isCustomized: Boolean(customUrl)
  };
}
