import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-accent-50 dark:from-gray-900 dark:via-background dark:to-gray-900" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-[20%] w-72 h-72 rounded-full bg-primary-400/30 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-[20%] w-96 h-96 rounded-full bg-accent-500/20 blur-3xl animate-pulse-soft delay-300" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">VeriFin AI</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}