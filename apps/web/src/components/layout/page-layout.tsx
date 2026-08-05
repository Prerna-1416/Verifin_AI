'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  children,
  className,
  size = 'xl',
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLSectionElement> {
  variant?: 'default' | 'muted' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({
  children,
  className,
  variant = 'default',
  padding = 'lg',
  ...props
}: SectionProps) {
  const variantClasses = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    dark: 'bg-gray-900 text-white',
  };

  const paddingClasses = {
    none: '',
    sm: 'py-12',
    md: 'py-20',
    lg: 'py-24 lg:py-32',
    xl: 'py-32 lg:py-40',
  };

  return (
    <section
      className={cn(variantClasses[variant], paddingClasses[padding], className)}
      {...props}
    >
      <Container size="xl">{children}</Container>
    </section>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md font-display font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-body-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function StatsGrid({ stats }: { stats: Array<{ label: string; value: string; change?: string; icon?: React.ReactNode }> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          {stat.icon && <div className="text-primary mb-2">{stat.icon}</div>}
          <div className="text-3xl lg:text-4xl font-bold text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          {stat.change && (
            <div className="text-xs text-success-600 mt-2 flex items-center gap-1">
              <span className="text-base">↑</span>
              {stat.change}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileHover={{ y: -8, boxShadow: '0 20px 60px -15px rgb(0 0 0 / 0.15)' }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group glass rounded-2xl p-6 h-full transition-all duration-300 border border-transparent hover:border-primary/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-heading-md font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-body-md text-muted-foreground mb-4">{description}</p>
      {href && (
        <a
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Learn more →
        </a>
      )}
    </motion.article>
  );
}