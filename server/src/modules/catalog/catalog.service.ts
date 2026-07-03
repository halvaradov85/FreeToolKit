import { TOOLS, type ToolCatalogEntry, type ToolCategory } from '@freetoolkit/shared';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export interface CatalogQuery {
  category?: string;
  q?: string;
}

/** Devuelve el catálogo aplicando overrides de admin (enabled, límite). */
export async function getCatalog(query: CatalogQuery): Promise<ToolCatalogEntry[]> {
  let overrides: Record<string, { enabled: boolean; freeLimitPerDayOverride: number | null }> = {};
  try {
    const rows = await prisma.tool.findMany();
    overrides = Object.fromEntries(
      rows.map((r) => [r.id, { enabled: r.enabled, freeLimitPerDayOverride: r.freeLimitPerDayOverride }]),
    );
  } catch (err) {
    // Si la BD no está disponible, se sirve el catálogo base (todo habilitado).
    logger.warn('catalog_overrides_unavailable', { name: (err as Error)?.name });
  }

  let entries: ToolCatalogEntry[] = TOOLS.map((t) => {
    const o = overrides[t.id];
    const enabled = o?.enabled ?? true;
    const effective = o?.freeLimitPerDayOverride ?? t.freeLimitPerDay;
    return { ...t, enabled, effectiveFreeLimitPerDay: effective };
  });

  if (query.category) {
    entries = entries.filter((e) => e.category === (query.category as ToolCategory));
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    entries = entries.filter(
      (e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
    );
  }
  return entries;
}
