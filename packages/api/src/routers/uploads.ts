import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { MAX_IMAGE_SIZE, MAX_DOC_SIZE, MAX_VIDEO_SIZE } from '@galaxy/shared';
import { protectedProcedure, adminProcedure, router } from '../trpc';
import { uploadFile, deleteFile, generatePresignedUrl, headFile } from '../lib/storage';

// ── Allowed MIME types ────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', ...ALLOWED_IMAGE_TYPES];

// R2 — reel uploads (REELS_SHOPPABLE_PLAN): phones record mp4/mov; webm
// covers browser captures.
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

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
      const result = await uploadFile(
        buffer,
        input.file.name,
        `avatars/${ctx.user.id}`,
        input.file.type,
      );

      // Update user avatar URL
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { avatarUrl: result.url },
      });

      return result;
    }),

  // ────────────────────────────────────────────────────────
  // Upload KYC / provider document (technicians, vendors, clinics).
  // Vendors and clinics upload KSA papers here and pass the returned URLs
  // to becomeVendor/becomeClinic; technician uploads are appended to the
  // technician's kycDocuments and flip KYC to SUBMITTED.
  // ────────────────────────────────────────────────────────
  uploadKycDocument: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          size: z.number().max(MAX_DOC_SIZE, 'Document must be under 10 MB'),
          base64: z.string(),
        }),
        documentType: z.enum([
          'id_front',
          'id_back',
          'certificate',
          'selfie',
          'cr',
          'national_id',
          'bank_letter',
          'medical_license',
          'license',
        ]),
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

      // Technicians: append the document to kycDocuments and flip PENDING
      // → SUBMITTED so the admin KYC review queue picks it up.
      const technician = await prisma.technician.findUnique({
        where: { userId: ctx.user.id },
      });

      if (technician) {
        const docs = ((technician.kycDocuments ?? []) as Array<{ type: string; url: string }>)
          .filter((d) => d.type !== input.documentType)
          .concat([{ type: input.documentType, url: result.url }]);
        await prisma.technician.update({
          where: { userId: ctx.user.id },
          data: {
            kycDocuments: docs,
            ...(technician.kycStatus === 'PENDING' ? { kycStatus: 'SUBMITTED' as const } : {}),
          },
        });
      }

      return result;
    }),

  // ────────────────────────────────────────────────────────
  // E7 — upload media (shorts videos / gallery images / product shots).
  // Reuses the storage pipeline; images ≤ 5 MB, videos ≤ 25 MB.
  // ────────────────────────────────────────────────────────
  uploadMedia: protectedProcedure
    .input(
      z.object({
        mediaType: z.enum(['image', 'video']),
        file: z.object({
          name: z.string(),
          type: z.string(),
          size: z.number().max(25 * 1024 * 1024, 'Video must be under 25 MB'),
          base64: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ALLOWED_MEDIA = [...ALLOWED_IMAGE_TYPES, 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!ALLOWED_MEDIA.includes(input.file.type)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported file type: ${input.file.type}. Allowed: images, MP4, WebM`,
        });
      }
      if (input.mediaType === 'image' && !ALLOWED_IMAGE_TYPES.includes(input.file.type)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Image uploads must be JPEG, PNG, WebP or AVIF',
        });
      }

      const { buffer } = decodeBase64File(input.file);
      return uploadFile(buffer, input.file.name, `media/${ctx.user.id}`, input.file.type);
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
        folder: z.enum(['avatars', 'kyc', 'categories', 'services', 'banners', 'shorts']),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // R2 — the shorts folder only accepts video content types.
      if (input.folder === 'shorts' && !ALLOWED_VIDEO_TYPES.includes(input.contentType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported file type: ${input.contentType}. Allowed: MP4, MOV, WebM`,
        });
      }

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

  /**
   * R2 — finalize a reel upload: HEAD the object and enforce the real
   * size cap (a presigned signature cannot bound the bytes a client
   * sends). Oversize objects are deleted and the upload is rejected.
   */
  finalizeShortUpload: protectedProcedure
    .input(z.object({ key: z.string().min(1).max(512) }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === 'ADMIN';
      const isOwner = input.key.startsWith(`shorts/${ctx.user.id}/`);
      if (!isAdmin && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only finalize your own uploads',
        });
      }

      const size = await headFile(input.key);
      if (size === null) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Uploaded file not found' });
      }
      if (size > MAX_VIDEO_SIZE) {
        await deleteFile(input.key);
        throw new TRPCError({
          code: 'PAYLOAD_TOO_LARGE',
          message: `Video must be under ${Math.round(MAX_VIDEO_SIZE / (1024 * 1024))} MB`,
        });
      }

      return { key: input.key, sizeBytes: size };
    }),

  // ────────────────────────────────────────────────────────
  // Delete an uploaded file (admin or owner)
  // ────────────────────────────────────────────────────────
  deleteUpload: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only allow deletion of files in the user's folder or admin
      const isAdmin = ctx.user.role === 'ADMIN';
      const isOwner =
        input.key.startsWith(`avatars/${ctx.user.id}/`) ||
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
