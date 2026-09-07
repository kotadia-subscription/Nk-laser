# Components Architecture (`/src/components`)

This directory houses all user interface building blocks, organized by consumer context.

---

## Folder Structure

```
src/components/
├── admin/       # Management console, edit modals, and admin views
├── client/      # Public-facing e-commerce storefront components
└── common/      # Shared foundational UI elements (Logos, Headings, Icons, SEO)
```

---

## 1. `/common` Subdirectory
Houses cross-cutting design system components:

- **`NKLogo.tsx`**: Renders the corporate industrial laser emblem with SVG geometric laser beam accents. Adapts to dark/light color modes with custom sizing props.
- **`SectionHeading.tsx`**: Unified section title block containing an eye-brow badge, primary heading, and descriptive subtitle with consistent typography math.
- **`ThemeToggle.tsx`**: Compact button toggling between `'dark'` and `'light'` UI palettes.
- **`WhatsAppIcon.tsx`**: High-fidelity vector SVG icon representing the WhatsApp brand for direct RFQ actions.
- **`SEOHead.tsx`**: Dynamic page head manager injecting meta tags and Schema.org JSON-LD structured data.
- **`ImageUploadField.tsx`**: Reusable image uploader with preview and fallback URL input.

---

## 2. `/client` Subdirectory
Houses public customer-facing sections and views. See [Client Documentation](./client/README.md) for full details on each component:

| Component | Responsibility |
|---|---|
| `Navbar.tsx` | Main sticky navigation, global SKU search, category shortcuts, theme toggle, and cart launcher |
| `Hero.tsx` | High-impact industrial landing banner with immediate catalog & brand CTAs |
| `SparesShopBanner.tsx` | Feature portal strip linking customers directly into the spares inventory |
| `CategoryHub.tsx` | Bento-grid interactive showcase of spare parts categories |
| `FeaturedDiscovery.tsx` | Highlighted high-precision spares and cutting heads |
| `StoreCatalogView.tsx` | Comprehensive product catalog with multi-facet filters (category, brand, power, price) |
| `ShareCatalogModal.tsx` | Multi-channel catalog sharing (branded PDF quotations, WhatsApp proposals, link copying) |
| `ProductDetailView.tsx` | Dedicated product page featuring zoomable gallery, spec sheet, and RFQ generator |
| `ProductGallery.tsx` | High-resolution interactive image gallery with zoom preview |
| `CartDrawer.tsx` | Slide-out drawer for multi-item RFQ preparation and direct WhatsApp quotation dispatch |
| `InquiryModal.tsx` | Quick quote modal popup with encrypted customer PII dispatch |
| `QuoteCalculator.tsx` | Interactive fiber laser spare parts and job cost estimator |
| `MaterialSpecs.tsx` | Material cutting tolerance and optical maintenance charts |
| `BrandsSection.tsx` | Compatible OEM laser head brands carousel |
| `ServiceShowcase.tsx` | Engineering, refurbishment, and custom fabrication service offerings |
| `ReviewsSection.tsx` | Social proof with verified client ratings and interactive review submission |
| `ContactSection.tsx` | Workshop location map, phone/email links, and category inquiry form |
| `Footer.tsx` | Bottom navigation, company profile, and admin login launcher |

---

## 3. `/admin` Subdirectory
Houses the password-protected administrative back-office. See [Admin Documentation](./admin/README.md) for detailed sub-view and modal specifications:

| Module | Responsibility |
|---|---|
| `AdminPanel.tsx` | Top-level auth guard, modal container, tab dispatcher, and state sync bridge |
| `AdminHeader.tsx` | Top bar displaying active tab title, quick view store button, theme switcher, and logout |
| `AdminSidebar.tsx` | Side navigation bar with item counters, category badges, and active state styles |
| `CategoryAutocomplete.tsx` | Fuzzy-matching multi-subcategory selector |
| `views/` | Modular tabs for Products, Categories, Attributes, Inquiries, Settings, and Security |
| `modals/` | Modal dialogues for creating/editing products, categories, and OEM brands |
