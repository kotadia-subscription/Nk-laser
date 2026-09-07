import { MaterialSpec, MaterialType, MaterialCapability, FAQItem } from '../types';
import { SITE_IMAGES } from './siteImages';

export const INITIAL_MATERIALS: MaterialSpec[] = [
  {
    name: 'Stainless Steel',
    grades: ['SS 304', 'SS 316', 'SS 316L', 'SS 202', 'SS 430'],
    maxThicknessMm: 16,
    cuttingGas: 'High Pressure Nitrogen (N2) / Air',
    surfaceFinish: '2B, No. 4 Brush, Mirror (8K), Scotch-Brite with PVC laser film',
    description: 'Oxidation-free clean mirror cut edge suitable for pharmaceuticals, food machinery, chemical vessels, and architectural fabrication.',
    imageUrl: SITE_IMAGES.materials.stainlessSteel.localPath,
    applications: ['Kitchen Equipment', 'Pharma Machinery', 'Architectural Panels', 'Enclosures']
  },
  {
    name: 'Mild Steel (MS)',
    grades: ['IS 2062 Grade A/B', 'CRCA Sheet', 'HR Plate', 'Strenx / Hardox'],
    maxThicknessMm: 25,
    cuttingGas: 'Oxygen (O2) for thick plate / High Pressure N2 for thin sheet',
    surfaceFinish: 'Clean deburred edge, ready for welding and powder coating',
    description: 'High-speed profiling from 0.8mm thin sheets up to 25mm heavy structural base plates and heavy machinery chassis components.',
    imageUrl: SITE_IMAGES.materials.mildSteel.localPath,
    applications: ['Chassis & Frames', 'Flanges & Base Plates', 'Heavy Machinery', 'Gates & Jali']
  },
  {
    name: 'Aluminum',
    grades: ['AL 5052-H32', 'AL 6061-T6', 'AL 1050', 'AL 8011'],
    maxThicknessMm: 12,
    cuttingGas: 'High Pressure Nitrogen (N2) / High Pressure Clean Air',
    surfaceFinish: 'Smooth burr-free edge with scratch-protection laser film',
    description: 'Precision cutting of lightweight, high-thermal conductive aluminum alloys with minimal thermal distortion and clean edge definition.',
    imageUrl: SITE_IMAGES.materials.aluminum.localPath,
    applications: ['Aerospace Brackets', 'Automotive Heat Shields', 'EV Battery Boxes', 'Light Fixtures']
  },
  {
    name: 'Brass',
    grades: ['CuZn37 (Commercial Brass)', 'CuZn40', 'Architectural Brass (IS 319)'],
    maxThicknessMm: 8,
    cuttingGas: 'High Pressure Nitrogen (N2)',
    surfaceFinish: 'Bright, burr-free edge without discoloration',
    description: 'Specialized fiber laser cutting parameter control preventing optical back-reflection damage on highly reflective yellow brass sheets.',
    imageUrl: SITE_IMAGES.materials.brassCopper.localPath,
    applications: ['Luxury Interior Screens', 'Electrical Busbars', 'Decorative Hardware', 'Nameplates']
  },
  {
    name: 'Copper',
    grades: ['Electrolytic Tough Pitch (ETP Cu)', 'Oxygen Free Copper (OFC)'],
    maxThicknessMm: 6,
    cuttingGas: 'High Pressure Oxygen (O2) / High Pressure N2',
    surfaceFinish: 'Precision cut edges with high electrical conductivity integrity',
    description: 'Cut with dedicated back-reflection isolators for electrical switchgear, transformer busbars, and EV charging contact lugs.',
    imageUrl: SITE_IMAGES.materials.brassCopper.localPath,
    applications: ['Electrical Busbars', 'EV Battery Terminals', 'Power Distribution', 'Heat Sinks']
  }
];

export const MATERIAL_CAPABILITIES: MaterialCapability[] = [
  {
    material: 'Stainless Steel (SS 304 / 316 / 202)',
    grades: 'SS 304, SS 316L, SS 202, SS 430',
    maxThickness: 'Up to 16 mm',
    assistGas: 'High Pressure Nitrogen (N2) / Compressed Air',
    applications: 'Pharmaceutical machinery, kitchenware, architectural panels, enclosures',
    tolerance: '±0.05 mm'
  },
  {
    material: 'Mild Steel / Carbon Steel (MS / CR / HR)',
    grades: 'IS 2062 Gr A/B, CRCA, HR, Corten, Hardox',
    maxThickness: 'Up to 25 mm',
    assistGas: 'Oxygen (O2) / High-Pressure N2 for thin sheets',
    applications: 'Heavy machinery chassis, brackets, base plates, gates, jali panels',
    tolerance: '±0.05 mm'
  },
  {
    material: 'Aluminum & Alloys',
    grades: 'AL 5052-H32, AL 6061-T6, Commercial AL',
    maxThickness: 'Up to 12 mm',
    assistGas: 'High Pressure Nitrogen (N2)',
    applications: 'Automotive heat shields, aerospace brackets, electronic heat sinks',
    tolerance: '±0.08 mm'
  },
  {
    material: 'Brass & Copper Alloys',
    grades: 'CuZn37 Brass, IS 319, ETP Copper, OFC Copper',
    maxThickness: 'Brass: 8 mm | Copper: 6 mm',
    assistGas: 'High Pressure Nitrogen / Oxygen',
    applications: 'Electrical busbars, EV switchgear, decorative architectural jali',
    tolerance: '±0.08 mm'
  },
  {
    material: 'Acrylic & Engineering Plastics',
    grades: 'Cast Acrylic, PMMA, Polycarbonate',
    maxThickness: 'Up to 20 mm',
    assistGas: 'Dry Compressed Air',
    applications: 'Signage, architectural light diffusers, protective shields',
    tolerance: '±0.1 mm'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I identify the correct nozzle or protective lens for my laser head?',
    answer: 'You can check the laser head brand and model (e.g., RayTools BM111, OSPRI LC208, WSX NC30) or share a clear photo of your existing nozzle/lens with dimensions on WhatsApp (+91 99020 35374). Our technical team will immediately confirm exact model compatibility.'
  },
  {
    question: 'What is the dispatch and delivery timeframe for laser spares?',
    answer: 'All in-stock consumables (RayTools lenses, OSPRI protective windows, copper nozzles, ceramic rings, CypCut remotes) are dispatched immediately with express 1 to 2 business day courier delivery and tracking across India.'
  },
  {
    question: 'Are your RayTools, OSPRI, and WSX spares genuine imported OEM quality?',
    answer: 'Yes, we are direct factory importers. Our optical windows use high-purity JGS1/Corning fused quartz silica with >99.8% transmittance at 1064nm, and our nozzles are precision CNC turned from high-conductivity tellurium copper for long lifespan.'
  },
  {
    question: 'What laser head brands and power ratings do your spares support?',
    answer: 'We stock ready spares for RayTools (BT240, BM110, BM111, BM06K), OSPRI (LC208, LC210, LC218), WSX (NC30, NC60, NC150), BOCHU/Friendess (BCS100, FSCUT2000), Precitec, and Han’s Laser for powers ranging from 1kW up to 20kW+.'
  },
  {
    question: 'Do you offer bulk wholesale discounts for machine manufacturers and job shops?',
    answer: 'Yes, we provide wholesale tier pricing and bulk distributor packaging for laser machine manufacturers, service engineers, and large-scale cutting job shops. Contact us on WhatsApp or submit an RFQ cart for bulk price sheets.'
  }
];

export const MATERIAL_THICKNESS_RANGES: Record<MaterialType, { min: number; max: number; default: number }> = {
  'Stainless Steel': { min: 0.5, max: 16, default: 2 },
  'Mild Steel (MS)': { min: 0.8, max: 25, default: 3 },
  'Aluminum': { min: 0.8, max: 12, default: 2 },
  'Brass': { min: 0.8, max: 8, default: 1.5 },
  'Copper': { min: 0.8, max: 6, default: 1 },
  'Acrylic': { min: 1, max: 20, default: 5 },
  'Wood/MDF': { min: 2, max: 18, default: 6 },
  'Fused Quartz / Silica': { min: 1.5, max: 15, default: 5 },
  'Copper (TeCu / T2)': { min: 1, max: 10, default: 2 },
  'Technical Ceramic (Al2O3)': { min: 1, max: 12, default: 3 },
  'Optical Glass': { min: 1, max: 15, default: 4 }
};

