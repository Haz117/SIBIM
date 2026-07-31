import { AREAS_DATA } from "./areas-list";
import type { AuthUser } from "./auth-users";

/**
 * Devuelve el conjunto de nombres de área (config/areas.js) que un usuario puede
 * ver/gestionar, según su rol:
 * - admin: null = sin restricción, ve todo.
 * - secretario: su secretaría + todas las direcciones adscritas a ella.
 * - direccion: únicamente su propia dirección.
 */
export function getAccessibleAreas(user: AuthUser): Set<string> | null {
  if (user.role === "admin") return null;
  if (!user.area) return new Set();

  if (user.role === "secretario") {
    const areas = new Set<string>([user.area]);
    const secretaria = AREAS_DATA.secretarias.find((s) => s.nombre === user.area);
    secretaria?.direcciones.forEach((d) => areas.add(d));
    return areas;
  }

  return new Set([user.area]);
}

export function isAreaAccessible(user: AuthUser, area: string | null | undefined): boolean {
  if (user.role === "admin") return true;
  if (!area) return false;
  const allowed = getAccessibleAreas(user);
  return allowed ? allowed.has(area) : false;
}
