import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'احجز الآن', variant: 'primary', size: 'md' } };
export const Secondary: Story = { args: { children: 'إلغاء', variant: 'secondary', size: 'md' } };
export const Outline: Story = { args: { children: 'تفاصيل', variant: 'outline', size: 'sm' } };
export const Ghost: Story = { args: { children: 'تعديل', variant: 'ghost', size: 'md' } };
export const Danger: Story = { args: { children: 'حذف', variant: 'danger', size: 'md' } };
export const Loading: Story = { args: { children: 'جاري...', variant: 'primary', loading: true } };
export const Disabled: Story = { args: { children: 'معطل', disabled: true } };
