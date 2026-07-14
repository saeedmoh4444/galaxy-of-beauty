import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/catalog.js';
import * as catalogService from '../services/catalog.js';

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get category tree (nested, localized)
 * @access  Public
 */
router.get('/', async (_req, res, next) => {
  try {
    const tree = await catalogService.getCategoryTree(true);
    res.json({ categories: tree });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/categories/all
 * @desc    Get all categories including inactive (admin)
 * @access  Admin
 */
router.get('/all', isAuth, hasRole('ADMIN'), async (_req, res, next) => {
  try {
    const tree = await catalogService.getCategoryTree(false);
    res.json({ categories: tree });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await catalogService.getCategoryById(id);
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create a new category (admin)
 * @access  Admin
 */
router.post(
  '/',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: createCategorySchema }),
  async (req, res, next) => {
    try {
      const category = await catalogService.createCategory(req.body);
      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category (admin)
 * @access  Admin
 */
router.put(
  '/:id',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: updateCategorySchema }),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await catalogService.updateCategory(id, req.body);
      res.json({ category });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category (admin, only if empty)
 * @access  Admin
 */
router.delete(
  '/:id',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      await catalogService.deleteCategory(id);
      res.json({ message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
