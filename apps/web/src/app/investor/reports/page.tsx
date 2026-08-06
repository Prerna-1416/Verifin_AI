import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-elegant">
          <FileText className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-heading-lg font-bold tracking-tight text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground">Download PDF security reports for your scans</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center shadow-glass">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-foreground">No reports yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          After running a scan, a downloadable PDF report is generated automatically.
        </p>
        <Link href="/investor/scanner" className="mt-4">
          <Button size="sm">
            Run a scan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
