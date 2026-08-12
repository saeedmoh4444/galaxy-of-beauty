import { logger } from './logger';

// ── Types ──────────────────────────────────────────────────

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGIN_LOCKOUT'
  | 'REGISTER_SUCCESS'
  | 'REGISTER_FAILURE'
  | 'TOKEN_REFRESH'
  | 'TOKEN_REUSE_DETECTED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'SESSION_REVOKED'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_FAILURE'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REACTIVATED'
  | 'ROLE_CHANGED'
  | 'FORBIDDEN_ACCESS'
  | 'CSRF_FAILURE'
  | 'RATE_LIMIT_HIT';

interface AuditEntry {
  event: SecurityEventType;
  actorId?: number | null;
  actorRole?: string | null;
  targetId?: number | null;
  targetType?: string | null;
  outcome: 'success' | 'failure';
  metadata?: Record<string, unknown>;
  clientIp?: string | null;
}

/**
 * Emit a structured security audit event.
 *
 * Events are logged as structured JSON via Pino for ingestion into
 * log aggregation systems (CloudWatch, Datadog, ELK, etc.).
 *
 * IMPORTANT: Never include sensitive data (passwords, full tokens, secrets)
 * in metadata. Use actor/target IDs for traceability.
 */
export function audit(event: AuditEntry): void {
  const { event: eventType, actorId, actorRole, targetId, targetType, outcome, metadata, clientIp } =
    event;

  logger.info(
    {
      audit: true,
      event: eventType,
      actorId,
      actorRole,
      targetId,
      targetType,
      outcome,
      clientIp,
      ...(metadata ?? {}),
    },
    `[AUDIT] ${eventType} — ${outcome}` +
      (actorId ? ` actor=${actorId}` : '') +
      (targetId ? ` target=${targetType}:${targetId}` : ''),
  );
}
