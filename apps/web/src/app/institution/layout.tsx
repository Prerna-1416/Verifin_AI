import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout portal="institution">{children}</DashboardLayout>;
}