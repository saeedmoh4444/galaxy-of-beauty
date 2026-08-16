import type { Meta, StoryObj } from '@storybook/react';
import {
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  CardListSkeleton,
  GridSkeleton,
  DetailSkeleton,
  FormSkeleton,
  TableSkeleton,
  KPIRowSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  TableRowSkeleton,
} from './Skeleton';

const meta: Meta = {
  title: 'UI/Skeleton',
};

export default meta;
type Story = StoryObj;

export const Generic: Story = { render: () => <Skeleton /> };

export const Card: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
};

export const List: Story = { render: () => <ListSkeleton rows={4} /> };

export const Dashboard: Story = { render: () => <DashboardSkeleton /> };

export const CardList: Story = { render: () => <CardListSkeleton count={4} /> };

export const Grid: Story = { render: () => <GridSkeleton count={6} /> };

export const Detail: Story = { render: () => <DetailSkeleton /> };

export const Form: Story = { render: () => <FormSkeleton fields={4} /> };

export const Table: Story = { render: () => <TableSkeleton rows={5} cols={4} /> };

export const KPIRow: Story = { render: () => <KPIRowSkeleton count={4} /> };

export const InlineParts: Story = {
  render: () => (
    <div className="space-y-4">
      <TextSkeleton width="60%" />
      <div className="flex items-center gap-3">
        <AvatarSkeleton size={10} />
        <div className="flex-1 space-y-2">
          <TextSkeleton width="40%" />
          <TextSkeleton width="25%" />
        </div>
      </div>
      <TableRowSkeleton cols={4} />
    </div>
  ),
};
