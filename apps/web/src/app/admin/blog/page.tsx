'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/ui';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function AdminBlogPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading, isError, refetch } = api.blog.listAll.useQuery({
    page: 1,
    limit: 50,
  });
  const posts = data?.items ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    titleAr: '',
    titleEn: '',
    bodyAr: '',
    bodyEn: '',
    slug: '',
    tags: '',
    isPublished: false,
  });
  const createMut = api.blog.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreate(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.blog.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>{t('admin.blog.new-post')}</Button>
      </div>
      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('admin.blog.load-error')} onRetry={() => refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState title={t('admin.blog.empty')} />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{localize(p.titleJson, locale)}</h3>
                  <p className="text-xs text-text-tertiary">
                    {p.slug} · {p.tags?.join(', ')}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {p.isPublished ? t('admin.beauty-events.published') : t('admin.blog.draft')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('admin.blog.new-post')}
        size="lg"
      >
        <div className="space-y-3">
          <Input
            label={t('admin.blog.title-ar')}
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          />
          <Input
            label={t('admin.blog.title-en')}
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
          <Input
            label={t('admin.blog.slug-label')}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <div>
            <label htmlFor="ab-body-ar" className="mb-1 block text-sm font-medium">
              {t('admin.blog.body-ar')}
            </label>
            <textarea
              id="ab-body-ar"
              className="w-full rounded-lg border border-edge p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              rows={5}
              value={form.bodyAr}
              onChange={(e) => setForm({ ...form, bodyAr: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="ab-body-en" className="mb-1 block text-sm font-medium">
              {t('admin.blog.body-en')}
            </label>
            <textarea
              id="ab-body-en"
              className="w-full rounded-lg border border-edge p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              rows={5}
              value={form.bodyEn}
              onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
            />
          </div>
          <Input
            label={t('admin.blog.tags-label')}
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="skincare, makeup"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />{' '}
            {t('admin.blog.publish-immediately')}
          </label>
          <Button
            onClick={() =>
              createMut.mutate({
                ...form,
                tags: form.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            loading={createMut.isPending}
          >
            {t('admin.blog.publish-button')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
