import React from 'react';
import type { NKLaserTemplateProps } from './types';
import './product-template.css';

export default function ProductTemplateSimple({
  logoSrc,
  logoAlt = 'NK Laser',
  productName = 'Product Name',
  size = '',
  productImageSrc,
  productImageAlt = 'Product',
  website = 'WWW.NKLASER.IN',
  footerTagline = 'IDEAS SHAPED WITH LASER',
  className = '',
  mode = 'detail'
}: NKLaserTemplateProps) {
  const title = [productName, size].filter(Boolean).join(' : ');

  return (
    <div className={`nkl-card-container ${mode === 'card' ? 'nkl-container--card' : ''} ${mode === 'thumbnail' ? 'nkl-container--thumb' : ''}`}>
      <section className={`nkl-card nkl-card--simple ${mode === 'thumbnail' ? 'nkl-card--thumbnail-mode' : mode === 'card' ? 'nkl-card--card-mode' : ''} ${className}`}>
        <div className="nkl-bg-shape nkl-bg-shape--left" />
        <div className="nkl-bg-shape nkl-bg-shape--right" />

        <header className="nkl-header">
          <img className="nkl-logo nkl-logo--simple" src={logoSrc} alt={logoAlt} />
        </header>

        <main className="nkl-content nkl-content--simple">
          <div className="nkl-product-panel nkl-product-panel--simple">
            <div className="nkl-title-bar">
              <span className="nkl-red-mark" />
              <h1 title={title}>{title}</h1>
            </div>

            <div className="nkl-image-card nkl-image-card--simple">
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
