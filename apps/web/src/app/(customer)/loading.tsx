import { LogoLoader } from '@/components/LogoLoader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CustomerLoading(): JSX.Element {
  return (
    <DashboardLayout userRole="CUSTOMER">
      <LogoLoader size="sm" />
    </DashboardLayout>
  );
}
