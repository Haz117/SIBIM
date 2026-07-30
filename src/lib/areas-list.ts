import areasData from "../../config/areas.js";
import type { AreasConfig } from "./areas.types";

const data = areasData as unknown as AreasConfig;

export function getAllAreaNames(): string[] {
  const names = new Set<string>();
  names.add(data.despacho.nombre);
  data.despacho.adscritas.forEach((a) => names.add(a));
  data.secretarias.forEach((s) => {
    names.add(s.nombre);
    s.direcciones.forEach((d) => names.add(d));
  });
  data.autonomos.forEach((a) => {
    names.add(a.nombre);
    a.direcciones.forEach((d) => names.add(d));
  });
  data.otras_areas.forEach((a) => names.add(a));
  return Array.from(names);
}

export const ALL_AREA_NAMES = getAllAreaNames();
