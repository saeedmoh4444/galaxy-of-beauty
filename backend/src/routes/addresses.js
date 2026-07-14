import { Router } from 'express';
import { isAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAddressSchema, updateAddressSchema } from '../validators/auth.js';
import * as addressService from '../services/address.js';

const router = Router();

// All routes require authentication
router.use(isAuth);

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses for current user
 * @access  Authenticated
 */
router.get('/', async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(req.user.userId);
    res.json({ addresses });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/addresses
 * @desc    Create a new address
 * @access  Authenticated
 */
router.post(
  '/',
  validate({ body: createAddressSchema }),
  async (req, res, next) => {
    try {
      const address = await addressService.createAddress(req.user.userId, req.body);
      res.status(201).json({ address });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   PUT /api/addresses/:id
 * @desc    Update an address
 * @access  Authenticated
 */
router.put(
  '/:id',
  validate({ body: updateAddressSchema }),
  async (req, res, next) => {
    try {
      const addressId = parseInt(req.params.id, 10);
      const address = await addressService.updateAddress(addressId, req.user.userId, req.body);
      res.json({ address });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete an address
 * @access  Authenticated
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const addressId = parseInt(req.params.id, 10);
    await addressService.deleteAddress(addressId, req.user.userId);
    res.json({ message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
