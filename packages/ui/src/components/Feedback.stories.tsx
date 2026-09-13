import type { Meta, StoryObj } from '@storybook/react';
import { ErrorAlert } from './ErrorAlert';
import { EmptyState } from './EmptyState';
import { Spinner, PageSpinner } from './Spinner';
import { ProgressBar } from './ProgressBar';
import { Pagination } from './Pagination';
import { StatCard } from './StatCard';

const meta: Meta = {
  title: 'UI/Feedback',
};

export default meta;
type Story = StoryObj;

export const Error: Story = {
  render: () => <ErrorAlert message="فشل تحميل البيانات" onRetry={() => {}} />,
};

export const Empty: Story = {
  render: () => (
    <EmptyState
      title="لا توجد بيانات"
      description="ابدئي رحلتكِ مع أول حجز"
      action={{ label: 'احجزي الآن', onPress: () => {} }}
    />
  ),
};

export const Spinners: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Spinner />
      <PageSpinner />
    </div>
  ),
};

export const Progress: Story = {
  render: () => <ProgressBar value={65} label="اكتمال الملف" />,
};

export const PaginationExample: Story = {
  render: () => <Pagination page={3} totalPages={10} onPageChange={() => {}} />,
};

export const Stat: Story = {
  render: () => <StatCard label="الحجوزات" value={42} icon="" />,
};
