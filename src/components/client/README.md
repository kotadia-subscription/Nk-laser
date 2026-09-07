# Frontend Client Storefront Components (`/src/components/client`)

This folder contains all storefront components designed for customers browsing, searching, and inquiring about laser cutting spare parts, optical lenses, nozzles, and machine accessories.

---

## Component Index & Breakdown

### 1. `Navbar.tsx`
- **Purpose**: Persistent sticky navigation bar at the top of every page.
- **Key Features**:
  - Global SKU & title search bar with real-time dropdown search results.
  - Category dropdown menu with icon badges and quick navigation.
  - Live RFQ Cart badge with real-time item counter.
  - Dark / Light mode toggle.
  - Mobile hamburger drawer with full navigation hierarchy.
  - WhatsApp quick-connect button with pre-configured phone link.

### 2. `Hero.tsx`
- **Purpose**: High-impact visual section on the homepage landing screen.
- **Key Features**:
  - Highlights core value propositions: 100% Imported OEM Spares, 24-48h India-wide express dispatch, and high-purity optics.
  - Primary CTA button "Explore Spares Store" to immediately navigate to the catalog.
  - Metric counters (10,000+ parts in stock, 500+ job shops served, 99.8% quartz purity).

### 3. `SparesShopBanner.tsx`
- **Purpose**: High-contrast banner connecting the homepage directly to the digital parts catalog.
- **Key Features**:
  - Grid preview of featured spare categories (Cutting Nozzles, Quartz Lenses, Ceramic Sensor Rings, CypCut Remotes).
  - One-click trigger leading directly to the store catalog view.

### 4. `CategoryHub.tsx`
- **Purpose**: Interactive bento-grid showcase of spare parts categories.
- **Key Features**:
  - Displays category cards with icons, item counts, and quick filter triggers.
  - Deep-links directly to store category filters.

### 5. `FeaturedDiscovery.tsx`
- **Purpose**: Highlights top-selling optical spares, laser cutting heads, and consumables.
- **Key Features**:
  - Curated product showcase with direct quick inquiry and cart triggers.

### 6. `StoreCatalogView.tsx`
- **Purpose**: Full-featured e-commerce catalog and search interface.
- **Key Features**:
  - **Faceted Filtering**: Filter simultaneously by Category, Subcategory, OEM Brand, and Laser Power Range (1kW – 20kW+).
  - **Search & Sort**: Instant text query filtering and sorting (Price Low-High, Price High-Low, Most Popular, Newest).
  - **Product Cards**: Display SKU code, stock availability badge, indicative pricing (₹), and quick action buttons ("Inquire / Add to Cart", "View Specs").
  - **Active Filter Pills**: Dynamic removal tags for quick query clearing.

### 7. `ProductDetailView.tsx`
- **Purpose**: In-depth individual product page.
- **Key Features**:
  - Zoomable high-resolution product image gallery (`ProductGallery.tsx`).
  - Technical specifications table (Material, Dimensions, Transmittance, Tolerance, Power Suitability).
  - Quantity selector and instant "Add to RFQ Cart" button.
  - Direct "Inquire on WhatsApp" button with pre-filled SKU and product name.
  - Related items carousel based on shared category.

### 8. `ShareCatalogModal.tsx`
- **Purpose**: Multi-channel catalog sharing dialog.
- **Key Features**:
  - **1. Save as PDF Document**: Generates branded, high-resolution PDF quotation with letterhead, active filter criteria, product list, and SKU table using `jspdf`.
  - **2. Send via WhatsApp to Client**: Dispatches formatted quotation proposal to client with direct catalog URL.
  - **3. Copy Link & Text**: 1-click clipboard copying of custom filtered search link and plain text quotation.
  - **Admin Pricing Policy Enforced**: If pricing is disabled in admin settings (`showPricing: false`), all prices are omitted from PDF generation, WhatsApp messages, text summaries, and the toggle is hidden.

### 9. `CartDrawer.tsx`
- **Purpose**: Slide-over RFQ Cart drawer allowing customers to build multi-item inquiries.
- **Key Features**:
  - Item listing with quantity increment/decrement controls and remove buttons.
  - Live estimated subtotal calculation.
  - Customer contact inputs (Name, Phone number, Company name).
  - **WhatsApp RFQ Generator**: Automatically compiles all cart items into a formatted WhatsApp message and opens a chat with the sales team.

### 10. `InquiryModal.tsx`
- **Purpose**: Pop-up dialog for single-item quote requests.
- **Key Features**:
  - Auto-fills selected product SKU and title.
  - Collects customer contact information (encrypted at rest on backend via AES-256-GCM).
  - Provides immediate WhatsApp chat continuation.

### 11. `QuoteCalculator.tsx`
- **Purpose**: Interactive fiber laser spare parts and job cost estimator.
- **Key Features**:
  - Calculate estimated consumable wear and replacement schedules based on cutting hours and sheet materials.
  - Export calculations directly to RFQ.

### 12. `MaterialSpecs.tsx`
- **Purpose**: Technical guide on cutting tolerances, assist gases, and optical maintenance.

### 13. `BrandsSection.tsx`
- **Purpose**: Showcase compatible OEM laser cutting head manufacturers (RayTools, OSPRI, WSX, Precitec, Bodor, etc.).

### 14. `ServiceShowcase.tsx`
- **Purpose**: Highlights engineering services (preventive maintenance, cutting head refurbishment, custom lens fabrication).

### 15. `ReviewsSection.tsx`
- **Purpose**: Verified customer reviews and interactive testimonial submission modal.

### 16. `ContactSection.tsx`
- **Purpose**: Direct inquiry form, workshop location map, and contact information.

### 17. `Footer.tsx`
- **Purpose**: Persistent site-wide footer with quick category links, corporate info, and admin portal launcher.
