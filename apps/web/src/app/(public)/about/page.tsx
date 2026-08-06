import type { Metadata } from 'next';
import { Shield, Target, Eye, Heart, Users, Award } from 'lucide-react';
import { Section, Container, FeatureCard } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about VeriFin AI - protecting investors from financial fraud with AI-powered detection.',
};

const values = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Protection First',
    description: 'Every decision we make is driven by our mission to protect investors from financial harm.',
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Radical Transparency',
    description: 'Our AI explains every decision. No black boxes, no hidden agendas.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Investor Advocacy',
    description: 'We stand with everyday investors against sophisticated fraud operations.',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Precision',
    description: 'Balancing high detection rates with minimal false positives through continuous learning.',
  },
];

const team = [
  { name: 'Team Member 1', role: 'Frontend Developer', initials: 'M1' },
  { name: 'Team Member 2', role: 'AI/ML Engineer', initials: 'M2' },
  { name: 'Team Member 3', role: 'Backend Developer', initials: 'M3' },
  { name: 'Team Member 4', role: 'Integration & DevOps', initials: 'M4' },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <Section variant="default" padding="lg">
        <Container size="md" className="text-center">
          <h1 className="text-display-lg font-display font-bold text-foreground mb-6">
            Building Trust in the{' '}
            <span className="gradient-text">Digital Investment Era</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            VeriFin AI was born from a simple observation: as financial scams become more
            sophisticated, the tools to detect them haven&apos;t kept up. We&apos;re changing that
            with AI that protects everyday investors.
          </p>
        </Container>
      </Section>

      {/* Mission */}
      <Section variant="muted">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-display-sm font-display font-bold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-body-lg text-muted-foreground mb-4">
              Every year, millions of investors fall victim to phishing scams, fraudulent
              schemes, and impersonation attacks. These scams exploit the trust gap between
              legitimate financial institutions and the public.
            </p>
            <p className="text-body-lg text-muted-foreground mb-6">
              We built VeriFin AI to close that gap — using multi-model AI detection,
              cryptographic verification, and a transparent threat intelligence network to
              give investors the tools institutions take for granted.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/register">
                <Button variant="gradient" size="lg">
                  Join the Mission
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">Contact Us</Button>
              </Link>
            </div>
          </div>
          <div className="glass rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Award className="w-10 h-10 text-primary shrink-0" />
              <div>
                <div className="font-semibold text-foreground">SEBI Hackathon 2026</div>
                <div className="text-sm text-muted-foreground">Official submission</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-accent-600 shrink-0" />
              <div>
                <div className="font-semibold text-foreground">Built for Investors</div>
                <div className="text-sm text-muted-foreground">By a team of 4 developers</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-success-600 shrink-0" />
              <div>
                <div className="font-semibold text-foreground">99.2% Detection Accuracy</div>
                <div className="text-sm text-muted-foreground">Across 4 detection engines</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-display-md font-display font-bold text-foreground mb-4">
            Our Values
          </h2>
          <p className="text-lg text-muted-foreground">
            The principles that guide every feature we build.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <FeatureCard key={value.title} {...value} />
          ))}
        </div>
      </Section>

      {/* Team */}
      <Section variant="muted">
        <div className="text-center mb-16">
          <h2 className="text-display-md font-display font-bold text-foreground mb-4">
            Meet the Team
          </h2>
          <p className="text-lg text-muted-foreground">
            Four developers, one mission: protect investors.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={member.name} className="glass rounded-2xl p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {member.initials}
              </div>
              <div className="font-semibold text-foreground">{member.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{member.role}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}