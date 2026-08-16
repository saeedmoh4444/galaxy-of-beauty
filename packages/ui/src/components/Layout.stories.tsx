import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from './PageContainer';
import { Icon } from './Icon';
import { Card } from './Card';

const meta: Meta = {
  title: 'UI/Layout',
};

export default meta;
type Story = StoryObj;

export const Page: Story = {
  render: () => (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">عنوان الصفحة</h1>
      <Card padding="lg">
        <p className="text-sm text-text-secondary">المحتوى داخل الحاوية القياسية</p>
      </Card>
    </PageContainer>
  ),
};

export const Icons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          'search',
          'calendar',
          'user',
          'heart',
          'star',
          'check',
          'close',
          'plus',
          'trash',
          'edit',
          'bell',
        ] as const
      ).map((name) => (
        <div key={name} className="flex flex-col items-center gap-1 text-text-secondary">
          <Icon name={name} size="lg" />
          <span className="text-xs">{name}</span>
        </div>
      ))}
    </div>
  ),
};
