import type { FuelType, Transmission } from "@prisma/client";

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

export function fuelLabel(value: FuelType) {
  return fuel[value] ?? value;
}

export function transmissionLabel(value: Transmission) {
  return transmission[value] ?? value;
}
