import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Sign in or create your VeriFin AI account',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.15),transparent_60%)]" />
      <div className="relative z-10 mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-elegant">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-bold tracking-tight text-foreground">VeriFin AI</p>
          <p className="text-xs text-muted-foreground">AI-Powered Financial Fraud Detection</p>
        </div>
      </div>
      {children}
      <p className="relative z-10 mt-8 text-center text-xs text-muted-foreground">
        Protected by bank-grade encryption.{' '}
        <Link href="/about" className="text-primary hover:underline">
          Learn more
        </Link>
      </p>
    </div>
  );
}
