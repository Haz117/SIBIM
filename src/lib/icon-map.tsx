import type { CSSProperties } from "react";
import {
  Armchair,
  Car,
  Laptop,
  Printer,
  Wrench,
  VideoCamera,
  Package as PackageIcon,
  Toolbox,
  Truck,
  Monitor,
  Couch,
  ClipboardText,
  type Icon,
} from "@phosphor-icons/react";

export const CATEGORY_ICONS: Record<string, Icon> = {
  Armchair,
  Car,
  Laptop,
  Printer,
  Wrench,
  VideoCamera,
  Toolbox,
  Truck,
  Monitor,
  Couch,
  ClipboardText,
  Package: PackageIcon,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS).filter((n) => n !== "Package");

export function resolveCategoryIcon(name?: string): Icon {
  return (name && CATEGORY_ICONS[name]) || CATEGORY_ICONS.Package;
}

export function CategoryIcon({ name, className, weight, style }: { name?: string; className?: string; weight?: "regular" | "duotone" | "fill"; style?: CSSProperties }) {
  // Stable lookup from the module-level CATEGORY_ICONS map (same `name` always resolves
  // to the same stateless Phosphor component), so dynamic selection here is safe.
  /* eslint-disable react-hooks/static-components */
  const Icon = resolveCategoryIcon(name);
  return <Icon className={className} weight={weight ?? "duotone"} style={style} />;
  /* eslint-enable react-hooks/static-components */
}
