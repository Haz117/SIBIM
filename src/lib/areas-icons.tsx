import {
  Scales, Broadcast, FirstAidKit, GraduationCap, Palette, Barbell,
  Mountains, FireTruck, Siren, Tractor, Wrench, Recycle,
  MapTrifold, Users, Archive, Coins, Envelope, Path, HandHeart,
  Baby, MagnifyingGlassPlus, Storefront, Bank, Cpu, Calendar,
  IdentificationCard, ChatCircleText, Handshake, ChartLineUp,
  Globe, Buildings,
  type Icon,
} from "@phosphor-icons/react";

const RULES: [RegExp, Icon][] = [
  [/jur[ií]dic/i, Scales],
  [/comunicaci[oó]n|marketing/i, Broadcast],
  [/salud/i, FirstAidKit],
  [/educaci[oó]n/i, GraduationCap],
  [/cultura/i, Palette],
  [/deporte/i, Barbell],
  [/turismo/i, Mountains],
  [/protecci[oó]n civil|bomberos/i, FireTruck],
  [/seguridad|tr[aá]nsito|vial/i, Siren],
  [/agropecuari/i, Tractor],
  [/desarrollo urbano|obras p[uú]blicas|ordenamiento/i, Wrench],
  [/servicios p[uú]blicos|limpias|servicios municipales/i, Recycle],
  [/catastro/i, MapTrifold],
  [/recursos humanos|n[oó]mina/i, Users],
  [/recursos materiales|patrimonio|archivo/i, Archive],
  [/ingresos|recaudaci[oó]n|egresos|cuenta p[uú]blica/i, Coins],
  [/correspondencia/i, Envelope],
  [/migrante/i, Path],
  [/mujeres/i, HandHeart],
  [/sipinna|ni[ñn]ez|juventud/i, Baby],
  [/transparencia/i, MagnifyingGlassPlus],
  [/reglamentos|comercio|mercado|espect[aá]culos/i, Storefront],
  [/gobierno/i, Bank],
  [/tecnolog[ií]as de la informaci[oó]n/i, Cpu],
  [/log[ií]stica|eventos/i, Calendar],
  [/registro del estado familiar/i, IdentificationCard],
  [/audiencias|atenci[oó]n ciudadana/i, ChatCircleText],
  [/relaciones p[uú]blicas|conciliaci[oó]n/i, Handshake],
  [/planeaci[oó]n|evaluaci[oó]n/i, ChartLineUp],
  [/reclutamiento/i, IdentificationCard],
  [/programas sociales|bienestar/i, HandHeart],
  [/desarrollo econ[oó]mico/i, ChartLineUp],
  [/pueblos|comunidades ind[ií]genas/i, Globe],
];

export function getAreaIcon(nombre: string): Icon {
  const match = RULES.find(([pattern]) => pattern.test(nombre));
  return match ? match[1] : Buildings;
}
