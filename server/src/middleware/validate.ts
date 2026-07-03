import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/** Valida req.body contra un schema zod y devuelve 422 si falla. */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({ error: 'validation_error', issues: result.error.issues });
    }
    req.body = result.data;
    return next();
  };
}
