import { BrandItem } from '../types';
import { SITE_IMAGES } from './siteImages';

export const INITIAL_BRANDS: BrandItem[] = [
  {
    id: 'brand-raytools',
    name: 'RayTools',
    logoUrl: SITE_IMAGES.brands.raytools.localPath,
    category: 'Cutting Heads & Spares',
    description: 'World leading fiber laser cutting head technology. Full range of BM110, BM111, BM06K, BM114, BM115, BT220, BT240 spares & consumables.',
    seriesList: ['BM110', 'BM111', 'BM06K', 'BM114', 'BM115', 'BT220', 'BT240']
  },
  {
    id: 'brand-ospri',
    name: 'OSPRI',
    logoUrl: SITE_IMAGES.brands.ospri.localPath,
    category: 'Cutting Heads & Spares',
    description: 'High-power intelligent autofocus fiber laser cutting head spares. LC40, LC80, LC80 Plus, LC218, LC608, LC808, LCm08 consumables.',
    seriesList: ['LC40', 'LC80', 'LC80 Plus', 'LC218', 'LC608', 'LC808', 'LCm08']
  },
  {
    id: 'brand-bochu',
    name: 'BOCHU (FSCUT)',
    logoUrl: SITE_IMAGES.brands.bochu.localPath,
    category: 'CNC Controllers & Software',
    description: 'Industry standard FSCUT CNC laser controllers, wireless remotes, RF cables, height sensors & control cards.',
    seriesList: ['FSCUT2000C', 'FSCUT3000', 'FSCUT4000', 'BCS100 Height Controller', 'WKC Wireless Remote']
  },
  {
    id: 'brand-wsx',
    name: 'WSX',
    logoUrl: SITE_IMAGES.brands.wsx.localPath,
    category: 'Cutting Heads & Spares',
    description: 'Precision fiber laser cutting heads. Spares for NC30, NC63, NC68 series cutting heads and replacement optic assemblies.',
    seriesList: ['NC30', 'NC63', 'NC68']
  },
  {
    id: 'brand-precitec',
    name: 'Precitec',
    logoUrl: SITE_IMAGES.brands.precitec.localPath,
    category: 'High-End Laser Optics',
    description: 'German standard cutting head consumables, ProCutter protective windows, KT B2 ceramic bodies and copper nozzles.',
    seriesList: ['ProCutter 2.0', 'LightCutter', 'KT B2', 'HP Series']
  },
  {
    id: 'brand-smc',
    name: 'SMC',
    logoUrl: SITE_IMAGES.brands.smc.localPath,
    category: 'Pneumatics & Automation',
    description: 'Genuine Japanese precision electro-pneumatic proportional valves and high pressure gas control solenoids.',
    seriesList: ['ITV2050', 'ITV2030', 'VX232', 'VXD2140']
  }
];
