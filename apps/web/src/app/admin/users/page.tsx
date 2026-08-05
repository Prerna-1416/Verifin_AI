'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, UserCheck, UserX, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/data-display/empty-state';
import { StatsCard } from '@/components/data-display/stats-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'INVESTOR' | 'INSTITUTION' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  scans: number;
  joined: string;
}

const users: UserItem[] = [
  { id: 'USR-001', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'INVESTOR', status: 'ACTIVE', scans: 128, joined: 'Jan 2026' },
  { id: 'USR-002', name: 'Priya Patel', email: 'priya@example.com', role: 'INVESTOR', status: 'ACTIVE', scans: 86, joined: 'Feb 2026' },
  { id: 'USR-003', name: 'Amit Verma', email: 'amit@example.com', role: 'INSTITUTION', status: 'ACTIVE', scans: 0, joined: 'Mar 2026' },
  { id: 'USR-004', name: 'Sneha Gupta', email: 'sneha@example.com', role: 'INVESTOR', status: 'SUSPENDED', scans: 45, joined: 'Apr 2026' },
  { id: 'USR-005', name: 'Vikram Singh', email: 'vikram@example.com', role: 'ADMIN', status: 'ACTIVE', scans: 12, joined: 'Jan 2026' },
  { id: 'USR-006', name: 'Ananya Iyer', email: 'ananya@example.com', role: 'INVESTOR', status: 'ACTIVE', scans: 234, joined: 'Feb 2026' },
];

const roleVariant: Record<string, 'default' | 'secondary' | 'warning'> = {
  INVESTOR: 'secondary',
  INSTITUTION: 'default',
  ADMIN: 'warning',
};

export default function UsersPage() {
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage platform users and their roles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Users" value="48,392" change={22.6} changeLabel="vs last month" icon={<Users className="w-5 h-5" />} color="primary" delay={0} />
        <StatsCard title="Active Users" value="42,180" change={18.4} changeLabel="vs last month" icon={<UserCheck className="w-5 h-5" />} color="success" delay={0.1} />
        <StatsCard title="Suspended" value="146" change={-3.2} changeLabel="vs last month" icon={<UserX className="w-5 h-5" />} color="destructive" delay={0.2} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          placeholder="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'INVESTOR', label: 'Investor' },
            { value: 'INSTITUTION', label: 'Institution' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
        />
      </div>

      {filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'destructive'}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.scans}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing ${user.name}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
          title="No users found"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}