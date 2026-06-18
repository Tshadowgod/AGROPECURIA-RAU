// Tabla oficial RAU — Gestión 2026 (DS 24463 y actualizaciones por RND)

export type ZonaRAU = "ALTIPLANO_PUNA" | "VALLES" | "SUBTROPICAL" | "TROPICAL";

export type SubzonaRAU =
  // Altiplano y Puna
  | "NORTE_RIBERANA_TITICACA"
  | "NORTE_CON_TITICACA"
  | "NORTE_SIN_TITICACA"
  | "CENTRAL_CON_POOPO"
  | "CENTRAL_SIN_POOPO"
  | "SUR_SEMIDESERTICA"
  | "SUR_ANDINA_PUNA"
  // Valles
  | "VALLES_ABT_CBB_RIEGO"
  | "VALLES_ABT_CBB_SECANO"
  | "VALLES_ABT_CBB_VITICOLA"
  | "OTROS_VALLES_RIEGO"
  | "OTROS_VALLES_SECANO"
  | "OTROS_VALLES_VITICOLA"
  | "VALLES_CERR_SERRANIAS"
  | "VALLES_CERR_OTROS_RIEGO"
  | "VALLES_CERR_OTROS_SECANO"
  | "VALLES_CERR_OTROS_VITICOLA"
  | "CABECERAS_VALLE_SECANO"
  // Subtropical
  | "YUNGAS"
  | "SANTA_CRUZ"
  | "CHACO"
  // Tropical
  | "BENI_PANDO_ITURRALDE";

export type TipoActividadRAU = "AGRICOLA_OTROS" | "PECUARIA";

export interface TasaRAU {
  zona: ZonaRAU;
  subzona: SubzonaRAU;
  subzonaLabel: string;
  agricolaMin: number;
  agricolaMax: number;
  pecuariaMin: number;
  pecuariaMax: number;
  tasaAgricola: number; // Bs/ha
  tasaPecuaria: number; // Bs/ha
}

// Tabla oficial RAU — Gestión 2026 (Anexo II DS 24463 actualizado)
export const TABLA_RAU_2024: TasaRAU[] = [
  // ─── ZONA ALTIPLANO Y PUNA ─────────────────────────────────────────────
  {
    zona: "ALTIPLANO_PUNA", subzona: "NORTE_RIBERANA_TITICACA",
    subzonaLabel: "Ribereña al Lago Titicaca",
    agricolaMin: 10, agricolaMax: 160, pecuariaMin: 10, pecuariaMax: 160,
    tasaAgricola: 49.06, tasaPecuaria: 3.03,
  },
  {
    zona: "ALTIPLANO_PUNA", subzona: "NORTE_CON_TITICACA",
    subzonaLabel: "Con influencia del Lago Titicaca",
    agricolaMin: 10, agricolaMax: 160, pecuariaMin: 10, pecuariaMax: 160,
    tasaAgricola: 44.34, tasaPecuaria: 3.03,
  },
  {
    zona: "ALTIPLANO_PUNA", subzona: "NORTE_SIN_TITICACA",
    subzonaLabel: "Sin influencia del Lago Titicaca",
    agricolaMin: 20, agricolaMax: 300, pecuariaMin: 20, pecuariaMax: 300,
    tasaAgricola: 34.77, tasaPecuaria: 3.03,
  },
  {
    zona: "ALTIPLANO_PUNA", subzona: "CENTRAL_CON_POOPO",
    subzonaLabel: "Con influencia del Lago Poopó",
    agricolaMin: 15, agricolaMax: 240, pecuariaMin: 15, pecuariaMax: 240,
    tasaAgricola: 36.72, tasaPecuaria: 3.15,
  },
  {
    zona: "ALTIPLANO_PUNA", subzona: "CENTRAL_SIN_POOPO",
    subzonaLabel: "Sin influencia del Lago Poopó",
    agricolaMin: 30, agricolaMax: 500, pecuariaMin: 30, pecuariaMax: 500,
    tasaAgricola: 28.51, tasaPecuaria: 1.62,
  },
  {
    zona: "ALTIPLANO_PUNA", subzona: "SUR_SEMIDESERTICA",
    subzonaLabel: "Sur y semidesértica",
    agricolaMin: 35, agricolaMax: 700, pecuariaMin: 35, pecuariaMax: 700,
    tasaAgricola: 15.87, tasaPecuaria: 1.78,
  },
  {
    zona: "ALTIPLANO_PUNA", subzona: "SUR_ANDINA_PUNA",
    subzonaLabel: "Andina, altiplano y puna",
    agricolaMin: 35, agricolaMax: 700, pecuariaMin: 35, pecuariaMax: 700,
    tasaAgricola: 15.87, tasaPecuaria: 1.78,
  },

  // ─── ZONA DE VALLES ────────────────────────────────────────────────────
  {
    zona: "VALLES", subzona: "VALLES_ABT_CBB_RIEGO",
    subzonaLabel: "Valles abiertos Cbba — Riego",
    agricolaMin: 6, agricolaMax: 100, pecuariaMin: 6, pecuariaMax: 100,
    tasaAgricola: 136.96, tasaPecuaria: 6.17,
  },
  {
    zona: "VALLES", subzona: "VALLES_ABT_CBB_SECANO",
    subzonaLabel: "Valles abiertos Cbba — Secano",
    agricolaMin: 12, agricolaMax: 200, pecuariaMin: 12, pecuariaMax: 200,
    tasaAgricola: 45.54, tasaPecuaria: 1.57,
  },
  {
    zona: "VALLES", subzona: "VALLES_ABT_CBB_VITICOLA",
    subzonaLabel: "Valles abiertos Cbba — Vitícola",
    agricolaMin: 3, agricolaMax: 48, pecuariaMin: 3, pecuariaMax: 48,
    tasaAgricola: 155.07, tasaPecuaria: 0,
  },
  {
    zona: "VALLES", subzona: "OTROS_VALLES_RIEGO",
    subzonaLabel: "Otros valles abiertos — Riego",
    agricolaMin: 6, agricolaMax: 120, pecuariaMin: 6, pecuariaMax: 120,
    tasaAgricola: 136.96, tasaPecuaria: 6.17,
  },
  {
    zona: "VALLES", subzona: "OTROS_VALLES_SECANO",
    subzonaLabel: "Otros valles abiertos — Secano",
    agricolaMin: 12, agricolaMax: 300, pecuariaMin: 12, pecuariaMax: 300,
    tasaAgricola: 45.54, tasaPecuaria: 1.57,
  },
  {
    zona: "VALLES", subzona: "OTROS_VALLES_VITICOLA",
    subzonaLabel: "Otros valles abiertos — Vitícola",
    agricolaMin: 3, agricolaMax: 48, pecuariaMin: 3, pecuariaMax: 48,
    tasaAgricola: 155.07, tasaPecuaria: 0,
  },
  {
    zona: "VALLES", subzona: "VALLES_CERR_SERRANIAS",
    subzonaLabel: "Valles cerrados — En valles y serranías",
    agricolaMin: 0, agricolaMax: 160, pecuariaMin: 0, pecuariaMax: 160,
    tasaAgricola: 65.93, tasaPecuaria: 2.90,
  },
  {
    zona: "VALLES", subzona: "VALLES_CERR_OTROS_RIEGO",
    subzonaLabel: "Valles cerrados otros — Riego",
    agricolaMin: 4, agricolaMax: 60, pecuariaMin: 4, pecuariaMax: 60,
    tasaAgricola: 142.64, tasaPecuaria: 5.84,
  },
  {
    zona: "VALLES", subzona: "VALLES_CERR_OTROS_SECANO",
    subzonaLabel: "Valles cerrados otros — Secano",
    agricolaMin: 8, agricolaMax: 120, pecuariaMin: 8, pecuariaMax: 120,
    tasaAgricola: 65.93, tasaPecuaria: 2.90,
  },
  {
    zona: "VALLES", subzona: "VALLES_CERR_OTROS_VITICOLA",
    subzonaLabel: "Valles cerrados otros — Vitícola",
    agricolaMin: 3, agricolaMax: 48, pecuariaMin: 3, pecuariaMax: 48,
    tasaAgricola: 155.07, tasaPecuaria: 0,
  },
  {
    zona: "VALLES", subzona: "CABECERAS_VALLE_SECANO",
    subzonaLabel: "Cabeceras de valle — Secano",
    agricolaMin: 20, agricolaMax: 400, pecuariaMin: 20, pecuariaMax: 400,
    tasaAgricola: 21.80, tasaPecuaria: 1.70,
  },

  // ─── ZONA SUBTROPICAL ─────────────────────────────────────────────────
  {
    zona: "SUBTROPICAL", subzona: "YUNGAS",
    subzonaLabel: "Yungas",
    agricolaMin: 10, agricolaMax: 300, pecuariaMin: 500, pecuariaMax: 10000,
    tasaAgricola: 57.44, tasaPecuaria: 3.03,
  },
  {
    zona: "SUBTROPICAL", subzona: "SANTA_CRUZ",
    subzonaLabel: "Santa Cruz",
    agricolaMin: 50, agricolaMax: 1000, pecuariaMin: 500, pecuariaMax: 10000,
    tasaAgricola: 35.51, tasaPecuaria: 2.61,
  },
  {
    zona: "SUBTROPICAL", subzona: "CHACO",
    subzonaLabel: "Chaco",
    agricolaMin: 80, agricolaMax: 1200, pecuariaMin: 500, pecuariaMax: 10000,
    tasaAgricola: 3.69, tasaPecuaria: 1.37,
  },

  // ─── ZONA TROPICAL ────────────────────────────────────────────────────
  {
    zona: "TROPICAL", subzona: "BENI_PANDO_ITURRALDE",
    subzonaLabel: "Beni, Pando y Prov. Iturralde (La Paz)",
    agricolaMin: 50, agricolaMax: 1000, pecuariaMin: 500, pecuariaMax: 10000,
    tasaAgricola: 32.57, tasaPecuaria: 2.61,
  },
];

export interface ResultadoRAU {
  subzonaLabel: string;
  tipoActividad: TipoActividadRAU;
  hectareas: number;
  minHa: number;
  maxHa: number;
  tasa: number;
  montoBase: number;
  montoTotal: number;
  esNoImponible: boolean; // bajo el mínimo
  superaMaximo: boolean;  // sobre el máximo → Régimen General
  vencimiento: Date;
  gestion: number;
  formulario: string;
  mensaje?: string;
}

export function calcularRAU(
  subzona: SubzonaRAU,
  tipoActividad: TipoActividadRAU,
  hectareas: number,
  gestion = new Date().getFullYear()
): ResultadoRAU {
  const tasaRow = TABLA_RAU_2024.find((r) => r.subzona === subzona);
  if (!tasaRow) throw new Error(`Subzona no encontrada: ${subzona}`);

  const esAgricola = tipoActividad === "AGRICOLA_OTROS";
  const minHa = esAgricola ? tasaRow.agricolaMin : tasaRow.pecuariaMin;
  const maxHa = esAgricola ? tasaRow.agricolaMax : tasaRow.pecuariaMax;
  const tasa = esAgricola ? tasaRow.tasaAgricola : tasaRow.tasaPecuaria;

  const esNoImponible = hectareas < minHa;
  const superaMaximo = hectareas > maxHa;

  const montoBase = esNoImponible || superaMaximo ? 0 : hectareas * tasa;
  const montoTotal = montoBase;

  // Vencimiento: 31 de octubre de la gestión actual (Form. 701 V.3)
  const vencimiento = new Date(gestion, 9, 31); // mes 9 = octubre

  let mensaje: string | undefined;
  if (esNoImponible) {
    mensaje = `Con ${hectareas} ha está por debajo del mínimo (${minHa} ha). Tramite el Certificado de NO Imponibilidad — Form. 280 V.3`;
  } else if (superaMaximo) {
    mensaje = `Con ${hectareas} ha supera el máximo permitido (${maxHa} ha). Debe inscribirse en el Régimen General de tributación.`;
  }

  return {
    subzonaLabel: tasaRow.subzonaLabel,
    tipoActividad,
    hectareas,
    minHa,
    maxHa,
    tasa,
    montoBase,
    montoTotal,
    esNoImponible,
    superaMaximo,
    vencimiento,
    gestion,
    formulario: "Formulario 701 V.3",
    mensaje,
  };
}

// ── Helpers de etiquetas ──────────────────────────────────────────────────

export const ZONAS_LABEL: Record<ZonaRAU, string> = {
  ALTIPLANO_PUNA: "Altiplano y Puna",
  VALLES: "Valles",
  SUBTROPICAL: "Subtropical",
  TROPICAL: "Tropical",
};

export const ACTIVIDAD_LABEL: Record<TipoActividadRAU, string> = {
  AGRICOLA_OTROS: "Agrícola / Avicultura / Apicultura / Floricultura / Cunicultura / Piscicultura",
  PECUARIA: "Pecuaria",
};

export function getSubzonasPorZona(zona: ZonaRAU) {
  return TABLA_RAU_2024.filter((r) => r.zona === zona).map((r) => ({
    value: r.subzona,
    label: r.subzonaLabel,
  }));
}

export function getTasaRow(subzona: SubzonaRAU) {
  return TABLA_RAU_2024.find((r) => r.subzona === subzona);
}
