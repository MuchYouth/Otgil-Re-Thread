
import { ClothingCategory } from './types';

export const IMPACT_FACTORS: Record<ClothingCategory, { water: number; co2: number }> = {
  '티셔츠': { water: 2700, co2: 5.5 },
  '바지': { water: 7600, co2: 22 },
  '드레스': { water: 5000, co2: 15 },
  '자켓': { water: 10000, co2: 30 },
  '악세서리': { water: 500, co2: 1 },
};
