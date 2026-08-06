'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  ShieldAlert,
  Flag,
  ScanSearch,
  Loader2,
} from 'lucide-react';
import { StatCard, PortalCard, SectionTitle, Badge } from '@/components/ui/portal-card';
import { apiGet } from '@/lib/portal-api';
import { formatRelativeTime } from '@/lib/utils';

type DashboardData = {
  users: number;
  institutions: number;
  notices: number;
  threats: number;
  scans: number;
  flagged: number;
  recentScans: Array<{
    id: string;
    inputType: string;
    riskLevel: string;
    riskScore: number;
    createdAt: string;
    user: { name: string | null; email: string } | null;
  }>;
  recentUsers: Array<{ id: string; name: string | null; email: string; role: string; createdAt: string }>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardData>('/api/admin/dashboard')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, []);

  if (!data && !error) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const stats = [
    { label: 'Users', value: data!.users, icon: <Users className="h-5 w-5" /> },
    { label: 'Institutions', value: data!.institutions, icon: <Building2 className="h-5 w-5" /> },
    { label: 'Threats', value: data!.threats, icon: <ShieldAlert className="h-5 w-5" /> },
    { label: 'Pending flags', value: data!.flagged, icon: <Flag className="h-5 w-5" /> },
    { label: 'Total scans', value: data!.scans, icon: <ScanSearch className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Overview" subtitle="Platform health at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard>
          <SectionTitle title="Recent Scans" />
          {data!.recentScans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scans yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data!.recentScans.map((scan) => (
                <li key={scan.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {scan.user ? scan.user.name || scan.user.email : 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scan.inputType} · {formatRelativeTime(scan.createdAt)}
                    </p>
                  </div>
                  <Badge tone={scan.riskLevel === 'LOW' ? 'success' : 'warning'}>
                    {scan.riskLevel} · {Math.round(scan.riskScore)}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard>
          <SectionTitle title="Recent Registrations" />
          {data!.recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data!.recentUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name || user.email}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge tone="info">{user.role}</Badge>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>
      </div>
    </div>
  );
}
