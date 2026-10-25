'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Input, Modal } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

/** A1 — capability strings mirrored from the API contract (t() keys are
 *  literals, so each capability maps to its own catalog key). */
const CAPABILITIES = [
  'ORDERS_MANAGE',
  'PRODUCTS_MANAGE',
  'COUPONS_MANAGE',
  'DEALS_MANAGE',
  'REVIEWS_MANAGE',
  'PAYOUTS_VIEW',
  'CUSTOMERS_VIEW',
  'ANALYTICS_VIEW',
  'STAFF_MANAGE',
] as const;

const CAP_LABELS: Record<(typeof CAPABILITIES)[number], TranslationKey> = {
  ORDERS_MANAGE: 'vendorPortal.staff.cap.ORDERS_MANAGE',
  PRODUCTS_MANAGE: 'vendorPortal.staff.cap.PRODUCTS_MANAGE',
  COUPONS_MANAGE: 'vendorPortal.staff.cap.COUPONS_MANAGE',
  DEALS_MANAGE: 'vendorPortal.staff.cap.DEALS_MANAGE',
  REVIEWS_MANAGE: 'vendorPortal.staff.cap.REVIEWS_MANAGE',
  PAYOUTS_VIEW: 'vendorPortal.staff.cap.PAYOUTS_VIEW',
  CUSTOMERS_VIEW: 'vendorPortal.staff.cap.CUSTOMERS_VIEW',
  ANALYTICS_VIEW: 'vendorPortal.staff.cap.ANALYTICS_VIEW',
  STAFF_MANAGE: 'vendorPortal.staff.cap.STAFF_MANAGE',
};

const STATUS_KEYS: Record<string, TranslationKey> = {
  PENDING: 'vendorPortal.staff.statusPending',
  ACTIVE: 'vendorPortal.staff.statusActive',
  REVOKED: 'vendorPortal.staff.statusRevoked',
};

type StaffRow = {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  permissions: string[];
  status: string;
  createdAt: string;
};

/**
 * A1 — the Team tab: invite by email, per-member role + capability editing,
 * revoke, and the vendor-scoped activity feed. Only rendered for owners /
 * STAFF_MANAGE holders (the tab is gated in the dashboard).
 */
export function StaffPanel(): JSX.Element {
  const { t } = useLocale();
  const utils = api.useUtils();

  const listQ = api.vendorPortal.staff.list.useQuery();
  const activityQ = api.vendorPortal.staff.activity.useQuery();
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState<TranslationKey | null>(null);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [editRole, setEditRole] = useState<'MANAGER' | 'STAFF'>('STAFF');
  const [editPerms, setEditPerms] = useState<(typeof CAPABILITIES)[number][]>([]);

  const invalidate = () => {
    void utils.vendorPortal.staff.list.invalidate();
    void utils.vendorPortal.staff.activity.invalidate();
  };

  const inviteMut = api.vendorPortal.staff.invite.useMutation({
    onSuccess: () => {
      setEmail('');
      setInviteError(null);
      invalidate();
    },
    onError: (e) => {
      setInviteError(
        e.data?.code === 'NOT_FOUND'
          ? 'vendorPortal.staff.inviteErrNotFound'
          : 'vendorPortal.staff.inviteErrConflict',
      );
    },
  });

  const updateMut = api.vendorPortal.staff.update.useMutation({
    onSuccess: () => {
      setEditing(null);
      invalidate();
    },
  });

  const revokeMut = api.vendorPortal.staff.revoke.useMutation({
    onSuccess: invalidate,
  });

  const openEdit = (row: StaffRow) => {
    setEditing(row);
    setEditRole(row.role === 'MANAGER' ? 'MANAGER' : 'STAFF');
    setEditPerms(row.permissions as (typeof CAPABILITIES)[number][]);
  };

  const toggleCap = (cap: (typeof CAPABILITIES)[number]) => {
    setEditPerms((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]));
  };

  return (
    <div className="space-y-6">
      <Card padding="md">
        <h2 className="text-lg font-semibold">{t('vendorPortal.staff.title')}</h2>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('vendorPortal.staff.inviteLabel')}
            aria-label={t('vendorPortal.staff.inviteLabel')}
            className="flex-1"
          />
          <Button
            onClick={() => inviteMut.mutate({ email: email.trim() })}
            disabled={!email.trim() || inviteMut.isPending}
            data-testid="staff-invite-button"
          >
            {t('vendorPortal.staff.invite')}
          </Button>
        </div>
        {inviteError && <p className="mt-2 text-sm text-error">{t(inviteError)}</p>}

        {listQ.isLoading ? (
          <p className="mt-4 text-sm text-text-secondary">…</p>
        ) : listQ.data && listQ.data.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">{t('vendorPortal.staff.empty')}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {listQ.data?.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                data-testid={`staff-row-${row.id}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {row.name} <span className="font-normal text-text-secondary">{row.email}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {row.role === 'MANAGER'
                        ? t('vendorPortal.staff.roleManager')
                        : t('vendorPortal.staff.roleStaff')}
                    </span>
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-text-secondary">
                      {t(STATUS_KEYS[row.status] ?? 'vendorPortal.staff.statusPending')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {row.permissions
                      .map((cap) =>
                        t(
                          CAP_LABELS[cap as keyof typeof CAP_LABELS] ??
                            'vendorPortal.staff.permissions',
                        ),
                      )
                      .join(' · ')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(row)}
                    disabled={row.status === 'REVOKED'}
                  >
                    {t('vendorPortal.staff.permissions')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => revokeMut.mutate({ staffId: row.id })}
                    disabled={row.status === 'REVOKED'}
                  >
                    {t('vendorPortal.staff.revoke')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padding="md">
        <h3 className="text-base font-semibold">{t('vendorPortal.staff.activity')}</h3>
        <ul className="mt-3 space-y-2">
          {activityQ.data?.map((l) => (
            <li key={l.id} className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">{l.actorName}</span>{' '}
              {l.action.replaceAll('_', ' ').toLowerCase()} —{' '}
              {new Date(l.createdAt).toLocaleString()}
            </li>
          ))}
          {activityQ.data && activityQ.data.length === 0 && (
            <li className="text-sm text-text-secondary">{t('vendorPortal.staff.empty')}</li>
          )}
        </ul>
      </Card>

      {editing && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={`${t('vendorPortal.staff.permissions')} — ${editing.name}`}
        >
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium">{t('vendorPortal.staff.role')}</p>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'MANAGER' | 'STAFF')}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="STAFF">{t('vendorPortal.staff.roleStaff')}</option>
                <option value="MANAGER">{t('vendorPortal.staff.roleManager')}</option>
              </select>
            </div>
            {editRole === 'STAFF' && (
              <div>
                <p className="mb-1 text-sm font-medium">{t('vendorPortal.staff.permissions')}</p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {CAPABILITIES.map((cap) => (
                    <label key={cap} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editPerms.includes(cap)}
                        onChange={() => toggleCap(cap)}
                      />
                      {t(CAP_LABELS[cap])}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                {t('vendorPortal.staff.cancel')}
              </Button>
              <Button
                onClick={() =>
                  updateMut.mutate({
                    staffId: editing.id,
                    role: editRole,
                    permissions: editPerms,
                  })
                }
                disabled={updateMut.isPending}
              >
                {t('vendorPortal.staff.save')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
