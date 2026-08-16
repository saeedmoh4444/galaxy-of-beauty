import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InlineEdit } from './InlineEdit';

const meta: Meta<typeof InlineEdit> = {
  title: 'UI/InlineEdit',
  component: InlineEdit,
  argTypes: {
    type: { control: 'select', options: ['text', 'textarea', 'number'] },
  },
};

export default meta;
type Story = StoryObj<typeof InlineEdit>;

function StatefulInlineEdit(args: { label: string; value: string }) {
  const [value, setValue] = useState(args.value);
  return (
    <InlineEdit
      {...args}
      value={value}
      onSave={async (v) => {
        setValue(v);
        return v;
      }}
    />
  );
}

export const Text: Story = {
  args: { label: 'الاسم', value: 'نورة العمري' },
  render: (args) => <StatefulInlineEdit {...args} />,
};

export const Empty: Story = {
  args: { label: 'الوصف', value: '', emptyText: 'أضيفي وصفاً' },
  render: (args) => <InlineEdit {...args} onSave={async (v) => v} />,
};

export const WithValidation: Story = {
  args: { label: 'رقم الجوال', value: '+966512345678' },
  render: (args) => (
    <InlineEdit
      {...args}
      validate={(v) => (/^\+9665\d{8}$/.test(v) ? null : 'صيغة الجوال: +9665xxxxxxxx')}
      onSave={async (v) => v}
    />
  ),
};

export const Multiline: Story = {
  args: { label: 'نبذة', value: 'مستشارة تجميل بخبرة ٥ سنوات', type: 'textarea' },
  render: (args) => <InlineEdit {...args} onSave={async (v) => v} />,
};
