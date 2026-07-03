import { Router } from 'express';
import { CATEGORIES } from '@freetoolkit/shared';
import { getCatalog } from './catalog.service';

export const catalogRouter = Router();

catalogRouter.get('/categories', (_req, res) => {
  res.json(CATEGORIES);
});

catalogRouter.get('/tools', async (req, res, next) => {
  try {
    const entries = await getCatalog({
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
    });
    res.json(entries);
  } catch (err) {
    next(err);
  }
});
