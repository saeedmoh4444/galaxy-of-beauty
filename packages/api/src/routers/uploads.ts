import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, technicianProcedure, adminProcedure, router } from '../trpc';
import { uploadFile, deleteFile, generatePresignedUrl } from '../lib/storage';

// ── Allowed MIME types ────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  ...ALLOWED_IMAGE_TYPES,
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB
const MAX_DOC_SIZE   = 10 * 1024 * 1024;   // 10 MB

// ── Helpers ────────────────────────────────────────────────

interface FileInput {
  name: string;
  type: string;
  size: number;
  base64: string;
}

function decodeBase64File(input: FileInput): { buffer: Buffer; ext: string } {
  // Data URLs look like: data:image/png;base64,xxxx
  const matches = input.base64.match(/^data:([^;]+);base64,(.+)$/);
  let buffer: Buffer;

  if (matches?.[2]) {
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    // Assume raw base64 string
    buffer = Buffer.from(input.base64, 'base64');
  }

  return { buffer, ext: '' };
}

// ── Router ─────────────────────────────────────────────────

export const uploadRouter = router({
  // ────────────────────────────────────────────────────────
  // Upload avatar image (any authenticated user)
  // ────────────────────────────────────────────────────────
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          size: z.number().max(MAX_IMAGE_SIZE, 'Image must be under 5 MB'),
          base64: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ALLOWED_IMAGE_TYPES.includes(input.file.type)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported file type: ${input.file.type}. Allowed: JPEG, PNG, WebP, AVIF`,
        });
      }

      const { buffer } = decodeBase64File(input.file);
      const result = await uploadFile(buffer, input.file.name, `avatars/${ctx.user.id}`, input.file.type);

      // Update user avatar URL
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { avatarUrl: result.url },
      });

      return result;
    }),

  // ────────────────────────────────────────────────────────
  // Upload KYC document (technician only)
  // ────────────────────────────────────────────────────────
  uploadKycDocument: technicianProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          size: z.number().max(MAX_DOC_SIZE, 'Document must be under 10 MB'),
          base64: z.string(),
        }),
        documentType: z.enum(['id_front', 'id_back', 'certificate', 'selfie']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ALLOWED_DOC_TYPES.includes(input.file.type)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported file type. Allowed: PDF, JPEG, PNG`,
        });
      }

      const { buffer } = decodeBase64File(input.file);
      const result = await uploadFile(
        buffer,
        input.file.name,
        `kyc/${ctx.user.id}/${input.documentType}`,
        input.file.type,
      );

      // Update KYC status to SUBMITTED if pending
      const technician = await prisma.technician.findUnique({
        where: { userId: ctx.user.id },
      });

      if (technician && technician.kycStatus === 'PENDING') {
        await prisma.technician.update({
          where: { userId: ctx.user.id },
          data: { kycStatus: 'SUBMITTED' },
        });
      }

      return result;
    }),

  // ────────────────────────────────────────────────────────
  // Upload category or service image (admin only)
  // ────────────────────────────────────────────────────────
  uploadImage: adminProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          size: z.number().max(MAX_IMAGE_SIZE, 'Image must be under 5 MB'),
          base64: z.string(),
        }),
        folder: z.enum(['categories', 'services', 'banners']),
      }),
    )
    .mutation(async ({ input }) => {
      if (!ALLOWED_IMAGE_TYPES.includes(input.file.type)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported file type. Allowed: JPEG, PNG, WebP, AVIF`,
        });
      }

      const { buffer } = decodeBase64File(input.file);
      return uploadFile(buffer, input.file.name, input.folder, input.file.type);
    }),

  // ────────────────────────────────────────────────────────
  // Generate presigned upload URL (for large files from SPA)
  // ────────────────────────────────────────────────────────
  presignedUrl: protectedProcedure
    .input(
      z.object({
        folder: z.enum(['avatars', 'kyc', 'categories', 'services', 'banners']),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generatePresignedUrl(
        `${input.folder}/${ctx.user.id}`,
        input.contentType,
        600, // 10 minutes
      );

      if (!result) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Presigned URLs require S3 to be configured',
        });
      }

      return result;
    }),

  // ────────────────────────────────────────────────────────
  // Delete an uploaded file (admin or owner)
  // ────────────────────────────────────────────────────────
  deleteUpload: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only allow deletion of files in the user's folder or admin
      const isAdmin = ctx.user.role === 'ADMIN';
      const isOwner = input.key.startsWith(`avatars/${ctx.user.id}/`) ||
        input.key.startsWith(`kyc/${ctx.user.id}/`);

      if (!isAdmin && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own uploads',
        });
      }

      await deleteFile(input.key);
      return { success: true };
    }),
});
