import { LandCategory, Region, ActivityType } from "@prisma/client";

// Tasas RAU Bolivia (Bs/ha) - Actualizables desde administración
export const RAU_RATES_2024: Record<Region, Record<LandCategory, Record<ActivityType, number>>> = {
  ALTIPLANO: {
    PRIMERA_CLASE: { AGRICULTURA: 45.0, GANADERIA: 22.5, MIXTA: 33.75, FORESTAL: 11.25 },
    SEGUNDA_CLASE: { AGRICULTURA: 30.0, GANADERIA: 15.0, MIXTA: 22.5, FORESTAL: 7.5 },
    TERCERA_CLASE: { AGRICULTURA: 15.0, GANADERIA: 7.5, MIXTA: 11.25, FORESTAL: 3.75 },
  },
  VALLES: {
    PRIMERA_CLASE: { AGRICULTURA: 55.0, GANADERIA: 27.5, MIXTA: 41.25, FORESTAL: 13.75 },
    SEGUNDA_CLASE: { AGRICULTURA: 38.0, GANADERIA: 19.0, MIXTA: 28.5, FORESTAL: 9.5 },
    TERCERA_CLASE: { AGRICULTURA: 20.0, GANADERIA: 10.0, MIXTA: 15.0, FORESTAL: 5.0 },
  },
  LLANOS: {
    PRIMERA_CLASE: { AGRICULTURA: 50.0, GANADERIA: 25.0, MIXTA: 37.5, FORESTAL: 12.5 },
    SEGUNDA_CLASE: { AGRICULTURA: 35.0, GANADERIA: 17.5, MIXTA: 26.25, FORESTAL: 8.75 },
    TERCERA_CLASE: { AGRICULTURA: 18.0, GANADERIA: 9.0, MIXTA: 13.5, FORESTAL: 4.5 },
  },
};

export interface RauSimulation {
  region: Region;
  landCategory: LandCategory;
  activityType: ActivityType;
  area: number;
  year: number;
  ratePerHa: number;
  baseAmount: number;
  adjustments: number;
  totalAmount: number;
  dueDate: Date;
}

export function calculateRau(
  region: Region,
  landCategory: LandCategory,
  activityType: ActivityType,
  area: number,
  year = new Date().getFullYear(),
  adjustmentPercent = 0
): RauSimulation {
  const ratePerHa = RAU_RATES_2024[region][landCategory][activityType];
  const baseAmount = area * ratePerHa;
  const adjustments = baseAmount * (adjustmentPercent / 100);
  const totalAmount = baseAmount + adjustments;

  // Vencimiento: 31 de marzo del año siguiente
  const dueDate = new Date(year + 1, 2, 31);

  return {
    region,
    landCategory,
    activityType,
    area,
    year,
    ratePerHa,
    baseAmount,
    adjustments,
    totalAmount,
    dueDate,
  };
}

export function getLandCategoryLabel(cat: LandCategory): string {
  const labels: Record<LandCategory, string> = {
    PRIMERA_CLASE: "Primera Clase",
    SEGUNDA_CLASE: "Segunda Clase",
    TERCERA_CLASE: "Tercera Clase",
  };
  return labels[cat];
}

export function getRegionLabel(region: Region): string {
  const labels: Record<Region, string> = {
    ALTIPLANO: "Altiplano",
    VALLES: "Valles",
    LLANOS: "Llanos",
  };
  return labels[region];
}

export function getActivityLabel(activity: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    AGRICULTURA: "Agricultura",
    GANADERIA: "Ganadería",
    MIXTA: "Mixta",
    FORESTAL: "Forestal",
  };
  return labels[activity];
}
