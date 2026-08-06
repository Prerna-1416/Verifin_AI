'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const levelColors: Record<RiskLevel, { text: string; ring: string; bg: string }> = {
  LOW: { text: 'text-success-600', ring: '#22c55e', bg: 'bg-success-500' },
  MEDIUM: { text: 'text-warning-600', ring: '#f59e0b', bg: 'bg-warning-500' },
  HIGH: { text: 'text-orange-600', ring: '#f97316', bg: 'bg-orange-500' },
  CRITICAL: { text: 'text-destructive', ring: '#ef4444', bg: 'bg-destructive' },
};

const sizeMap = {
  sm: { size: 100, strokeWidth: 8, fontSize: 'text-lg' },
  md: { size: 140, strokeWidth: 10, fontSize: 'text-2xl' },
  lg: { size: 180, strokeWidth: 12, fontSize: 'text-3xl' },
};

export function RiskScore({ score, level, size = 'md', showLabel = true }: RiskScoreProps) {
  const { size: px, strokeWidth, fontSize } = sizeMap[size];
  const radius = (px - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = levelColors[level];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={px} height={px} className="-rotate-90">
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn('font-bold text-foreground', fontSize)}>{score}</div>
        {showLabel && (
          <div className={cn('text-xs font-medium uppercase tracking-wide', colors.text)}>
            {level}
          </div>
        )}
      </div>
    </div>
  );
}