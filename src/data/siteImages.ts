/**
 * NK LASER - Centralized Site Image Asset Directory
 * 
 * All site images are structured by category and can be customized or replaced
 * by placing new files in the corresponding `/images/` directory.
 */

export interface ImageAsset {
  id: string;
  title: string;
  localPath: string;
  fallbackUrl: string;
  alt: string;
  category: 'logo' | 'categories' | 'products' | 'services' | 'brands' | 'materials' | 'banners';
}

export const SITE_IMAGES = {
  // Brand Logos
  logo: {
    main: {
      localPath: '/images/logo/nk-laser-logo.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      alt: 'NK Laser Cutting & Spares Logo'
    },
    icon: {
      localPath: '/images/logo/nk-laser-icon.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
      alt: 'NK Laser Icon'
    },
    dark: {
      localPath: '/images/logo/nk-laser-logo-dark.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      alt: 'NK Laser Dark Mode Logo'
    }
  },

  // E-Commerce Categories (NKL Laser Industrial Spares)
  categories: {
    protectiveLenses: {
      id: 'cat-protective-lenses',
      localPath: '/images/categories/protective-lenses.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
      alt: 'Fiber Laser Protective Lenses & Quartz Windows'
    },
    cuttingNozzles: {
      id: 'cat-cutting-nozzles',
      localPath: '/images/categories/cutting-nozzles.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
      alt: 'Tellurium Copper Laser Cutting Nozzles'
    },
    ceramicRings: {
      id: 'cat-ceramic-rings',
      localPath: '/images/categories/ceramic-rings.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      alt: 'Technical Ceramic Rings & Height Sensor Bodies'
    },
    focusCollimation: {
      id: 'cat-focus-collimation',
      localPath: '/images/categories/focus-collimation.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      alt: 'Focusing and Collimating Lens Sets'
    },
    cuttingHeads: {
      id: 'cat-cutting-heads',
      localPath: '/images/categories/cutting-heads.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      alt: 'Autofocus Fiber Laser Cutting Heads'
    },
    cncControllers: {
      id: 'cat-cnc-controllers',
      localPath: '/images/categories/cnc-controllers.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
      alt: 'BOCHU CypCut CNC Controllers & Handheld Remotes'
    },
    laserWelding: {
      id: 'cat-laser-welding',
      localPath: '/images/categories/laser-welding.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
      alt: 'Handheld Laser Welding Torches & Spares'
    },
    pneumatics: {
      id: 'cat-pneumatics',
      localPath: '/images/categories/pneumatics.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      alt: 'SMC Electro-Pneumatic Proportional Valves'
    },
    opticsCleaning: {
      id: 'cat-optics-cleaning',
      localPath: '/images/categories/optics-cleaning.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
      alt: 'Laser Optics Cleaning Swabs & Safety Goggles'
    },
    laserSources: {
      id: 'cat-laser-sources',
      localPath: '/images/categories/laser-sources.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
      alt: 'Fiber Laser Source Spares and QBH Connectors'
    },
    sheetParts: {
      id: 'cat-sheet-parts',
      localPath: '/images/categories/sheet-parts.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      alt: 'Precision Laser Cut Sheet Metal Parts'
    },
    decorativeJali: {
      id: 'cat-decorative-jali',
      localPath: '/images/categories/decorative-jali.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      alt: 'Architectural CNC Laser Cut Jali Panels'
    }
  },

  // Services
  services: {
    sheetMetalCutting: {
      localPath: '/images/services/sheet-metal-cutting.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      alt: 'High-Power Sheet Metal Fiber Laser Cutting'
    },
    sparesImporter: {
      localPath: '/images/services/spares-importer.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      alt: 'Laser Machine Spares & Consumables Importer'
    },
    tubePipeCutting: {
      localPath: '/images/services/tube-pipe-cutting.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
      alt: 'CNC 3D Tube and Pipe Laser Cutting'
    },
    cncBending: {
      localPath: '/images/services/cnc-bending.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      alt: 'CNC Hydraulic Press Brake Sheet Bending'
    },
    laserWelding: {
      localPath: '/images/services/laser-welding.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      alt: 'Precision High-Speed Fiber Laser Welding'
    },
    architecturalJali: {
      localPath: '/images/services/architectural-jali.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      alt: 'Custom Architectural Metal Jali & Screens'
    }
  },

  // OEM Brands
  brands: {
    raytools: {
      localPath: '/images/brands/raytools.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
      alt: 'RayTools Cutting Heads & Optics'
    },
    ospri: {
      localPath: '/images/brands/ospri.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80',
      alt: 'OSPRI Intelligent Laser Heads'
    },
    bochu: {
      localPath: '/images/brands/bochu.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80',
      alt: 'BOCHU FSCUT CypCut CNC Controllers'
    },
    wsx: {
      localPath: '/images/brands/wsx.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
      alt: 'WSX Fiber Laser Heads'
    },
    precitec: {
      localPath: '/images/brands/precitec.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
      alt: 'Precitec ProCutter Consumables'
    },
    smc: {
      localPath: '/images/brands/smc.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80',
      alt: 'SMC Japan Proportional Valves'
    }
  },

  // Raw Materials
  materials: {
    stainlessSteel: {
      localPath: '/images/materials/stainless-steel.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
      alt: 'Stainless Steel SS304 / SS316 Sheet'
    },
    mildSteel: {
      localPath: '/images/materials/mild-steel.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
      alt: 'Mild Steel / Carbon Steel Plates'
    },
    aluminum: {
      localPath: '/images/materials/aluminum.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      alt: 'Aluminum 5052 / 6061 Sheet'
    },
    brassCopper: {
      localPath: '/images/materials/brass-copper.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
      alt: 'Brass and Pure Copper Sheets'
    }
  },

  // Workshop & Quality Badges
  banners: {
    hero: {
      localPath: '/images/banners/hero-workshop.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80',
      alt: 'NK Laser Cutting Workshop'
    },
    expressDispatch: {
      localPath: '/images/banners/express-dispatch.svg',
      fallbackUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80',
      alt: '1-2 Days Express Delivery Guarantee'
    },
    warehouseInventory: {
      localPath: '/images/banners/warehouse-inventory.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      alt: 'NK Laser Warehouse Inventory & Dispatch Center'
    }
  }
};

/**
 * Helper function to retrieve image URL with graceful fallback
 */
export function getSiteImage(path: string | undefined, fallback: string): string {
  if (!path) return fallback;
  return path;
}
