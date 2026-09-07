import React from 'react';
import type { NKLaserTemplateProps } from './types';
import './product-template.css';

export default function ProductTemplateBadgeHero({
  logoSrc,
  logoAlt = 'NK Laser',
  productName = 'Product Name',
  size = '',
  productImageSrc,
  productImageAlt = 'Product',
  website = 'WWW.NKLASER.IN',
  footerTagline = 'IDEAS SHAPED WITH LASER',
  className = '',
  brand = 'RayTools OEM',
  powerRange = '1kW - 30kW',
  material = 'Fused Quartz',
  sku = 'NK-SPARE',
  mode = 'detail'
}: NKLaserTemplateProps) {
  const title = [productName, size].filter(Boolean).join(' : ');

  return (
    <div className={`nkl-card-container ${mode === 'card' ? 'nkl-container--card' : ''} ${mode === 'thumbnail' ? 'nkl-container--thumb' : ''}`}>
      <section className={`nkl-card nkl-card--badge-hero ${mode === 'thumbnail' ? 'nkl-card--thumbnail-mode' : mode === 'card' ? 'nkl-card--card-mode' : ''} ${className}`}>
        <div className="nkl-bg-shape nkl-bg-shape--left" />
        <div className="nkl-bg-shape nkl-bg-shape--right" />

        {/* Top Header Split: Logo on Left, OEM Fitment Badge on Right */}
        <header className="nkl-header flex items-center justify-between px-2 sm:px-6">
          <img className="nkl-logo" src={logoSrc} alt={logoAlt} style={{ maxHeight: '70%' }} />
          {brand && (
            <div className="nkl-oem-pill">
              <span>●</span>
              <span>{brand} FITMENT</span>
            </div>
          )}
        </header>

        <main className="nkl-content">
          <div className="nkl-title-bar">
            <span className="nkl-red-mark" />
            <h1 title={title}>{title}</h1>
          </div>

          {/* Central Image Card with Optical Reticle Crosshairs */}
          <div className="nkl-crosshair-card">
            <div className="nkl-reticle nkl-reticle--tl" />
            <div className="nkl-reticle nkl-reticle--tr" />
            <div className="nkl-reticle nkl-reticle--bl" />
            <div className="nkl-reticle nkl-reticle--br" />

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

          {/* Floating Technical Specs Pill Strip */}
          <div className="nkl-floating-spec-strip">
            {powerRange && (
              <span className="nkl-chip">
                ⚡ <span>{powerRange}</span>
              </span>
            )}
            {material && (
              <span className="nkl-chip">
                ◈ <span>{material}</span>
              </span>
            )}
            {sku && (
              <span className="nkl-chip">
                № <span>{sku}</span>
              </span>
            )}
            <span className="nkl-chip" style={{ borderColor: 'rgba(255, 22, 52, 0.5)', color: '#ff7588' }}>
              ✓ 1064nm Fiber Approved
            </span>
          </div>
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
