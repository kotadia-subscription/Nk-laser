import React from 'react';
import type { NKLaserTemplateProps } from './types';
import './product-template.css';

export default function ProductTemplateBlueprint({
  logoSrc,
  logoAlt = 'NK Laser',
  productName = 'Product Name',
  size = '',
  productImageSrc,
  productImageAlt = 'Product',
  website = 'WWW.NKLASER.IN',
  footerTagline = 'LASER ENGINEERING SCHEMATICS & SPARES',
  className = '',
  sku = 'NK-SCHEMATIC',
  brand = 'NK Laser',
  material = 'Fused Quartz',
  mode = 'detail'
}: NKLaserTemplateProps) {
  const title = [productName, size].filter(Boolean).join(' : ');

  return (
    <div className={`nkl-card-container ${mode === 'card' ? 'nkl-container--card' : ''} ${mode === 'thumbnail' ? 'nkl-container--thumb' : ''}`}>
      <section className={`nkl-card nkl-card--blueprint ${mode === 'thumbnail' ? 'nkl-card--thumbnail-mode' : mode === 'card' ? 'nkl-card--card-mode' : ''} ${className}`}>
        {/* Corner Blueprint CAD Coordinates */}
        <span className="nkl-blueprint-corner top-2 left-3">SEC-01 [X:0 Y:0]</span>
        <span className="nkl-blueprint-corner top-2 right-3">DWG-REF: {sku}</span>

        <header className="nkl-header flex items-center justify-between px-3">
          <img className="nkl-logo" src={logoSrc} alt={logoAlt} />
          <div className="nkl-blueprint-cad-badge">
            <span>CAD APPROVED</span>
          </div>
        </header>

        <main className="nkl-content">
          <div className="nkl-title-bar" style={{ background: 'rgba(6, 35, 77, 0.92)', borderColor: 'rgba(93, 160, 236, 0.7)' }}>
            <span className="nkl-red-mark" />
            <h1 title={title} style={{ color: '#ffffff' }}>{title}</h1>
          </div>

          <div className="nkl-image-card" style={{ background: '#ffffff', border: '2px solid rgba(93, 160, 236, 0.5)' }}>
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

          <div className="flex flex-wrap items-center justify-between gap-1 text-[8px] sm:text-[11px] font-mono text-blue-200 pt-2 px-1">
            <span>SPEC: <strong className="text-white">{size || 'OEM Standard'}</strong></span>
            <span>SUBSTRATE: <strong className="text-white">{material}</strong></span>
            <span>TOLERANCE: <strong className="text-amber-300">±0.02 mm</strong></span>
          </div>
        </main>

        <footer className="nkl-footer" style={{ background: 'rgba(3, 16, 36, 0.85)', borderColor: 'rgba(93, 160, 236, 0.4)' }}>
          <div className="nkl-footer-line" />
          <div className="nkl-footer-copy">
            <strong>{website}</strong>
            <span style={{ color: '#90caf9' }}>{footerTagline}</span>
          </div>
          <div className="nkl-footer-line" />
        </footer>
      </section>
    </div>
  );
}
