'use client';
import type { JSX } from 'react';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Input, Button, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@galaxy/ui';

function ResultBox({ ar, en }: { ar: string; en: string }): JSX.Element {
  const { addToast } = useToast();
  const copy = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => addToast('success', text.slice(0, 40)));
  };
  return (
    <div className="mt-3 space-y-2 text-sm">
      <div className="rounded-lg bg-surface-muted p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary">عربي</span>
          <button onClick={() => copy(ar)} className="text-xs text-brand-600 hover:underline">
            Copy
          </button>
        </div>
        <p className="whitespace-pre-wrap">{ar}</p>
      </div>
      <div className="rounded-lg bg-surface-muted p-3" dir="ltr">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary">English</span>
          <button onClick={() => copy(en)} className="text-xs text-brand-600 hover:underline">
            Copy
          </button>
        </div>
        <p className="whitespace-pre-wrap text-start">{en}</p>
      </div>
    </div>
  );
}

export default function AdminContentGenPage(): JSX.Element {
  const { t } = useLocale();
  const { data: status } = api.contentGen.status.useQuery();

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [serviceName, setServiceName] = useState('');

  const descMut = api.contentGen.generateServiceDescription.useMutation();
  const captionMut = api.contentGen.generateSocialCaption.useMutation();
  const faqMut = api.contentGen.generateFaqAnswer.useMutation();
  const blogMut = api.contentGen.generateBlogDraft.useMutation();

  const providerBadge = status ? (
    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
      {t('admin.contentGen.provider', { p: status.provider })}
    </span>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.contentGen.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.contentGen.subtitle')}</p>
        </div>
        {providerBadge}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Service description */}
        <Card padding="md">
          <h2 className="font-semibold">{t('admin.contentGen.desc')}</h2>
          <div className="mt-3 space-y-2">
            <Input
              label={t('admin.contentGen.nameAr')}
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
            />
            <Input
              label={t('admin.contentGen.nameEn')}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              loading={descMut.isPending}
              onClick={() => descMut.mutate({ serviceNameAr: nameAr, serviceNameEn: nameEn })}
            >
              {t('admin.contentGen.generate')}
            </Button>
            {descMut.isError && <ErrorAlert message={descMut.error.message} />}
            {descMut.data && <ResultBox ar={descMut.data.ar} en={descMut.data.en} />}
          </div>
        </Card>

        {/* Social caption */}
        <Card padding="md">
          <h2 className="font-semibold">{t('admin.contentGen.caption')}</h2>
          <div className="mt-3 space-y-2">
            <Input
              label={t('admin.contentGen.topic')}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              loading={captionMut.isPending}
              onClick={() => captionMut.mutate({ topic })}
            >
              {t('admin.contentGen.generate')}
            </Button>
            {captionMut.data && <ResultBox ar={captionMut.data.ar} en={captionMut.data.en} />}
          </div>
        </Card>

        {/* FAQ answer */}
        <Card padding="md">
          <h2 className="font-semibold">{t('admin.contentGen.faq')}</h2>
          <div className="mt-3 space-y-2">
            <Input
              label={t('admin.contentGen.question')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Input
              label={t('admin.contentGen.serviceName')}
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              loading={faqMut.isPending}
              onClick={() => faqMut.mutate({ question, serviceName })}
            >
              {t('admin.contentGen.generate')}
            </Button>
            {faqMut.data && <ResultBox ar={faqMut.data.ar} en={faqMut.data.en} />}
          </div>
        </Card>

        {/* Blog draft */}
        <Card padding="md">
          <h2 className="font-semibold">{t('admin.contentGen.blog')}</h2>
          <div className="mt-3 space-y-2">
            <Input
              label={t('admin.contentGen.nameAr')}
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
            />
            <Input
              label={t('admin.contentGen.nameEn')}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              loading={blogMut.isPending}
              onClick={() => blogMut.mutate({ titleAr: nameAr, titleEn: nameEn })}
            >
              {t('admin.contentGen.generate')}
            </Button>
            {blogMut.data && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="rounded-full bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 inline-block">
                  {blogMut.data.status} — {t('admin.contentGen.copy')}
                </p>
                <ResultBox
                  ar={`${blogMut.data.titleAr}\n\n${blogMut.data.bodyAr}`}
                  en={`${blogMut.data.titleEn}\n\n${blogMut.data.bodyEn}`}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
