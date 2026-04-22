import type { FuelType, Transmission, VehicleCondition } from "@prisma/client";


const fuel: Record<FuelType, string> = {
  GASOLINE: "Gasolina",
  DIESEL: "Diésel",
  ELECTRIC: "Eléctrico",
  HYBRID: "Híbrido",
  LPG: "GLP",
  OTHER: "Otro",
};

const transmission: Record<Transmission, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automático",
  SEMI_AUTOMATIC: "Semi-automático",
  CVT: "CVT",
};

const conditionMap: Record<VehicleCondition, string> = {
  NEW: "Nuevo",
  USED: "Usado",
};


export function fuelLabel(value: FuelType) {
  return fuel[value] ?? value;
}

export function transmissionLabel(value: Transmission) {
  return transmission[value] ?? value;
}


export function conditionLabel(value: VehicleCondition) {
  return conditionMap[value] ?? value;
}