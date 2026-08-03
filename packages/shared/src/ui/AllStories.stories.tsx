import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { EmptyState } from "./EmptyState";
import { ErrorAlert } from "./ErrorAlert";
import { Spinner, PageSpinner } from "./Spinner";
import { ProgressBar } from "./ProgressBar";
import { Pagination } from "./Pagination";
import { StatCard } from "./StatCard";
import { PageContainer } from "./PageContainer";
import { Icon } from "./Icon";
import { InlineEdit } from "./InlineEdit";
import {
  Skeleton, CardSkeleton, ListSkeleton, TextLineSkeleton,
  AvatarSkeleton, TableRowSkeleton, DashboardSkeleton,
  CardListSkeleton, DetailSkeleton, FormSkeleton, TableSkeleton,
} from "./Skeleton";
import { ToastProvider, useToast } from "./Toast";
import { useState } from "react";

// =================================================================
// Button
// =================================================================
const buttonMeta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default buttonMeta;
type ButtonStory = StoryObj<typeof Button>;

export const Primary: ButtonStory = { args: { children: "احجزي الآن", variant: "primary", size: "md" } };
export const Secondary: ButtonStory = { args: { children: "إلغاء", variant: "secondary" } };
export const Outline: ButtonStory = { args: { children: "عرض الكل", variant: "outline" } };
export const Ghost: ButtonStory = { args: { children: "تعديل", variant: "ghost" } };
export const Danger: ButtonStory = { args: { children: "حذف", variant: "danger" } };
export const Small: ButtonStory = { args: { children: "حفظ", size: "sm" } };
export const Large: ButtonStory = { args: { children: "تأكيد الحجز", size: "lg" } };
export const Loading: ButtonStory = { args: { children: "جاري الحفظ", loading: true } };
export const Disabled: ButtonStory = { args: { children: "غير متاح", disabled: true } };
export const WithIcon: ButtonStory = {
  render: () => (
    <Button>
      <Icon name="plus" size="sm" />
      إضافة جديدة
    </Button>
  ),
};

// =================================================================
// Card
// =================================================================
export const CardStory: StoryObj<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
      <Card padding="sm">Small padding card</Card>
      <Card padding="md">Medium padding card (default)</Card>
      <Card padding="lg">Large padding card</Card>
      <Card hover>Hover me — I have a shadow transition</Card>
    </div>
  ),
};

// =================================================================
// Input
// =================================================================
export const InputStory: StoryObj<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
      <Input label="البريد الإلكتروني" placeholder="example@email.com" />
      <Input label="كلمة المرور" type="password" placeholder="••••••••" />
      <Input label="الاسم" hint="أدخلي اسمكِ الكامل" />
      <Input label="البريد" error="هذا الحقل مطلوب" defaultValue="invalid" />
      <Input label="معطل" disabled value="لا يمكن التعديل" />
    </div>
  ),
};

// =================================================================
// Modal
// =================================================================
export const ModalStory: StoryObj<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>افتح النافذة</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="عنوان النافذة" description="وصف توضيحي للنافذة">
          <p>محتوى النافذة هنا. اضغط Escape أو على الخلفية للإغلاق.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={() => setOpen(false)}>تأكيد</Button>
          </div>
        </Modal>
      </>
    );
  },
};

// =================================================================
// EmptyState
// =================================================================
export const EmptyStateStory: StoryObj<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-col gap-8" style={{ maxWidth: 500 }}>
      <EmptyState title="لا توجد حجوزات" description="ابدئي رحلتكِ مع أول حجز" />
      <EmptyState
        title="السلة فارغة"
        description="أضيفي خدمات إلى سلتكِ للبدء"
        action={{ label: "تصفحي الخدمات", onPress: () => alert("Navigate") }}
      />
    </div>
  ),
};

// =================================================================
// ErrorAlert
// =================================================================
export const ErrorAlertStory: StoryObj<typeof ErrorAlert> = {
  title: "UI/ErrorAlert",
  component: ErrorAlert,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-col gap-4" style={{ maxWidth: 500 }}>
      <ErrorAlert message="فشل تحميل البيانات" />
      <ErrorAlert message="فشل تحميل البيانات" onRetry={() => alert("Retry")} />
    </div>
  ),
};

// =================================================================
// Spinner
// =================================================================
export const SpinnerStory: StoryObj<typeof Spinner> = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
      <PageSpinner message="جاري تحميل الصفحة..." />
    </div>
  ),
};

// =================================================================
// ProgressBar
// =================================================================
export const ProgressBarStory: StoryObj<typeof ProgressBar> = {
  title: "UI/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
      <ProgressBar value={0} label="0%" />
      <ProgressBar value={40} label="40%" />
      <ProgressBar value={75} label="75%" />
      <ProgressBar value={100} label="مكتمل" />
      <ProgressBar label="جاري التحميل..." />
    </div>
  ),
};

// =================================================================
// Pagination
// =================================================================
export const PaginationStory: StoryObj<typeof Pagination> = {
  title: "UI/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  render: () => {
    const [page, setPage] = useState(3);
    return <Pagination page={page} totalPages={10} onPageChange={setPage} />;
  },
};

// =================================================================
// StatCard
// =================================================================
export const StatCardStory: StoryObj<typeof StatCard> = {
  title: "UI/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3" style={{ maxWidth: 700 }}>
      <StatCard label="الحجوزات" value={42} icon="📅" />
      <StatCard label="الإيرادات" value="١٢٬٥٠٠ ر.س" icon="💰" />
      <StatCard label="التقييم" value="4.8" icon="⭐" trend={{ direction: "up", value: "12%" }} />
    </div>
  ),
};

// =================================================================
// PageContainer
// =================================================================
export const PageContainerStory: StoryObj<typeof PageContainer> = {
  title: "UI/PageContainer",
  component: PageContainer,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-col gap-4">
      <PageContainer width="narrow"><Card padding="md">نموذج ضيق (max-w-2xl)</Card></PageContainer>
      <PageContainer width="default"><Card padding="md">افتراضي (max-w-4xl)</Card></PageContainer>
      <PageContainer width="wide"><Card padding="md">عريض (max-w-6xl)</Card></PageContainer>
    </div>
  ),
};

// =================================================================
// Icon
// =================================================================
export const IconStory: StoryObj<typeof Icon> = {
  title: "UI/Icon",
  component: Icon,
  tags: ["autodocs"],
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["search", "calendar", "user", "heart", "star", "check", "close", "plus", "trash", "edit", "bell", "wallet", "gift", "chat", "share", "bookmark", "settings", "camera", "sparkle", "clock"] as const).map((name) => (
        <div key={name} className="flex flex-col items-center gap-1 text-xs text-text-secondary">
          <Icon name={name} size="lg" />
          {name}
        </div>
      ))}
    </div>
  ),
};

// =================================================================
// InlineEdit
// =================================================================
export const InlineEditStory: StoryObj<typeof InlineEdit> = {
  title: "UI/InlineEdit",
  component: InlineEdit,
  tags: ["autodocs"],
  render: () => (
    <div className="space-y-4" style={{ maxWidth: 400 }}>
      <div>
        <p className="text-xs text-text-secondary mb-1">الاسم</p>
        <InlineEdit
          value="نورة العمري"
          onSave={async (v) => { await new Promise((r) => setTimeout(r, 500)); return v; }}
          label="الاسم"
        />
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">البريد الإلكتروني</p>
        <InlineEdit
          value="noora@example.com"
          onSave={async (v) => { await new Promise((r) => setTimeout(r, 500)); return v; }}
          label="البريد الإلكتروني"
        />
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">فارغ</p>
        <InlineEdit
          value=""
          onSave={async (v) => { await new Promise((r) => setTimeout(r, 500)); return v; }}
          label="ملاحظات"
          placeholder="أضيفي ملاحظة..."
          emptyText="اضغطي للإضافة"
        />
      </div>
    </div>
  ),
};

// =================================================================
// Skeleton
// =================================================================
export const SkeletonStory: StoryObj = {
  title: "UI/Skeleton",
  tags: ["autodocs"],
  render: () => (
    <div className="space-y-8" style={{ maxWidth: 800 }}>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Dashboard Skeleton</h3>
        <DashboardSkeleton />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Card List Skeleton</h3>
        <CardListSkeleton count={3} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Detail Skeleton</h3>
        <DetailSkeleton />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Form Skeleton</h3>
        <FormSkeleton fields={3} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Table Skeleton</h3>
        <TableSkeleton rows={3} cols={4} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Text Line + Avatar</h3>
        <div className="space-y-2">
          <TextLineSkeleton width="3/4" />
          <TextLineSkeleton width="1/2" />
          <div className="flex items-center gap-2 mt-3">
            <AvatarSkeleton size={10} />
            <TextLineSkeleton width="1/3" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Table Row</h3>
        <TableRowSkeleton cols={4} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">List Skeleton</h3>
        <ListSkeleton rows={3} />
      </div>
    </div>
  ),
};

// =================================================================
// Toast
// =================================================================
function ToastDemo() {
  const { addToast, toasts } = useToast();
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => addToast("success", "تم الحفظ بنجاح")}>نجاح</Button>
        <Button size="sm" variant="danger" onClick={() => addToast("error", "فشلت العملية")}>خطأ</Button>
        <Button size="sm" variant="outline" onClick={() => addToast("warning", "تنبيه هام")}>تحذير</Button>
        <Button size="sm" variant="secondary" onClick={() => addToast("info", "معلومة جديدة")}>معلومة</Button>
      </div>
      <p className="text-xs text-text-secondary">عدد الإشعارات: {toasts.length}</p>
    </div>
  );
}

export const ToastStory: StoryObj = {
  title: "UI/Toast",
  tags: ["autodocs"],
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
