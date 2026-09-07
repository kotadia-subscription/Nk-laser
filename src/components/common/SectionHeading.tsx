import React from 'react';
import { motion } from 'motion/react';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  themeMode?: 'dark' | 'light';
  children?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  centered = true,
  themeMode = 'light',
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`mb-10 sm:mb-14 ${centered ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'}`}
    >
      {badge && (
        <span
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3 border bg-amber-100 text-amber-900 border-amber-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {badge}
        </span>
      )}
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-zinc-900"
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-sm sm:text-base leading-relaxed text-zinc-600"
        >
          {subtitle}
        </p>
      )}
      {children}
    </motion.div>
  );
};
