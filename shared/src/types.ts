// Tipos compartidos entre cliente y servidor (fuente de verdad del catálogo y la API).

export type ToolCategory =
  | 'imagenes'
  | 'texto'
  | 'pdf'
  | 'desarrollo'
  | 'conversores'
  | 'calculadoras'
  | 'redes'
  | 'seguridad';

export type Tier = 'FREE' | 'PRO';

/** Dónde se ejecuta la herramienta. */
export type ToolRuntime = 'client' | 'server' | 'server+provider';

export interface ToolDef {
  id: string;
  category: ToolCategory;
  name: string;
  /** Descripción corta para el catálogo. */
  description: string;
  tier: Tier;
  /** Usos/día en Free. null = ilimitado en Free. */
  freeLimitPerDay: number | null;
  runtime: ToolRuntime;
  /** Proveedor externo cuando runtime = 'server+provider'. */
  provider?: string;
  /** Funciones extra que desbloquea Pro. */
  proFeatures: string[];
}

/** Entrada de catálogo entregada al cliente (def + estado editable por admin). */
export interface ToolCatalogEntry extends ToolDef {
  enabled: boolean;
  /** Límite efectivo tras aplicar override de admin. */
  effectiveFreeLimitPerDay: number | null;
}

export interface CategoryMeta {
  id: ToolCategory;
  label: string;
}

export interface QuotaStatus {
  toolId: string;
  limit: number | null;
  used: number;
  remaining: number | null;
  unlimited: boolean;
}
