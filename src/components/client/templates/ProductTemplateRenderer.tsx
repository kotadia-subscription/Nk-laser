import React from 'react';
import { ProductItem, ProductTemplateConfig, SiteSettings } from '../../../types';
import { resolveTemplateLogoSrc, extractDefaultSpecsFromProduct } from './templatePresets';
import { loadSiteSettings } from '../../../lib/storage';
import type { NKLaserTemplateProps } from './types';
import ProductTemplateSimple from './ProductTemplateSimple';
import ProductTemplateWithSpecs from './ProductTemplateWithSpecs';
import ProductTemplateBadgeHero from './ProductTemplateBadgeHero';
import ProductTemplateDarkCarbon from './ProductTemplateDarkCarbon';
import ProductTemplateBlueprint from './ProductTemplateBlueprint';

interface ProductTemplateRendererProps {
  product: Partial<ProductItem>;
  templateConfig?: ProductTemplateConfig;
  settings?: SiteSettings;
  mode?: 'detail' | 'card' | 'thumbnail' | 'preview';
  className?: string;
  imgClassName?: string;
  allowRawToggle?: boolean;
  onSelectProduct?: () => void;
}

export const ProductTemplateRenderer: React.FC<ProductTemplateRendererProps> = ({
  product,
  templateConfig,
  settings,
  mode = 'card',
  className = '',
  imgClassName = '',
  onSelectProduct
}) => {
  // Active configuration (custom prop or stored on product)
  const config = templateConfig || product.templateConfig;
  // On client side, always render a branded photo template (default to 'simple' if not specified or 'none')
  const templateId = (config?.templateId && config.templateId !== 'none')
    ? config.templateId
    : (mode === 'preview' && config?.templateId === 'none' ? 'none' : 'simple');

  const rawImage = product.imageUrl || (product as any)?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

  // Only in admin preview if explicitly chosen 'none'
  if (templateId === 'none') {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
        <img
          src={rawImage}
          alt={product.title || 'Product Photo'}
          className={`max-w-full max-h-full object-contain ${imgClassName}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>
    );
  }

  // Resolve template properties
  const siteSettings = settings || loadSiteSettings();
  const logoSrc = resolveTemplateLogoSrc(config, siteSettings?.templateLogoPresets);
  const sizeText = config?.sizeText || product.dimensions || product.thickness || '';
  const website = config?.websiteText || 'WWW.NKLASER.IN';
  const footerTagline = config?.footerTagline || 'IDEAS SHAPED WITH LASER';
  const specs = config?.specs && config.specs.length > 0 ? config.specs : extractDefaultSpecsFromProduct(product);

  const commonProps: NKLaserTemplateProps = {
    logoSrc,
    logoAlt: config?.logoAlt || 'NK Laser',
    productName: product.title || 'Fiber Laser Spare',
    size: sizeText,
    productImageSrc: rawImage,
    productImageAlt: product.title || 'Product',
    website,
    footerTagline,
    className,
    specs,
    sku: product.sku || 'NK-SPARE',
    brand: product.brand || 'OEM Compatible',
    material: product.material || 'Fused Quartz',
    powerRange: product.powerRange || '1kW - 30kW',
    mode: mode as NKLaserTemplateProps['mode']
  };

  const renderSelectedTemplate = () => {
    switch (templateId) {
      case 'simple':
        return <ProductTemplateSimple {...commonProps} />;
      case 'specs':
        return <ProductTemplateWithSpecs {...commonProps} />;
      case 'badge-hero':
        return <ProductTemplateBadgeHero {...commonProps} />;
      case 'dark-carbon':
        return <ProductTemplateDarkCarbon {...commonProps} />;
      case 'blueprint':
        return <ProductTemplateBlueprint {...commonProps} />;
      default:
        return <ProductTemplateSimple {...commonProps} />;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {renderSelectedTemplate()}
    </div>
  );
};
