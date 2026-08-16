import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { padding: 'md' },
  render: (args) => (
    <Card {...args}>
      <h3 className="font-bold text-text-primary">بطاقة</h3>
      <p className="mt-1 text-sm text-text-secondary">محتوى البطاقة</p>
    </Card>
  ),
};

export const WithActions: Story = {
  args: { padding: 'lg' },
  render: (args) => (
    <Card {...args}>
      <h3 className="font-bold text-text-primary">حجز خدمة</h3>
      <p className="mt-1 text-sm text-text-secondary">مانيكير وباديكير — ٩٠ دقيقة</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm">احجزي</Button>
        <Button size="sm" variant="outline">
          التفاصيل
        </Button>
      </div>
    </Card>
  ),
};

export const Hover: Story = {
  args: { padding: 'md', hover: true },
  render: (args) => (
    <Card {...args}>
      <p className="text-sm text-text-primary">مرري الماوس فوق البطاقة</p>
    </Card>
  ),
};
