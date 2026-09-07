# Admin Modal Dialogues (`/src/components/admin/modals`)

This directory contains standalone popup dialogues for creating and updating business entities without navigating away from the current view.

---

## Modals Index

### 1. `ProductEditModal.tsx`
- **Purpose**: Full-form modal for adding or editing a product SKU in the catalog.
- **Fields**:
  - Title, SKU, Category Slug, Subcategory, OEM Brand.
  - Estimated Price (₹), Minimum Order Quantity (MOQ).
  - Material, Dimensions, Thickness, Power Range, Wavelength.
  - Image URL with instant preview.
  - Stock Status dropdown (`In Stock`, `Low Stock`, `Made to Order`, `Pre-Order`).
  - Key technical specification tags and custom Key-Value specifications table.

### 2. `CategoryEditModal.tsx`
- **Purpose**: Modal for defining a new product category or modifying existing category metadata.
- **Fields**:
  - Category Name, Slug, Description, Badge text.
  - Icon selection (Shield, Disc, CircleDot, Eye, Zap, Cpu, Flame, Sliders, Radio, Sparkles, Layers, Grid).
  - Subcategories list (comma-separated or dynamic chips).
  - Compatible OEM brands list.

### 3. `BrandEditModal.tsx`
- **Purpose**: Modal for registering and updating OEM laser head and source manufacturer brands.
- **Fields**:
  - Brand Name (e.g. RayTools, OSPRI, WSX, Precitec).
  - Brand Logo URL with live image preview.
  - Category / Specialization description.
