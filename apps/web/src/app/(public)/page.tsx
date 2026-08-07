'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ScanSearch,
  FileSearch,
  QrCode,
  Building2,
  RadioTower,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  Bot,
  MessageSquare,
  Puzzle,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section, Container, FeatureCard } from '@/components/layout/page-layout';

const features = [
  {
    icon: <ScanSearch className="w-6 h-6" />,
    title: 'Multi-Format AI Scanner',
    description: 'Scan text, URLs, images, and audio for phishing attempts, scam patterns, and fraudulent content with state-of-the-art AI.',
    href: '/investor/scanner',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Risk Scoring Engine',
    description: 'Get instant 0-100 risk scores with detailed explanations of why content was flagged, powered by explainable AI.',
    href: '/investor/scanner',
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: 'Cryptographic QR Verification',
    description: 'Verify official communications from registered institutions using tamper-proof digitally signed QR codes.',
    href: '/investor/verify',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Verified Institution Registry',
    description: 'Access a transparent registry of verified financial institutions with their public keys and communication history.',
    href: '/registry',
  },
  {
    icon: <RadioTower className="w-6 h-6" />,
    title: 'Real-time Threat Intelligence',
    description: 'Stay ahead of emerging scams with a continuously updated threat feed sourced from global intelligence networks.',
    href: '/threats',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Court-ready Evidence Reports',
    description: 'Download comprehensive PDF evidence reports documenting every scan, detection, and verification for legal use.',
    href: '/investor/reports',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'AI Threat-Hunter Agents',
    description: 'Autonomous agents watch for look-alike domains and fraud networks, auto-publishing threats and notifying regulators.',
    href: '/threat-hunter',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'WhatsApp Scam Scanner',
    description: 'Paste a WhatsApp conversation and every message is risk-scored for phishing, scams, and fraudulent investment offers.',
    href: '/whatsapp',
  },
  {
    icon: <Puzzle className="w-6 h-6" />,
    title: 'Browser Extension',
    description: 'Right-click any message or link to scan it with VeriFin from anywhere in Chrome, with instant plain-language verdicts.',
    href: '/extension',
  },
  {
    icon: <EyeOff className="w-6 h-6" />,
    title: 'Privacy Shield (DPDP)',
    description: 'A PAN, Aadhaar, or OTP pasted into a scan is redacted locally before any AI runs — no personal data ever reaches a model.',
    href: '/privacy',
  },
];

const steps = [
  {
    number: '01',
    icon: <FileSearch className="w-6 h-6" />,
    title: 'Upload Content',
    description: 'Paste suspicious text, enter a URL, or upload an image or audio file to the AI scanner.',
  },
  {
    number: '02',
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI Analyzes',
    description: 'Our multi-model ensemble scans content across 4 detection engines simultaneously.',
  },
  {
    number: '03',
    icon: <Zap className="w-6 h-6" />,
    title: 'Risk Score Generated',
    description: 'Receive a transparent 0-100 risk score with per-detector breakdowns and reasoning.',
  },
  {
    number: '04',
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Verify & Act',
    description: 'Verify official QRs, download evidence reports, and report threats to protect others.',
  },
];

const stats = [
  { value: '50K+', label: 'Content Scans', change: '+12% this month' },
  { value: '99.2%', label: 'Detection Accuracy', change: '+0.4% this month' },
  { value: '1.2K', label: 'Verified Institutions', change: '+48 this month' },
  { value: '8.4K', label: 'Threats Identified', change: '+1.2K this month' },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-background to-background dark:from-gray-900 dark:via-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary-400/30 blur-3xl animate-pulse-soft" />
          <div className="absolute top-40 right-[10%] w-96 h-96 rounded-full bg-accent-500/20 blur-3xl animate-pulse-soft delay-200" />
          <div className="absolute bottom-20 left-[40%] w-64 h-64 rounded-full bg-primary-300/20 blur-3xl animate-pulse-soft delay-500" />
        </div>

        <Container className="relative z-10 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary"
              >
                <ShieldCheck className="w-4 h-4" />
                SEBI Hackathon 2026 • Trusted Fraud Detection
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground leading-tight"
              >
                Verify Financial Communications{' '}
                <span className="gradient-text">Instantly</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-muted-foreground max-w-xl"
              >
                VeriFin AI uses advanced artificial intelligence to detect scams, phishing
                attempts, and fraudulent communications targeting investors — before they
                cost you money.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link href="/register">
                  <Button size="xl" variant="gradient" className="w-full sm:w-auto group">
                    Start Scanning Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/investor/scanner">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    <ScanSearch className="w-5 h-5 mr-2" />
                    Try the Scanner
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-4 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success-500" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-success-500" /> SOC 2 compliant
                </span>
              </motion.div>
            </div>

            {/* Hero visual - Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="glass-strong rounded-3xl p-6 shadow-elegant-hover rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                    <div className="w-3 h-3 rounded-full bg-warning-500/80" />
                    <div className="w-3 h-3 rounded-full bg-success-500/80" />
                  </div>
                  <div className="flex-1 text-center text-sm font-medium text-muted-foreground">
                    Scan Result
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                        <span className="font-bold text-destructive text-xl">Critical</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                      <div className="text-3xl font-bold text-foreground">94</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
                    <div className="text-sm font-semibold text-foreground mb-2">
                      Detection Reasons
                    </div>
                    <div className="space-y-2">
                      {['Urgent action required pattern detected', 'Domain registered 3 days ago', 'Matches 2 known scam templates', 'Inconsistent sender identity'].map((reason, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <XCircle className="w-4 h-4 text-destructive shrink-0" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-success-500/5 border border-success-500/20">
                    <div className="text-sm text-muted-foreground">Verified Institution</div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-success-600">
                      <CheckCircle2 className="w-4 h-4" />
                      HDFC Securities
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 glass rounded-2xl p-4 shadow-elegant-hover animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Threat Blocked</div>
                    <div className="text-xs text-muted-foreground">Just now</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <Section variant="muted">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              <div className="text-xs text-success-600 mt-2">{stat.change}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Features Section */}
      <Section>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-display-md font-display font-bold text-foreground mb-4">
              Complete Fraud Detection Platform
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything investors need to verify financial communications and stay protected
              from increasingly sophisticated scams.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section variant="muted">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-display-md font-display font-bold text-foreground mb-4"
          >
            How It Works
          </motion.h2>
          <p className="text-lg text-muted-foreground">
            From suspicious message to verified decision in seconds.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 h-full relative">
                  <div className="absolute -top-4 left-6 text-4xl font-display font-bold text-primary/10">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-heading-md font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-body-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-8 lg:p-16 text-center bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-display-md font-display font-bold mb-4">
              Protect Yourself from Financial Fraud
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of investors who verify every financial communication before
              they act. Free to start, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" className="bg-white text-primary-700 hover:bg-white/90 shadow-elegant-hover">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}