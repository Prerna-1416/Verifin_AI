import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout portal="investor">{children}</DashboardLayout>;
}