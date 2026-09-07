import { ServiceItem } from '../types';
import { SITE_IMAGES } from './siteImages';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'sheet-metal-laser',
    title: 'Sheet Metal Fiber Laser Cutting',
    category: 'Sheet Metal Cutting',
    shortDesc: 'High-power fiber laser cutting up to 25mm thickness with micro-precision tolerance and mirror-smooth burr-free edges.',
    description: 'Our state-of-the-art multi-kW Fiber Laser Cutting machine handles complex sheet metal geometries with extreme accuracy. Suitable for Stainless Steel, Mild Steel, Aluminum, Brass, and Copper sheets.',
    iconName: 'Zap',
    imageUrl: SITE_IMAGES.services.sheetMetalCutting.localPath,
    materials: ['Stainless Steel', 'Mild Steel (MS)', 'Aluminum', 'Brass', 'Copper'],
    maxThickness: '25 mm (MS) / 16 mm (SS)',
    tolerance: '±0.05 mm',
    features: [
      'High-speed precision cutting for rapid turnarounds',
      'Nitrogen assist cutting for oxidation-free clean edges',
      'Nesting software optimization for zero material waste',
      'Ideal for prototype to 50,000+ batch production'
    ],
    startingPriceEstimate: '₹45 / min machine runtime'
  },
  {
    id: 'spares-consumables',
    title: 'Laser Machine Spares & Consumables Importer',
    category: 'Laser Cutting Spares & Consumables',
    shortDesc: 'Direct factory importer of RayTools, OSPRI, WSX, BOCHU cutting heads, quartz lenses, copper nozzles & ceramic rings.',
    description: 'Stocking over 20,000+ ready-to-ship replacement parts for all major CNC fiber laser cutting machine brands. Guaranteed OEM compatibility, superior optical purity, high temperature resistance, and express shipping across India.',
    iconName: 'Shield',
    imageUrl: SITE_IMAGES.services.sparesImporter.localPath,
    materials: ['Fused Quartz / Silica', 'Copper (TeCu / T2)', 'Technical Ceramic (Al2O3)', 'Optical Glass'],
    maxThickness: 'RayTools / OSPRI / WSX / BOCHU / DNE',
    tolerance: '100% OEM Fitment',
    features: [
      'Genuine factory import with certificate of optical purity',
      'Dual-side anti-reflective coated quartz windows (transmittance >99.8%)',
      'Tellurium copper single & double layer nozzles with hard chrome plating',
      'Fast 1-2 days express courier delivery across India'
    ],
    startingPriceEstimate: 'Starting ₹180 / piece'
  },
  {
    id: 'tube-pipe-laser',
    title: 'CNC Tube & Pipe Laser Cutting',
    category: 'Tube & Pipe Laser',
    shortDesc: 'Rotary chuck laser profiling for round, square, rectangular, oval tubes and open channels up to 220mm diameter.',
    description: 'Automated 3D rotary chuck fiber laser tube processing eliminating traditional saw cutting, drilling, and slotting into one fast operation.',
    iconName: 'Disc',
    imageUrl: SITE_IMAGES.services.tubePipeCutting.localPath,
    materials: ['Mild Steel (MS)', 'Stainless Steel', 'Aluminum'],
    maxThickness: '220 mm diameter, 10 mm wall',
    tolerance: '±0.1 mm',
    features: [
      'Complex slotting, miter cuts, interlocking tabs, and hole arrays',
      'Eliminates manual hole drilling, deburring, and sawing',
      'Interlocking tab-and-slot designs for instant weld jigging',
      'High repeatability for furniture, structural frames, & chassis'
    ],
    startingPriceEstimate: '₹60 / tube cut cycle'
  },
  {
    id: 'cnc-bending',
    title: 'CNC Hydraulic Press Brake Bending',
    category: 'CNC Bending',
    shortDesc: 'Multi-axis CNC synchronized bending with segmented tooling, crowning compensation, and precise angular accuracy.',
    description: 'Precision bending from thin 0.8mm sheet metal brackets to heavy 12mm structural plates with auto-crowning technology.',
    iconName: 'Sliders',
    imageUrl: SITE_IMAGES.services.cncBending.localPath,
    materials: ['Stainless Steel', 'Mild Steel (MS)', 'Aluminum', 'Brass'],
    maxThickness: 'Up to 12 mm bending capacity',
    tolerance: '±0.2° angle tolerance',
    features: [
      'Segmented precision-ground punch and die tooling',
      'Hemming, acute, offset, and radius bending operations',
      'Complex multi-bend profiles without tool collision',
      'Scratch-free bending films for decorative SS & Aluminum'
    ],
    startingPriceEstimate: '₹8 / bend stroke'
  },
  {
    id: 'laser-welding-service',
    title: 'Precision Fiber Laser Welding',
    category: 'Laser Welding',
    shortDesc: 'High-speed laser welding with deep penetration, minimal thermal distortion, and seamless polished seams.',
    description: 'Modern fiber laser welding technology providing 4x-10x faster seam speeds than traditional TIG welding with minimal heat distortion.',
    iconName: 'Flame',
    imageUrl: SITE_IMAGES.services.laserWelding.localPath,
    materials: ['Stainless Steel', 'Mild Steel (MS)', 'Aluminum'],
    maxThickness: '6 mm welding depth',
    tolerance: 'Seamless cosmetic finish',
    features: [
      'Minimal post-weld grinding and polishing required',
      'Suitable for thin gauge sheet metal enclosures & tanks',
      'Continuous and pulse spot welding modes',
      'High structural strength seam welds'
    ],
    startingPriceEstimate: '₹120 / meter weld'
  },
  {
    id: 'decorative-jali',
    title: 'Architectural Laser Cut Jali & Panels',
    category: 'Decorative & Architectural Jali',
    shortDesc: 'Custom parametric laser-cut metal screens, room dividers, gate grills, elevations, and luxury interior decorative panels.',
    description: 'Transforming architect designs into intricate metal & acrylic artwork with 500+ geometric, floral, and modern pattern options.',
    iconName: 'Grid',
    imageUrl: SITE_IMAGES.services.architecturalJali.localPath,
    materials: ['Stainless Steel', 'Mild Steel (MS)', 'Brass', 'Aluminum', 'Acrylic'],
    maxThickness: '1.2 mm to 10 mm',
    tolerance: '±0.1 mm intricate detail',
    features: [
      'Custom CAD scaling for exterior facades & gates',
      'Powder coating, PVD titanium coating, and antique brass finishes',
      'Integrated LED backlighting frame design options',
      'Weather-resistant outdoor grade materials'
    ],
    startingPriceEstimate: '₹180 / sq.ft'
  }
];
