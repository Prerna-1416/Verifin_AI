'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiGet, apiPatch } from '@/lib/portal-api';
import { formatDate } from '@/lib/utils';

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
};

const ROLES = ['INVESTOR', 'INSTITUTION', 'ADMIN', 'SUPER_ADMIN'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet<AdminUser[]>('/api/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(id: string, role: string) {
    setActing(id);
    try {
      await apiPatch(`/api/admin/users/${id}`, { role });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Users" subtitle="Manage user roles" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No users yet"
          description="Users appear here after they register."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{user.name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={user.isVerified ? 'success' : 'neutral'}>
                      {user.isVerified ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="h-9 rounded-lg border border-input bg-background px-2 text-sm disabled:opacity-50"
                      value={user.role}
                      disabled={acting === user.id}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
