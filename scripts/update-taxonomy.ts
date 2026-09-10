import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { INITIAL_PRODUCTS, STORE_CATEGORIES, DEFAULT_SITE_SETTINGS, INITIAL_BRANDS, INITIAL_REVIEWS } from '../server/seedData';
import { ProductItem, ProductCategoryDef } from '../src/types';

// The 3 User Specified Categories and Subcategories
const NEW_CATEGORIES: ProductCategoryDef[] = [
  {
    id: 'cat-laser-spares-consumables',
    slug: 'laser-spares-consumables',
    name: 'Laser Spares/Consumables',
    shortTitle: 'Laser Spares',
    description: 'Direct-imported fiber laser cutting & welding spares, protective windows, nozzles, ceramics, optics, sensors, cables, and controllers.',
    iconName: 'Flame',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    defaultMaterial: 'Fused Silica / Tellurium Copper / Precision Zirconia Ceramic',
    defaultPower: '1kW - 30kW',
    subCategories: [
      'Protective lens',
      'Nozzles',
      'Ceramic ring',
      'Collimation & Focus lens',
      'Sensor head TRA',
      'RF cable',
      'Amplifier',
      'QBH protection cap',
      'Remote',
      'Smc valve',
      'Seal ring',
      'Cleaning consumbles',
      'Ceramic locking Ring',
      'Nozzle visual aligner',
      'Welding reflector mirror',
      'Fiber cable',
      'Bodor consumbles',
      'Cutting head & controller',
      'Welding controller'
    ],
    itemCount: 0, // Will be computed
    oemBrands: ['NKL Laser', 'RayTools', 'OSPRI', 'WSX', 'BOCI', 'Precitec', 'BOCHU', 'SMC', 'Bodor', 'DNE'],
    powerRanges: ['1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 20kW', '20kW - 30kW', '30kW+'],
    featured: true,
    showOnHome: true
  },
  {
    id: 'cat-laser-source',
    slug: 'laser-source',
    name: 'Laser Source',
    shortTitle: 'Laser Source',
    description: 'Continuous wave (CW) industrial fiber laser sources and replacement power modules from Max Photonics and Raycus.',
    iconName: 'Zap',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    defaultMaterial: 'Continuous Wave (CW) Fiber Cavity',
    defaultPower: '1.5kW - 30kW',
    subCategories: [
      'Max',
      'Raycus'
    ],
    itemCount: 0, // Will be computed
    oemBrands: ['NKL Laser', 'Max', 'Raycus'],
    powerRanges: ['1.5kW', '2kW', '3kW', '6kW', '12kW', '20kW', '30kW'],
    featured: true,
    showOnHome: true
  },
  {
    id: 'cat-laser-chiller',
    slug: 'laser-chiller',
    name: 'Laser Chiller',
    shortTitle: 'Laser Chiller',
    description: 'High-performance dual-temperature industrial water chillers and cooling circulation units from Hanli, S&A, and Hexacool.',
    iconName: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    defaultMaterial: 'Stainless Steel Evaporator / Dual Circuit Refrigerant R410a',
    defaultPower: '1kW - 30kW',
    subCategories: [
      'Hanli',
      'S&a',
      'Hexacool'
    ],
    itemCount: 0, // Will be computed
    oemBrands: ['NKL Laser', 'Hanli', 'S&A', 'Hexacool'],
    powerRanges: ['1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 30kW'],
    featured: true,
    showOnHome: true
  }
];

// Map existing 169 products
const updatedProducts: ProductItem[] = INITIAL_PRODUCTS.map((p) => {
  const titleLower = p.title.toLowerCase();
  const oldSlug = p.categorySlug || '';
  let category = 'Laser Spares/Consumables';
  let categorySlug = 'laser-spares-consumables';
  let subCategory = 'Protective lens';

  if (oldSlug === 'laser-source') {
    category = 'Laser Source';
    categorySlug = 'laser-source';
    if (titleLower.includes('raycus')) {
      subCategory = 'Raycus';
    } else {
      subCategory = 'Max';
    }
  } else if (oldSlug === 'protective-lenses') {
    if (titleLower.includes('seal') || titleLower.includes('o-ring') || titleLower.includes('drawer')) {
      subCategory = 'Seal ring';
    } else {
      subCategory = 'Protective lens';
    }
  } else if (oldSlug === 'cutting-nozzles') {
    subCategory = 'Nozzles';
  } else if (oldSlug === 'ceramic-rings') {
    subCategory = 'Ceramic ring';
  } else if (oldSlug === 'ceramic-locking-ring') {
    subCategory = 'Ceramic locking Ring';
  } else if (oldSlug === 'focus-collimation-lens') {
    subCategory = 'Collimation & Focus lens';
  } else if (oldSlug === 'sensor-head') {
    if (titleLower.includes('amplifier') || titleLower.includes('pre-amp')) {
      subCategory = 'Amplifier';
    } else {
      subCategory = 'Sensor head TRA';
    }
  } else if (oldSlug === 'rf-cable-sensor-cable') {
    subCategory = 'RF cable';
  } else if (oldSlug === 'qbh-protection-cap') {
    subCategory = 'QBH protection cap';
  } else if (oldSlug === 'remote-controller') {
    if (titleLower.includes('bodor')) {
      subCategory = 'Bodor consumbles';
    } else {
      subCategory = 'Remote';
    }
  } else if (oldSlug === 'smc-valve') {
    subCategory = 'Smc valve';
  } else if (oldSlug === 'cleaning-consumables') {
    if (titleLower.includes('aligner')) {
      subCategory = 'Nozzle visual aligner';
    } else {
      subCategory = 'Cleaning consumbles';
    }
  } else if (oldSlug === 'dne-consumables') {
    if (titleLower.includes('nozzle')) {
      subCategory = 'Nozzles';
    } else if (titleLower.includes('seal') || titleLower.includes('ring')) {
      subCategory = 'Seal ring';
    } else {
      subCategory = 'Nozzles';
    }
  } else if (oldSlug.startsWith('cutting-head') || oldSlug === 'control-card') {
    subCategory = 'Cutting head & controller';
  } else if (oldSlug === 'safety-equipment') {
    subCategory = 'Cleaning consumbles';
  }

  return {
    ...p,
    category,
    categorySlug,
    subCategory,
    guid: p.guid || crypto.randomUUID()
  };
});

// Additional representative products for categories/subcategories that need initial catalog items
const newItemsToAdd: ProductItem[] = [
  // 1. Laser Spares -> Amplifier
  {
    id: 'nkl-bcs100-amplifier-board',
    sku: 'NKL-AMP-BCS100',
    title: 'Bochu BCS100 Capacitive Height Controller Pre-Amplifier Board',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Amplifier',
    material: 'High-Frequency Low-Noise Multi-layer PCB',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    description: 'Genuine Bochu BCS100 capacitive height sensor pre-amplifier module. Provides stable micro-capacitance signal conditioning with zero thermal drift for high-speed frog-jump piercing.',
    specs: ['Direct Importer: NKL Laser Genuine Spares', 'Gold-plated BMA/SMA Terminals', 'Zero Drift Capacitance Tracking'],
    specificationsTable: [
      { label: 'Brand', value: 'BOCHU' },
      { label: 'Category', value: 'Laser Spares/Consumables' },
      { label: 'Subcategory', value: 'Amplifier' },
      { label: 'Compatibility', value: 'Bochu BCS100 / CypCut FSCUT2000' }
    ],
    brand: 'NKL Laser / BOCHU',
    compatibleBrands: ['BOCHU', 'Cypcut'],
    powerRange: '1kW - 30kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: true,
    regularPrice: 7500,
    salePrice: 5200,
    estimatedPrice: 5200,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-raytools-bm111-amplifier',
    sku: 'NKL-AMP-RTBM',
    title: 'RayTools BM111 / BM114 Auto-Focus Sensor Head Pre-Amplifier Module',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Amplifier',
    material: 'High-Frequency Shielded Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'High-precision pre-amplifier circuit board for RayTools BM111 and BM114 autofocus cutting heads. Direct plug-and-play fitment with noise shielding.',
    specs: ['Direct Importer: NKL Laser Genuine Spares', 'OEM Fitment BM111 / BM114', 'Tested 100% Signal Stability'],
    specificationsTable: [
      { label: 'Brand', value: 'RayTools' },
      { label: 'Category', value: 'Laser Spares/Consumables' },
      { label: 'Subcategory', value: 'Amplifier' },
      { label: 'Compatibility', value: 'RayTools BM111, BM114, BM115' }
    ],
    brand: 'NKL Laser / RayTools',
    compatibleBrands: ['RayTools'],
    powerRange: '1kW - 12kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: false,
    regularPrice: 6800,
    salePrice: 4800,
    estimatedPrice: 4800,
    moq: 1,
    guid: crypto.randomUUID()
  },

  // 2. Laser Spares -> Welding reflector mirror
  {
    id: 'nkl-welding-reflector-mirror-d30',
    sku: 'NKL-WELD-MIR-303',
    title: 'Laser Welding Head 45-Degree High Damage Quartz Reflector Mirror D30*3mm 1064nm',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Welding reflector mirror',
    material: 'JGS1 Optical Fused Silica with Dielectric High Reflection Coating',
    thickness: '3.0mm',
    dimensions: 'Dia : 30mm x 3.0mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    description: 'High-power 45-degree total reflection mirror for fiber laser welding heads. Reflectivity > 99.8% at 1064nm with 15J/cm2 damage threshold.',
    specs: ['Direct Importer: NKL Laser Genuine Optics', 'Reflectivity > 99.8% @ 1064nm', 'Zero Thermal Lensing'],
    specificationsTable: [
      { label: 'Diameter', value: '30mm' },
      { label: 'Thickness', value: '3.0mm' },
      { label: 'Wavelength', value: '1064nm' },
      { label: 'Angle of Incidence', value: '45 Degrees' }
    ],
    brand: 'NKL Laser',
    compatibleBrands: ['RayTools', 'Sup20S', 'Qilin', 'WSX'],
    powerRange: '1kW - 6kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: true,
    regularPrice: 3200,
    salePrice: 2100,
    estimatedPrice: 2100,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-welding-turning-mirror-d20',
    sku: 'NKL-WELD-MIR-202',
    title: 'Sup20S / Qilin Handheld Laser Welding Galvanometer Turning Mirror D20*2mm',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Welding reflector mirror',
    material: 'High-Purity Fused Quartz / 1064nm HR Coating',
    thickness: '2.0mm',
    dimensions: 'Dia : 20mm x 2.0mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    description: 'High-speed galvo motor turning mirror for handheld fiber laser welding torches. Ultra-lightweight substrate with high temperature durability.',
    specs: ['Direct Importer: NKL Laser Genuine Optics', 'Ultra Lightweight Quartz', 'Reflectivity > 99.8%'],
    specificationsTable: [
      { label: 'Diameter', value: '20mm' },
      { label: 'Thickness', value: '2.0mm' },
      { label: 'Application', value: 'Sup20S / Qilin Handheld Welding Gun' }
    ],
    brand: 'NKL Laser',
    compatibleBrands: ['Sup20S', 'Qilin', 'WSX'],
    powerRange: '1kW - 3kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: false,
    regularPrice: 2400,
    salePrice: 1550,
    estimatedPrice: 1550,
    moq: 1,
    guid: crypto.randomUUID()
  },

  // 3. Laser Spares -> Fiber cable
  {
    id: 'nkl-qbh-fiber-cable-50um-15m',
    sku: 'NKL-FIBER-QBH-50',
    title: 'QBH High Power Optical Fiber Delivery Cable Assembly 1064nm 50um (15M)',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Fiber cable',
    material: 'Silica Core Fiber with Armored Metal Flexible Conduit',
    dimensions: 'Core: 50um, Length: 15 Meters',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    description: 'Armored industrial QBH fiber delivery cable for continuous wave fiber laser sources. Equipped with safety interlock pins, water cooling jacket, and quartz block.',
    specs: ['Direct Importer: NKL Laser Genuine Spares', 'Standard QBH Connector', 'Armored Anti-Crush Conduit'],
    specificationsTable: [
      { label: 'Core Diameter', value: '50um' },
      { label: 'Length', value: '15 Meters' },
      { label: 'Connector Type', value: 'Standard QBH' },
      { label: 'Power Endurance', value: 'Up to 12kW CW' }
    ],
    brand: 'NKL Laser',
    compatibleBrands: ['Max', 'Raycus', 'IPG'],
    powerRange: '1kW - 12kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: true,
    regularPrice: 85000,
    salePrice: 62000,
    estimatedPrice: 62000,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-qbh-fiber-cable-100um-20m',
    sku: 'NKL-FIBER-QBH-100',
    title: 'QBH Industrial Fiber Laser Transmission Cable 1064nm 100um (20M)',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Fiber cable',
    material: 'Silica Core Fiber with Armored Shielding',
    dimensions: 'Core: 100um, Length: 20 Meters',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    description: 'High-power 100um core QBH optical fiber transmission assembly for thick plate laser cutting. Water-cooled end face block with dust sealed packaging.',
    specs: ['Direct Importer: NKL Laser Genuine Spares', '100um Core for Thick Sheet Penetration', 'Safety Interlock Sensor Built-in'],
    specificationsTable: [
      { label: 'Core Diameter', value: '100um' },
      { label: 'Length', value: '20 Meters' },
      { label: 'Connector', value: 'Standard QBH' }
    ],
    brand: 'NKL Laser',
    compatibleBrands: ['Max', 'Raycus', 'IPG'],
    powerRange: '3kW - 20kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: false,
    regularPrice: 95000,
    salePrice: 72000,
    estimatedPrice: 72000,
    moq: 1,
    guid: crypto.randomUUID()
  },

  // 4. Laser Spares -> Welding controller
  {
    id: 'nkl-sup20s-welding-controller-system',
    sku: 'NKL-WELD-CTRL-SUP20S',
    title: 'Sup20S Handheld Fiber Laser Welding Controller System & Wire Feeder Combo',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Welding controller',
    material: 'Industrial Grade Touch Screen CNC Controller & Auto Wire Feeder',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    description: 'Complete Sup20S handheld fiber laser welding control kit including 7-inch touchscreen panel, mainboard, auto wire feeder unit, and safety ground interlock.',
    specs: ['Direct Importer: NKL Laser Genuine CNC Spares', 'Dual Wobble Beam Patterns', 'Automatic Wire Feeding Synced'],
    specificationsTable: [
      { label: 'Model', value: 'Sup20S Welding Control Combo' },
      { label: 'Display', value: '7-inch High Contrast Touch Screen' },
      { label: 'Wobble Modes', value: 'Line, Circle, Double Circle, Triangle' },
      { label: 'Power Compatibility', value: '1kW - 3kW Handheld Laser Welders' }
    ],
    brand: 'NKL Laser / Sup20S',
    compatibleBrands: ['Sup20S'],
    powerRange: '1kW - 3kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: true,
    regularPrice: 38000,
    salePrice: 28500,
    estimatedPrice: 28500,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-qilin-welding-controller-dual-axis',
    sku: 'NKL-WELD-CTRL-QILIN',
    title: 'Qilin Dual Axis Handheld Laser Welding System Motion Controller with Wire Feeder',
    category: 'Laser Spares/Consumables',
    categorySlug: 'laser-spares-consumables',
    subCategory: 'Welding controller',
    material: 'Multi-Axis Galvanometer Controller & Microprocessor PCB',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    description: 'Qilin intelligent dual-axis laser welding control system. Supports weld seam tracking, multiple scan modes, and real-time gas/temperature fault protection.',
    specs: ['Direct Importer: NKL Laser Genuine CNC Spares', 'Dual Axis Wobble Galvo Control', 'Integrated Gas Pressure Sensing'],
    specificationsTable: [
      { label: 'Brand', value: 'Qilin' },
      { label: 'Type', value: 'Dual Axis Handheld Controller' },
      { label: 'Compatibility', value: 'Qilin BWT15, BWT20 Torch Heads' }
    ],
    brand: 'NKL Laser / Qilin',
    compatibleBrands: ['Qilin'],
    powerRange: '1kW - 3kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: false,
    regularPrice: 36000,
    salePrice: 27000,
    estimatedPrice: 27000,
    moq: 1,
    guid: crypto.randomUUID()
  },

  // 5. Category 3: Laser Chiller -> Hanli
  {
    id: 'nkl-hanli-chiller-hl-1500',
    sku: 'NKL-CHL-HANLI-1500',
    title: 'Hanli HL-1500 Dual Temperature Fiber Laser Water Chiller 1.5kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'Hanli',
    material: 'Stainless Steel Water Tank / Dual Circulation Copper Piping',
    dimensions: '650 x 500 x 850 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Original Hanli HL-1500 dual-circuit industrial water chiller designed for 1.5kW fiber laser cutting and welding machines. Independent cooling loops for laser resonator and QBH cutting head optics.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'Dual Circuit Independent Temperature Control', 'High Precision ±0.5°C Stability', 'Eco-friendly R410a Refrigerant'],
    specificationsTable: [
      { label: 'Brand', value: 'Hanli' },
      { label: 'Model', value: 'HL-1500' },
      { label: 'Cooling Capacity', value: '4.2 kW / 14,300 BTU/h' },
      { label: 'Applicable Laser Power', value: '1.5kW CW Fiber Laser' },
      { label: 'Temperature Control Accuracy', value: '±0.5°C' },
      { label: 'Pump Flow Rate', value: '25 L/min' }
    ],
    brand: 'NKL Laser / Hanli',
    compatibleBrands: ['Hanli', 'Max', 'Raycus', 'RayTools'],
    powerRange: '1kW - 3kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: true,
    regularPrice: 85000,
    salePrice: 65000,
    estimatedPrice: 65000,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-hanli-chiller-hl-3000',
    sku: 'NKL-CHL-HANLI-3000',
    title: 'Hanli HL-3000 Dual Circuit Industrial Fiber Laser Chiller 3kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'Hanli',
    material: 'Stainless Steel Tank / Heavy-Duty Compressor',
    dimensions: '750 x 580 x 950 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Heavy-duty Hanli HL-3000 water chiller for 3kW fiber laser cutting systems. Features dual digital thermoregulation displays, flow alarm protection, and water purity filters.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'High Flow Stainless Steel Multistage Pump', '±0.5°C Precision Thermoregulation', 'Complete Flow & Overheat Alarms'],
    specificationsTable: [
      { label: 'Brand', value: 'Hanli' },
      { label: 'Model', value: 'HL-3000' },
      { label: 'Cooling Capacity', value: '8.5 kW / 29,000 BTU/h' },
      { label: 'Laser Power Rating', value: '3kW CW Fiber Laser' },
      { label: 'Refrigerant', value: 'R410a' }
    ],
    brand: 'NKL Laser / Hanli',
    compatibleBrands: ['Hanli', 'Max', 'Raycus', 'RayTools', 'BOCI'],
    powerRange: '3kW - 6kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: false,
    regularPrice: 125000,
    salePrice: 98000,
    estimatedPrice: 98000,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-hanli-chiller-hl-6000',
    sku: 'NKL-CHL-HANLI-6000',
    title: 'Hanli HL-6000 High Power Dual Circuit Fiber Laser Water Chiller 6kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'Hanli',
    material: 'Industrial Rigid Steel Chassis / Dual Copeland Compressors',
    dimensions: '950 x 700 x 1200 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'High-power industrial chiller HL-6000 for 6kW laser machines. Maintains strict ±0.5°C water temperature for optical stability under heavy continuous production.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'Dual Compressor Redundancy', 'Modbus RS485 CNC Communication', 'Automatic Water Filling & Deionizer'],
    specificationsTable: [
      { label: 'Brand', value: 'Hanli' },
      { label: 'Model', value: 'HL-6000' },
      { label: 'Cooling Capacity', value: '17.5 kW' },
      { label: 'Laser Power Rating', value: '6kW Fiber Laser' }
    ],
    brand: 'NKL Laser / Hanli',
    compatibleBrands: ['Hanli', 'Max', 'Raycus', 'BOCI', 'Precitec'],
    powerRange: '6kW - 12kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: true,
    regularPrice: 210000,
    salePrice: 168000,
    estimatedPrice: 168000,
    moq: 1,
    guid: crypto.randomUUID()
  },

  // 6. Category 3: Laser Chiller -> S&a
  {
    id: 'nkl-sna-chiller-cwfl-1500',
    sku: 'NKL-CHL-SNA-1500',
    title: 'S&A CWFL-1500 Dual Circuit Fiber Laser Water Chiller 1.5kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'S&a',
    material: 'Stainless Steel Water Tank / Intelligent T-506 Controller',
    dimensions: '600 x 480 x 820 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Genuine S&A Teyu CWFL-1500 dual-temperature closed loop chiller. Specially designed for 1500W fiber lasers to prevent lens condensation.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'Dual Circuit: Laser Source + QBH Optics', 'High Precision ±0.5°C Temperature Control', 'CE & RoHS Certified'],
    specificationsTable: [
      { label: 'Brand', value: 'S&A' },
      { label: 'Model', value: 'CWFL-1500' },
      { label: 'Cooling Capacity', value: '4.0 kW' },
      { label: 'Laser Power Rating', value: '1.5kW Fiber Laser' },
      { label: 'Water Tank Capacity', value: '28 Liters' }
    ],
    brand: 'NKL Laser / S&A',
    compatibleBrands: ['S&A', 'Max', 'Raycus', 'RayTools'],
    powerRange: '1kW - 3kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: true,
    regularPrice: 89000,
    salePrice: 68000,
    estimatedPrice: 68000,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-sna-chiller-cwfl-3000',
    sku: 'NKL-CHL-SNA-3000',
    title: 'S&A CWFL-3000 Dual Circuit Fiber Laser Water Chiller 3kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'S&a',
    material: 'Stainless Steel Tank / Dual Intelligent Temperature Sensors',
    dimensions: '720 x 550 x 920 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'S&A CWFL-3000 dual circuit industrial water chiller for 3000W fiber laser cutting and welding systems. Integrated Modbus-485 communication protocol.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'Dual Temperature Control for Resonator & Optics', 'High Volume Water Flow with Visual Gauge', 'Built-in Deionizing Filter'],
    specificationsTable: [
      { label: 'Brand', value: 'S&A' },
      { label: 'Model', value: 'CWFL-3000' },
      { label: 'Cooling Capacity', value: '8.4 kW' },
      { label: 'Laser Power Rating', value: '3kW Fiber Laser' }
    ],
    brand: 'NKL Laser / S&A',
    compatibleBrands: ['S&A', 'Max', 'Raycus', 'RayTools', 'WSX', 'BOCI'],
    powerRange: '3kW - 6kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: false,
    regularPrice: 130000,
    salePrice: 102000,
    estimatedPrice: 102000,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-sna-chiller-cwfl-6000',
    sku: 'NKL-CHL-SNA-6000',
    title: 'S&A CWFL-6000 Dual Circuit Fiber Laser Water Chiller 6kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'S&a',
    material: 'Heavy-Duty Industrial Steel Enclosure / Dual Water Pumps',
    dimensions: '980 x 680 x 1150 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'High-power S&A CWFL-6000 industrial water cooling unit for 6kW fiber laser machines. Delivers ultra-steady ±1.0°C cooling for fiber laser sources and optics.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'High Capacity Water Tank with Dual Filter Systems', 'RS485 CNC Monitoring Support', 'Multi-Protection Warning System'],
    specificationsTable: [
      { label: 'Brand', value: 'S&A' },
      { label: 'Model', value: 'CWFL-6000' },
      { label: 'Cooling Capacity', value: '18 kW' },
      { label: 'Laser Power Rating', value: '6kW CW Laser' }
    ],
    brand: 'NKL Laser / S&A',
    compatibleBrands: ['S&A', 'Max', 'Raycus', 'BOCI', 'Precitec'],
    powerRange: '6kW - 12kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: true,
    regularPrice: 220000,
    salePrice: 175000,
    estimatedPrice: 175000,
    moq: 1,
    guid: crypto.randomUUID()
  },

  // 7. Category 3: Laser Chiller -> Hexacool
  {
    id: 'nkl-hexacool-chiller-hexa-1500',
    sku: 'NKL-CHL-HEXA-1500',
    title: 'Hexacool Hexa-1500 High Efficiency Industrial Laser Chiller 1.5kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'Hexacool',
    material: 'Corrosion Resistant Stainless Steel Internal Piping',
    dimensions: '620 x 490 x 830 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Hexacool Hexa-1500 energy-efficient fiber laser chiller. Features micro-channel heat exchangers for 25% lower energy consumption and reliable year-round cooling.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'Energy-Saving Microchannel Condenser', 'Dual Independent Temp Circuits', 'Low Noise Inverter Fan'],
    specificationsTable: [
      { label: 'Brand', value: 'Hexacool' },
      { label: 'Model', value: 'Hexa-1500' },
      { label: 'Laser Power', value: '1.5kW Fiber Laser' },
      { label: 'Temperature Accuracy', value: '±0.5°C' }
    ],
    brand: 'NKL Laser / Hexacool',
    compatibleBrands: ['Hexacool', 'Max', 'Raycus'],
    powerRange: '1kW - 3kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: false,
    regularPrice: 82000,
    salePrice: 62000,
    estimatedPrice: 62000,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-hexacool-chiller-hexa-3000',
    sku: 'NKL-CHL-HEXA-3000',
    title: 'Hexacool Hexa-3000 Dual Temperature Fiber Laser Chiller 3kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'Hexacool',
    material: 'Heavy-Duty Anti-Vibration Stainless Steel Frame',
    dimensions: '740 x 560 x 930 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Hexacool Hexa-3000 industrial laser cooling system designed for tropical environments. Stable cooling performance even at 43°C ambient temperature.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'Tropical Grade Heavy-Duty Compressor', 'Dual Circuit Cooling for Resonator and Head', 'Smart Touch Digital Interface'],
    specificationsTable: [
      { label: 'Brand', value: 'Hexacool' },
      { label: 'Model', value: 'Hexa-3000' },
      { label: 'Cooling Capacity', value: '8.8 kW' },
      { label: 'Laser Power Rating', value: '3kW Fiber Laser' }
    ],
    brand: 'NKL Laser / Hexacool',
    compatibleBrands: ['Hexacool', 'Max', 'Raycus', 'RayTools', 'WSX'],
    powerRange: '3kW - 6kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: true,
    isFeatured: false,
    regularPrice: 128000,
    salePrice: 99000,
    estimatedPrice: 99000,
    moq: 1,
    guid: crypto.randomUUID()
  },
  {
    id: 'nkl-hexacool-chiller-hexa-6000',
    sku: 'NKL-CHL-HEXA-6000',
    title: 'Hexacool Hexa-6000 Intelligent Fiber Laser Water Chiller 6kW',
    category: 'Laser Chiller',
    categorySlug: 'laser-chiller',
    subCategory: 'Hexacool',
    material: 'Industrial Stainless Steel High Pressure Piping & Dual Pumps',
    dimensions: '960 x 690 x 1180 mm',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Hexacool Hexa-6000 dual-temperature industrial water chiller engineered for continuous 24/7 cutting on 6kW fiber laser machines.',
    specs: ['Direct Importer: NKL Laser Factory Sourced', 'High Flow Rate Multistage Water Pump', 'Dual Independent Temp Loops', 'Deionizer Filter Cartridge Built-in'],
    specificationsTable: [
      { label: 'Brand', value: 'Hexacool' },
      { label: 'Model', value: 'Hexa-6000' },
      { label: 'Cooling Capacity', value: '18.2 kW' },
      { label: 'Laser Power Rating', value: '6kW Fiber Laser' }
    ],
    brand: 'NKL Laser / Hexacool',
    compatibleBrands: ['Hexacool', 'Max', 'Raycus', 'BOCI'],
    powerRange: '6kW - 12kW',
    stockStatus: 'In Stock',
    inStock: true,
    isPopular: false,
    isFeatured: true,
    regularPrice: 215000,
    salePrice: 172000,
    estimatedPrice: 172000,
    moq: 1,
    guid: crypto.randomUUID()
  }
];

// Combine all products
const allProducts: ProductItem[] = [...updatedProducts, ...newItemsToAdd];

// Calculate item counts for the 3 categories
NEW_CATEGORIES.forEach(cat => {
  cat.itemCount = allProducts.filter(p => p.categorySlug === cat.slug).length;
});

console.log('Total all products:', allProducts.length);
NEW_CATEGORIES.forEach(c => {
  console.log(`Category: ${c.name} (${c.slug}) -> ${c.itemCount} items`);
});

// Verify subcategory distributions
const subDist: Record<string, number> = {};
allProducts.forEach(p => {
  const key = `${p.category} -> ${p.subCategory}`;
  subDist[key] = (subDist[key] || 0) + 1;
});
console.log('Subcategory distribution:', subDist);

// Write to server/seedData.ts
const seedDataContent = `import { ProductItem, ProductCategoryDef, BrandItem, ReviewItem, SiteSettings } from '../src/types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = ${JSON.stringify(DEFAULT_SITE_SETTINGS, null, 2)};

export const INITIAL_PRODUCTS: ProductItem[] = ${JSON.stringify(allProducts, null, 2)};

export const STORE_CATEGORIES: ProductCategoryDef[] = ${JSON.stringify(NEW_CATEGORIES, null, 2)};

export const INITIAL_BRANDS: BrandItem[] = ${JSON.stringify(INITIAL_BRANDS, null, 2)};

export const INITIAL_REVIEWS: ReviewItem[] = ${JSON.stringify(INITIAL_REVIEWS, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'server/seedData.ts'), seedDataContent, 'utf-8');
console.log('Successfully updated server/seedData.ts!');

// Update d1-schema.sql
// We will update line 50 and line 51 with the new serialized json
const d1SchemaPath = path.join(process.cwd(), 'd1-schema.sql');
const d1SchemaLines = fs.readFileSync(d1SchemaPath, 'utf-8').split('\n');

const newProductsJson = JSON.stringify(allProducts).replace(/'/g, "''");
const newCategoriesJson = JSON.stringify(NEW_CATEGORIES).replace(/'/g, "''");

// Find products line and categories line
let updatedD1Lines = d1SchemaLines.map(line => {
  if (line.startsWith("INSERT OR IGNORE INTO config (key, value) VALUES ('products',")) {
    return `INSERT OR IGNORE INTO config (key, value) VALUES ('products', '${newProductsJson}');`;
  }
  if (line.startsWith("INSERT OR IGNORE INTO config (key, value) VALUES ('categories',")) {
    return `INSERT OR IGNORE INTO config (key, value) VALUES ('categories', '${newCategoriesJson}');`;
  }
  return line;
});

fs.writeFileSync(d1SchemaPath, updatedD1Lines.join('\n'), 'utf-8');
console.log('Successfully updated d1-schema.sql!');
