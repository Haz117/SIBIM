export interface Despacho {
  nombre: string;
  titular: string;
  adscritas: string[];
}

export interface Secretaria {
  nombre: string;
  titular: string;
  direcciones: string[];
}

export interface EntidadAutonoma {
  nombre: string;
  titular: string;
  nota?: string;
  direcciones: string[];
}

export interface AreasConfig {
  fecha: string;
  despacho: Despacho;
  secretarias: Secretaria[];
  autonomos: EntidadAutonoma[];
  otras_areas: string[];
}
