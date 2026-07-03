import { TOOLS_BY_ID } from '@freetoolkit/shared';
import { prisma } from '../../lib/prisma';

/** Registra el uso de una herramienta por un usuario autenticado (sin contenido de usuario). */
export async function recordHistory(userId: string, toolId: string): Promise<void> {
  if (!TOOLS_BY_ID[toolId]) return; // ignora ids desconocidos
  try {
    await prisma.historyItem.create({ data: { userId, toolId } });
  } catch {
    // el historial no debe romper el flujo principal
  }
}
