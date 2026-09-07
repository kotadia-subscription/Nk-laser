import type { ProductTemplateSpecItem } from '../../../types';

export type ProductSpec = ProductTemplateSpecItem;

export interface NKLaserTemplateProps {
  /** Logo URL / data-uri / SVG for template (isolated from site settings) */
  logoSrc?: string;
  logoAlt?: string;

  /** Product title */
  productName?: string;
  
  /** Size / dimension callout (e.g. "Ø 32 mm", "D27.9 T4.1") */
  size?: string;

  /** Product photo image URL */
  productImageSrc?: string;
  productImageAlt?: string;

  /** Footer display texts */
  website?: string;
  footerTagline?: string;

  /** Class name override */
  className?: string;

  /** Specification items */
  specs?: ProductSpec[];

  /** Additional product attributes for advanced templates */
  sku?: string;
  brand?: string;
  material?: string;
  powerRange?: string;
  wavelength?: string;
  stockStatus?: string;

  /** Render mode: detail (full resolution), card (grid thumbnail), preview (modal) */
  mode?: 'detail' | 'card' | 'thumbnail' | 'preview';
}
