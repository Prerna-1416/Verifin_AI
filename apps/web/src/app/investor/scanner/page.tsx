'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Music,
  ScanSearch,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/forms/file-upload';
import { RiskScore } from '@/components/data-display/risk-score';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ScanType = 'TEXT' | 'URL' | 'IMAGE' | 'AUDIO';

interface DetectorResult {
  name: string;
  status: 'passed' | 'flagged' | 'checking';
  detail: string;
}

interface MockScanResult {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectors: DetectorResult[];
  threats: string[];
}

const mockResults: Record<ScanType, MockScanResult> = {
  TEXT: {
    score: 87,
    level: 'HIGH',
    detectors: [
      { name: 'Phishing Pattern Analysis', status: 'flagged', detail: 'Urgent action required + payment demand pattern detected (confidence: 94%)' },
      { name: 'Lexical Analysis', status: 'flagged', detail: 'High emotional trigger words: "immediately", "suspended", "verify within 24 hours"' },
      { name: 'Sender Identity Check', status: 'flagged', detail: 'Claims to be SEBI but domain mismatches official registry' },
      { name: 'Grammar & Language Model', status: 'passed', detail: 'No anomalies detected in language model' },
    ],
    threats: ['Phishing', 'Impersonation', 'Urgency Scam'],
  },
  URL: {
    score: 91,
    level: 'CRITICAL',
    detectors: [
      { name: 'Domain Reputation', status: 'flagged', detail: 'Domain registered 3 days ago (whois: privacy-protected)' },
      { name: 'SSL & Certificate Check', status: 'passed', detail: 'Valid SSL certificate found' },
      { name: 'Redirect Analysis', status: 'flagged', detail: '3 redirects detected, final destination differs from displayed URL' },
      { name: 'Typo-Squatting Detection', status: 'flagged', detail: 'Visually similar to hdfc-securities.com (1 char difference)' },
      { name: 'Threat Feed Match', status: 'flagged', detail: 'Domain matches active threat indicator #THR-2041' },
    ],
    threats: ['Phishing', 'Typo-Squatting', 'Malicious URL'],
  },
  IMAGE: {
    score: 34,
    level: 'MEDIUM',
    detectors: [
      { name: 'Logo Verification', status: 'flagged', detail: 'Logo detected resembles SEBI logo but with minor distortion' },
      { name: 'QR Code Extraction', status: 'passed', detail: 'QR code decoded, signature verification pending' },
      { name: 'Image Tampering (ELA)', status: 'flagged', detail: 'Error Level Analysis shows edited regions around logo (21%)' },
      { name: 'OCR Text Extraction', status: 'passed', detail: 'Text extraction completed, no suspicious keywords' },
    ],
    threats: ['Logo Misuse', 'Document Tampering'],
  },
  AUDIO: {
    score: 45,
    level: 'MEDIUM',
    detectors: [
      { name: 'Speech-to-Text', status: 'passed', detail: 'Transcription completed (12 seconds audio)' },
      { name: 'Script Analysis', status: 'flagged', detail: 'Phrases like "guaranteed returns", "limited time offer" detected' },
      { name: 'Voice Consistency', status: 'passed', detail: 'Single speaker detected, voice patterns consistent' },
      { name: 'Claim Verification', status: 'flagged', detail: 'Claims of "SEBI-approved returns" - no matching official record' },
    ],
    threats: ['Investment Scam', 'Misleading Claims'],
  },
};

const typeConfig = {
  TEXT: {
    icon: FileText,
    label: 'Text',
    placeholder: 'Paste suspicious text here... e.g., an email, SMS, or WhatsApp message',
  },
  URL: {
    icon: LinkIcon,
    label: 'URL',
    placeholder: 'https://example.com',
  },
  IMAGE: {
    icon: ImageIcon,
    label: 'Image',
    accept: 'image/*',
  },
  AUDIO: {
    icon: Music,
    label: 'Audio',
    accept: 'audio/*',
  },
};

export default function ScannerPage() {
  const [scanType, setScanType] = React.useState<ScanType>('TEXT');
  const [text, setText] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<MockScanResult | null>(null);
  const [activeDetector, setActiveDetector] = React.useState(0);

  const handleScan = async () => {
    // Validate input
    if (scanType === 'TEXT' && text.length < 10) {
      toast.error('Please enter at least 10 characters of text');
      return;
    }
    if (scanType === 'URL' && !url) {
      toast.error('Please enter a URL to scan');
      return;
    }
    if ((scanType === 'IMAGE' || scanType === 'AUDIO') && files.length === 0) {
      toast.error(`Please upload a${scanType === 'AUDIO' ? 'n' : ''} ${scanType.toLowerCase()} file`);
      return;
    }

    setIsScanning(true);
    setResult(null);
    setProgress(0);

    // Animate scanning progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 4;
      });
    }, 80);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2500));
    clearInterval(interval);
    setProgress(100);

    // Animate detectors one by one
    const mock = mockResults[scanType];
    setResult(mock);
    setIsScanning(false);
    setActiveDetector(0);
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setUrl('');
    setFiles([]);
    setProgress(0);
  };

  const currentConfig = typeConfig[scanType];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">AI Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scan any content for scams, phishing, and fraud across 4 detection engines.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input side */}
        <div className="space-y-4">
          <Tabs value={scanType} onValueChange={(v) => setScanType(v as ScanType)}>
            <TabsList className="w-full grid grid-cols-4">
              {(Object.keys(typeConfig) as ScanType[]).map((type) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                return (
                  <TabsTrigger key={type} value={type} className="gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="TEXT" className="mt-4">
              <Textarea
                label="Text Content"
                placeholder={typeConfig.TEXT.placeholder}
                className="min-h-[280px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
                helperText={`${text.length}/50000 characters`}
              />
            </TabsContent>

            <TabsContent value="URL" className="mt-4">
              <Input
                type="url"
                label="URL Address"
                placeholder={typeConfig.URL.placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                helperText="We'll analyze the domain, redirects, SSL, and reputation"
              />
              <div className="mt-4 rounded-2xl bg-muted/50 p-4 space-y-2">
                <div className="text-sm font-medium text-foreground">What we check:</div>
                {['Domain age & reputation', 'SSL certificate validity', 'Redirect chains & final destination', 'Typo-squatting similarity', 'Threat feed indicators'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-success-500" />
                    {item}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="IMAGE" className="mt-4">
              <FileUpload
                accept={typeConfig.IMAGE.accept}
                label="Upload screenshot of suspicious communication"
                value={files}
                onChange={setFiles}
              />
            </TabsContent>

            <TabsContent value="AUDIO" className="mt-4">
              <FileUpload
                accept={typeConfig.AUDIO.accept}
                label="Upload audio recording of suspicious call"
                value={files}
                onChange={setFiles}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="gradient"
              className="flex-1"
              onClick={handleScan}
              loading={isScanning}
              disabled={isScanning}
            >
              {!isScanning && <ScanSearch className="w-5 h-5 mr-2" />}
              {isScanning ? 'Analyzing...' : 'Scan Content'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Running 4 detection engines...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-600 to-accent-600"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                  Text/Content preprocessing
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                  Feature extraction
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                  Model inference
                </div>
                <div className="flex items-center gap-2 animate-pulse">
                  <ScanSearch className="w-3.5 h-3.5 text-primary" />
                  Generating explanations...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results side */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result && !isScanning ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full rounded-3xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <ScanSearch className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Enter content on the left and click "Scan Content" to see detailed risk
                  analysis and explanations.
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Score summary */}
                <div className="glass rounded-3xl p-6 flex items-center gap-6">
                  <RiskScore score={result.score} level={result.level} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          result.level === 'CRITICAL' || result.level === 'HIGH'
                            ? 'destructive'
                            : result.level === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {result.level} RISK
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {result.score}/100
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.level === 'LOW'
                        ? 'No significant threats detected. Content appears safe.'
                        : result.level === 'MEDIUM'
                        ? 'Some suspicious patterns detected. Exercise caution.'
                        : 'High likelihood of fraudulent content. Do not share personal information.'}
                    </p>
                  </div>
                </div>

                {/* Detectors */}
                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Detection Breakdown</h3>
                  <div className="space-y-2">
                    {result.detectors.map((detector, index) => (
                      <motion.button
                        key={detector.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setActiveDetector(index)}
                        className={cn(
                          'w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all',
                          activeDetector === index ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'
                        )}
                      >
                        {detector.status === 'passed' ? (
                          <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
                        ) : detector.status === 'flagged' ? (
                          <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                        ) : (
                          <ScanSearch className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-pulse" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">{detector.name}</div>
                          {activeDetector === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-xs text-muted-foreground mt-1"
                            >
                              {detector.detail}
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Threats */}
                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold text-foreground mb-3">Matched Threats</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.threats.map((threat) => (
                      <Badge key={threat} variant="destructive">
                        {threat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="gradient">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Scan Another
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}