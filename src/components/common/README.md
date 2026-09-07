# Shared Foundational UI Components (`/src/components/common`)

This directory contains atomic, reusable UI elements shared across storefront views, product browsers, and back-office administrative consoles.

---

## Component Index

### 1. `NKLogo.tsx`
- **Location**: `/src/components/common/NKLogo.tsx`
- **Purpose**: Corporate branding vector emblem for NK Laser Spares & Optics.
- **Props**:
  - `variant?: 'dark' | 'light'` (Adaptive color scheme)
  - `size?: 'sm' | 'md' | 'lg'` (Flexible sizing)
  - `showText?: boolean` (Toggle corporate wordmark display)
- **Features**:
  - High-precision SVG graphic featuring an industrial laser aperture and focus ray.
  - Consistent mathematical scaling across header, admin bar, and invoice headers.

### 2. `SectionHeading.tsx`
- **Location**: `/src/components/common/SectionHeading.tsx`
- **Purpose**: Unified section header block enforcing typographic hierarchy and optical spacing.
- **Props**:
  - `badge: string` (Contextual uppercase category chip)
  - `title: string` (Primary display headline)
  - `subtitle?: string` (High-contrast explanatory description)
  - `centered?: boolean` (Alignment toggle)
  - `isDark?: boolean` (Theme awareness)

### 3. `ThemeToggle.tsx`
- **Location**: `/src/components/common/ThemeToggle.tsx`
- **Purpose**: Single-click toggle button between Light Mode and Dark Mode.
- **Props**:
  - `theme: 'light' | 'dark'`
  - `onToggle: () => void`
- **Features**:
  - Smooth Lucide icon rotation between `Sun` and `Moon`.
  - Accessible tooltip and keyboard focus ring.

### 4. `WhatsAppIcon.tsx`
- **Location**: `/src/components/common/WhatsAppIcon.tsx`
- **Purpose**: Official vector representation of the WhatsApp logo for direct quotation requests.
- **Props**: Standard SVG properties (`className`, `size`, `color`).

### 5. `SEOHead.tsx`
- **Location**: `/src/components/common/SEOHead.tsx`
- **Purpose**: Dynamic search engine optimization (SEO) head manager powered by `react-helmet-async`.
- **Props**: `currentView`, `selectedProduct`, `selectedCategory`, `selectedCategorySlug`, `selectedBrand`, `storeSearchQuery`, `storePower`, `isAdminOpen`, `settings`.
- **Features**:
  - Dynamically updates `<title>`, `<meta name="description">`, keywords, and canonical URLs.
  - Generates Open Graph (`og:title`, `og:description`, `og:image`, `og:type`) and Twitter Cards.
  - Injects Schema.org JSON-LD structured data (`Product`, `Offer`, `LocalBusiness`, `Organization`) for rich search snippets.
  - Automatically adds `noindex, nofollow` when the administrative back-office panel is open.

### 6. `ImageUploadField.tsx`
- **Location**: `/src/components/common/ImageUploadField.tsx`
- **Purpose**: Image upload component supporting local file selection, drag-and-drop preview, and fallback image URL entry.
- **Features**:
  - Instant client-side preview with compression support.
  - Fallback input for CDN and external image URLs.
