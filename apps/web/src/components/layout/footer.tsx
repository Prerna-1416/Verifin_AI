'use client';

import Link from 'next/link';
import { Shield, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { href: '/investor/scanner', label: 'AI Scanner' },
      { href: '/investor/verify', label: 'Verification' },
      { href: '/investor/history', label: 'Scan History' },
      { href: '/registry', label: 'Institution Registry' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/admin', label: 'Threat Intelligence' },
      { href: '/threats', label: 'Threat Feed' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/about', label: 'How It Works' },
      { href: '/about', label: 'Security' },
      { href: '/about', label: 'Compliance' },
      { href: '/contact', label: 'Support' },
    ],
  },
];

const socialLinks = [
  { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
  { href: 'https://github.com', label: 'GitHub', icon: Github },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'mailto:hello@verifin.ai', label: 'Email', icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">VeriFin AI</span>
            </Link>
            <p className="text-body-sm text-muted-foreground max-w-sm mb-6">
              AI-powered fraud detection platform helping investors verify financial communications
              instantly and stay protected from scams.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:shadow-elegant transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-foreground mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-body-xs text-muted-foreground">
            © {new Date().getFullYear()} VeriFin AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-body-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="text-body-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-body-xs text-muted-foreground hover:text-foreground transition-colors">
              Compliance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}