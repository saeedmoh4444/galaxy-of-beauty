import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addTechnicianServiceSchema,
  updateTechnicianServiceSchema,
} from '../validators/catalog.js';
import * as catalogService from '../services/catalog.js';

const router = Router();

/**
 * @route   GET /api/technicians/:techId/services
 * @desc    Get services offered by a technician
 * @access  Public
 */
router.get('/:techId/services', async (req, res, next) => {
  try {
    const techId = parseInt(req.params.techId, 10);
    const services = await catalogService.getTechnicianServices(techId);
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/technicians/:techId/services
 * @desc    Add a service to technician's offerings
 * @access  Technician (owner) or Admin
 */
router.post(
  '/:techId/services',
  isAuth,
  validate({ body: addTechnicianServiceSchema }),
  async (req, res, next) => {
    try {
      const techId = parseInt(req.params.techId, 10);
      const { user } = req;

      // Only the technician owner or admin can add services
      if (user.role !== 'ADMIN') {
        // Verify the requesting user owns this technician profile
        if (user.userId !== techId) {
          return res.status(403).json({
            error: { code: 'FORBIDDEN', message: 'You can only manage your own services' },
          });
        }
      }

      const result = await catalogService.addServiceToTechnician(
        techId,
        req.body.serviceId,
        req.body.customPrice,
      );
      res.status(201).json({ mapping: result });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   PUT /api/technicians/:techId/services/:mappingId
 * @desc    Update technician-service mapping (custom price, active status)
 * @access  Technician (owner) or Admin
 */
router.put(
  '/:techId/services/:mappingId',
  isAuth,
  validate({ body: updateTechnicianServiceSchema }),
  async (req, res, next) => {
    try {
      const mappingId = parseInt(req.params.mappingId, 10);
      const result = await catalogService.updateTechnicianService(mappingId, req.body);
      res.json({ mapping: result });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/technicians/:techId/services/:mappingId
 * @desc    Remove a service from technician's offerings (soft-delete via isActive=false)
 * @access  Technician (owner) or Admin
 */
router.delete(
  '/:techId/services/:mappingId',
  isAuth,
  async (req, res, next) => {
    try {
      const mappingId = parseInt(req.params.mappingId, 10);
      await catalogService.removeServiceFromTechnician(mappingId);
      res.json({ message: 'Service removed from your offerings' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
