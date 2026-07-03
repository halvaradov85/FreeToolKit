import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'not_found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.code, message: err.message });
  }
  logger.error('unhandled_error', { name: (err as Error)?.name });
  return res.status(500).json({ error: 'internal_error' });
}
