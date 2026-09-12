import React, { useState, useEffect } from 'react';

export interface NKLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showSubtitle?: boolean;
  themeMode?: 'light' | 'dark';
  variant?: 'full' | 'icon-only' | 'monochrome';
  logoUrl?: string;
  alt?: string;
}

export const NKLogo: React.FC<NKLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  themeMode = 'light',
  variant = 'full',
  logoUrl,
  alt = 'NK Laser'
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset img error if logoUrl changes
  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  // Sizing configurations
  const heightClass = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
    custom: ''
  }[size];

  // Colors based on theme
  const navyColor = variant === 'monochrome' 
    ? 'currentColor' 
    : '#16264F'; // Deep industrial navy in light mode
  
  const redColor = variant === 'monochrome' 
    ? 'currentColor' 
    : '#E51424'; // Laser Red

  const subtitleColor = variant === 'monochrome'
    ? 'currentColor'
    : '#16264F';

  // If a logo URL (the shipped default asset, or a custom upload) is provided and hasn't
  // failed to load, render it as an <img>. Only fall back to the inline vector mark below
  // when no logoUrl is set at all, or the configured image actually fails to load.
  const hasCustomLogoUrl = Boolean(logoUrl && logoUrl.trim() && !imgError);

  if (hasCustomLogoUrl && logoUrl) {
    return (
      <div className={`inline-flex items-center select-none ${className}`} id="nk-brand-logo">
        <img
          src={logoUrl}
          alt={alt}
          className={`${heightClass} w-auto max-w-full object-contain shrink-0 transition-transform duration-200`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const isIconOnly = variant === 'icon-only' || !showSubtitle;
  // Bounding box: X: 98..466 (width: 368), Y mark: 111..297 (height: 186), Y text: ..347 (height: 236)
  const viewBox = isIconOnly ? '98 111 368 186' : '98 111 368 236';

  return (
    <div className={`inline-flex items-center select-none ${className}`} id="nk-brand-logo">
      <svg
        viewBox={viewBox}
        className={`${heightClass} w-auto shrink-0 transition-transform duration-200`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={alt}
      >
        <title>{alt}</title>
        <g id="nkl-mark">
          {/* N and K Letters in Industrial Navy (or white in dark mode) */}
          <path
            fill={navyColor}
            d="M 233,119 231,126 231,289 264,288 265,224 270,225 320,289 361,289 362,286 302,211 299,202 367,126 370,119 326,119 269,185 264,184 264,119 Z M 221,119 191,119 190,205 183,203 112,122 106,120 106,287 108,289 135,288 136,208 140,208 212,289 222,288 Z"
          />

          {/* Stylized L in Vibrant Laser Red */}
          <path
            fill={redColor}
            d="M 375,119 348,150 348,254 376,289 458,289 458,257 382,256 382,119 Z"
          />
        </g>

        {/* Subtitle Wordmark: NK LASER */}
        {!isIconOnly && (
          <text
            id="nk-wordmark"
            x="282"
            y="336"
            textAnchor="middle"
            fill={subtitleColor}
            fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', Arial, sans-serif"
            fontWeight="800"
            fontSize="20"
            letterSpacing="9"
            className="tracking-[9px] font-bold"
          >
            NK LASER
          </text>
        )}
      </svg>
    </div>
  );
};

