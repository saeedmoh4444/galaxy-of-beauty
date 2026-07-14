import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as zatcaService from '../services/zatca.js';

const router = Router();

/**
 * @route   GET /api/zatca/invoice/:bookingId
 * @desc    Get or generate ZATCA invoice for a completed booking
 * @access  Authenticated (participants + admin)
 */
router.get('/invoice/:bookingId', isAuth, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);

    // Generate or retrieve invoice
    const invoice = await zatcaService.generateInvoice(bookingId);

    res.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceHash: invoice.invoiceHash,
        qrCode: invoice.qrCode,
        status: invoice.status,
        totalAmount: invoice.totalAmount,
        vatAmount: invoice.vatAmount,
        createdAt: invoice.createdAt,
      },
      // QR code is a Base64 payload; decode for display
      qrPayload: invoice.qrCode
        ? JSON.parse(Buffer.from(invoice.qrCode, 'base64').toString('utf-8'))
        : null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/zatca/invoice/:bookingId/report
 * @desc    Report invoice to ZATCA (Phase 2 stub)
 * @access  Admin
 */
router.post('/invoice/:bookingId/report', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    const invoice = await zatcaService.getInvoice(bookingId);

    if (!invoice) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Invoice not found. Generate it first.' },
      });
    }

    const result = await zatcaService.reportToZatca(invoice.id);
    res.json({ invoice: result, message: 'Invoice reported to ZATCA' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/zatca/invoices
 * @desc    List all ZATCA invoices (admin)
 * @access  Admin
 */
router.get('/admin/invoices', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await zatcaService.listInvoices({
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
