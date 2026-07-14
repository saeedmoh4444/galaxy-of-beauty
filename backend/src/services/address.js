import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

/**
 * Get all addresses for a user.
 *
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export async function getAddresses(userId) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

/**
 * Create a new address.
 * If isDefault is true, unset any existing default.
 *
 * @param {number} userId
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createAddress(userId, data) {
  // Unset existing default if this one is default
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // If this is the first address, make it default
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = count === 0 ? true : data.isDefault || false;

  return prisma.address.create({
    data: { ...data, userId, isDefault },
  });
}

/**
 * Update an address.
 *
 * @param {number} addressId
 * @param {number} userId
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateAddress(addressId, userId, data) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw new AppError('Address not found', 404, ErrorCodes.NOT_FOUND);
  }

  // Unset existing default if this one is now default
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

/**
 * Delete an address.
 *
 * @param {number} addressId
 * @param {number} userId
 */
export async function deleteAddress(addressId, userId) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw new AppError('Address not found', 404, ErrorCodes.NOT_FOUND);
  }

  // Don't allow deleting default address if others exist
  if (address.isDefault) {
    const otherCount = await prisma.address.count({
      where: { userId, id: { not: addressId } },
    });
    if (otherCount > 0) {
      throw new AppError(
        'Cannot delete default address. Set another address as default first.',
        400,
        ErrorCodes.INVALID_INPUT,
      );
    }
  }

  await prisma.address.delete({ where: { id: addressId } });
}

export default { getAddresses, createAddress, updateAddress, deleteAddress };
