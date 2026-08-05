import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'VeriFin AI | AI-Powered Financial Fraud Detection',
    template: '%s | VeriFin AI',
  },
  description: 'Verify financial communications instantly with AI-powered fraud detection. Scan text, URLs, images, and audio for scams, phishing, and fraud.',
  keywords: ['fraud detection', 'financial security', 'AI scanner', 'phishing protection', 'scam verification', 'SEBI compliance'],
  authors: [{ name: 'VeriFin AI Team' }],
  creator: 'VeriFin AI',
  publisher: 'VeriFin AI',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://verifin.ai',
    siteName: 'VeriFin AI',
    title: 'VeriFin AI | AI-Powered Financial Fraud Detection',
    description: 'Verify financial communications instantly with AI-powered fraud detection.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VeriFin AI - Financial Fraud Detection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VeriFin AI | AI-Powered Financial Fraud Detection',
    description: 'Verify financial communications instantly with AI-powered fraud detection.',
    images: ['/og-image.png'],
    creator: '@verifin_ai',
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" class={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}