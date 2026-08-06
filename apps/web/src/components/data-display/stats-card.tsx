'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent';
  delay?: number;
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success-500/10 text-success-600',
  warning: 'bg-warning-500/10 text-warning-600',
  destructive: 'bg-destructive/10 text-destructive',
  accent: 'bg-accent-600/10 text-accent-700',
};

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
  delay = 0,
}: StatsCardProps) {
  const positive = (change || 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-3xl font-bold text-foreground mt-2">{value}</div>
        </div>
        {icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
      {(change !== undefined || changeLabel) && (
        <div className="mt-3 flex items-center gap-2">
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                positive ? 'text-success-600' : 'text-destructive'
              )}
            >
              {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(change)}%
            </span>
          )}
          {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}