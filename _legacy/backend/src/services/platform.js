import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Get all platform settings.
 */
export async function getSettings() {
  const configs = await prisma.platformConfig.findMany();
  const settings = {};
  for (const cfg of configs) {
    settings[cfg.key] = cfg.value;
  }
  return settings;
}

/**
 * Update a platform setting.
 */
export async function updateSetting(key, value, adminId) {
  const existing = await prisma.platformConfig.findUnique({ where: { key } });
  if (!existing) {
    throw new AppError('Setting not found', 404, ErrorCodes.NOT_FOUND);
  }

  const updated = await prisma.platformConfig.update({
    where: { key },
    data: { value: String(value), updatedBy: adminId },
  });

  // Audit
  await prisma.auditLog.create({
    data: {
      adminId,
      action: 'UPDATE_SETTINGS',
      targetType: 'PlatformConfig',
      targetId: key,
      oldValue: { value: existing.value },
      newValue: { value: String(value) },
    },
  });

  logger.info('Platform setting updated', { key, oldValue: existing.value, newValue: value, adminId });

  return updated;
}

/**
 * Check if maintenance mode is enabled.
 */
export async function isMaintenanceMode() {
  const cfg = await prisma.platformConfig.findUnique({ where: { key: 'maintenance_mode' } });
  return cfg?.value === 'true';
}

/**
 * Toggle maintenance mode.
 */
export async function toggleMaintenanceMode(enable, adminId) {
  return updateSetting('maintenance_mode', enable ? 'true' : 'false', adminId);
}

/**
 * Export bookings as CSV data.
 */
export async function exportBookingsCSV(filters = {}) {
  const { startDate, endDate, status } = filters;
  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (status) where.status = { in: status.split(',') };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      technician: { select: { name: true } },
      service: { select: { titleJson: true } },
      payment: { select: { status: true, amount: true } },
    },
    take: 10000,
  });

  // Build CSV rows
  const headers = ['Booking Code', 'Status', 'Customer', 'Email', 'Phone', 'Technician', 'Service', 'Start At', 'Amount', 'Platform Fee', 'Payment Status', 'Created At'];
  const rows = bookings.map((b) => [
    b.bookingCode,
    b.status,
    b.customer?.name || '',
    b.customer?.email || '',
    b.customer?.phone || '',
    b.technician?.name || '',
    b.service?.titleJson?.ar || b.service?.titleJson?.en || '',
    b.startAt?.toISOString() || '',
    Number(b.totalAmount),
    Number(b.platformFee),
    b.payment?.status || '',
    b.createdAt?.toISOString() || '',
  ]);

  return { headers, rows, total: bookings.length };
}

/**
 * Export users as CSV data.
 */
export async function exportUsersCSV(filters = {}) {
  const { role } = filters;
  const where = {};
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      isActive: true, emailVerified: true, createdAt: true, lastLoginAt: true,
      wallet: { select: { balance: true, bonusBalance: true } },
    },
    take: 10000,
  });

  const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Active', 'Email Verified', 'Wallet Balance', 'Bonus Balance', 'Created At', 'Last Login'];
  const rows = users.map((u) => [
    u.id, u.name, u.email, u.phone, u.role,
    u.isActive ? 'Yes' : 'No', u.emailVerified ? 'Yes' : 'No',
    Number(u.wallet?.balance || 0), Number(u.wallet?.bonusBalance || 0),
    u.createdAt?.toISOString() || '', u.lastLoginAt?.toISOString() || '',
  ]);

  return { headers, rows, total: users.length };
}

export default { getSettings, updateSetting, isMaintenanceMode, toggleMaintenanceMode, exportBookingsCSV, exportUsersCSV };
