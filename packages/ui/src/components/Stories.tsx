import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
// Modal stories TBD
import { Skeleton, CardSkeleton, ListSkeleton, DashboardSkeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { ErrorAlert } from './ErrorAlert';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { StatCard } from './StatCard';
import { ProgressBar } from './ProgressBar';

// ── Button ──
const buttonMeta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default buttonMeta;
type ButtonStory = StoryObj<typeof Button>;
export const Primary: ButtonStory = {
  args: { children: 'احجز الآن', variant: 'primary', size: 'md' },
};
export const Secondary: ButtonStory = {
  args: { children: 'إلغاء', variant: 'secondary', size: 'md' },
};
export const Outline: ButtonStory = {
  args: { children: 'تفاصيل', variant: 'outline', size: 'sm' },
};
export const Danger: ButtonStory = { args: { children: 'حذف', variant: 'danger', size: 'md' } };
export const Loading: ButtonStory = {
  args: { children: 'جاري...', variant: 'primary', loading: true },
};
export const Disabled: ButtonStory = { args: { children: 'معطل', disabled: true } };

// ── Card ──
export const CardExample = {
  render: () => (
    <Card padding="lg">
      <h3 className="font-bold">بطاقة</h3>
      <p className="text-sm text-gray-500">محتوى البطاقة</p>
    </Card>
  ),
};

// ── Input ──
export const InputDefault = {
  render: () => <Input label="البريد الإلكتروني" placeholder="example@email.com" />,
};
export const InputError = {
  render: () => <Input label="كلمة المرور" type="password" error="كلمة المرور قصيرة جداً" />,
};
export const InputWithHint = { render: () => <Input label="الاسم" hint="أدخلي اسمكِ الكامل" /> };

// ── Skeleton ──
export const SkeletonVariants = {
  render: () => (
    <div className="space-y-4">
      <CardSkeleton />
      <ListSkeleton rows={3} />
      <DashboardSkeleton />
      <Skeleton>
        <div className="h-24 w-full" />
      </Skeleton>
    </div>
  ),
};

// ── Error / Empty ──
export const ErrorExample = {
  render: () => <ErrorAlert message="فشل تحميل البيانات" onRetry={() => alert('Retry!')} />,
};
export const EmptyExample = {
  render: () => (
    <EmptyState
      title="لا توجد بيانات"
      description="ابدئي رحلتكِ مع أول حجز"
      action={{ label: 'احجزي الآن', onPress: () => alert('Book!') }}
    />
  ),
};

// ── Spinner / Progress / StatCard ──
export const SpinnerExample = { render: () => <Spinner /> };
export const ProgressExample = { render: () => <ProgressBar value={65} label="اكتمال الملف" /> };
export const StatCardExample = { render: () => <StatCard label="الحجوزات" value={42} icon="📅" /> };

// ── Pagination ──
export const PaginationExample = {
  render: () => <Pagination page={3} totalPages={10} onPageChange={(p) => console.log(p)} />,
};
