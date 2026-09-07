import React from 'react';
import type { NKLaserTemplateProps, ProductSpec } from './types';
import './product-template.css';

const Icon = ({ type = 'generic' }: { type?: ProductSpec['icon'] }) => {
  const common = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (type) {
    case 'diameter':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M5.3 18.7 18.7 5.3" />
        </svg>
      );
    case 'height':
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="m8.5 6 3.5-3 3.5 3" />
          <path d="m8.5 18 3.5 3 3.5-3" />
        </svg>
      );
    case 'power':
      return (
        <svg {...common}>
          <path d="m13 2-8 12h6l-1 8 9-13h-6z" />
        </svg>
      );
    case 'qty':
      return (
        <svg {...common}>
          <path d="m12 3 7 4-7 4-7-4 7-4Z" />
          <path d="m5 7 7 4 7-4" />
          <path d="M5 7v9l7 5 7-5V7" />
          <path d="M12 11v10" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M9 12h6" />
        </svg>
      );
  }
};

const defaultSpecs: ProductSpec[] = [
  { label: 'Diameter', value: '32 mm', icon: 'diameter' },
  { label: 'Height', value: '15 mm', icon: 'height' },
  { label: 'Power', value: '6 kW', icon: 'power' },
  { label: 'Qty', value: '1 pc', icon: 'qty' },
];

export default function ProductTemplateWithSpecs({
  logoSrc,
  logoAlt = 'NK Laser',
  productName = 'Product Name',
  size = '',
  productImageSrc,
  productImageAlt = 'Product',
  website = 'WWW.NKLASER.IN',
  footerTagline = 'IDEAS SHAPED WITH LASER',
  className = '',
  specs = defaultSpecs,
  mode = 'detail'
}: NKLaserTemplateProps) {
  const title = [productName, size].filter(Boolean).join(' : ');
  const displaySpecs = specs && specs.length > 0 ? specs : defaultSpecs;

  return (
    <div className={`nkl-card-container ${mode === 'card' ? 'nkl-container--card' : ''} ${mode === 'thumbnail' ? 'nkl-container--thumb' : ''}`}>
      <section className={`nkl-card nkl-card--with-specs ${mode === 'thumbnail' ? 'nkl-card--thumbnail-mode' : mode === 'card' ? 'nkl-card--card-mode' : ''} ${className}`}>
        <div className="nkl-bg-shape nkl-bg-shape--left" />
        <div className="nkl-bg-shape nkl-bg-shape--right" />

        <header className="nkl-header">
          <img className="nkl-logo" src={logoSrc} alt={logoAlt} />
        </header>

        <main className="nkl-content nkl-content--two-col">
          <div className="nkl-product-panel">
            <div className="nkl-title-bar">
              <span className="nkl-red-mark" />
              <h1 title={title}>{title}</h1>
            </div>

            <div className="nkl-image-card">
              {productImageSrc ? (
                <img
                  className="nkl-product-image"
                  src={productImageSrc}
                  alt={productImageAlt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              ) : (
                <div className="nkl-placeholder">
                  <div className="nkl-placeholder-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64">
                      <rect x="8" y="11" width="48" height="42" rx="4" />
                      <circle cx="42" cy="25" r="5" />
                      <path d="m14 47 13-14 10 9 7-8 12 13" />
                    </svg>
                  </div>
                  <div className="nkl-placeholder-title">Product Photo</div>
                  <div className="nkl-placeholder-subtitle">Add product image here</div>
                </div>
              )}
            </div>
          </div>

          <aside className="nkl-spec-panel">
            <div className="nkl-section-title">
              <span className="nkl-red-mark" />
              <h2>SPECIFICATIONS</h2>
            </div>

            <div className="nkl-spec-list">
              {displaySpecs.slice(0, 4).map((spec, index) => (
                <div 
                  className="nkl-spec-row" 
                  key={`${spec.label}-${index}`}
                  title={`${spec.label}: ${spec.value || 'N/A'}`}
                >
                  <div className="nkl-spec-icon"><Icon type={spec.icon} /></div>
                  <div className="nkl-spec-label">{spec.label}</div>
                  <div className="nkl-spec-colon">:</div>
                  <div className={`nkl-spec-value ${spec.value ? '' : 'is-empty'}`}>
                    {spec.value || '\u00A0'}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>

        <footer className="nkl-footer">
          <div className="nkl-footer-line" />
          <div className="nkl-footer-copy">
            <strong>{website}</strong>
            <span>{footerTagline}</span>
          </div>
          <div className="nkl-footer-line" />
        </footer>
      </section>
    </div>
  );
}
