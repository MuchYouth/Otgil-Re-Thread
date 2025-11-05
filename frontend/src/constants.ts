
import { ClothingCategory } from './types';

export const IMPACT_FACTORS: Record<ClothingCategory, { water: number; co2: number }> = {
  'T-SHIRT': { water: 2700, co2: 5.5 },
  'JEANS': { water: 7600, co2: 22 },
  'DRESS': { water: 5000, co2: 15 },
  'JACKET': { water: 10000, co2: 30 },
  'ACCESSORY': { water: 500, co2: 1 },
};
