import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: 'البريد الإلكتروني', placeholder: 'example@email.com' },
};

export const WithHint: Story = {
  args: { label: 'الاسم', hint: 'أدخلي اسمكِ الكامل' },
};

export const Error: Story = {
  args: { label: 'كلمة المرور', type: 'password', error: 'كلمة المرور قصيرة جداً' },
};

export const Disabled: Story = {
  args: { label: 'رقم الجوال', value: '+966512345678', disabled: true },
};
