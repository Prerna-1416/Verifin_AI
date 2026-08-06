import Link from 'next/link';
import { ScanSearch, History, FileText, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickActions = [
  {
    href: '/investor/scanner',
    title: 'New scan',
    desc: 'Analyze text, URL, image, or audio',
    icon: ScanSearch,
    cta: 'Scan now',
  },
  {
    href: '/investor/history',
    title: 'Scan history',
    desc: 'Review your past verifications',
    icon: History,
    cta: 'View history',
  },
  {
    href: '/investor/reports',
    title: 'Reports',
    desc: 'Download PDF security reports',
    icon: FileText,
    cta: 'View reports',
  },
];

export default function InvestorDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-8 text-white shadow-elegant sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_55%)]" />
        <div className="relative">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Protected by VeriFin AI
          </p>
          <h2 className="text-heading-xl font-bold tracking-tight">
            Verify before you trust.
          </h2>
          <p className="mt-2 max-w-md text-body-md text-white/85">
            Scan suspicious messages, links, images, and calls for scams, phishing, and fraud in seconds.
          </p>
          <div className="mt-6">
            <Link href="/investor/scanner">
              <Button variant="gradient" size="lg" className="bg-white/15 text-white hover:bg-white/25">
                Start a scan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-2xl border border-border bg-card p-6 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glass-hover"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary-100">
              <action.icon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-foreground">{action.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{action.desc}</p>
            <p className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
              {action.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-glass">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Recent activity</h3>
        </div>
        <p className="py-8 text-center text-sm text-muted-foreground">
          No scans yet. Start your first scan to see results here.
        </p>
      </section>
    </div>
  );
}
