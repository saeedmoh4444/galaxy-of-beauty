import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  createVariantSchema,
  updateVariantSchema,
  manageAddonSchema,
  createTagSchema,
  assignTagSchema,
} from '../validators/catalog.js';
import * as catalogService from '../services/catalog.js';

const router = Router();

// =============================================================================
// Service Listing & Detail (Public)
// =============================================================================

/**
 * @route   GET /api/services
 * @desc    List services with search, filters, pagination, sorting
 * @access  Public
 */
router.get(
  '/',
  validate({ query: serviceQuerySchema }),
  async (req, res, next) => {
    try {
      const result = await catalogService.listServices(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/services/surprise-me
 * @desc    Get a random service within budget/availability (discovery feature)
 * @access  Public
 */
router.get('/surprise-me', async (req, res, next) => {
  try {
    const { maxPrice, city } = req.query;
    const filters = { isActive: true };
    if (maxPrice) filters.basePrice = { lte: parseFloat(maxPrice) };

    // Get all matching services
    const services = await catalogService.listServices({
      ...filters,
      limit: 50,
      sortBy: 'popularity',
    });

    if (services.services.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'No services found matching criteria' },
      });
    }

    // Pick a random service
    const random = services.services[Math.floor(Math.random() * services.services.length)];

    // Optionally find a technician for this service
    let technician = null;
    if (city) {
      const techServices = await catalogService.getTechnicianServices(random.id);
      if (techServices.length > 0) {
        const randomTech = techServices[Math.floor(Math.random() * techServices.length)];
        technician = randomTech.technician || null;
      }
    }

    res.json({
      service: random,
      technician,
      message: {
        ar: '✨ اخترنا لكِ هذه الخدمة! جربي شيئاً جديداً اليوم.',
        en: '✨ We picked this service for you! Try something new today.',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/services/:id
 * @desc    Get service detail with variants, add-ons, tags, technicians
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid service ID' },
      });
    }
    const service = await catalogService.getServiceById(id);
    res.json({ service });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// Service Admin CRUD
// =============================================================================

/**
 * @route   POST /api/services
 * @desc    Create a new service (admin)
 * @access  Admin
 */
router.post(
  '/',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: createServiceSchema }),
  async (req, res, next) => {
    try {
      const service = await catalogService.createService(req.body);
      res.status(201).json({ service });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service (admin)
 * @access  Admin
 */
router.put(
  '/:id',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: updateServiceSchema }),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const service = await catalogService.updateService(id, req.body);
      res.json({ service });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service (admin, only if no bookings)
 * @access  Admin
 */
router.delete(
  '/:id',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      await catalogService.deleteService(id);
      res.json({ message: 'Service deleted' });
    } catch (error) {
      next(error);
    }
  },
);

// =============================================================================
// Variants (Admin)
// =============================================================================

/**
 * @route   POST /api/services/:id/variants
 * @desc    Add a variant to a service
 * @access  Admin
 */
router.post(
  '/:id/variants',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: createVariantSchema }),
  async (req, res, next) => {
    try {
      const serviceId = parseInt(req.params.id, 10);
      const variant = await catalogService.createVariant({ ...req.body, serviceId });
      res.status(201).json({ variant });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   PUT /api/services/:id/variants/:variantId
 * @desc    Update a variant
 * @access  Admin
 */
router.put(
  '/:id/variants/:variantId',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: updateVariantSchema }),
  async (req, res, next) => {
    try {
      const variantId = parseInt(req.params.variantId, 10);
      const variant = await catalogService.updateVariant(variantId, req.body);
      res.json({ variant });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/services/:id/variants/:variantId
 * @desc    Delete a variant
 * @access  Admin
 */
router.delete(
  '/:id/variants/:variantId',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const variantId = parseInt(req.params.variantId, 10);
      await catalogService.deleteVariant(variantId);
      res.json({ message: 'Variant deleted' });
    } catch (error) {
      next(error);
    }
  },
);

// =============================================================================
// Add-ons (Admin)
// =============================================================================

/**
 * @route   POST /api/services/:id/addons
 * @desc    Add an add-on service to a service
 * @access  Admin
 */
router.post(
  '/:id/addons',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: manageAddonSchema }),
  async (req, res, next) => {
    try {
      const serviceId = parseInt(req.params.id, 10);
      const result = await catalogService.addAddonToService(serviceId, req.body.addonId);
      res.status(201).json({ addon: result });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/services/:id/addons/:addonId
 * @desc    Remove an add-on from a service
 * @access  Admin
 */
router.delete(
  '/:id/addons/:addonId',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const serviceId = parseInt(req.params.id, 10);
      const addonId = parseInt(req.params.addonId, 10);
      await catalogService.removeAddonFromService(serviceId, addonId);
      res.json({ message: 'Add-on removed' });
    } catch (error) {
      next(error);
    }
  },
);

// =============================================================================
// Tags (Admin)
// =============================================================================

/**
 * @route   POST /api/services/tags
 * @desc    Create a new service tag
 * @access  Admin
 */
router.post(
  '/tags',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: createTagSchema }),
  async (req, res, next) => {
    try {
      const tag = await catalogService.createTag(req.body);
      res.status(201).json({ tag });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/services/:id/tags
 * @desc    Assign a tag to a service
 * @access  Admin
 */
router.post(
  '/:id/tags',
  isAuth,
  hasRole('ADMIN'),
  validate({ body: assignTagSchema }),
  async (req, res, next) => {
    try {
      const serviceId = parseInt(req.params.id, 10);
      const result = await catalogService.assignTagToService(serviceId, req.body.tagId);
      res.status(201).json({ assignment: result });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/services/:id/tags/:tagId
 * @desc    Remove a tag from a service
 * @access  Admin
 */
router.delete(
  '/:id/tags/:tagId',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const serviceId = parseInt(req.params.id, 10);
      const tagId = parseInt(req.params.tagId, 10);
      await catalogService.removeTagFromService(serviceId, tagId);
      res.json({ message: 'Tag removed' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
