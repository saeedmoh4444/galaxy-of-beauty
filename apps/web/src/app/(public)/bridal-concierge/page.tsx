'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import {
  Card,
  DashboardSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  formatCurrency,
} from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ConciergeData {
  id: number;
  weddingDate: string | null;
  venue: string | null;
  guestCount: number | null;
  budget: number | null;
  notes: string | null;
  services: Array<{
    id: number;
    serviceId: number;
    trialDate: string | null;
    notes: string | null;
    isTrialDone: boolean;
  }>;
}

const STEPS = [
  { key: 'profile', label: 'marketing.bridal-concierge.step-profile', emoji: '' },
  { key: 'services', label: 'marketing.bridal-concierge.step-services', emoji: '' },
  { key: 'trials', label: 'marketing.bridal-concierge.step-trials', emoji: '' },
  { key: 'wedding', label: 'marketing.bridal-concierge.step-wedding', emoji: '' },
] as const;

const MARKETING_FEATURES = [
  {
    icon: '',
    title: 'marketing.bridal-concierge.feature-plan-title',
    desc: 'marketing.bridal-concierge.feature-plan-desc',
  },
  {
    icon: '',
    title: 'marketing.bridal-concierge.feature-try-title',
    desc: 'marketing.bridal-concierge.feature-try-desc',
  },
  {
    icon: '',
    title: 'marketing.bridal-concierge.feature-shine-title',
    desc: 'marketing.bridal-concierge.feature-shine-desc',
  },
  {
    icon: '',
    title: 'marketing.bridal-concierge.feature-budget-title',
    desc: 'marketing.bridal-concierge.feature-budget-desc',
  },
  {
    icon: '',
    title: 'marketing.bridal-concierge.feature-countdown-title',
    desc: 'marketing.bridal-concierge.feature-countdown-desc',
  },
  {
    icon: '',
    title: 'marketing.bridal-concierge.feature-tips-title',
    desc: 'marketing.bridal-concierge.feature-tips-desc',
  },
] as const;

// ---------------------------------------------------------------------------
// Bridal Dashboard (authenticated view)
// ---------------------------------------------------------------------------
function BridalDashboard(): JSX.Element {
  const { t, locale } = useLocale();
  const {
    data: concierge,
    isLoading,
    isError,
    refetch,
  } = api.bridalConcierge.get.useQuery() as {
    data: ConciergeData | null | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const upsertMut = api.bridalConcierge.upsert.useMutation({ onSuccess: () => refetch() });
  const addServiceMut = api.bridalConcierge.addService.useMutation({ onSuccess: () => refetch() });
  const markTrialMut = api.bridalConcierge.markTrialDone.useMutation({
    onSuccess: () => refetch(),
  });

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [weddingDate, setWeddingDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newTrialDate, setNewTrialDate] = useState('');
  const [newServiceNotes, setNewServiceNotes] = useState('');
  const [serviceError, setServiceError] = useState('');

  const handleSaveProfile = () => {
    setFormError('');
    upsertMut.mutate(
      {
        weddingDate: weddingDate ? new Date(weddingDate).toISOString() : undefined,
        venue: venue.trim() || undefined,
        guestCount: guestCount ? parseInt(guestCount, 10) : undefined,
        budget: budget ? parseInt(budget, 10) : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowProfileForm(false);
          setFormError('');
        },
        onError: () => setFormError(t('marketing.bridal-concierge.save-error')),
      },
    );
  };

  const handleAddService = () => {
    setServiceError('');
    if (!newServiceId) {
      setServiceError(t('marketing.bridal-concierge.service-id-required'));
      return;
    }
    addServiceMut.mutate(
      {
        serviceId: parseInt(newServiceId, 10),
        trialDate: newTrialDate ? new Date(newTrialDate).toISOString() : undefined,
        notes: newServiceNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowAddService(false);
          setNewServiceId('');
          setNewTrialDate('');
          setNewServiceNotes('');
          setServiceError('');
        },
        onError: () => setServiceError(t('marketing.bridal-concierge.add-service-error')),
      },
    );
  };

  const openProfileForm = () => {
    if (concierge) {
      setWeddingDate(
        concierge.weddingDate ? new Date(concierge.weddingDate).toISOString().slice(0, 16) : '',
      );
      setVenue(concierge.venue ?? '');
      setGuestCount(concierge.guestCount?.toString() ?? '');
      setBudget(concierge.budget?.toString() ?? '');
      setNotes(concierge.notes ?? '');
    }
    setShowProfileForm(true);
  };

  const services = concierge?.services ?? [];
  const completedTrials = services.filter((s) => s.isTrialDone).length;
  const hasProfile = !!concierge?.weddingDate;
  const currentStep = !hasProfile
    ? 0
    : services.length === 0
      ? 1
      : completedTrials < services.length
        ? 2
        : 3;
  const daysUntil = concierge?.weddingDate
    ? Math.ceil((new Date(concierge.weddingDate).getTime() - Date.now()) / 86400000)
    : null;

  if (isLoading)
    return (
      <div className="space-y-4">
        <DashboardSkeleton />
      </div>
    );
  if (isError)
    return (
      <ErrorAlert message={t('marketing.bridal-concierge.load-error')} onRetry={() => refetch()} />
    );

  return (
    <>
      {/* Dashboard Header */}
      <div className="text-center sm:text-right">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.bridal-concierge.dashboard-title')}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t('marketing.bridal-concierge.dashboard-subtitle')}
        </p>
      </div>

      {/* Progress Steps */}
      <Card padding="lg">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => (
            <div key={step.key} className="text-center">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${idx < currentStep ? 'bg-green-100 ring-2 ring-green-500 dark:bg-green-900' : idx === currentStep ? 'bg-brand-100 ring-2 ring-brand-500 animate-pulse dark:bg-brand-900' : 'bg-surface-muted dark:bg-gray-800 opacity-50'}`}
              >
                {idx < currentStep ? '' : step.emoji}
              </div>
              <p className="mt-1.5 text-xs font-semibold text-text-primary dark:text-gray-300 hidden sm:block">
                {t(step.label)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
            style={{ width: `${Math.min(100, (currentStep / 3) * 100)}%` }}
          />
        </div>
      </Card>

      {/* Wedding Details */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-gray-100">
            {t('marketing.bridal-concierge.wedding-details')}
          </h2>
          <Button size="sm" variant="ghost" onClick={openProfileForm}>
            {hasProfile
              ? t('marketing.bridal-concierge.edit')
              : t('marketing.bridal-concierge.add')}
          </Button>
        </div>
        {!hasProfile ? (
          <EmptyState
            title={t('marketing.bridal-concierge.no-details-title')}
            description={t('marketing.bridal-concierge.no-details-desc')}
            action={{
              label: t('marketing.bridal-concierge.add-details'),
              onPress: openProfileForm,
            }}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {concierge?.weddingDate && (
                <div className="rounded-xl bg-brand-50 p-3 text-center dark:bg-brand-950">
                  <p className="text-3xl"></p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('marketing.bridal-concierge.wedding-date')}
                  </p>
                  <p className="text-sm font-bold">
                    {new Date(concierge.weddingDate).toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-GB',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </p>
                  {daysUntil !== null && daysUntil > 0 && (
                    <p className="mt-1 text-xs font-semibold text-brand-600">
                      {t('marketing.bridal-concierge.days-left', { count: daysUntil })}
                    </p>
                  )}
                </div>
              )}
              {concierge?.venue && (
                <div className="rounded-xl bg-purple-50 p-3 text-center dark:bg-purple-950">
                  <p className="text-3xl"></p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('marketing.bridal-concierge.venue')}
                  </p>
                  <p className="text-sm font-bold">{concierge.venue}</p>
                </div>
              )}
              {concierge?.guestCount && (
                <div className="rounded-xl bg-pink-50 p-3 text-center dark:bg-pink-950">
                  <p className="text-3xl"></p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('marketing.bridal-concierge.guests')}
                  </p>
                  <p className="text-sm font-bold">
                    {t('marketing.bridal-concierge.guest-count', { count: concierge.guestCount })}
                  </p>
                </div>
              )}
              {concierge?.budget && (
                <div className="rounded-xl bg-green-50 p-3 text-center dark:bg-green-950">
                  <p className="text-3xl"></p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('marketing.bridal-concierge.budget')}
                  </p>
                  <p className="text-sm font-bold">
                    {t('marketing.bridal-concierge.budget-amount', {
                      amount: formatCurrency(concierge.budget),
                    })}
                  </p>
                </div>
              )}
            </div>
            {concierge?.notes && (
              <div className="mt-4 rounded-xl bg-surface-muted p-3 dark:bg-gray-800">
                <p className="text-xs text-text-tertiary mb-1">
                  {t('marketing.bridal-concierge.notes-label')}
                </p>
                <p className="text-sm text-text-primary dark:text-gray-300 whitespace-pre-wrap">
                  {concierge.notes}
                </p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Service Trials */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-gray-100">
              {t('marketing.bridal-concierge.services-title')}
            </h2>
            <p className="text-xs text-text-secondary">
              {t('marketing.bridal-concierge.trials-progress', {
                done: completedTrials,
                total: services.length,
              })}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddService(true)}>
            {t('marketing.bridal-concierge.add-service')}
          </Button>
        </div>
        {services.length === 0 ? (
          <EmptyState
            title={t('marketing.bridal-concierge.no-services-title')}
            description={t('marketing.bridal-concierge.no-services-desc')}
          />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${svc.isTrialDone ? 'bg-green-100 dark:bg-green-900' : 'bg-surface-muted dark:bg-gray-800'}`}
                  >
                    {svc.isTrialDone ? '' : ''}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {t('marketing.bridal-concierge.service-id', { id: svc.serviceId })}
                    </p>
                    {svc.trialDate && (
                      <p className="text-xs text-text-secondary">
                        {t('marketing.bridal-concierge.trial-label')}
                        {new Date(svc.trialDate).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-GB',
                          {
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    )}
                    {svc.notes && <p className="text-xs text-text-tertiary mt-0.5"> {svc.notes}</p>}
                  </div>
                </div>
                {!svc.isTrialDone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markTrialMut.mutate({ serviceId: svc.id })}
                    loading={markTrialMut.isPending}
                  >
                    {t('marketing.bridal-concierge.mark-trial-done')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card
        padding="lg"
        className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-none"
      >
        <h3 className="font-bold text-text-primary dark:text-gray-100 mb-3">
          {t('marketing.bridal-concierge.bride-tips')}
        </h3>
        <div className="grid gap-2 text-sm text-text-secondary dark:text-gray-400">
          <p>{t('marketing.bridal-concierge.tip-skin')}</p>
          <p>{t('marketing.bridal-concierge.tip-makeup-trial')}</p>
          <p>{t('marketing.bridal-concierge.tip-hair')}</p>
          <p>{t('marketing.bridal-concierge.tip-nails')}</p>
        </div>
      </Card>

      {/* Modals */}
      <Modal
        open={showProfileForm}
        onClose={() => setShowProfileForm(false)}
        title={t('marketing.bridal-concierge.wedding-details')}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="bcd-wedding-date"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
            >
              {t('marketing.bridal-concierge.wedding-date')}
            </label>
            <input
              id="bcd-wedding-date"
              type="datetime-local"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="bcd-venue"
                className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
              >
                {t('marketing.bridal-concierge.venue')}
              </label>
              <input
                id="bcd-venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder={t('marketing.bridal-concierge.venue-placeholder')}
                className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label
                htmlFor="bcd-guests"
                className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
              >
                {t('marketing.bridal-concierge.guest-count-label')}
              </label>
              <input
                id="bcd-guests"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder={t('marketing.bridal-concierge.guests-placeholder')}
                className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="bcd-budget"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
            >
              {t('marketing.bridal-concierge.budget-label')}
            </label>
            <input
              id="bcd-budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t('marketing.bridal-concierge.budget-placeholder')}
              className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label
              htmlFor="bcd-notes"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
            >
              {t('marketing.bridal-concierge.notes-field')}
            </label>
            <textarea
              id="bcd-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('marketing.bridal-concierge.notes-placeholder')}
              rows={3}
              className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {formError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowProfileForm(false)}>
              {t('marketing.bridal-concierge.cancel')}
            </Button>
            <Button onClick={handleSaveProfile} loading={upsertMut.isPending}>
              {t('marketing.bridal-concierge.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showAddService}
        onClose={() => setShowAddService(false)}
        title={t('marketing.bridal-concierge.add-service-title')}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="bcd-service-id"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
            >
              {t('marketing.bridal-concierge.service-id-label')}
            </label>
            <input
              id="bcd-service-id"
              type="number"
              value={newServiceId}
              onChange={(e) => setNewServiceId(e.target.value)}
              placeholder={t('marketing.bridal-concierge.service-id-placeholder')}
              className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label
              htmlFor="bcd-trial-date"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
            >
              {t('marketing.bridal-concierge.trial-date-label')}
            </label>
            <input
              id="bcd-trial-date"
              type="datetime-local"
              value={newTrialDate}
              onChange={(e) => setNewTrialDate(e.target.value)}
              className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label
              htmlFor="bcd-service-notes"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1"
            >
              {t('marketing.bridal-concierge.notes-field')}
            </label>
            <textarea
              id="bcd-service-notes"
              value={newServiceNotes}
              onChange={(e) => setNewServiceNotes(e.target.value)}
              placeholder={t('marketing.bridal-concierge.service-notes-placeholder')}
              rows={2}
              className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          {serviceError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {serviceError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddService(false)}>
              {t('marketing.bridal-concierge.cancel')}
            </Button>
            <Button onClick={handleAddService} loading={addServiceMut.isPending}>
              {t('marketing.bridal-concierge.add-service-btn')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Marketing Landing (unauthenticated)
// ---------------------------------------------------------------------------
function MarketingLanding(): JSX.Element {
  const { t } = useLocale();
  return (
    <>
      <div className="text-center">
        <span className="text-7xl"></span>
        <h1 className="mt-6 text-4xl font-extrabold text-text-primary dark:text-gray-100">
          {t('marketing.bridal-concierge.landing-title')}
        </h1>
        <p className="mt-4 text-lg text-text-secondary dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {t('marketing.bridal-concierge.landing-subtitle')}
        </p>
        <div className="mt-6">
          <Link href="/login?redirect=/bridal-concierge">
            <Button size="lg">{t('marketing.bridal-concierge.login-cta')}</Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETING_FEATURES.map((f, i) => (
          <Card key={i} padding="lg" className="text-center transition-all hover:shadow-lg">
            <div className="text-4xl">{f.icon}</div>
            <h3 className="mt-3 text-lg font-bold text-text-primary dark:text-gray-100">
              {t(f.title)}
            </h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
              {t(f.desc)}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 p-8 text-white text-center">
        <p className="text-3xl font-bold">{t('marketing.bridal-concierge.journey-title')}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {STEPS.map((s, idx) => (
            <div key={s.key} className="rounded-xl bg-white/20 p-4 backdrop-blur">
              <p className="text-4xl">{s.emoji}</p>
              <p className="mt-2 text-lg font-bold">
                {t('marketing.bridal-concierge.step-number', { number: idx + 1 })}
              </p>
              <p className="text-sm text-white/80">{t(s.label)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-text-secondary dark:text-gray-400">
          {t('marketing.bridal-concierge.help-line')}
          <span className="font-bold text-brand-600">٩٢٠٠١٣٣٣٣</span>
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function BridalConciergePage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      {authLoading ? (
        <div className="space-y-4">
          <DashboardSkeleton />
        </div>
      ) : user ? (
        <BridalDashboard />
      ) : (
        <MarketingLanding />
      )}
    </div>
  );
}
