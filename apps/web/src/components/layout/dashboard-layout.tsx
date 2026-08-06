'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ScanSearch,
  History,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  RadioTower,
  BarChart3,
  Flag,
  Users,
  QrCode,
  Megaphone,
  Library,
  Shield,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const portalNav: Record<string, NavItem[]> = {
  investor: [
    { href: '/investor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/investor/scanner', label: 'AI Scanner', icon: ScanSearch },
    { href: '/investor/history', label: 'Scan History', icon: History },
    { href: '/investor/reports', label: 'Reports', icon: FileText },
    { href: '/investor/verify', label: 'Verification', icon: ShieldCheck },
  ],
  institution: [
    { href: '/institution', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/institution/register-notice', label: 'Register Notice', icon: Megaphone },
    { href: '/institution/qr-generator', label: 'QR Generator', icon: QrCode },
    { href: '/institution/registry', label: 'Registry', icon: Library },
    { href: '/institution/reports', label: 'Reports', icon: FileText },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/threats', label: 'Threat Feed', icon: RadioTower },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/flagged', label: 'Flagged Content', icon: Flag },
    { href: '/admin/institutions', label: 'Institutions', icon: Building2 },
    { href: '/admin/users', label: 'Users', icon: Users },
  ],
};

export function DashboardLayout({
  children,
  portal,
}: {
  children: React.ReactNode;
  portal: 'investor' | 'institution' | 'admin';
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = portalNav[portal];
  const portalLabel = {
    investor: 'Investor Portal',
    institution: 'Institution Portal',
    admin: 'Admin Portal',
  }[portal];

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const handleSignOut = () => signOut({ callbackUrl: '/' });

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r border-border transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          'max-lg:-translate-x-full max-lg:data-[open=true]:translate-x-0'
        )}
        data-open={sidebarOpen}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/" className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <div className="font-display font-bold text-lg text-foreground leading-none">VeriFin AI</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{portalLabel}</div>
              </div>
            )}
          </Link>
          <button
            className={cn('lg:hidden p-2 text-muted-foreground hover:text-foreground', collapsed && 'hidden')}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative',
                  collapsed && 'justify-center px-2',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {active && (
                  <motion.div
                    layoutId={`active-${portal}`}
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={cn('w-5 h-5 shrink-0 relative z-10', active && 'text-primary')} />
                {!collapsed && <span className="relative z-10">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href={`/${portal}/settings`}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all',
              collapsed && 'justify-center px-2'
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn('flex flex-col min-h-screen transition-all duration-300', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]')}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-8">
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            className="hidden lg:flex p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-medium text-foreground capitalize">
              {pathname.split('/')[2] || 'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/investor/scanner">
                <ScanSearch className="w-4 h-4 mr-1.5" />
                New Scan
              </Link>
            </Button>
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(session?.user?.name || session?.user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-foreground leading-none">
                  {session?.user?.name || 'User'}
                </div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">
                  {session?.user?.role?.toLowerCase() || 'investor'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}