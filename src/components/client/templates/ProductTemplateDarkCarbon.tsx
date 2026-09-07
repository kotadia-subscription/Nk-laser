import React from 'react';
import type { NKLaserTemplateProps } from './types';
import './product-template.css';

export default function ProductTemplateDarkCarbon({
  logoSrc,
  logoAlt = 'NK Laser',
  productName = 'Product Name',
  size = '',
  productImageSrc,
  productImageAlt = 'Product',
  website = 'WWW.NKLASER.IN',
  footerTagline = 'HIGH-POWER FIBER LASER OPTICS',
  className = '',
  sku = 'NK-SPARE',
  brand = 'NK Laser',
  powerRange = '1kW - 30kW',
  material = 'Fused Quartz',
  mode = 'detail'
}: NKLaserTemplateProps) {
  const title = [productName, size].filter(Boolean).join(' : ');

  return (
    <div className={`nkl-card-container ${mode === 'card' ? 'nkl-container--card' : ''} ${mode === 'thumbnail' ? 'nkl-container--thumb' : ''}`}>
      <section className={`nkl-card nkl-card--dark-carbon ${mode === 'thumbnail' ? 'nkl-card--thumbnail-mode' : mode === 'card' ? 'nkl-card--card-mode' : ''} ${className}`}>
        {/* Carbon Precision Millimeter Scale */}
        <div className="nkl-carbon-ruler-h">
          <span>| 0mm</span>
          <span>| 25mm</span>
          <span>| 50mm</span>
          <span>| 75mm</span>
          <span>| 100mm |</span>
        </div>

        <header className="nkl-header flex items-center justify-between px-2">
          <img className="nkl-logo" src={logoSrc} alt={logoAlt} />
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-xs font-mono font-bold tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
              PRECISION OPTICS
            </span>
          </div>
        </header>

        <main className="nkl-content">
          <div className="nkl-title-bar" style={{ background: 'linear-gradient(115deg, rgba(17, 20, 26, 0.98), rgba(26, 32, 44, 0.95))', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <span className="nkl-carbon-accent-bar" style={{ height: '36px' }} />
            <h1 title={title} className="text-white">{title}</h1>
          </div>

          <div className="nkl-image-card" style={{ background: '#0a0d13', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {productImageSrc ? (
              <img
                className="nkl-product-image"
                src={productImageSrc}
                alt={productImageAlt}
                referrerPolicy="no-referrer"
                loading="lazy"
                style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))' }}
              />
            ) : (
              <div className="nkl-placeholder" style={{ color: '#718096' }}>
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

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[8px] sm:text-xs font-mono text-zinc-400 px-1">
            <span>SKU: <strong className="text-white">{sku}</strong></span>
            <span>OEM: <strong className="text-white">{brand}</strong></span>
            <span>POWER: <strong className="text-amber-400">{powerRange}</strong></span>
            <span>GRADE: <strong className="text-emerald-400">JGS1 A-GRADE</strong></span>
          </div>
        </main>

        <footer className="nkl-footer" style={{ background: 'rgba(13, 17, 23, 0.85)', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <div className="nkl-footer-line" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
          <div className="nkl-footer-copy">
            <strong>{website}</strong>
            <span style={{ color: '#cbd5e0' }}>{footerTagline}</span>
          </div>
          <div className="nkl-footer-line" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
        </footer>
      </section>
    </div>
  );
}
