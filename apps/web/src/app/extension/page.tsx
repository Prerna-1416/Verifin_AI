'use client';

import { Puzzle, FileCode2, MousePointerClick, CheckCircle2 } from 'lucide-react';
import { SectionTitle, PortalCard, Badge } from '@/components/ui/portal-card';

const steps = [
  {
    icon: <FileCode2 className="h-5 w-5" />,
    title: 'Open the extension folder',
    body: 'Navigate to tools/browser-extension in the project, or open it in VS Code.',
  },
  {
    icon: <MousePointerClick className="h-5 w-5" />,
    title: 'Load unpacked in Chrome',
    body: 'Open chrome://extensions, enable Developer mode (top-right), click "Load unpacked", and select the tools/browser-extension folder.',
  },
  {
    icon: <Puzzle className="h-5 w-5" />,
    title: 'Pin & scan',
    body: 'Pin VeriFin AI to the toolbar. Select any text → right-click → "Scan with VeriFin", or open the popup and paste a link/message.',
  },
];

export default function ExtensionPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Browser Extension"
        subtitle="Scan messages and links for financial scams from anywhere in your browser"
      />

      <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Ready to load — requires AI service on port 8001.</p>
          <p className="mt-1 text-emerald-700">
            The extension talks to <code className="rounded bg-emerald-100 px-1">http://localhost:8001</code>.
            Start the AI service before scanning.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <PortalCard key={s.title}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {s.icon}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Step {i + 1}</div>
                <div className="text-sm font-semibold">{s.title}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </PortalCard>
        ))}
      </div>

      <PortalCard>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          Features <Badge tone="neutral">Manifest V3</Badge>
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
            Select any text on a page → right-click → <em>Scan with VeriFin</em> for an instant risk verdict.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
            Paste a URL or message in the popup to get a 0–100 risk score and a plain-language explanation.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
            Full-page scan view for reviewing multiple suspicious links at once.
          </li>
        </ul>
      </PortalCard>

      <PortalCard>
        <h3 className="mb-2 text-base font-semibold">Files</h3>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1">manifest.json</code>,{' '}
          <code className="rounded bg-muted px-1">background.js</code>,{' '}
          <code className="rounded bg-muted px-1">popup/*</code> — under{' '}
          <code className="rounded bg-muted px-1">tools/browser-extension</code>. Full instructions are in the
          folder&apos;s <code className="rounded bg-muted px-1">README.md</code>.
        </p>
      </PortalCard>
    </div>
  );
}